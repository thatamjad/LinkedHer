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

// Get all achievements for the current user
exports.getMyAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ user: req.user.id })
      .populate('verifiedBy.user', 'firstName lastName profileImage')
      .populate('celebrations.user', 'firstName lastName profileImage')
      .populate('comments.user', 'firstName lastName profileImage')
      .populate('relatedProjects', 'title')
      .populate('relatedMentors', 'firstName lastName profileImage')
      .sort({ achievedAt: -1 });
    
    res.status(200).json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get achievements for a specific user (respecting privacy settings)
exports.getUserAchievements = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Build query based on privacy settings
    const query = { user: userId };
    
    // If not the user themselves, respect privacy settings
    if (userId !== req.user.id) {
      // Check if users are connected
      const viewingUser = await User.findById(req.user.id);
      const isConnected = viewingUser.connections.includes(mongoose.Types.ObjectId(userId));
      
      if (isConnected) {
        // Show public and connections-only achievements
        query.privacy = { $in: ['public', 'connections'] };
      } else {
        // Show only public achievements
        query.privacy = 'public';
      }
    }
    
    const achievements = await Achievement.find(query)
      .populate('verifiedBy.user', 'firstName lastName profileImage')
      .populate('celebrations.user', 'firstName lastName profileImage')
      .populate('comments.user', 'firstName lastName profileImage')
      .populate('relatedProjects', 'title')
      .populate('relatedMentors', 'firstName lastName profileImage')
      .sort({ achievedAt: -1 });
    
    res.status(200).json(achievements);
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single achievement by id
exports.getAchievementById = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id)
      .populate('user', 'firstName lastName profileImage')
      .populate('verifiedBy.user', 'firstName lastName profileImage')
      .populate('celebrations.user', 'firstName lastName profileImage')
      .populate('comments.user', 'firstName lastName profileImage')
      .populate('relatedProjects', 'title')
      .populate('relatedMentors', 'firstName lastName profileImage');
    
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }
    
    // Check privacy settings
    if (achievement.user._id.toString() !== req.user.id) {
      if (achievement.privacy === 'private') {
        return res.status(403).json({ message: 'This achievement is private' });
      }
      
      if (achievement.privacy === 'connections') {
        // Check if users are connected
        const viewingUser = await User.findById(req.user.id);
        const isConnected = viewingUser.connections.includes(mongoose.Types.ObjectId(achievement.user._id));
        
        if (!isConnected) {
          return res.status(403).json({ 
            message: 'This achievement is only visible to connections' 
          });
        }
      }
    }
    
    res.status(200).json(achievement);
  } catch (error) {
    console.error('Error fetching achievement:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an achievement (owner only)
exports.updateAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }
    
    // Check if user is the owner
    if (achievement.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own achievements' });
    }
    
    const { 
      title, description, category, achievedAt, mediaUrls, 
      skills, location, organization, privacy, isHighlighted,
      relatedProjects, relatedMentors 
    } = req.body;
    
    // Update fields if provided
    if (title) achievement.title = title;
    if (description) achievement.description = description;
    if (category) achievement.category = category;
    if (achievedAt) achievement.achievedAt = new Date(achievedAt);
    if (mediaUrls) achievement.mediaUrls = mediaUrls;
    if (skills) achievement.skills = skills;
    if (location !== undefined) achievement.location = location;
    if (organization !== undefined) achievement.organization = organization;
    if (privacy) achievement.privacy = privacy;
    if (isHighlighted !== undefined) achievement.isHighlighted = isHighlighted;
    if (relatedProjects) achievement.relatedProjects = relatedProjects;
    if (relatedMentors) achievement.relatedMentors = relatedMentors;
    
    // Update feed sharing status if privacy changed
    if (privacy && privacy !== achievement.privacy) {
      achievement.isSharedOnFeed = privacy === 'public';
    }
    
    await achievement.save();
    
    res.status(200).json(achievement);
  } catch (error) {
    console.error('Error updating achievement:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an achievement (owner only)
exports.deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }
    
    // Check if user is the owner
    if (achievement.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own achievements' });
    }
    
    await Achievement.deleteOne({ _id: req.params.id });
    
    res.status(200).json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify an achievement
exports.verifyAchievement = async (req, res) => {
  try {
    const { relationship } = req.body;
    
    if (!relationship) {
      return res.status(400).json({ message: 'Relationship is required for verification' });
    }
    
    const achievement = await Achievement.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }
    
    // Check if achievement is public or user is connected
    if (achievement.privacy === 'private') {
      return res.status(403).json({ message: 'Cannot verify a private achievement' });
    }
    
    if (achievement.privacy === 'connections') {
      // Check if users are connected
      const viewingUser = await User.findById(req.user.id);
      const isConnected = viewingUser.connections.includes(mongoose.Types.ObjectId(achievement.user._id));
      
      if (!isConnected) {
        return res.status(403).json({ 
          message: 'You can only verify achievements of your connections' 
        });
      }
    }
    
    // Check if user already verified
    const alreadyVerified = achievement.verifiedBy.some(verifier => 
      verifier.user.toString() === req.user.id
    );
    
    if (alreadyVerified) {
      return res.status(400).json({ message: 'You have already verified this achievement' });
    }
    
    // Add verification
    achievement.verifiedBy.push({
      user: req.user.id,
      relationship,
      verifiedAt: Date.now()
    });
    
    // Update verification status if this is the first verification
    if (achievement.verifiedBy.length === 1) {
      achievement.isVerified = true;
    }
    
    await achievement.save();
    
    res.status(200).json({ message: 'Achievement verified successfully' });
  } catch (error) {
    console.error('Error verifying achievement:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Celebrate an achievement
exports.celebrateAchievement = async (req, res) => {
  try {
    const { message } = req.body;
    
    const achievement = await Achievement.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }
    
    // Check privacy settings
    if (achievement.user.toString() !== req.user.id) {
      if (achievement.privacy === 'private') {
        return res.status(403).json({ message: 'This achievement is private' });
      }
      
      if (achievement.privacy === 'connections') {
        // Check if users are connected
        const viewingUser = await User.findById(req.user.id);
        const isConnected = viewingUser.connections.includes(mongoose.Types.ObjectId(achievement.user));
        
        if (!isConnected) {
          return res.status(403).json({ 
            message: 'This achievement is only visible to connections' 
          });
        }
      }
    }
    
    // Check if user already celebrated
    const alreadyCelebrated = achievement.celebrations.some(celebration => 
      celebration.user.toString() === req.user.id
    );
    
    if (alreadyCelebrated) {
      return res.status(400).json({ message: 'You have already celebrated this achievement' });
    }
    
    // Add celebration
    achievement.celebrations.push({
      user: req.user.id,
      message: message || '',
      createdAt: Date.now()
    });
    
    // Update celebration count
    achievement.celebrationCount = achievement.celebrations.length;
    
    await achievement.save();
    
    res.status(200).json({ message: 'Achievement celebrated successfully' });
  } catch (error) {
    console.error('Error celebrating achievement:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add comment to an achievement
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    
    const achievement = await Achievement.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }
    
    // Check privacy settings
    if (achievement.user.toString() !== req.user.id) {
      if (achievement.privacy === 'private') {
        return res.status(403).json({ message: 'This achievement is private' });
      }
      
      if (achievement.privacy === 'connections') {
        // Check if users are connected
        const viewingUser = await User.findById(req.user.id);
        const isConnected = viewingUser.connections.includes(mongoose.Types.ObjectId(achievement.user));
        
        if (!isConnected) {
          return res.status(403).json({ 
            message: 'This achievement is only visible to connections' 
          });
        }
      }
    }
    
    // Add comment
    achievement.comments.push({
      user: req.user.id,
      content,
      createdAt: Date.now()
    });
    
    await achievement.save();
    
    // Return the newly added comment with populated user
    const updatedAchievement = await Achievement.findById(req.params.id)
      .populate('comments.user', 'firstName lastName profileImage');
    
    const newComment = updatedAchievement.comments[updatedAchievement.comments.length - 1];
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a comment (comment author or achievement owner only)
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const achievement = await Achievement.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }
    
    // Find the comment
    const commentIndex = achievement.comments.findIndex(comment => 
      comment._id.toString() === commentId
    );
    
    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the comment author or achievement owner
    const isCommentAuthor = achievement.comments[commentIndex].user.toString() === req.user.id;
    const isAchievementOwner = achievement.user.toString() === req.user.id;
    
    if (!isCommentAuthor && !isAchievementOwner) {
      return res.status(403).json({ 
        message: 'You can only delete your own comments or comments on your achievements' 
      });
    }
    
    // Remove comment
    achievement.comments.splice(commentIndex, 1);
    await achievement.save();
    
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle highlight status of an achievement
exports.toggleHighlight = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }
    
    // Check if user is the owner
    if (achievement.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only highlight your own achievements' });
    }
    
    // Toggle highlight status
    achievement.isHighlighted = !achievement.isHighlighted;
    await achievement.save();
    
    res.status(200).json({ 
      message: `Achievement ${achievement.isHighlighted ? 'highlighted' : 'unhighlighted'} successfully`,
      isHighlighted: achievement.isHighlighted
    });
  } catch (error) {
    console.error('Error toggling highlight status:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 