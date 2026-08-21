import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import os from 'os';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fail-safe check for critical configuration
const REQUIRED_ENV = ['ADMIN_PASSWORD_HASH', 'JWT_SECRET'];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.warn(`[WARNING] Missing environment variables: ${missingEnv.join(', ')}. Using fallback values.`);
}

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'hacknclash_default_jwt_secret_key_2026';
// Default hash for password 'hacknclash2026' fallback if ADMIN_PASSWORD_HASH is not set yet
const DEFAULT_HASH = '$2a$10$wT5gZ6A6dI.UaD1gH/xLDe3G9v8N9oQ5rW5F7e8r9t0y1u2i3o4p5';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || DEFAULT_HASH;
const DEFAULT_ENDS_AT = process.env.DEFAULT_ENDS_AT || '2026-08-30T23:59:59+05:30';

// Database & Audit file paths (use OS tmp dir when running on Vercel or in production serverless)
const DATA_DIR = (process.env.VERCEL || process.env.NODE_ENV === 'production')
  ? path.join(os.tmpdir(), 'hacknclash_data')
  : path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const LOG_PATH = path.join(DATA_DIR, 'audit.log');

// Ensure data directory exists
try {
  await fs.mkdir(DATA_DIR, { recursive: true });
} catch (err) {
  console.error('Failed to create data directory:', err);
}

// In-process write queue / mutex to prevent race conditions on JSON file
class WriteQueue {
  constructor() {
    this.queue = Promise.resolve();
  }

  enqueue(operation) {
    this.queue = this.queue.then(() => operation()).catch((err) => {
      console.error('[MUTEX] Operation failed:', err);
      throw err;
    });
    return this.queue;
  }
}

const dbMutex = new WriteQueue();

// Helper to write to structured audit log
async function writeAuditLog(action, operator = 'SYSTEM') {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [ACTION: ${action}] [OPERATOR: ${operator}]\n`;
  try {
    await fs.appendFile(LOG_PATH, logLine, 'utf8');
    console.log(`[AUDIT] ${logLine.trim()}`);
  } catch (err) {
    console.error('[AUDIT] Failed to write audit log:', err);
  }
}

// Universal Cloud KV (Vercel KV / Upstash Redis REST) configuration
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

// Helper to read state safely (Cloud KV -> Local FS fallback)
async function readState() {
  const defaultState = {
    startedAt: null,
    endsAt: DEFAULT_ENDS_AT,
  };

  // 1. Try reading from Cloud KV if configured
  if (KV_URL && KV_TOKEN) {
    try {
      const res = await fetch(`${KV_URL}/get/hacknclash_state`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` }
      });
      const data = await res.json();
      if (data && data.result) {
        const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        return { ...defaultState, ...parsed };
      }
    } catch (err) {
      console.error('[KV READ ERROR]', err.message);
    }
  }

  // 2. Fallback to reading from local filesystem / container cache
  try {
    const content = await fs.readFile(DB_PATH, 'utf8');
    return { ...defaultState, ...JSON.parse(content) };
  } catch (err) {
    // If file doesn't exist, try initializing DB file
    try {
      await fs.writeFile(DB_PATH, JSON.stringify(defaultState, null, 2), 'utf8');
    } catch (writeErr) {
      // Ignore write errors in read-only environment
    }
    return defaultState;
  }
}

// Helper to mutate state atomically across Cloud KV and local FS
async function mutateState(updater, action, operator) {
  return dbMutex.enqueue(async () => {
    const state = await readState();
    const updatedState = updater(state);

    // 1. Persist to Cloud KV if configured
    if (KV_URL && KV_TOKEN) {
      try {
        await fetch(`${KV_URL}/set/hacknclash_state`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${KV_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(JSON.stringify(updatedState)),
        });
      } catch (err) {
        console.error('[KV WRITE ERROR]', err.message);
      }
    }

    // 2. Persist to local file cache
    try {
      await fs.writeFile(DB_PATH, JSON.stringify(updatedState, null, 2), 'utf8');
      if (action) {
        await writeAuditLog(action, operator);
      }
    } catch (err) {
      console.warn('[FS WRITE WARNING]', err.message);
    }

    return updatedState;
  });
}

// Dynamic status calculation
function computeStatus(state, now) {
  if (!state.startedAt) {
    return 'READY';
  }
  const endsAtTime = new Date(state.endsAt).getTime();
  const nowTime = now.getTime();
  
  if (nowTime >= endsAtTime) {
    return 'ENDED';
  }
  return 'LIVE';
}

// Setup Express App
const app = express();
app.use(helmet());
app.use(cors({
  origin: '*', // For development, customize for production
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// In-memory rate limiting for login attempts
const loginAttempts = new Map();
const LOCKOUT_LIMIT = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

function checkLoginLockout(req, res, next) {
  const ip = req.ip;
  const record = loginAttempts.get(ip);
  
  if (record && record.attempts >= LOCKOUT_LIMIT) {
    const remainingTime = record.lockoutUntil - Date.now();
    if (remainingTime > 0) {
      return res.status(429).json({
        error: `Too many login attempts. Try again in ${Math.ceil(remainingTime / 60000)} minutes.`
      });
    } else {
      loginAttempts.delete(ip); // Lockout expired
    }
  }
  next();
}

function recordFailedLogin(ip) {
  const record = loginAttempts.get(ip) || { attempts: 0, lockoutUntil: 0 };
  record.attempts += 1;
  if (record.attempts >= LOCKOUT_LIMIT) {
    record.lockoutUntil = Date.now() + LOCKOUT_TIME;
    console.warn(`[SECURITY] IP ${ip} locked out due to repeated failed login attempts.`);
  }
  loginAttempts.set(ip, record);
}

function clearFailedLogins(ip) {
  loginAttempts.delete(ip);
}

// Authentication Middleware
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// Public status endpoint
app.get('/api/round/status', async (req, res) => {
  try {
    const state = await readState();
    const now = new Date();
    const status = computeStatus(state, now);
    
    res.json({
      status,
      startedAt: state.startedAt,
      endsAt: state.endsAt,
      serverTime: now.toISOString(),
    });
  } catch (err) {
    console.error('Error fetching round status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Public start round action (Inauguration screen clicks this)
app.post('/api/round/start', async (req, res) => {
  try {
    const state = await readState();
    const now = new Date();
    const currentStatus = computeStatus(state, now);
    
    if (currentStatus !== 'READY') {
      return res.status(400).json({ 
        error: `Cannot start round. Current status is ${currentStatus}.` 
      });
    }

    const updated = await mutateState(
      (s) => ({
        ...s,
        startedAt: now.toISOString(),
      }),
      'START_ROUND_1',
      'GUEST_INAUTURATION'
    );

    res.json({
      status: 'LIVE',
      startedAt: updated.startedAt,
      endsAt: updated.endsAt,
      serverTime: now.toISOString()
    });
  } catch (err) {
    console.error('Error starting round:', err);
    res.status(500).json({ error: 'Failed to start round' });
  }
});

// Admin Login
app.post('/api/admin/login', checkLoginLockout, async (req, res) => {
  const { password } = req.body;
  const ip = req.ip;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!isValid) {
      recordFailedLogin(ip);
      return res.status(401).json({ error: 'Incorrect password' });
    }

    clearFailedLogins(ip);
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '4h' });
    
    await writeAuditLog('ADMIN_LOGIN', 'ADMIN');
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin verification status check
app.get('/api/admin/verify', authenticateAdmin, (req, res) => {
  res.json({ valid: true });
});

// Admin Reset Round
app.post('/api/admin/reset', authenticateAdmin, async (req, res) => {
  try {
    const updated = await mutateState(
      (s) => ({
        ...s,
        startedAt: null,
      }),
      'RESET_ROUND_1',
      'ADMIN'
    );

    res.json({
      status: 'READY',
      startedAt: updated.startedAt,
      endsAt: updated.endsAt,
      serverTime: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error resetting round:', err);
    res.status(500).json({ error: 'Failed to reset round' });
  }
});

// Admin Update Deadline
app.post('/api/admin/set-end-time', authenticateAdmin, async (req, res) => {
  const { endsAt } = req.body;

  if (!endsAt) {
    return res.status(400).json({ error: 'End deadline timestamp is required.' });
  }

  // Validate ISO Date format and logic
  const dateObj = new Date(endsAt);
  if (isNaN(dateObj.getTime())) {
    return res.status(400).json({ error: 'Invalid date format. Use ISO-8601 string (e.g. 2026-08-30T23:59:59+05:30).' });
  }

  if (dateObj.getTime() <= Date.now()) {
    return res.status(400).json({ error: 'The new deadline must be a future date and time.' });
  }

  try {
    const updated = await mutateState(
      (s) => ({
        ...s,
        endsAt: dateObj.toISOString(),
      }),
      `SET_DEADLINE: ${dateObj.toISOString()}`,
      'ADMIN'
    );

    res.json({
      status: computeStatus(updated, new Date()),
      startedAt: updated.startedAt,
      endsAt: updated.endsAt,
      serverTime: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error setting end time:', err);
    res.status(500).json({ error: 'Failed to set deadline' });
  }
});

// Serve static client assets in production
const CLIENT_DIST = path.join(__dirname, '../client/dist');
app.use(express.static(CLIENT_DIST));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(CLIENT_DIST, 'index.html'), (err) => {
    if (err) {
      // Fallback if production static assets aren't built
      res.status(404).send('HACK N CLASH API Server is running. Client dashboard not compiled yet.');
    }
  });
});

// Start Server (only when run directly in standalone Node environment)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  HACK 'N' CLASH BACKEND SERVER IS RUNNING     `);
    console.log(`  Port: ${PORT}                                `);
    console.log(`  Mode: Production/Event-Ready                `);
    console.log(`===============================================`);
  });
}

export default app;
