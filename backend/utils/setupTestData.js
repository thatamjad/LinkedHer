const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const config = require('../config');

// Import models
const User = require('../models/user.model');
const Profile = require('../models/profile.model');
const Post = require('../models/post.model');
const Achievement = require('../models/achievement.model');
const AnalyticsEvent = require('../models/analyticsEvent.model');
const Notification = require('../models/notification.model');

// Connect to MongoDB
let MONGODB_URI;
if (process.env.NODE_ENV !== 'production') {
  MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/test';
} else {
  MONGODB_URI = config.mongoURI;
}

mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    console.log('MongoDB connected to:', MONGODB_URI);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    try {
      await mongoose.connect('mongodb://localhost:27017/linker', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 3000
      });
      console.log('Connected to fallback MongoDB');
    } catch (fallbackErr) {
      console.error('All MongoDB connection attempts failed:', fallbackErr.message);
      process.exit(1);
    }
  }
};

const createTestUser = async () => {
  try {
    // Delete existing test user and related data
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Removing existing test user and related data...');
      await Profile.deleteMany({ user: existingUser._id });
      await Post.deleteMany({ user: existingUser._id });
      await Achievement.deleteMany({ user: existingUser._id });
      await AnalyticsEvent.deleteMany({ user: existingUser._id });
      await Notification.deleteMany({ user: existingUser._id });
      await User.deleteOne({ email: 'test@example.com' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123', salt);

    // Create test user
    const testUser = new User({
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      verificationStatus: 'verified',
      bio: 'Passionate software developer and tech enthusiast. Love building innovative solutions and connecting with fellow professionals.',
      role: 'user',
      isActive: true,
      security: {
        twoFactorEnabled: false
      },
      verificationMethods: {
        linkedIn: { 
          verified: true,
          data: {
            profileId: 'test-linkedin-id',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            verifiedAt: new Date()
          }
        },
        professionalEmail: { 
          verified: true, 
          email: 'test@example.com',
          verifiedAt: new Date()
        }
      },
      verificationScore: 85
    });

    await testUser.save();
    console.log('✓ Test user created');

    return testUser;
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
};

const createTestProfile = async (userId) => {
  try {
    const profile = new Profile({
      user: userId,
      headline: 'Senior Software Developer | Full Stack Engineer | Tech Innovator',
      skills: [
        { name: 'JavaScript', level: 'expert', verified: true },
        { name: 'React', level: 'expert', verified: true },
        { name: 'Node.js', level: 'advanced', verified: true },
        { name: 'Python', level: 'advanced', verified: false },
        { name: 'Machine Learning', level: 'intermediate', verified: false },
        { name: 'Cloud Computing', level: 'advanced', verified: true }
      ],
      experience: [{
        title: 'Senior Software Developer',
        company: 'Tech Innovations Inc.',
        location: 'San Francisco, CA',
        startDate: new Date('2021-01-01'),
        endDate: null,
        current: true,
        description: 'Leading development of scalable web applications using modern technologies. Mentoring junior developers and driving technical decisions.'
      }, {
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        location: 'New York, NY',
        startDate: new Date('2019-06-01'),
        endDate: new Date('2020-12-31'),
        current: false,
        description: 'Built and maintained multiple client-facing applications. Collaborated with cross-functional teams to deliver high-quality software solutions.'
      }],
      education: [{
        institution: 'University of Technology',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: new Date('2015-09-01'),
        endDate: new Date('2019-05-31'),
        gpa: '3.8'
      }],      certifications: [{
        name: 'AWS Certified Solutions Architect',
        issuingOrganization: 'Amazon Web Services',
        issueDate: new Date('2022-03-15'),
        expirationDate: new Date('2025-03-15'),
        credentialURL: 'https://aws.amazon.com/certification/verify/AWS-SA-12345'
      }],
      languages: [
        { language: 'English', proficiency: 'Native/Bilingual' },
        { language: 'Spanish', proficiency: 'Intermediate' }
      ],      websites: [
        { title: 'Portfolio', url: 'https://testuser.dev' },
        { title: 'GitHub', url: 'https://github.com/testuser' }
      ],
      visibility: 'public'
    });

    await profile.save();
    console.log('✓ Test profile created');
    return profile;
  } catch (error) {
    console.error('Error creating test profile:', error);
    throw error;
  }
};

const createTestPosts = async (userId) => {
  try {
    const posts = [
      {
        user: userId,
        content: {
          text: 'Excited to announce that I just completed my AWS certification! The journey was challenging but incredibly rewarding. Looking forward to applying these cloud skills in upcoming projects. #AWS #CloudComputing #ProfessionalDevelopment',
          formatting: {}
        },
        visibility: 'public',        engagement: {
          likes: { count: 23 },
          shares: { count: 5 },
          comments: { count: 8 }
        },
        tags: ['AWS', 'CloudComputing', 'ProfessionalDevelopment'],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        user: userId,
        content: {
          text: 'Just wrapped up an amazing project using React and Node.js. The power of modern JavaScript never ceases to amaze me! What are your favorite tech stacks for web development?',
          formatting: {}
        },
        visibility: 'public',        engagement: {
          likes: { count: 15 },
          shares: { count: 3 },
          comments: { count: 12 }
        },
        tags: ['React', 'NodeJS', 'WebDevelopment'],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        user: userId,
        content: {
          text: 'Attending TechConf 2024 next week! Excited to learn about the latest trends in AI and machine learning. Who else will be there? #TechConf2024 #AI #MachineLearning',
          formatting: {}
        },
        visibility: 'public',        engagement: {
          likes: { count: 31 },
          shares: { count: 8 },
          comments: { count: 6 }
        },
        tags: ['TechConf2024', 'AI', 'MachineLearning'],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
      }
    ];

    const createdPosts = await Post.insertMany(posts);
    console.log(`✓ Created ${createdPosts.length} test posts`);
    return createdPosts;
  } catch (error) {
    console.error('Error creating test posts:', error);
    throw error;
  }
};

const createTestAchievements = async (userId) => {
  try {
    const achievements = [
      {
        user: userId,
        title: 'AWS Certified Solutions Architect',
        description: 'Successfully completed AWS Solutions Architect certification with distinction',
        category: 'career',
        achievedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
        isVerified: true,
        privacy: 'public'
      },
      {
        user: userId,
        title: 'Project Lead Excellence',
        description: 'Led a team of 5 developers to deliver a complex web application 2 weeks ahead of schedule',
        category: 'career',
        achievedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
        isVerified: true,
        privacy: 'public'
      },
      {
        user: userId,
        title: 'Open Source Contributor',
        description: 'Made significant contributions to 3 major open source projects',
        category: 'community',
        achievedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
        isVerified: true,
        privacy: 'public'
      },
      {
        user: userId,
        title: 'Technical Mentor',
        description: 'Successfully mentored 5 junior developers, helping them advance their careers',
        category: 'community',
        achievedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 4 months ago
        isVerified: true,
        privacy: 'public'
      },
      {
        user: userId,
        title: 'Innovation Award',
        description: 'Received company innovation award for developing an AI-powered code review system',
        category: 'career',
        achievedAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000), // 5 months ago
        isVerified: true,
        privacy: 'public'
      }
    ];

    const createdAchievements = await Achievement.insertMany(achievements);
    console.log(`✓ Created ${createdAchievements.length} test achievements`);
    return createdAchievements;
  } catch (error) {
    console.error('Error creating test achievements:', error);
    throw error;
  }
};

const createTestAnalytics = async (userId) => {
  try {
    const events = [];
    const eventTypes = ['profile_view', 'post_view', 'post_like', 'profile_search', 'skill_endorsement'];
    
    // Create analytics events for the past 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dailyViews = Math.floor(Math.random() * 10) + 1; // 1-10 views per day
      
      for (let j = 0; j < dailyViews; j++) {
        events.push({
          eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          user: userId,
          timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
          featureArea: 'professionalMode',
          metadata: {
            source: 'profile_page',
            viewerLocation: 'search_results'
          }
        });
      }
    }

    const createdEvents = await AnalyticsEvent.insertMany(events);
    console.log(`✓ Created ${createdEvents.length} analytics events`);
    return createdEvents;
  } catch (error) {
    console.error('Error creating test analytics:', error);
    throw error;
  }
};

const createTestNotifications = async (userId) => {
  try {
    // Create some fake users to act as senders
    const fakeSenders = await User.insertMany([
      {
        email: 'sarah.johnson@example.com',
        password: 'hashedpassword123',
        firstName: 'Sarah',
        lastName: 'Johnson',
        verificationStatus: 'verified',
        bio: 'Tech enthusiast and community leader',
        role: 'user',
        isActive: true
      },
      {
        email: 'tech.community@example.com',
        password: 'hashedpassword123',
        firstName: 'Tech',
        lastName: 'Community',
        verificationStatus: 'verified',
        bio: 'Official tech community account',
        role: 'user',
        isActive: true
      }
    ]);

    const notifications = [
      {
        recipient: userId,
        sender: fakeSenders[0]._id,
        type: 'connection_request',
        content: {
          title: 'Sarah Johnson connected with you',
          body: 'Sarah Johnson would like to connect with you on the platform'
        },
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        recipient: userId,
        sender: fakeSenders[1]._id,
        type: 'share_post',
        content: {
          title: 'Tech Community shared your post',
          body: 'Your post about AWS certification was shared by Tech Community'
        },
        isRead: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      {
        recipient: userId,
        sender: userId, // System notification
        type: 'skill_endorsement',
        content: {
          title: 'You earned a new badge',
          body: 'Congratulations! You\'ve earned the "Innovation Award" badge'
        },
        isRead: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];

    const createdNotifications = await Notification.insertMany(notifications);
    console.log(`✓ Created ${createdNotifications.length} test notifications`);
    return createdNotifications;
  } catch (error) {
    console.error('Error creating test notifications:', error);
    throw error;
  }
};

// Main setup function
const setupTestData = async () => {
  try {
    await connectDB();
    
    console.log('Setting up comprehensive test data...\n');
    
    const testUser = await createTestUser();
    await createTestProfile(testUser._id);
    await createTestPosts(testUser._id);
    await createTestAchievements(testUser._id);
    await createTestAnalytics(testUser._id);
    await createTestNotifications(testUser._id);
    
    console.log('\n✅ Test data setup complete!');
    console.log('\nTest user credentials:');
    console.log('Email: test@example.com');
    console.log('Password: Password123');
    console.log('\nYou can now use the test-login endpoint or login normally.');
    console.log('The test account now has:');
    console.log('- Complete profile with skills, experience, and education');
    console.log('- 3 sample posts with engagement');
    console.log('- 5 achievements');
    console.log('- 30 days of analytics data (profile views, etc.)');
    console.log('- Recent notifications');
    
  } catch (error) {
    console.error('Error setting up test data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Execute if run directly
if (require.main === module) {
  setupTestData();
}

module.exports = { setupTestData };
