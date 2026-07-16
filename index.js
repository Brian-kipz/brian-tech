const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { default: makeWASocket, useMultiFileAuthState, delay, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// BOT CONFIGURATION WITH PREFIX
// ==========================================
const PREFIX = process.env.PREFIX || '!';
const BOT_NAME = 'BRIAN-TECH';
const BOT_VERSION = '1.0.0';

const botConfig = {
  prefix: PREFIX,
  botName: BOT_NAME,
  version: BOT_VERSION,
  description: 'WhatsApp Respiratory Monitoring Bot'
};

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Global variable to store the WhatsApp socket instance
let sock = null;

// Readline interface for terminal input
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

// ==========================================
// BOT CONNECTION STATUS MESSAGE
// ==========================================
const displayBotStatus = () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║          BRIAN-TECH BOT - CONNECTED           ║
╠═══════════════════════════════════════════════╣
║ 🤖 Bot Name: ${BOT_NAME.padEnd(29)}║
║ 📊 Status: Active & Connected to WhatsApp   ║
║ ⚙️  Command Prefix: ${PREFIX.padEnd(32)}║
║ 📌 Version: ${BOT_VERSION.padEnd(33)}║
║ 🫁 Module: Respiratory Monitoring System    ║
╚═══════════════════════════════════════════════╝
  `);
};

// ==========================================
// WHATSAPP CONNECTION LOGIC (BAILEYS)
// ==========================================
async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: ["Ubuntu", "Chrome", "20.0.04"]
  });

  // Pairing Code Flow
  if (!sock.authState.creds.registered) {
    let phoneNumber = process.env.PHONE_NUMBER;

    if (!phoneNumber) {
      console.log('\n======================================================');
      phoneNumber = await question('📱 Enter your WhatsApp phone number with country code (e.g. 254712345678): ');
      console.log('======================================================\n');
    }

    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

    try {
      await delay(3000);
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
      console.log('\n✅ \x1b[32mSuccessfully connected to WhatsApp!\x1b[0m\n');
      displayBotStatus();
      sendConnectionStatusToChat();
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

// ==========================================
// SEND BOT CONNECTION STATUS TO WHATSAPP
// ==========================================
async function sendConnectionStatusToChat() {
  if (!sock) return;
  
  try {
    // Get bot's own number
    const myNumber = sock.user?.id?.split(':')[0];
    if (!myNumber) return;

    const statusMessage = `
╔═══════════════════════════════════════════╗
║  ✅ ${BOT_NAME} BOT - CONNECTED         ║
╠═══════════════════════════════════════════╣
║ 🤖 Status: Online & Active               ║
║ 📡 Connected to WhatsApp                 ║
║ ⚙️  Prefix: ${PREFIX.padEnd(32)}║
║ 🫁 Module: Respiratory Monitoring        ║
║ 📌 Version: ${BOT_VERSION.padEnd(25)}║
╠═══════════════════════════════════════════╣
║ Usage: Type ${PREFIX}help for commands       ║
╚═══════════════════════════════════════════╝
    `;

    const jid = `${myNumber}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text: statusMessage });
    console.log('📤 Bot connection status sent to WhatsApp');
  } catch (error) {
    console.error('⚠️ Could not send status message:', error.message);
  }
}

// ==========================================
// COMMAND HANDLER WITH PREFIX
// ==========================================
const parseCommand = (message) => {
  if (!message.startsWith(PREFIX)) {
    return null;
  }

  const args = message.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  return {
    prefix: PREFIX,
    command: command,
    args: args,
    fullCommand: message
  };
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================
async function sendWhatsAppAlert(targetNumber, message) {
  if (!sock) {
    console.log('⚠️ Cannot send message: WhatsApp socket is not ready.');
    return false;
  }
  try {
    const formattedJid = `${targetNumber.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    await sock.sendMessage(formattedJid, { text: message });
    console.log(`✉️ WhatsApp notification successfully sent to ${targetNumber}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error);
    return false;
  }
}

// ==========================================
// EXPRESS SERVER ROUTES
// ==========================================

// Home Route
app.get('/', (req, res) => {
  res.json({
    message: `Welcome to ${BOT_NAME} Respiratory Monitoring API`,
    version: BOT_VERSION,
    status: 'Server is running',
    prefix: PREFIX,
    whatsapp_status: sock?.user ? 'Connected' : 'Disconnected',
    endpoints: {
      health: '/api/health',
      respiratory: '/api/respiratory',
      users: '/api/users',
      bot_info: '/api/bot'
    }
  });
});

// Bot Info Endpoint
app.get('/api/bot', (req, res) => {
  res.json({
    name: BOT_NAME,
    version: BOT_VERSION,
    prefix: PREFIX,
    status: sock?.user ? 'Connected to WhatsApp' : 'Disconnected',
    description: 'WhatsApp Bot for Respiratory Monitoring',
    phoneNumber: sock?.user?.id || 'Not connected',
    uptime: process.uptime()
  });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    bot_name: BOT_NAME,
    prefix: PREFIX,
    whatsapp_connected: sock?.user ? true : false
  });
});

// Respiratory Data Endpoints
app.get('/api/respiratory', (req, res) => {
  res.json({
    message: 'Respiratory monitoring data endpoint',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    prefix_info: `Use ${PREFIX} prefix for bot commands`
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

// POST new respiratory reading
app.post('/api/respiratory', async (req, res) => {
  const { userId, respiratoryRate, oxygenLevel, timestamp, phoneToSendAlert } = req.body;
  
  if (!userId || !respiratoryRate || !oxygenLevel) {
    return res.status(400).json({
      error: 'Missing required fields: userId, respiratoryRate, oxygenLevel'
    });
  }

  const recordTime = timestamp || new Date().toISOString();

  let waSent = false;
  if (phoneToSendAlert) {
    const alertMessage = `🚨 *${BOT_NAME} Respiratory Alert* 🚨\n\n👤 *User:* ${userId}\n🫁 *Resp Rate:* ${respiratoryRate} bpm\n🩸 *Oxygen Level:* ${oxygenLevel}%\n📅 *Time:* ${recordTime}\n\n⚙️ Prefix: ${PREFIX}`;
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
      'GET /api/bot',
      'GET /api/health',
      'GET /api/respiratory',
      'GET /api/respiratory/:userId',
      'POST /api/respiratory',
      'GET /api/users',
      'POST /api/users'
    ]
  });
});

// ==========================================
// START SERVER AND BOT
// ==========================================
connectToWhatsApp();

app.listen(PORT, () => {
  console.log(`🚀 ${BOT_NAME} Respiratory Monitoring Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🫁 Ready to monitor respiratory health data`);
  console.log(`⚙️  Bot Prefix: ${PREFIX}`);
});

module.exports = app;
