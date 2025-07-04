#!/usr/bin/env node
/**
 * Production Setup Test Script
 * Tests MongoDB connection and JWT configuration for Railway deployment
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Test configuration values
console.log('🧪 LinkedHer Production Setup Test');
console.log('=====================================');

// 1. Test environment variables
console.log('\n1️⃣ Environment Variables Check:');
const requiredEnvVars = [
  'NODE_ENV',
  'MONGODB_URI', 
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

let envCheck = true;
for (const envVar of requiredEnvVars) {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${envVar.includes('SECRET') ? '***HIDDEN***' : value}`);
  } else {
    console.log(`❌ ${envVar}: MISSING`);
    envCheck = false;
  }
}

if (!envCheck) {
  console.log('\n🚨 Missing required environment variables!');
  process.exit(1);
}

// 2. Test MongoDB connection
console.log('\n2️⃣ MongoDB Connection Test:');
async function testMongoDB() {
  try {
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ MongoDB connected successfully');
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections`);
    
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected cleanly');
    
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

// 3. Test JWT functionality
console.log('\n3️⃣ JWT Configuration Test:');
function testJWT() {
  try {
    const testPayload = { 
      user: { id: 'test123' },
      test: true,
      timestamp: Date.now()
    };
    
    // Test JWT creation
    const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('✅ JWT token created successfully');
    
    // Test JWT verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ JWT token verified successfully');
    
    // Test refresh token
    const refreshToken = jwt.sign(testPayload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    console.log('✅ JWT refresh token working');
    
    console.log('✅ All JWT operations successful');
    
  } catch (error) {
    console.log('❌ JWT test failed:', error.message);
    throw error;
  }
}

// Run all tests
async function runTests() {
  try {
    await testMongoDB();
    testJWT();
    
    console.log('\n🎉 All tests passed! Production setup is ready.');
    console.log('\n📋 Next steps:');
    console.log('1. Update Railway environment variables with these values');
    console.log('2. Deploy your application');
    console.log('3. Test the /health endpoint');
    
  } catch (error) {
    console.log('\n💥 Test failed:', error.message);
    console.log('\n🔧 Please fix the issues before deploying to production.');
    process.exit(1);
  }
}

runTests();
