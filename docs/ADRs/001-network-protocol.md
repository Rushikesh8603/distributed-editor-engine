# ADR 001: Real-Time Network Protocol Selection

## Status
Accepted

## Context
We are building a distributed collaborative text editor requiring sub-50ms keystroke broadcasting across multiple concurrent clients. We evaluated standard HTTP Request-Response, HTTP Long Polling, and WebSockets. 

Standard HTTP is half-duplex and stateless. It requires a TCP 3-way handshake (SYN, SYN-ACK, ACK) and transmits 500+ bytes of header bloat for every single keystroke. HTTP Long Polling mitigates empty responses but still suffers from connection recreation overhead and Head-of-Line blocking.

## Decision
We will implement **WebSockets** as the primary network protocol for real-time document synchronization. We will reserve standard HTTP strictly for initial authentication and fetching the baseline document state.

## Consequences
* **Positive:** We achieve true full-duplex communication. The TCP handshake occurs only once during the initial `101 Switching Protocols` upgrade, eliminating network latency for subsequent keystrokes.
* **Positive:** Eliminates HTTP header bloat, reducing bandwidth per keystroke to just a few bytes of framing data.
* **Negative:** WebSockets introduce stateful, long-lived TCP connections. This will require us to implement specific Load Balancing strategies (Sticky Sessions) when scaling horizontally, as standard round-robin routing will break the connection state.

   