# ADR 003: Redis Pub/Sub for Cluster Communication

## Status
Accepted

## Context
As the `distributed-editor-engine` scales horizontally behind a load balancer with sticky sessions, individual Node.js servers become isolated. If User A is connected to Server A and User B is connected to Server B, they cannot natively share WebSocket events. 

Relying on the central database (e.g., MongoDB or PostgreSQL) to sync real-time keystrokes requires high-frequency database polling (Pull). This will overwhelm the database's disk I/O and introduce unacceptable latency. We require a low-latency "Push" mechanism to route ephemeral data across the cluster without touching the persistent database.

## Decision
We will introduce **Redis** as a centralized Message Broker utilizing the **Pub/Sub (Publish/Subscribe)** pattern. We will use the `@socket.io/redis-adapter` to act as the bridge. 

When a server receives a WebSocket event for a specific document, the adapter automatically publishes the payload to a Redis channel labeled with the `document_id`. Redis instantly broadcasts this payload to all other Node instances subscribed to that channel, allowing them to push the update down to their connected clients.

## Consequences
* **Positive:** Achieves sub-millisecond cross-server communication by leveraging Redis's in-memory (RAM) architecture.
* **Positive:** Completely decouples real-time ephemeral syncing from permanent database storage, protecting the database from high-frequency read bottlenecks.
* **Negative:** Introduces a new infrastructural dependency. If the Redis node crashes, cross-server real-time collaboration halts completely.
* **Negative:** Redis Pub/Sub is "fire-and-forget." Messages are not persisted in Redis. If a client disconnects, they will miss real-time events and must rely on a combination of HTTP baseline fetching and Conflict-free Replicated Data Types (CRDTs) to merge missed changes upon reconnection.

