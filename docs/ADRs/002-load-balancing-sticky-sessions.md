# ADR 002: Load Balancing and Sticky Sessions

## Status
Accepted

## Context
As we scale the `distributed-editor-engine` beyond a single Node.js instance, we must introduce a Load Balancer (e.g., [Nginx](https://www.nginx.com/)) to distribute incoming traffic. By default, load balancers use a Round-Robin algorithm. 

Because [Socket.io](https://socket.io/docs/v4/using-multiple-nodes/) initiates connections with HTTP Long-Polling before upgrading to WebSockets, the handshake requires in-memory state. Round-Robin routing causes the secondary upgrade request to land on a different server that lacks this memory state, resulting in a failed handshake (400 Bad Request).

## Decision
We will enforce **Sticky Sessions (Session Affinity)** at the Load Balancer level using either IP Hashing or Session Cookies. This guarantees that once a client initiates a connection, all subsequent requests for that session are routed to the exact same backend Node instance.

## Consequences
* **Positive:** Prevents the Socket.io WebSocket upgrade handshake from failing in a horizontally scaled cluster.
* **Positive:** Allows individual Node servers to maintain localized in-memory state for their connected clients without requiring a shared database for session lookup.
* **Negative:** Introduces the risk of "Hotspots." If one server is assigned a disproportionate number of highly active users, the load balancer cannot re-route those active WebSocket connections to idle servers without severing the connection entirely.
* **Negative:** If a Node instance crashes, all clients "stuck" to it will be dropped and forced to execute a full reconnection loop.


