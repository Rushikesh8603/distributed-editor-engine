# Distributed CRDT Editor Engine — Architecture & Specification

This document provides a comprehensive architectural breakdown, mathematical data structure specification, sequence diagrams, and operational flowcharts for the real-time collaborative text editor engine.

---

## 1. High-Level System Architecture

The distributed editor engine consists of a client-side Conflict-free Replicated Data Type (CRDT) linked-list engine running in the browser, an asynchronous WebSocket relay room server, an Express REST API for persistence and user authentication, and a MongoDB Atlas database for document storage.

```mermaid
graph TD
    subgraph Browser Clients
        C1["Client 1: Sir<br/>(In-Memory CRDT Linked List)"]
        C2["Client 2: Tejas<br/>(In-Memory CRDT Linked List)"]
        C3["Client 3: Bob<br/>(In-Memory CRDT Linked List)"]
    end

    subgraph Backend Infrastructure
        WS["WebSocket Server (ws)<br/>Port 8080<br/>Room Broadcast Engine"]
        API["Express REST API<br/>Auth & Document Routes"]
    end

    subgraph Persistence Layer
        DB[("MongoDB Atlas<br/>Users & Documents Collections")]
    end

    C1 <-->|"WebSocket Frames (JSON)"| WS
    C2 <-->|"WebSocket Frames (JSON)"| WS
    C3 <-->|"WebSocket Frames (JSON)"| WS

    C1 -->|"HTTP PUT /api/docs/:id (Debounced Auto-Save)"| API
    C2 -->|"HTTP GET /api/docs/:id (Initial Hydration)"| API
    C3 -->|"HTTP POST /api/docs/:id/share"| API

    API <-->|"Mongoose ODM"| DB
```

---

## 2. In-Memory CRDT Data Structure

The editor uses a sequence CRDT implemented as an in-memory **Doubly Linked List** backed by a **Hash Map (`structStore`)** for fast random-access anchor resolution.

```mermaid
classDiagram
    class Item {
        +string clientId
        +number clock
        +string val
        +string | null anchorClientId
        +number | null anchorClock
        +boolean deleted
        +Item | null left
        +Item | null right
        +Record~string, any~ attributes
    }

    class CRDTDocument {
        +Map~string, Item[]~ structStore
        +Item | null head
        +Item | null tail
        +number localClock
        +tick() number
        +findItemByClock(clientId, clock) Item
        +insert(clientId, clock, anchorId, anchorClock, val, attributes) Item
        +delete(clientId, clock) boolean
        +format(startId, startClock, endId, endClock, attributes) void
        +renderText() string
        +renderHTML() string
        +renderDelta() Array
        +getItems() Array
        +loadItems(items) void
    }

    CRDTDocument "1" *-- "many" Item : stores in linked list & structStore
```

### 2.1 The `Item` Object
Every character in the document is encapsulated in an `Item` node:
* `clientId`: Unique identifier of the client who typed the character (e.g., `"sir_280"`).
* `clock`: Lamport logical clock counter when the keystroke occurred.
* `val`: The single character string (e.g., `"a"`, `"\n"`, `" "`).
* `anchorClientId` & `anchorClock`: Coordinates of the character immediately to the left at the time of typing.
* `deleted`: Tombstone boolean flag. Characters are soft-deleted to maintain anchor continuity for concurrent edits.
* `left` & `right`: Pointers to adjacent items in document display order.
* `attributes`: Typography styling (bold, italic, underline, color, font, size, script).

### 2.2 $O(\log K)$ Binary Search Anchor Resolution (`structStore`)
Because inserting into a raw linked list can require $O(N)$ traversal, `structStore` organizes items by `clientId` in arrays sorted by `clock`. When an incoming remote operation arrives anchoring to `(anchorClientId, anchorClock)`, the anchor item is located in $O(\log K)$ time using binary search.

### 2.3 Deterministic Tie-Breaking Loop
When two clients type simultaneously at the exact same anchor position, both items are candidates for the slot. The CRDT resolves this deterministically across all nodes without a central authority:

$$\text{Priority}(A) > \text{Priority}(B) \iff (A.\text{clock} > B.\text{clock}) \lor (A.\text{clock} = B.\text{clock} \land A.\text{clientId} > B.\text{clientId})$$

If item $A$ has a higher priority, it sits to the left; otherwise, it is spliced to the right. All machines compute identical positions independently.

---

## 3. End-to-End Operational Lifecycle & Sequence Diagrams

### 3.1 Document Creation and Sharing
```mermaid
sequenceDiagram
    autonumber
    actor Sir as User: Sir
    participant API as Express API
    participant DB as MongoDB Atlas
    actor Tejas as User: Tejas

    Sir->>API: POST /api/docs { title: "Research Notes" }
    API->>DB: DocumentModel.create({ owner: "sir", content: "", collaborators: [] })
    DB-->>API: Saved Document (_id: doc123)
    API-->>Sir: 201 Created { _id: "doc123", ... }

    Sir->>API: POST /api/docs/doc123/share { username: "tejas" }
    API->>DB: doc.collaborators.push("tejas")
    DB-->>API: Updated Document
    API-->>Sir: 200 OK "Document shared successfully"
```

---

### 3.2 Offline Hydration vs. Real-Time Peer Sync

When a collaborator opens a document, the system executes a 2-step hydration sequence:

```mermaid
flowchart TD
    Start["User opens document: /?docId=doc123"] --> FetchDB["Step 1: HTTP GET /api/docs/doc123"]
    FetchDB --> CheckContent{"Does MongoDB have saved text?"}
    CheckContent -- Yes --> BootstrapInit["Bootstrap baseline CRDT linked list<br/>using clientId: 'init', clocks: 1..N"]
    CheckContent -- No --> EmptyDoc["Initialize empty CRDT linked list"]

    BootstrapInit --> RenderUI["Render baseline text in Textarea & Rich View"]
    EmptyDoc --> RenderUI

    RenderUI --> ConnectWS["Step 2: Connect WebSocket<br/>ws://localhost:8080?docId=doc123"]
    ConnectWS --> SendSyncReq["Broadcast WS: { type: 'sync_request' }"]

    SendSyncReq --> CheckPeers{"Are other peers in the room?"}
    CheckPeers -- "Yes (e.g. Sir is online)" --> RecvSyncResp["Peer replies with live items:<br/>{ type: 'sync_response', items: [...] }"]
    RecvSyncResp --> LoadItems["doc.loadItems(items):<br/>Replace 'init' baseline with active peer's live state"]
    LoadItems --> UpdateScreen["Update Textarea & Cursor seamlessly"]

    CheckPeers -- "No (User is alone)" --> Ready["Document is ready for editing"]
    UpdateScreen --> Ready
```

---

### 3.3 Live Multi-Peer Collaboration (3 Collaborators)

When Sir, Tejas, and Bob are online together, all keystrokes are broadcast as operations through the WebSocket server:

```mermaid
sequenceDiagram
    autonumber
    actor Sir as Sir (Active)
    actor Tejas as Tejas (Active)
    participant WS as WebSocket Relay (8080)
    actor Bob as Bob (Just Joined)

    Note over Sir,Tejas: Both currently have identical CRDT linked lists

    Bob->>WS: Connects to Room "doc123"
    Bob->>WS: WS: { type: "sync_request" }
    
    par Relay to active peers
        WS->>Sir: Relay { type: "sync_request" }
        WS->>Tejas: Relay { type: "sync_request" }
    end

    par Active peers reply
        Sir->>WS: WS: { type: "sync_response", items: sir_doc.getItems() }
        Tejas->>WS: WS: { type: "sync_response", items: tejas_doc.getItems() }
    end

    WS->>Bob: Delivers sync_response
    Note over Bob: Bob runs doc.loadItems(items).<br/>Because Sir and Tejas were identical,<br/>Bob converges immediately to the exact live state!

    Sir->>Sir: Types '!' (anchor: last char, clock: 25)
    Sir->>WS: WS: { type: "insert", clientId: "sir_01", clock: 25, anchorClientId: "sir_01", anchorClock: 24, value: "!" }

    par Broadcast to other clients
        WS->>Tejas: Delivers operation
        WS->>Bob: Delivers operation
    end

    Note over Tejas: Locates anchor ('sir_01'@24), splices '!' into linked list
    Note over Bob: Locates anchor ('sir_01'@24), splices '!' into linked list
```

---

## 4. Keystroke & Delete Event Pipeline

```mermaid
flowchart TD
    KeyInput["User presses key in Textarea"] --> DiffCheck{"Compute length difference:<br/>newValue.length - previousValue.length"}
    
    DiffCheck -- "lengthDiff > 0 (Insert / Paste)" --> ForLoop["Iterate through inserted chars sequentially"]
    ForLoop --> FindAnchor["Find visible item at cursor - 1<br/>Get anchorClientId & anchorClock"]
    FindAnchor --> LocalClock["doc.tick() -> new Clock"]
    LocalClock --> LocalInsert["doc.insert(clientId, newClock, anchorId, anchorClock, char)"]
    LocalInsert --> SendWSInsert["ws.send({ type: 'insert', clientId, clock, anchorId, anchorClock, value: char })"]
    
    DiffCheck -- "lengthDiff < 0 (Delete / Backspace)" --> LoopDel["Iterate deleteCount = |lengthDiff|"]
    LoopDel --> GetDelItem["Find visible item at cursor position"]
    GetDelItem --> LocalDelete["doc.delete(item.clientId, item.clock)<br/>Mark deleted = true (tombstone)"]
    LocalDelete --> SendWSDelete["ws.send({ type: 'delete', clientId, clock })"]

    SendWSInsert --> Redraw["textarea.value = doc.renderText()<br/>updateRichView()"]
    SendWSDelete --> Redraw

    Redraw --> DebounceSave["triggerAutoSave():<br/>Debounce 1000ms -> PUT /api/docs/:id"]
```

---

## 5. Wire Protocol Payloads

All WebSocket payloads transmitted through the server room are structured JSON text frames:

### 5.1 Insert Operation
```json
{
  "type": "insert",
  "clientId": "sir_280",
  "clock": 15,
  "anchorClientId": "sir_280",
  "anchorClock": 14,
  "value": "w",
  "attributes": {
    "bold": true,
    "color": "#1a73e8"
  }
}
```

### 5.2 Delete Operation
```json
{
  "type": "delete",
  "clientId": "sir_280",
  "clock": 15
}
```

### 5.3 Format Operation
```json
{
  "type": "format",
  "startClientId": "sir_280",
  "startClock": 10,
  "endClientId": "sir_280",
  "endClock": 15,
  "attributes": {
    "italic": true,
    "font": "Georgia"
  }
}
```

### 5.4 Synchronization Handshake
```json
// Client Request
{
  "type": "sync_request"
}

// Peer Response
{
  "type": "sync_response",
  "items": [
    {
      "clientId": "sir_280",
      "clock": 1,
      "val": "H",
      "anchorClientId": null,
      "anchorClock": null,
      "deleted": false,
      "attributes": {}
    },
    {
      "clientId": "sir_280",
      "clock": 2,
      "val": "i",
      "anchorClientId": "sir_280",
      "anchorClock": 1,
      "deleted": false,
      "attributes": {}
    }
  ]
}
```
