const cors = require("cors");
app.use(cors());
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend'))); // For frontend
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const mongodb_uri = process.env.MONGODB_URI;
if (!mongodb_uri) {
  console.error('ERROR: MONGODB_URI is not defined in environment variables.');
  console.log('Server will start but DB features will fail.');
} else {
  mongoose.connect(mongodb_uri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
      console.error('MongoDB connection error:', err);
      console.log('Continuing server start despite DB error...');
    });
}

// Schema
const shareSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  content: { type: String, required: true }, // Message or filename
  type: { type: String, enum: ['text', 'file', 'image', 'document'], required: true },
  originalName: { type: String }, // For files
  createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto-delete after 24 hours (86400 seconds)
});

const Share = mongoose.model('Share', shareSchema);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  console.log('Creating uploads directory...');
  fs.mkdirSync(uploadDir, { recursive: true });
}

// File Upload Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// API Endpoints

// 1. Send Content
app.post('/api/send', upload.single('file'), async (req, res) => {
  try {
    const { message } = req.body;
    const file = req.file;
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();

    let newShare;

    if (file) {
      let type = 'file';
      if (file.mimetype.startsWith('image/')) type = 'image';
      else if (file.mimetype === 'application/pdf') type = 'document';

      newShare = new Share({
        code,
        content: file.filename,
        originalName: file.originalname,
        type
      });
    } else if (message) {
      newShare = new Share({
        code,
        content: message,
        type: 'text'
      });
    } else {
      return res.status(400).json({ error: 'No content provided' });
    }

    await newShare.save();
    res.json({ success: true, code });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: 'Failed to share content' });
  }
});

// 2. Retrieve Content
app.get('/api/retrieve/:code', async (req, res) => {
  try {
    const share = await Share.findOne({ code: req.params.code.toUpperCase() });
    if (!share) {
      return res.status(404).json({ error: 'Invalid or expired code' });
    }
    res.json(share);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve content' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
  console.log(`Static files being served from: ${path.join(__dirname, '../frontend')}`);
});
