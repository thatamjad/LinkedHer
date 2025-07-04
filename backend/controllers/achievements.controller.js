const Achievement = require('../models/achievement.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

// Create a new achievement
exports.createAchievement = async (req, res) => {
  try {
    const { 
      title, description, category, achievedAt, mediaUrls, 
      skills, location, organization, privacy, relatedProjects, relatedMentors 
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !category || !achievedAt) {
      return res.status(400).json({ 
        message: 'Title, description, category, and achievement date are required' 
      });
    }
    
    const newAchievement = new Achievement({
      user: req.user.id,
      title,
      description,
      category,
      achievedAt: new Date(achievedAt),
      mediaUrls: mediaUrls || [],
      skills: skills || [],
      location: location || '',
      organization: organization || '',
      privacy: privacy || 'public',
      relatedProjects: relatedProjects || [],
      relatedMentors: relatedMentors || []
    });
    
    const savedAchievement = await newAchievement.save();
    
    // Check if achievement should be shared on feed
    if (privacy === 'public') {
      // Set flag for sharing on feed
      savedAchievement.isSharedOnFeed = true;
      await savedAchievement.save();
      
      // TODO: Create post for this achievement on the feed
    }
    
    res.status(201).json(savedAchievement);
  } catch (error) {
    console.error('Error creating achievement:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 