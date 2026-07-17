/**
 * Configuration file for Brian-Tech Respiratory Project
 * This file contains environment variables and configuration settings
 */

const config = {
  // Application Environment
  env: process.env.NODE_ENV || 'development',
  
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
  },

  // Database Configuration
  database: {
    // Fallback updated to use your exact MongoDB connection code
    url: process.env.DATABASE_URL || 'D299125ce161011f0452995de67c653a',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 27017,
    name: process.env.DB_NAME || 'D299125ce161011f0452995de67c653a',
  },

  // API Configuration
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    version: 'v1',
    timeout: process.env.API_TIMEOUT || 30000,
  },

  // Authentication
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiry: process.env.JWT_EXPIRY || '24h',
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  },

  // Features
  features: {
    enableSwagger: process.env.ENABLE_SWAGGER !== 'false',
    enableMetrics: process.env.ENABLE_METRICS !== 'false',
  },
};

// Freeze config to prevent accidental modifications
Object.freeze(config);

module.exports = config;
