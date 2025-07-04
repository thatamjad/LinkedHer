// MongoDB Connection Test Script
// Run this to verify your connection string works

const mongoose = require('mongoose');
require('dotenv').config();

// Replace this with your actual MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://thatamjad:Amjad%401413@linkedher-production.nhyv4ey.mongodb.net/linkedher?retryWrites=true&w=majority';

const testConnection = async () => {
  try {
    console.log('🔄 Testing MongoDB connection...');
    console.log('📍 Connection string (password hidden):', MONGODB_URI.replace(/:([^@]+)@/, ':****@'));
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ MongoDB connection successful!');
    
    // Test ping
    await mongoose.connection.db.admin().ping();
    console.log('✅ MongoDB ping successful!');
    
    // List databases
    const adminDb = mongoose.connection.db.admin();
    const databases = await adminDb.listDatabases();
    console.log('📊 Available databases:', databases.databases.map(db => db.name));
    
    console.log('🎉 All tests passed! Your MongoDB connection is working.');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('🔍 Error details:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('🚨 Issue: Username or password is incorrect');
      console.error('📝 Solution: Check your MongoDB Atlas Database Access settings');
    } else if (error.message.includes('timed out')) {
      console.error('🚨 Issue: Connection timeout');
      console.error('📝 Solution: Check your MongoDB Atlas Network Access settings');
    } else if (error.message.includes('hostname')) {
      console.error('🚨 Issue: Incorrect cluster URL');
      console.error('📝 Solution: Check your connection string format');
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 Connection closed');
    }
    process.exit();
  }
};

// Run the test
testConnection();
