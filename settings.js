/**
 * BRIAN-TECH Respiratory Settings Configuration
 * Main configuration file for respiratory monitoring and management system
 */

const settings = {
  // Repository Information
  repository: {
    owner: 'Brian-kipz',
    number: 1288187429,
    name: 'brian-tech',
    fullName: 'Brian-kipz/brian-tech'
  },

  // Application Information
  app: {
    name: 'BRIAN-TECH',
    version: '1.0.0',
    description: 'Respiratory Monitoring and Management System',
    environment: process.env.NODE_ENV || 'development'
  },

  // Respiratory Monitoring Settings
  respiratory: {
    // Breathing Rate Parameters (breaths per minute)
    breathingRate: {
      min: 12,
      max: 20,
      criticalLow: 8,
      criticalHigh: 30,
      unit: 'bpm'
    },

    // Oxygen Saturation Parameters (SpO2 %)
    oxygenSaturation: {
      normal: { min: 95, max: 100 },
      warning: { min: 90, max: 94 },
      critical: { min: 0, max: 89 },
      unit: 'percent'
    },

    // CO2 Levels (end-tidal CO2 in mmHg)
    carbonDioxide: {
      normal: { min: 35, max: 45 },
      hypoventilation: { min: 45, max: 60 },
      hyperventilation: { min: 20, max: 35 },
      unit: 'mmHg'
    },

    // Tidal Volume Settings (mL)
    tidalVolume: {
      min: 400,
      max: 800,
      target: 600,
      unit: 'mL'
    },

    // Respiratory Mechanics
    mechanics: {
      measurePIP: true, // Peak Inspiratory Pressure
      measurePlat: true, // Plateau Pressure
      measureCompliance: true,
      measureResistance: true
    }
  },

  // Alert Thresholds
  alerts: {
    enabled: true,
    severityLevels: {
      low: { color: '#FFD700', priority: 1 }, // Yellow
      medium: { color: '#FF8C00', priority: 2 }, // Orange
      high: { color: '#FF4500', priority: 3 }, // Red
      critical: { color: '#8B0000', priority: 4 } // Dark Red
    },
    soundEnabled: true,
    notificationMethod: 'sound-visual' // 'sound-visual', 'visual', 'sound'
  },

  // Data Collection
  data: {
    sampleRate: 100, // Hz
    bufferSize: 1024,
    storageLocation: './data',
    archiveAfterDays: 30,
    backupEnabled: true,
    backupFrequency: 'daily'
  },

  // User Interface
  ui: {
    theme: 'dark', // 'dark' or 'light'
    language: 'en',
    refreshRate: 1000, // milliseconds
    graphUpdateInterval: 500, // milliseconds
    graphTimeWindow: 300 // seconds
  },

  // Device Connection
  device: {
    connectionType: 'serial', // 'serial', 'bluetooth', 'usb'
    baudRate: 115200,
    serialPort: '/dev/ttyUSB0', // Windows: 'COM3', Linux/Mac: '/dev/ttyUSB0'
    autoConnect: true,
    connectionTimeout: 5000, // milliseconds
    reconnectAttempts: 3
  },

  // Calibration Settings
  calibration: {
    enabled: true,
    autoCalibration: true,
    calibrationInterval: 24, // hours
    lastCalibration: null,
    calibrationDeviation: 0.5 // percent
  },

  // Patient Information
  patient: {
    recordDefault: false,
    recordPatientID: true,
    anonymizeData: false,
    consentRequired: true
  },

  // Export Settings
  export: {
    formats: ['csv', 'json', 'pdf'],
    defaultFormat: 'csv',
    includeTimestamps: true,
    includeCalculations: true,
    compressionEnabled: true
  },

  // Logging
  logging: {
    enabled: true,
    level: 'info', // 'debug', 'info', 'warn', 'error'
    logFile: './logs/brian-tech.log',
    maxLogSize: '10m',
    maxLogFiles: 5
  },

  // Database Configuration
  database: {
    type: 'sqlite', // 'sqlite', 'mysql', 'postgresql'
    host: 'localhost',
    port: 5432,
    database: 'brian_tech_respiratory',
    username: 'admin',
    password: process.env.DB_PASSWORD || 'default_password',
    synchronize: true,
    logging: false
  },

  // API Settings (if applicable)
  api: {
    enabled: true,
    port: process.env.PORT || 3000,
    host: 'localhost',
    cors: {
      enabled: true,
      origin: ['http://localhost:3000', 'http://localhost:3001']
    },
    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100
    }
  },

  // Security Settings
  security: {
    enableSSL: false,
    sslCert: './certs/certificate.pem',
    sslKey: './certs/key.pem',
    passwordMinLength: 8,
    sessionTimeout: 30, // minutes
    enableTwoFactor: false
  }
};

// Export configuration
module.exports = settings;

// Alternatively, export as default for ES6 modules
// export default settings;
