const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

// Load environment variables FIRST
dotenv.config();

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const verificationRoutes = require('./routes/verification.routes');
const profileRoutes = require('./routes/profile.routes');
const postRoutes = require('./routes/post.routes');
const commentRoutes = require('./routes/comment.routes');
const notificationRoutes = require('./routes/notification.routes');
const anonymousRoutes = require('./routes/anonymous.routes');
const securityRoutes = require('./routes/securityRoutes');
const betaTestingRoutes = require('./routes/betaTestingRoutes');
const abTestRoutes = require('./routes/abTestRoutes');
const achievementsRoutes = require('./routes/achievements.routes');
const messageRoutes = require('./routes/message.routes');

// Create Express app
const app = express();
const server = http.createServer(app);

// Environment variables with defaults
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/linkedher';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET;

// Validate required environment variables in production
if (NODE_ENV === 'production') {
  if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET is required in production');
    process.exit(1);
  }
  if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
    console.error('❌ MONGODB_URI is required in production');
    process.exit(1);
  }
}

// Setup Socket.IO with production-ready configuration
const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        CLIENT_URL,
        'https://linkedher.vercel.app',
        'https://linkedher-frontend.vercel.app'
      ].filter(Boolean);
      
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
});

// Create uploads directories only if not in serverless environment
const createUploadsDirectories = () => {
  try {
    const directories = [
      'uploads/id-documents',
      'uploads/media',
      'uploads/anonymous',
      'uploads/bug-reports'
    ];

    directories.forEach(dir => {
      const dirPath = path.join(__dirname, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    });
  } catch (error) {
    console.log('⚠️ Could not create upload directories (normal in serverless):', error.message);
  }
};

createUploadsDirectories();

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS configuration for production and development
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      CLIENT_URL,
      'https://linkedher.vercel.app',
      'https://linkedher-frontend.vercel.app'
    ].filter(Boolean);
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV 
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'LinkedHer API Server',
    version: '1.0.0',
    environment: NODE_ENV
  });
});

// Socket.IO middleware for authentication
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.id || decoded.user?.id;
    next();
  } catch (err) {
    console.error('Socket authentication error:', err);
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.userId}`);
  
  socket.join(`user_${socket.userId}`);
  
  socket.on('typing_start', ({ conversationId }) => {
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      userId: socket.userId,
      conversationId
    });
  });
  
  socket.on('typing_stop', ({ conversationId }) => {
    socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', {
      userId: socket.userId,
      conversationId
    });
  });
  
  socket.on('join_conversation', ({ conversationId }) => {
    socket.join(`conversation_${conversationId}`);
  });
  
  socket.on('leave_conversation', ({ conversationId }) => {
    socket.leave(`conversation_${conversationId}`);
  });
  
  socket.on('disconnect', () => {
    console.log(`👤 User disconnected: ${socket.userId}`);
  });
});

// Add Socket.IO to app
app.set('io', io);
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts/:postId/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/anonymous', anonymousRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/beta-testing', betaTestingRoutes);
app.use('/api/ab-tests', abTestRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/messages', messageRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'API endpoint not found',
    requestedPath: req.originalUrl 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.stack);
  
  if (NODE_ENV === 'production') {
    res.status(500).json({ message: 'Internal server error' });
  } else {
    res.status(500).json({ 
      message: 'Server Error',
      error: err.message,
      stack: err.stack 
    });
  }
});

// MongoDB connection function - FIXED for Railway
const connectToDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 Environment:', NODE_ENV);
    
    // In production, only use the provided MONGODB_URI
    let mongoUri = MONGODB_URI;
    
    if (NODE_ENV === 'production') {
      console.log('🔗 Using production MongoDB URI');
    } else {
      console.log('🔗 Using development MongoDB URI:', mongoUri);
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
      bufferMaxEntries: 0,
      maxPoolSize: 10,
      minPoolSize: 5,
    });
    
    console.log('✅ Connected to MongoDB successfully');
    
    // Test the connection
    await mongoose.connection.db.admin().ping();
    console.log('✅ MongoDB ping successful');
    
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    
    if (NODE_ENV === 'production') {
      console.error('💀 Exiting: Database required in production');
      process.exit(1);
    } else {
      console.log('⚠️ Continuing without database for development');
      return false;
    }
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📴 SIGTERM received, shutting down gracefully');
  await mongoose.connection.close();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Start server
const startServer = async () => {
  try {
    const dbConnected = await connectToDatabase();
    
    if (NODE_ENV === 'production' && !dbConnected) {
      console.error('💀 Database connection required in production');
      process.exit(1);
    }
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 Server started successfully');
      console.log(`📍 Environment: ${NODE_ENV}`);
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`🔗 CORS enabled for: ${CLIENT_URL}`);
      console.log(`📊 Database: ${dbConnected ? 'Connected' : 'Disconnected'}`);
    });
  } catch (error) {
    console.error('💀 Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
