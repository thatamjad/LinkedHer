// Helper function to create comprehensive test data for a user
async function createComprehensiveTestData(userId) {
  try {
    const Profile = require('../models/profile.model');
    const Post = require('../models/post.model');
    const Achievement = require('../models/achievement.model');
    const AnalyticsEvent = require('../models/analyticsEvent.model');
    
    console.log('Creating comprehensive test data for user:', userId);
    
    // Check if data already exists
    const existingProfile = await Profile.findOne({ user: userId });
    if (existingProfile) {
      console.log('Test data already exists for this user');
      return;
    }
    
    // Create profile
    const profile = new Profile({
      user: userId,
      headline: 'Senior Software Developer | Full Stack Engineer | Tech Innovator',
      skills: [
        { name: 'JavaScript', level: 'expert', verified: true },
        { name: 'React', level: 'expert', verified: true },
        { name: 'Node.js', level: 'advanced', verified: true },
        { name: 'Python', level: 'advanced', verified: false },
        { name: 'Cloud Computing', level: 'advanced', verified: true }
      ],
      experience: [{
        title: 'Senior Software Developer',
        company: 'Tech Innovations Inc.',
        location: 'San Francisco, CA',
        startDate: new Date('2021-01-01'),
        endDate: null,
        current: true,
        description: 'Leading development of scalable web applications using modern technologies.'
      }],
      education: [{
        institution: 'University of Technology',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: new Date('2015-09-01'),
        endDate: new Date('2019-05-31'),
        gpa: '3.8'
      }],
      certifications: [{
        name: 'AWS Certified Solutions Architect',
        issuingOrganization: 'Amazon Web Services',
        issueDate: new Date('2022-03-15'),
        expirationDate: new Date('2025-03-15')
      }],
      languages: [
        { language: 'English', proficiency: 'Native/Bilingual' },
        { language: 'Spanish', proficiency: 'Intermediate' }
      ],
      visibility: 'public'
    });
    await profile.save();
    
    // Create posts
    const posts = [
      {
        user: userId,
        content: {
          text: 'Excited to announce that I just completed my AWS certification! The journey was challenging but incredibly rewarding. #AWS #CloudComputing',
          formatting: {}
        },
        visibility: 'public',
        engagement: {
          likes: { count: 23 },
          shares: { count: 5 },
          comments: { count: 8 }
        },
        tags: ['AWS', 'CloudComputing'],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        user: userId,
        content: {
          text: 'Just wrapped up an amazing project using React and Node.js. The power of modern JavaScript never ceases to amaze me!',
          formatting: {}
        },
        visibility: 'public',
        engagement: {
          likes: { count: 15 },
          shares: { count: 3 },
          comments: { count: 12 }
        },
        tags: ['React', 'NodeJS'],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        user: userId,
        content: {
          text: 'Attending TechConf 2024 next week! Excited to learn about the latest trends in AI and machine learning. #TechConf2024 #AI',
          formatting: {}
        },
        visibility: 'public',
        engagement: {
          likes: { count: 31 },
          shares: { count: 8 },
          comments: { count: 6 }
        },
        tags: ['TechConf2024', 'AI'],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];
    await Post.insertMany(posts);
    
    // Create achievements
    const achievements = [
      {
        user: userId,
        title: 'AWS Certified Solutions Architect',
        description: 'Successfully completed AWS Solutions Architect certification with distinction',
        category: 'career',
        achievedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        isVerified: true,
        privacy: 'public'
      },
      {
        user: userId,
        title: 'Project Lead Excellence',
        description: 'Led a team of 5 developers to deliver a complex web application ahead of schedule',
        category: 'career',
        achievedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        isVerified: true,
        privacy: 'public'
      },
      {
        user: userId,
        title: 'Open Source Contributor',
        description: 'Made significant contributions to 3 major open source projects',
        category: 'community',
        achievedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        isVerified: true,
        privacy: 'public'
      },
      {
        user: userId,
        title: 'Innovation Award',
        description: 'Received company innovation award for developing an AI-powered code review system',
        category: 'career',
        achievedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        isVerified: true,
        privacy: 'public'
      },
      {
        user: userId,
        title: 'Technical Mentor',
        description: 'Successfully mentored 5 junior developers, helping them advance their careers',
        category: 'community',
        achievedAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
        isVerified: true,
        privacy: 'public'
      }
    ];
    await Achievement.insertMany(achievements);
    
    // Create analytics events (for profile views, etc.)
    const events = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dailyViews = Math.floor(Math.random() * 10) + 1;
      
      for (let j = 0; j < dailyViews; j++) {
        events.push({
          eventType: 'profile_view',
          user: userId,
          timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
          featureArea: 'professionalMode',
          metadata: { source: 'search_results' }
        });
      }
    }
    await AnalyticsEvent.insertMany(events);
    
    console.log('✅ Comprehensive test data created successfully');
    console.log(`   - Profile: ✓`);
    console.log(`   - Posts: ${posts.length}`);
    console.log(`   - Achievements: ${achievements.length}`);
    console.log(`   - Analytics events: ${events.length}`);
    
  } catch (error) {
    console.error('Error creating test data:', error);
  }
}

module.exports = { createComprehensiveTestData };
