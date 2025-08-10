const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const logger = require('./config/logger');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',     // Frontend dev server
    'http://localhost:5173',     // Vite dev server
    'https://fitnessgeek.clintgeek.com', // Production domain
    'http://192.168.1.17:4080'   // Local network access
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/foods', require('./routes/foodRoutes'));
app.use('/api/logs', require('./routes/logRoutes'));
app.use('/api/summary', require('./routes/summaryRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/meals', require('./routes/mealRoutes'));
app.use('/api/weight', require('./routes/weightRoutes'));
app.use('/api/blood-pressure', require('./routes/bloodPressureRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/streaks', require('./routes/streakRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/fitness', require('./routes/fitnessRoutes'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND'
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    },
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FitnessGeek API server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 AI features enabled`);
});

module.exports = app;