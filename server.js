const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { JWT } = require('google-auth-library');
const { GoogleSpreadsheet } = require('google-spreadsheet');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Static Web & PWA assets
app.use(express.static(path.join(__dirname)));

// Google Sheet Database Configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || '1zjcbkAkIv2-g1629Eax2S1SO_5uGTxKghJSsvSjcfx0';
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : null;
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL; // Optional WebApp webhook fallback

const LOCAL_BACKUP_FILE = path.join(__dirname, 'state_backup.json');

// Initialize Google Spreadsheet Document Client
let doc = null;

const initGoogleSpreadsheet = async () => {
  if (SERVICE_ACCOUNT_EMAIL && PRIVATE_KEY) {
    try {
      const serviceAccountAuth = new JWT({
        email: SERVICE_ACCOUNT_EMAIL,
        key: PRIVATE_KEY,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
      await doc.loadInfo();
      console.log(`✅ Google Sheet Database Connected: "${doc.title}" (ID: ${SPREADSHEET_ID})`);
    } catch (err) {
      console.error('⚠️ Google Sheet API Auth Warning:', err.message);
    }
  } else {
    console.log('ℹ️ Google Service Account credentials not set. Using Google Sheet Public Sync & File Backup mode.');
  }
};

initGoogleSpreadsheet();

// Load persistent state from local backup file if present
let cachedState = null;
if (fs.existsSync(LOCAL_BACKUP_FILE)) {
  try {
    cachedState = JSON.parse(fs.readFileSync(LOCAL_BACKUP_FILE, 'utf8'));
    console.log('✅ Loaded persistent state from local file backup.');
  } catch (e) {
    console.error('Error reading local state backup file:', e);
  }
}

// Write/Sync State to Google Sheet & File Storage
const syncStateToGoogleSheet = async (state) => {
  cachedState = state;
  
  // 1. Save to local file backup
  try {
    fs.writeFileSync(LOCAL_BACKUP_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing local backup file:', e);
  }

  // 2. Sync to Google Sheet via Service Account if authenticated
  if (doc) {
    try {
      let syncSheet = doc.sheetsByTitle['App_Sync_Log'];
      if (!syncSheet) {
        syncSheet = await doc.addSheet({ title: 'App_Sync_Log', headerValues: ['Timestamp', 'MonthKey', 'ValidatedTasksCount', 'TipTotal'] });
      }
      const tasksCount = (state.tasks || []).length;
      const tipsConfig = state.tipsConfig?.[state.currentMonth] || {};
      
      await syncSheet.addRow({
        Timestamp: new Date().toISOString(),
        MonthKey: state.currentMonth || '2026-07',
        ValidatedTasksCount: tasksCount,
        TipTotal: tipsConfig.totalAmount || 2600
      });
    } catch (err) {
      console.log('Google Sheet row sync note:', err.message);
    }
  }

  // 3. Fallback sync via Google Script WebApp Webhook if configured
  if (GOOGLE_SCRIPT_URL) {
    try {
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_state', state })
      }).catch(() => {});
    } catch (e) {}
  }
};

// Health Check Endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(), 
    mode: 'PWA_ANDROID_CLOUD',
    database: 'GOOGLE_SHEET_FREE',
    spreadsheetId: SPREADSHEET_ID,
    serviceAccountActive: !!doc,
    hasBackup: !!cachedState
  });
});

// REST API: Load Persistent State from Google Sheet Backend
app.get('/api/state', (req, res) => {
  res.status(200).json({ 
    success: true, 
    data: cachedState, 
    mode: doc ? 'google_sheet_api' : 'google_sheet_backup' 
  });
});

// REST API: Save State & Push Task Validations to Google Sheet
app.post('/api/state', async (req, res) => {
  const { state } = req.body;
  if (!state) {
    return res.status(400).json({ success: false, error: 'Missing state payload' });
  }

  await syncStateToGoogleSheet(state);
  res.status(200).json({ success: true, mode: 'google_sheet_synced' });
});

// Proxy route to fetch live Google Sheet tasks CSV
app.get('/api/google-sheet-tasks', async (req, res) => {
  const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv`;
  try {
    const fetchRes = await fetch(csvUrl);
    if (!fetchRes.ok) throw new Error(`HTTP error ${fetchRes.status}`);
    const csvText = await fetchRes.text();
    res.status(200).send(csvText);
  } catch (err) {
    console.error('Error proxying Google Sheet CSV:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Single Page Application Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 TipBitte Resto Server (100% Free Google Sheet DB) running on port ${PORT}`);
});
