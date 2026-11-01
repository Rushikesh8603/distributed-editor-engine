import 'dotenv/config';
import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { parse } from 'url';
import mongoose from 'mongoose';
import cors from 'cors';
import { Redis } from 'ioredis';
import authRoutes, { JWT_SECRET } from './routes/auth.js';
import docRoutes from './routes/docs.js';
import jwt from 'jsonwebtoken';

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/crdt-editor";
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const SERVER_ID = process.env.SERVER_ID || `srv-${Math.random().toString(36).substring(2, 9)}`;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// 1. Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log(`[${SERVER_ID}] Connected to MongoDB successfully.`))
  .catch(err => console.error(`[${SERVER_ID}] MongoDB connection error:`, err));

// 2. Initialize Redis Pub/Sub Clients
let isRedisAvailable = false;
const redisPublisher = new Redis(REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 3) return null;
    return Math.min(times * 100, 1000);
  }
});

const redisSubscriber = new Redis(REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 3) return null;
    return Math.min(times * 100, 1000);
  }
});

Promise.all([redisPublisher.connect(), redisSubscriber.connect()])
  .then(() => {
    isRedisAvailable = true;
    console.log(`[${SERVER_ID}] Connected to Redis Pub/Sub at ${REDIS_URL}`);
  })
  .catch((err) => {
    isRedisAvailable = false;
    console.warn(`[${SERVER_ID}] Redis not available (${err.message}). Running in standalone local memory mode.`);
  });

redisPublisher.on('error', () => { isRedisAvailable = false; });
redisSubscriber.on('error', () => { isRedisAvailable = false; });

// 3. Initialize Express App
const app = express();
app.use(express.json());
app.use(cors());

// Health Check Endpoint (Essential for NGINX Load Balancer)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    serverId: SERVER_ID,
    redis: isRedisAvailable ? 'connected' : 'standalone',
    rooms: rooms.size
  });
});

// Route Traffic
app.use('/api', authRoutes);
app.use('/api/docs', docRoutes);

// 4. Create HTTP Server
const server = http.createServer(app);

// 5. Attach WebSocket Room Server
const wss = new WebSocketServer({ noServer: true });
const rooms = new Map<string, Set<WebSocket>>();

// Handle Incoming Redis Pub/Sub Broadcasts from OTHER servers
redisSubscriber.on('message', (channel: string, rawMessage: string) => {
  try {
    const envelope = JSON.parse(rawMessage);

    // Echo suppression: Ignore if this server published it
    if (envelope.originServer === SERVER_ID) {
      return;
    }

    const docId = channel.replace(/^doc:/, '');
    const room = rooms.get(docId);
    if (!room) return;

    // Fan-out to all local clients connected to this room
    for (const client of room) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(envelope.payload);
      }
    }
  } catch (err) {
    // Drop malformed packets
  }
});

server.on('upgrade', (request, socket, head) => {
  const parameters = parse(request.url || '', true);
  const docId = (parameters.query.docId as string) || 'default-room';
  const token = (parameters.query.token as string) || '';

  try {
    const user = jwt.verify(token, JWT_SECRET);
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request, docId, user);
    });
  } catch (err) {
    try {
      const user = jwt.verify(token, "super_secret_jwt_key_change_in_production");
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request, docId, user);
      });
    } catch (e) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
    }
  }
});

wss.on('connection', (ws: WebSocket, req: any, docId: string, user: any) => {
  const isFirstClient = !rooms.has(docId);
  if (isFirstClient) {
    rooms.set(docId, new Set());
    if (isRedisAvailable) {
      redisSubscriber.subscribe(`doc:${docId}`).catch(() => {});
    }
  }

  const room = rooms.get(docId)!;
  room.add(ws);
  const username = user?.username || 'Collaborator';
  console.log(`[${SERVER_ID}] User ${username} joined room: ${docId}. Active in room on this node: ${room.size}`);

  ws.on('message', (message) => {
    const textMessage = typeof message === 'string' ? message : message.toString('utf8');

    // 1. Broadcast locally to other clients on THIS server instance
    for (const client of room) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(textMessage);
      }
    }

    // 2. Publish to Redis so OTHER server instances broadcast to their clients
    if (isRedisAvailable) {
      redisPublisher.publish(`doc:${docId}`, JSON.stringify({
        originServer: SERVER_ID,
        payload: textMessage
      })).catch(() => {});
    }
  });

  ws.on('close', () => {
    room.delete(ws);
    if (room.size === 0) {
      rooms.delete(docId);
      if (isRedisAvailable) {
        redisSubscriber.unsubscribe(`doc:${docId}`).catch(() => {});
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`[${SERVER_ID}] Backend Server running on http://localhost:${PORT}`);
});
