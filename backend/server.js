const express = require('express');
const { MongoClient } = require('mongodb');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend'))); // For frontend
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const mongodb_uri = process.env.MONGODB_URI;
let db;
let isDbConnected = false;

if (!mongodb_uri) {
  console.error('ERROR: MONGODB_URI is not defined in environment variables.');
} else {
  const client = new MongoClient(mongodb_uri);
  client.connect()
    .then(() => {
      console.log('MongoDB Connected successfully');
      db = client.db();
      isDbConnected = true;
      
      // Create TTL Index (expires after 24 hours)
      db.collection('shares').createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 })
        .then(() => console.log('TTL Index verified'))
        .catch(err => console.error('Error creating index:', err));
    })
    .catch(err => {
      console.error('MongoDB connection error:', err.message);
      console.log('--------------------------------------------------');
      console.log('TIP: Check your Atlas credentials in .env');
      console.log('--------------------------------------------------');
    });
}

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
    if (!isDbConnected) {
      return res.status(503).json({ error: 'Database not connected. Please check Atlas settings.' });
    }
    const { message } = req.body;
    const file = req.file;
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();

    let newShareData = {
      code,
      createdAt: new Date()
    };

    if (file) {
      let type = 'file';
      if (file.mimetype.startsWith('image/')) type = 'image';
      else if (file.mimetype === 'application/pdf') type = 'document';

      newShareData = {
        ...newShareData,
        content: file.filename,
        originalName: file.originalname,
        type
      };
    } else if (message) {
      newShareData = {
        ...newShareData,
        content: message,
        type: 'text'
      };
    } else {
      return res.status(400).json({ error: 'No content provided' });
    }

    await db.collection('shares').insertOne(newShareData);
    res.json({ success: true, code });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: 'Failed to share content' });
  }
});

// 2. Retrieve Content
app.get('/api/retrieve/:code', async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.status(503).json({ error: 'Database not available' });
    }
    const share = await db.collection('shares').findOne({ code: req.params.code.toUpperCase() });
    if (!share) {
      return res.status(404).json({ error: 'Invalid or expired code' });
    }
    res.json(share);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve content' });
  }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Serving frontend from: ${path.join(__dirname, '../frontend')}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`ERROR: Port ${PORT} is already in use.`);
    console.log('Try closing other terminals or changing the PORT in .env');
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});
