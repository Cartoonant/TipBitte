const express = require('express');
const path = require('path');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Static Assets
app.use(express.static(path.join(__dirname)));

// PostgreSQL Database Connection Pool setup via process.env.DATABASE_URL
const dbUrl = process.env.DATABASE_URL;
let pool = null;

if (dbUrl) {
  pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL Pool Error:', err);
  });
} else {
  console.log('⚠️ DATABASE_URL not found. Running in Local In-Memory Fallback Mode.');
}

// Database Schema Initialization Script
const initDB = async () => {
  if (!pool) return;
  try {
    const client = await pool.connect();
    try {
      // 1. App State Storage Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS app_state_store (
          key_name VARCHAR(50) PRIMARY KEY,
          state_data JSONB NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 2. Persistent Task Validation Logs Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS task_logs (
          id VARCHAR(100) PRIMARY KEY,
          employee_id VARCHAR(50) NOT NULL,
          description TEXT,
          points INT DEFAULT 0,
          status VARCHAR(20) DEFAULT 'PENDING',
          month_key VARCHAR(10),
          is_malus BOOLEAN DEFAULT FALSE,
          created_at BIGINT
        );
      `);

      // 3. Manager Penalty Audit Log Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id SERIAL PRIMARY KEY,
          date_str VARCHAR(20),
          employee_name VARCHAR(100),
          task_name TEXT,
          penalty INT,
          reason TEXT,
          timestamp BIGINT
        );
      `);

      console.log('✅ PostgreSQL Tables Initialized Successfully (app_state_store, task_logs, audit_logs).');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Failed to initialize PostgreSQL Schema:', err);
  }
};

initDB();

// Health check endpoint for Render monitoring & DB verification
app.get('/healthz', async (req, res) => {
  let dbConnected = false;
  if (pool) {
    try {
      await pool.query('SELECT 1');
      dbConnected = true;
    } catch (e) {
      dbConnected = false;
    }
  }

  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(), 
    mode: 'PWA_ANDROID_CLOUD',
    database: dbUrl ? (dbConnected ? 'CONNECTED_POSTGRESQL' : 'CONNECTIVITY_ERROR') : 'IN_MEMORY_FALLBACK'
  });
});

// REST API: Load Persistent State from PostgreSQL
app.get('/api/state', async (req, res) => {
  if (!pool) {
    return res.status(200).json({ success: true, data: null, mode: 'local' });
  }
  try {
    const result = await pool.query('SELECT state_data FROM app_state_store WHERE key_name = $1', ['main_state']);
    if (result.rows.length > 0) {
      return res.status(200).json({ success: true, data: result.rows[0].state_data, mode: 'postgresql' });
    }
    return res.status(200).json({ success: true, data: null, mode: 'postgresql_empty' });
  } catch (err) {
    console.error('GET /api/state Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// REST API: Save/Sync Application State to PostgreSQL
app.post('/api/state', async (req, res) => {
  const { state } = req.body;
  if (!state) {
    return res.status(400).json({ success: false, error: 'Missing state payload' });
  }

  if (!pool) {
    return res.status(200).json({ success: true, mode: 'local_skipped' });
  }

  try {
    await pool.query(`
      INSERT INTO app_state_store (key_name, state_data, updated_at)
      VALUES ('main_state', $1, CURRENT_TIMESTAMP)
      ON CONFLICT (key_name)
      DO UPDATE SET state_data = EXCLUDED.state_data, updated_at = CURRENT_TIMESTAMP;
    `, [JSON.stringify(state)]);

    res.status(200).json({ success: true, mode: 'postgresql_saved' });
  } catch (err) {
    console.error('POST /api/state Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Single Page Application Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 TipBitte Resto Server with PostgreSQL Database running on port ${PORT}`);
});
