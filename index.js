const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { default: makeWASocket, useMultiFileAuthState, delay, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Global variable to store the WhatsApp socket instance
let sock = null;

// Readline interface for terminal input (used to grab phone number if not in .env)
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

// ==========================================
// WHATSAPP CONNECTION LOGIC (BAILEYS)
// ==========================================
async function connectToWhatsApp() {
  // Save authentication state to "./auth_info" folder so you only have to pair once
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // Disabling QR code since we are using pairing code
    logger: pino({ level: 'silent' }),
    browser: ["Ubuntu", "Chrome", "20.0.04"] // Required for pairing to succeed
  });

  // Pairing Code Flow
  if (!sock.authState.creds.registered) {
    let phoneNumber = process.env.PHONE_NUMBER;

    if (!phoneNumber) {
      console.log('\n======================================================');
      phoneNumber = await question('📱 Enter your WhatsApp phone number with country code (e.g. 254712345678): ');
      console.log('======================================================\n');
    }

    // Clean phone number (remove +, spaces, or dashes)
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

    try {
      await delay(3000); // Wait for socket to stabilize
      const code = await sock.requestPairingCode(phoneNumber);
      console.log('\n======================================================');
      console.log(`🔑 YOUR WHATSAPP PAIRING CODE IS: \x1b[32m${code}\x1b[0m`);
      console.log('👉 Open WhatsApp -> Linked Devices -> Link with Phone Number');
      console.log('======================================================\n');
    } catch (err) {
      console.error('❌ Failed to generate pairing code:', err);
    }
  }

  // Handle connection updates
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('⚠️ WhatsApp Connection closed. Reconnecting...', shouldReconnect);
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      console.log('✅ \x1b[32mSuccessfully connected to WhatsApp!\x1b[0m');
    }
  });

  // Keep credentials updated
  sock.ev.on('creds.update', saveCreds);
}

// Start WhatsApp background connection
connectToWhatsApp();


// ==========================================
// EXPRESS SERVER ROUTES
// ==========================================

// Helper function to send WhatsApp messages
async function sendWhatsAppAlert(targetNumber, message) {
  if (!sock) {
    console.log('⚠️ Cannot send message: WhatsApp socket is not ready.');
    return false;
  }
  try {
    // Standardize WhatsApp ID format
    const formattedJid = `${targetNumber.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    await sock.sendMessage(formattedJid, { text: message });
    console.log(`✉️ WhatsApp notification successfully sent to ${targetNumber}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error);
    return false;
  }
}

// Home Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to BRIAN-TECH Respiratory Monitoring API',
    version: '1.0.0',
    status: 'Server is running',
    endpoints: {
      health: '/api/health',
      respiratory: '/api/respiratory',
      users: '/api/users'
    }
  });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    whatsapp_connected: sock?.user ? true : false
  });
});

// Respiratory Data Endpoints
app.get('/api/respiratory', (req, res) => {
  res.json({
    message: 'Respiratory monitoring data endpoint',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  });
});

// GET respiratory data for a user
app.get('/api/respiratory/:userId', (req, res) => {
  const { userId } = req.params;
  res.json({
    userId,
    message: 'Respiratory data for user',
    data: [],
    timestamp: new Date().toISOString()
  });
});

// POST new respiratory reading (triggers a WhatsApp message)
app.post('/api/respiratory', async (req, res) => {
  const { userId, respiratoryRate, oxygenLevel, timestamp, phoneToSendAlert } = req.body;
  
  if (!userId || !respiratoryRate || !oxygenLevel) {
    return res.status(400).json({
      error: 'Missing required fields: userId, respiratoryRate, oxygenLevel'
    });
  }

  const recordTime = timestamp || new Date().toISOString();

  // If a phone number is provided in the request body, send an alert directly to WhatsApp
  let waSent = false;
  if (phoneToSendAlert) {
    const alertMessage = `🚨 *BRIAN-TECH Respiratory Alert* 🚨\n\n👤 *User:* ${userId}\n🫁 *Resp Rate:* ${respiratoryRate} bpm\n🩸 *Oxygen Level:* ${oxygenLevel}%\n📅 *Time:* ${new Date(recordTime).toLocaleString()}\n\n_System status: Monitoring..._`;
    waSent = await sendWhatsAppAlert(phoneToSendAlert, alertMessage);
  }

  res.status(201).json({
    success: true,
    message: 'Respiratory data recorded',
    whatsapp_notification: phoneToSendAlert ? (waSent ? 'Sent' : 'Failed to Send') : 'No alert number provided',
    data: {
      userId,
      respiratoryRate,
      oxygenLevel,
      timestamp: recordTime
    }
  });
});

// User Endpoints
app.get('/api/users', (req, res) => {
  res.json({
    message: 'Users endpoint',
    users: []
  });
});

// Create a new user
app.post('/api/users', (req, res) => {
  const { name, email, age } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({
      error: 'Missing required fields: name, email'
    });
  }

  res.status(201).json({
    success: true,
    message: 'User created',
    user: {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      age,
      createdAt: new Date().toISOString()
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/respiratory',
      'GET /api/respiratory/:userId',
      'POST /api/respiratory',
      'GET /api/users',
      'POST /api/users'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BRIAN-TECH Respiratory Monitoring Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🫁 Ready to monitor respiratory health data`);
});

module.exports = app;