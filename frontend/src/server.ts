import { WebSocketServer, WebSocket } from 'ws';
import { parse } from 'url';
import http from 'http';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = "super_secret_jwt_key_change_in_production";
const MONGO_URI = "mongodb://localhost:27017/crdt-editor";

// 1. Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define User Schema & Model
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password_hash: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// 2. Create HTTP & WebSocket Server
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    const parsedUrl = parse(req.url || '', true);

    try {
      // SIGNUP ROUTE: POST /api/signup
      if (parsedUrl.pathname === '/api/signup' && req.method === 'POST') {
        const { username, password } = JSON.parse(body);
        if (!username || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Username and password required' }));
          return;
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        
        const newUser = new User({ username, password_hash: hashedPassword });
        await newUser.save();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User registered successfully!', userId: newUser._id }));
      } 
      // LOGIN ROUTE: POST /api/login
      else if (parsedUrl.pathname === '/api/login' && req.method === 'POST') {
        const { username, password } = JSON.parse(body);
        
        const user: any = await User.findOne({ username });

        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid username or password' }));
          return;
        }

        const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Login successful', token, username: user.username }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
    } catch (e: any) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message || 'Server error' }));
    }
  });
});

// 3. Attach WebSocket Room Server
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
  console.log('MongoDB Server running on http://localhost:8080');
});

