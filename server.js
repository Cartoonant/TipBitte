const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static PWA & Web application assets
app.use(express.static(path.join(__dirname)));

// Health check endpoint for Cloud platforms (Render, Railway, Fly.io)
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString(), mode: 'PWA_ANDROID_CLOUD' });
});

// Single Page Application Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 TipBitte Resto Cloud Server running on port ${PORT}`);
});
