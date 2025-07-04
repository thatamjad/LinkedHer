const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const config = require('../config');

// Connect to MongoDB - use the same connection as the main server
let MONGODB_URI;

// Check if we're in development and should use in-memory MongoDB
if (process.env.NODE_ENV !== 'production') {
  // Try to connect to the in-memory MongoDB that the server might be using
  MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/test';
} else {
  MONGODB_URI = config.mongoURI;
}

// Set mongoose options to prevent deprecation warnings
mongoose.set('strictQuery', false);

// Connect to MongoDB with shorter timeout for testing
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // 5 second timeout
  connectTimeoutMS: 5000
})
.then(() => console.log('MongoDB connected to:', MONGODB_URI))
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  console.log('Trying alternative connection...');
  
  // Try alternative connection to local MongoDB
  return mongoose.connect('mongodb://localhost:27017/auraconnect', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 3000
  });
})
.catch(err => {
  console.error('All MongoDB connection attempts failed:', err.message);
  console.log('Please ensure MongoDB is running or the server is started');
  process.exit(1);
});

// Load User model - use the correct path to the user model
const User = require('../models/user.model');

// Create test user function
const createTestUser = async () => {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'testuser@auraconnect.com' });
    
    if (existingUser) {
      console.log('Test user already exists!');
      console.log('Email: testuser@auraconnect.com');
      console.log('Password: TestPassword123!');
      mongoose.connection.close();
      return;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('TestPassword123!', salt);
    
    // Create new test user
    const testUser = new User({
      email: 'testuser@auraconnect.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      verificationStatus: 'verified',
      bio: 'This is a test user account for development purposes.',
      role: 'user',
      isActive: true,
      security: {
        twoFactorEnabled: false
      }
    });
    
    // Save user to database
    await testUser.save();
    
    console.log('Test user created successfully!');
    console.log('Email: testuser@auraconnect.com');
    console.log('Password: TestPassword123!');
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Execute the function
createTestUser(); 