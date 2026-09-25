import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const router = Router();
const JWT_SECRET = "super_secret_jwt_key_change_in_production";

// SIGNUP ROUTE: POST /api/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({ username, password_hash: hashedPassword });
    await newUser.save();

    res.status(200).json({ message: 'User registered successfully!', userId: newUser._id });
  } catch (e: any) {
    res.status(400).json({ error: 'Username already taken or invalid request' });
  }
});

// LOGIN ROUTE: POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user: any = await User.findOne({ username });

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({ message: 'Login successful', token, username: user.username });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;


