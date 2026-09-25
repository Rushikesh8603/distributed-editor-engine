import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { parse } from 'url';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';

const MONGO_URI = "mongodb://localhost:27017/crdt-editor";

// 1. Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// 2. Initialize Express App
const app = express();
app.use(express.json());
app.use(cors());

// Route Traffic
app.use('/api', authRoutes);

// 3. Create HTTP Server
const server = http.createServer(app);

// 4. Attach WebSocket Room Server
const wss = new WebSocketServer({ noServer: true });
const rooms = new Map<string, Set<WebSocket>>();

server.on('upgrade', (request, socket, head) => {
  const parameters = parse(request.url || '', true);
  const docId = (parameters.query.docId as string) || 'default-room';

  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request, docId);
  });
});

wss.on('connection', (ws: WebSocket, req: any, docId: string) => {
  if (!rooms.has(docId)) {
    rooms.set(docId, new Set());
  }
  
  const room = rooms.get(docId)!;
  room.add(ws);
  console.log(`Client joined room: ${docId}. Active in room: ${room.size}`);

  ws.on('message', (message) => {
    for (const client of room) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });

  ws.on('close', () => {
    room.delete(ws);
    if (room.size === 0) rooms.delete(docId);
  });
});

server.listen(8080, () => {
  console.log('Backend Server running on http://localhost:8080');
});


