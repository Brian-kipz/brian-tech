/**
 * BRIAN-TECH Respiratory Monitoring Application
 * Entry point for the respiratory health tracking system
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config');

const app = express();

// ============= MIDDLEWARE =============
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ============= DATABASE CONNECTION =============
const connectDatabase = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || config.database.mongoURI;
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });
        
        console.log('✅ MongoDB Connected Successfully');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        // Retry connection after 5 seconds
        setTimeout(connectDatabase, 5000);
    }
};

// ============= API ROUTES =============

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'BRIAN-TECH Respiratory Monitoring',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        name: 'BRIAN-TECH',
        description: 'Respiratory Monitoring and Health Tracking Application',
        version: '1.0.0',
        author: 'Brian-kipz',
        status: 'running',
        endpoints: {
            health: '/api/health',
            monitoring: '/api/monitoring',
            data: '/api/data',
            stats: '/api/stats',
        },
        documentation: 'https://github.com/Brian-kipz/brian-tech#readme',
    });
});

// Placeholder respiratory data endpoints
app.get('/api/monitoring', (req, res) => {
    res.status(200).json({
        message: 'Respiratory monitoring endpoint',
        features: [
            'Real-time respiratory rate tracking',
            'Breathing pattern analysis',
            'Health alerts and notifications',
            'Historical data storage',
        ],
        status: 'ready',
    });
});

app.get('/api/data', (req, res) => {
    res.status(200).json({
        message: 'Respiratory data access endpoint',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        status: 'ready',
    });
});

app.get('/api/stats', (req, res) => {
    res.status(200).json({
        message: 'Health statistics endpoint',
        metrics: ['daily_average', 'weekly_trends', 'alerts_generated', 'user_compliance'],
        status: 'ready',
    });
});

// Error handling for undefined routes
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.path} does not exist`,
        method: req.method,
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message,
    });
});

// ============= SERVER INITIALIZATION =============
const startServer = async () => {
    try {
        // Connect to database
        await connectDatabase();

        const PORT = process.env.PORT || config.server.port || 3000;
        
        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(50));
            console.log('🚀 BRIAN-TECH Server Started Successfully');
            console.log('='.repeat(50));
            console.log(`📡 Server running on: http://localhost:${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📊 API Health: GET http://localhost:${PORT}/api/health`);
            console.log('='.repeat(50) + '\n');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n📴 Shutting down gracefully...');
    mongoose.connection.close(() => {
        console.log('✅ MongoDB connection closed');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n📴 Terminating server...');
    process.exit(0);
});

// Start the application
startServer();

module.exports = app;
