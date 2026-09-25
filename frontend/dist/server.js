import { WebSocketServer, WebSocket } from 'ws';
// Start a server on port 8080
const wss = new WebSocketServer({ port: 8080 });
console.log("WebSocket Server running on ws://localhost:8080");
// Listen for new connections
wss.on('connection', (ws) => {
    console.log("New client connected!");
    // When this client sends us a CRDT JSON packet...
    ws.on('message', (message) => {
        // Broadcast it to every OTHER connected client
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });
    ws.on('close', () => {
        console.log("Client disconnected.");
    });
});
//# sourceMappingURL=server.js.map