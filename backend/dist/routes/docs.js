import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './auth.js';
import { DocumentModel } from '../models/Document.js';
import { User } from '../models/User.js';
const router = Router();
function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header provided' });
    }
    const parts = authHeader.split(' ');
    const token = parts.length === 2 ? parts[1] : parts[0];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        try {
            const decoded = jwt.verify(token, "super_secret_jwt_key_change_in_production");
            req.user = decoded;
            next();
        }
        catch (e) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    }
}
//[ User in Browser ] Clicks "+ New Document" button
//In our upcoming dashboardView.ts (the Lobby / Document List view). Whenever the user clicks the + New Document button, this route is triggered.
router.post('/', authenticate, async (req, res) => {
    try {
        const title = req.body.title || 'Untitled document';
        const newDoc = new DocumentModel({
            // here id gets created automatically by mongo and we can use it to identify the doc uniquely example: http://localhost:8080/editor.html?docId=64f1e2c4b5a3c2d1e4f5a6b7
            title: title,
            content: '',
            owner: req.user.username,
            collaborators: []
        });
        await newDoc.save();
        res.status(201).json(newDoc); //we send id also of this unique doc mongo creates it for every doc 
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create document' });
    }
});
//In dashboardView.ts (the Google Docs Home / Dashboard page).
//When: The exact moment a user logs in and lands on the home screen.
//Why: So the user isn't looking at an empty screen; they immediately see all their past work and shared files ready to click.
router.get('/', authenticate, async (req, res) => {
    try {
        const username = req.user.username;
        const myDocs = await DocumentModel.find({ owner: username }).sort({ updatedAt: -1 });
        const sharedDocs = await DocumentModel.find({ collaborators: username }).sort({ updatedAt: -1 });
        res.status(200).json({ myDocs, sharedDocs });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});
// when i click to open a document from the dashboard, this route is triggered to fetch the document's content and metadata. by that pertifular doc id 
router.get('/:id', authenticate, async (req, res) => {
    try {
        const docId = req.params.id;
        const doc = await DocumentModel.findById(docId);
        if (!doc) {
            return res.status(404).json({ error: 'Document not found' });
        }
        const username = req.user.username;
        const isOwner = doc.owner === username;
        const isCollaborator = doc.collaborators.includes(username);
        if (!isOwner && !isCollaborator) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.status(200).json(doc);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to retrieve document' });
    }
});
//Clicks "Share" & enters friend's name: "bob". 
router.post('/:id/share', authenticate, async (req, res) => {
    try {
        const docId = req.params.id;
        const targetUsername = req.body.username;
        if (!targetUsername) {
            return res.status(400).json({ error: 'Target username is required' });
        }
        const doc = await DocumentModel.findById(docId);
        if (!doc) {
            return res.status(404).json({ error: 'Document not found' });
        }
        if (doc.owner !== req.user.username) {
            return res.status(403).json({ error: 'Only the document owner can share this document' });
        }
        if (targetUsername === doc.owner) {
            return res.status(400).json({ error: 'Cannot share document with yourself' });
        }
        const targetUser = await User.findOne({ username: targetUsername });
        if (!targetUser) {
            return res.status(404).json({ error: 'User to share with does not exist' });
        }
        if (!doc.collaborators.includes(targetUsername)) {
            doc.collaborators.push(targetUsername);
            await doc.save();
        }
        res.status(200).json({ message: 'Document shared successfully', document: doc });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to share document' });
    }
});
//update the document's title or content. This route is triggered when a user edits a document in real-time. The changes are sent to the server, which updates the document in the database. The server then broadcasts the changes to all other collaborators connected to the same document via WebSocket.
router.put('/:id', authenticate, async (req, res) => {
    try {
        const docId = req.params.id;
        const doc = await DocumentModel.findById(docId);
        if (!doc) {
            return res.status(404).json({ error: 'Document not found' });
        }
        const username = req.user.username;
        const isOwner = doc.owner === username;
        const isCollaborator = doc.collaborators.includes(username);
        if (!isOwner && !isCollaborator) {
            return res.status(403).json({ error: 'Access denied' });
        }
        if (req.body.title !== undefined) {
            doc.title = req.body.title;
        }
        if (req.body.content !== undefined) {
            doc.content = req.body.content;
        }
        await doc.save();
        res.status(200).json(doc);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update document' });
    }
});
export default router;
