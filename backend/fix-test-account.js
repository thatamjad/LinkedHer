/**
 * Setup script to create a permanent test account and fix common authentication issues
 * Run this with: node fix-test-account.js
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import models
const User = require('./models/user.model');
const { createComprehensiveTestData } = require('./utils/testDataHelper');

// MongoDB connection
const connectDB = async () => {
  try {
    // First try the same URI that the running server uses
    const mongoUri = 'mongodb://127.0.0.1:27018/';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB (same as server)');
  } catch (error) {
    // Try alternative connections
    const alternatives = [
      'mongodb://127.0.0.1:27017/linker',
      'mongodb://localhost:27017/linker',
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/test'
    ];
    
    for (const uri of alternatives) {
      try {
        await mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 3000
        });
        console.log('✅ Connected to MongoDB:', uri);
        return;
      } catch (fallbackError) {
        console.log('⚠️ Failed to connect to:', uri);
      }
    }
    
    console.error('❌ All MongoDB connections failed');
    console.log('💡 Make sure the backend server is running first (npm start)');
    process.exit(1);
  }
};

const createPermanentTestAccount = async () => {
  try {
    console.log('🔧 Setting up permanent test account...\n');

    // Delete existing test accounts
    await User.deleteMany({ 
      $or: [
        { email: 'test@example.com' },
        { email: 'testuser@linker.com' },
        { email: 'demo@linker.com' }
      ]
    });    // Use plain password - let the User model's pre-save middleware handle hashing
    const password = 'TestPassword123!';

    // Create multiple test accounts for different scenarios
    const testAccounts = [
      {
        email: 'testuser@linker.com',
        password: password,
        firstName: 'Test',
        lastName: 'User',
        verificationStatus: 'verified',
        bio: 'Senior Software Developer & Tech Enthusiast. Available for testing the Linker platform.',
        role: 'user',
        isActive: true,
        security: {
          twoFactorEnabled: false,
          failedLoginAttempts: { count: 0 }
        },
        verificationMethods: {
          linkedIn: { 
            verified: true,
            data: {
              profileId: 'test-linkedin-profile',
              firstName: 'Test',
              lastName: 'User',
              email: 'testuser@linker.com',
              verifiedAt: new Date()
            }
          },
          professionalEmail: { 
            verified: true, 
            email: 'testuser@linker.com',
            verifiedAt: new Date()
          }
        },
        verificationScore: 95      },
      {
        email: 'demo@linker.com',
        password: password,
        firstName: 'Demo',
        lastName: 'Account',
        verificationStatus: 'verified',
        bio: 'Product Manager & Innovation Leader. Demo account for Linker platform testing.',
        role: 'user',
        isActive: true,
        security: {
          twoFactorEnabled: false,
          failedLoginAttempts: { count: 0 }
        },
        verificationMethods: {
          linkedIn: { 
            verified: true,
            data: {
              profileId: 'demo-linkedin-profile',
              firstName: 'Demo',
              lastName: 'Account',
              email: 'demo@linker.com',
              verifiedAt: new Date()
            }
          },
          professionalEmail: { 
            verified: true, 
            email: 'demo@linker.com',
            verifiedAt: new Date()
          }
        },
        verificationScore: 90
      }
    ];

    const createdUsers = [];
    for (const accountData of testAccounts) {
      const user = new User(accountData);
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created account: ${user.email}`);
    }

    // Create comprehensive test data for each account
    for (const user of createdUsers) {
      await createComprehensiveTestData(user._id);
      console.log(`✅ Created test data for: ${user.email}`);
    }

    console.log('\n🎉 Permanent test accounts created successfully!\n');
    console.log('📋 LOGIN CREDENTIALS:\n');
    console.log('Account 1:');
    console.log('  Email: testuser@linker.com');
    console.log('  Password: TestPassword123!\n');
    console.log('Account 2:');
    console.log('  Email: demo@linker.com');
    console.log('  Password: TestPassword123!\n');
    console.log('✨ These accounts will persist across server restarts');
    console.log('🔧 You can login with these credentials instead of using test-login');

  } catch (error) {
    console.error('❌ Error creating test accounts:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await createPermanentTestAccount();
  } catch (error) {
    console.error('Failed to setup test accounts:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
};

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { createPermanentTestAccount };
