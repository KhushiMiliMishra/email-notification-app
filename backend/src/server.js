const express = require('express');
const cors = require('cors');
const config = require('./config/environment');
const routes = require('./routes');
const { verifyTransporter } = require('./config/mailer');

const app = express();

// ==========================================
// Middleware Configuration
// ==========================================

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    // In development, allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin || config.isDevelopment) {
      return callback(null, true);
    }
    if (config.clientUrls.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS.`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// JSON and URL-encoded request body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development mode)
if (config.isDevelopment) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ==========================================
// API Routes
// ==========================================
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Email Notification Application Backend API',
    healthCheck: '/api/health',
    documentation: '/api/docs'
  });
});

// ==========================================
// 404 Handler
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// ==========================================
// Global Error Handler
// ==========================================
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(config.isDevelopment && { stack: err.stack })
  });
});

// ==========================================
// Server Startup
// ==========================================
const PORT = config.port;

const server = app.listen(PORT, async () => {
  console.log('====================================================');
  console.log(`🚀 Server running in [${config.env.toUpperCase()}] mode`);
  console.log(`📡 Listening on http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log('====================================================');

  // Verify SMTP connectivity on startup
  try {
    await verifyTransporter();
  } catch (error) {
    console.warn('[Startup] Warning: SMTP connection check encountered an issue:', error.message);
  }
});

module.exports = { app, server };

