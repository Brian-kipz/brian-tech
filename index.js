const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
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
    uptime: process.uptime()
  });
});

// Respiratory Data Endpoints
app.get('/api/respiratory', (req, res) => {
  res.json({
    message: 'Respiratory monitoring data endpoint',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  });
});

// Get respiratory data for a user
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
app.post('/api/respiratory', (req, res) => {
  const { userId, respiratoryRate, oxygenLevel, timestamp } = req.body;
  
  if (!userId || !respiratoryRate || !oxygenLevel) {
    return res.status(400).json({
      error: 'Missing required fields: userId, respiratoryRate, oxygenLevel'
    });
  }

  res.status(201).json({
    success: true,
    message: 'Respiratory data recorded',
    data: {
      userId,
      respiratoryRate,
      oxygenLevel,
      timestamp: timestamp || new Date().toISOString()
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
