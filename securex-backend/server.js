const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
const { validateEnv, getSafeEnvReport } = require('./utils/envValidation');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Socket authentication using JWT
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) return next(new Error('Authentication token missing'));
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
});

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const threatRoutes = require('./routes/threats');
const securityRoutes = require('./routes/security');
const complianceRoutes = require('./routes/compliance');
const systemRoutes = require('./routes/system');
const aiRoutes = require('./routes/ai');
const callRoutes = require('./routes/call');

// Middleware
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

// Security
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Rate limiter
app.use('/api', rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Too many requests, please try again later.' }
}));

// Core middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(compression());
app.use(logger);

validateEnv({ failOnMissing: true });

// Socket connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Client ${socket.id} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Attach io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/threats', threatRoutes);
app.use('/api/v1/security', securityRoutes);
app.use('/api/v1/compliance', complianceRoutes);
app.use('/api/v1/system', systemRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/call', callRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SecureX API is running smoothly',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/health/env', (req, res) => {
  res.status(200).json({ success: true, report: getSafeEnvReport() });
});

// Undefined routes
app.all('*', (req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

// Database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectDB();
  
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`⚠️  Port ${PORT} is already in use. Please try these solutions:
      1. Kill the process using the port: lsof -i :${PORT} then kill -9 PID
      2. Use a different port: PORT=5001 npm run dev
      3. Wait a few seconds and try again\n`);
      process.exit(1);
    } else {
      console.error('Server error:', error);
      process.exit(1);
    }
  });

  server.listen(PORT, () => {
    console.log(`SecureX Backend running on port ${PORT} [${process.env.NODE_ENV || 'development'} mode]`);
  });
};

// Unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

startServer();
module.exports = app;
