import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled document' },
  content: { type: String, default: '' },
  owner: { type: String, required: true },
  collaborators: { type: [String], default: [] }
}, {
  timestamps: true
});

export const DocumentModel = mongoose.model('Document', documentSchema);

