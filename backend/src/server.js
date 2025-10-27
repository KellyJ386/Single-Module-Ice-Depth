import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import measurementRoutes from './routes/measurements.js';
import './database.js'; // Initialize database

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'IceDepth Pro API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/measurements', measurementRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   ❄️  IceDepth Pro API Server                ║
║                                               ║
║   🚀 Server: http://localhost:${PORT}           ║
║   📊 Health: http://localhost:${PORT}/health    ║
║   🔐 Auth: /api/auth/[login|register]        ║
║   📏 Measurements: /api/measurements          ║
║                                               ║
║   Environment: ${process.env.NODE_ENV || 'development'}                     ║
║                                               ║
╚═══════════════════════════════════════════════╝
  `);
});

export default app;
