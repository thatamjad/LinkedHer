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
const { MongoMemoryServer } = require('mongodb-memory-server');
const config = require('./config');

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
// Note: Other routes temporarily disabled due to middleware issues

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);

// Setup Socket.IO with production-ready configuration
const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        process.env.CLIENT_URL,
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

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads/id-documents');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create media uploads directory
const mediaUploadsDir = path.join(__dirname, 'uploads/media');
if (!fs.existsSync(mediaUploadsDir)) {
  fs.mkdirSync(mediaUploadsDir, { recursive: true });
}

// Create anonymous uploads directory
const anonymousUploadsDir = path.join(__dirname, 'uploads/anonymous');
if (!fs.existsSync(anonymousUploadsDir)) {
  fs.mkdirSync(anonymousUploadsDir, { recursive: true });
}

// Create screenshots directory for bug reports
const screenshotsDir = path.join(__dirname, 'uploads/bug-reports');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Middleware
app.use(helmet()); // Security headers
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev')); // Logging

// CORS configuration for production and development
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      process.env.CLIENT_URL,
      'https://linkedher.vercel.app',
      'https://linkedher-frontend.vercel.app'
    ].filter(Boolean);
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token']
};

app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies

// Make uploads directory accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.IO middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handler with authentication
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.user.id;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  // Join user's room for targeted notifications and messages
  socket.join(`user_${socket.userId}`);
  
  // Handle typing indicators
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
  
  // Join conversation rooms
  socket.on('join_conversation', ({ conversationId }) => {
    socket.join(`conversation_${conversationId}`);
  });
  
  socket.on('leave_conversation', ({ conversationId }) => {
    socket.leave(`conversation_${conversationId}`);
  });
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

// Add Socket.IO instance to app for controllers
app.set('io', io);

// Add Socket.IO instance to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
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

// Add working routes
app.use('/api/achievements', achievementsRoutes);
app.use('/api/messages', messageRoutes);

// Note: Other routes temporarily disabled due to middleware configuration issues

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AuraConnect API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Server Error' });
});

// MongoDB connection function
const connectToDatabase = async () => {
  try {
    let mongoUri;
    
    if (process.env.NODE_ENV !== 'production') {
      // Try in-memory MongoDB first, then fallback to local MongoDB
      try {
        console.log('Attempting to start in-memory MongoDB...');
        const mongod = await MongoMemoryServer.create({
          instance: {
            port: 27018, // Use a different port to avoid conflicts
          }
        });
        mongoUri = mongod.getUri();
        console.log('✅ In-memory MongoDB started:', mongoUri);
      } catch (memoryError) {
        console.log('⚠️  In-memory MongoDB failed, trying local MongoDB...');
        mongoUri = 'mongodb://localhost:27017/auraconnect-dev';
        console.log('Using local MongoDB URI:', mongoUri);
      }
    } else {
      mongoUri = config.mongoURI;
    }

    // Set a connection timeout for faster fallback
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    );
    
    const connectPromise = mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000,
    });

    await Promise.race([connectPromise, timeoutPromise]);
    
    console.log('✅ Connected to MongoDB successfully');
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('📝 Note: For full functionality, ensure MongoDB is running');
    console.log('🚀 Server will continue for frontend development testing');
    // Return true to continue server startup for frontend testing
    return true;
  }
};

// Connect to MongoDB & start server
const PORT = config.port;

connectToDatabase()
  .then((connected) => {
    if (connected) {
      server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log('Environment:', process.env.NODE_ENV || 'development');
      });
    } else {
      console.error('Failed to connect to database');
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

module.exports = app; // For testing 