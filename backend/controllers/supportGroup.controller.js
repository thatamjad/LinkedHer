const SupportGroup = require('../models/supportGroup.model');
const SupportGroupDiscussion = require('../models/supportGroupDiscussion.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

// Create a new support group
exports.createSupportGroup = async (req, res) => {
  try {
    const { name, description, category, rules, isPrivate, topics } = req.body;
    
    const newGroup = new SupportGroup({
      name,
      description,
      category,
      moderators: [req.user.id],
      rules: rules || [],
      isPrivate: isPrivate || false,
      topics: topics || []
    });
    
    // Add creator as first member
    newGroup.members.push({
      user: req.user.id,
      joinedAt: Date.now(),
      isActive: true
    });
    
    const supportGroup = await newGroup.save();
    res.status(201).json(supportGroup);
  } catch (error) {
    console.error('Error creating support group:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all support groups with filtering
exports.getSupportGroups = async (req, res) => {
  try {
    const { category, topic, search, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (topic) {
      filter.topics = topic;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // If user is not authenticated, only show public groups
    if (!req.user) {
      filter.isPrivate = false;
    }
    
    const options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };
    
    const groups = await SupportGroup.find(filter, null, options)
      .populate('moderators', 'firstName lastName profileImage')
      .populate('members.user', 'firstName lastName profileImage');
    
    const total = await SupportGroup.countDocuments(filter);
    
    res.json({
      groups,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching support groups:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single support group by ID
exports.getSupportGroupById = async (req, res) => {
  try {
    const supportGroup = await SupportGroup.findById(req.params.id)
      .populate('moderators', 'firstName lastName profileImage')
      .populate('members.user', 'firstName lastName profileImage');
    
    if (!supportGroup) {
      return res.status(404).json({ message: 'Support group not found' });
    }
    
    // Check if private and user is a member
    if (supportGroup.isPrivate && req.user) {
      const isMember = supportGroup.members.some(member => 
        member.user._id.toString() === req.user.id && member.isActive
      );
      
      if (!isMember) {
        return res.status(403).json({ message: 'This is a private group' });
      }
    } else if (supportGroup.isPrivate && !req.user) {
      return res.status(403).json({ message: 'This is a private group' });
    }
    
    res.json(supportGroup);
  } catch (error) {
    console.error('Error fetching support group:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a support group
exports.updateSupportGroup = async (req, res) => {
  try {
    const supportGroup = await SupportGroup.findById(req.params.id);
    
    if (!supportGroup) {
      return res.status(404).json({ message: 'Support group not found' });
    }
    
    // Check if user is a moderator
    if (!supportGroup.moderators.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this group' });
    }
    
    const updatableFields = [
      'name', 'description', 'category', 'rules', 
      'isPrivate', 'topics', 'bannerImage', 'colorScheme', 'resourceLinks'
    ];
    
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        supportGroup[field] = req.body[field];
      }
    });
    
    const updatedGroup = await supportGroup.save();
    res.json(updatedGroup);
  } catch (error) {
    console.error('Error updating support group:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Join a support group
exports.joinSupportGroup = async (req, res) => {
  try {
    const supportGroup = await SupportGroup.findById(req.params.id);
    
    if (!supportGroup) {
      return res.status(404).json({ message: 'Support group not found' });
    }
    
    // Check if user is already a member
    const existingMember = supportGroup.members.find(
      member => member.user.toString() === req.user.id
    );
    
    if (existingMember) {
      if (existingMember.isActive) {
        return res.status(400).json({ message: 'Already a member of this group' });
      } else {
        // Reactivate membership
        existingMember.isActive = true;
        await supportGroup.save();
        return res.json({ message: 'Membership reactivated', supportGroup });
      }
    }
    
    // If private group, create join request
    if (supportGroup.isPrivate) {
      // Check if request already exists
      const existingRequest = supportGroup.joinRequests.find(
        request => request.user.toString() === req.user.id
      );
      
      if (existingRequest) {
        return res.status(400).json({ message: 'Join request already exists' });
      }
      
      supportGroup.joinRequests.push({
        user: req.user.id,
        requestedAt: Date.now(),
        status: 'pending'
      });
      
      await supportGroup.save();
      return res.status(200).json({ message: 'Join request submitted', isPending: true });
    }
    
    // For public groups, add member directly
    supportGroup.members.push({
      user: req.user.id,
      joinedAt: Date.now(),
      isActive: true
    });
    
    await supportGroup.save();
    res.json({ message: 'Successfully joined group', supportGroup });
  } catch (error) {
    console.error('Error joining support group:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Leave a support group
exports.leaveSupportGroup = async (req, res) => {
  try {
    const supportGroup = await SupportGroup.findById(req.params.id);
    
    if (!supportGroup) {
      return res.status(404).json({ message: 'Support group not found' });
    }
    
    // Find member and set to inactive
    const memberIndex = supportGroup.members.findIndex(
      member => member.user.toString() === req.user.id && member.isActive
    );
    
    if (memberIndex === -1) {
      return res.status(400).json({ message: 'Not a member of this group' });
    }
    
    // Check if user is the only moderator
    const isLastModerator = 
      supportGroup.moderators.length === 1 && 
      supportGroup.moderators[0].toString() === req.user.id;
    
    if (isLastModerator) {
      return res.status(400).json({ 
        message: 'You are the only moderator. Assign another moderator before leaving.' 
      });
    }
    
    // If moderator, remove from moderators array
    if (supportGroup.moderators.includes(req.user.id)) {
      supportGroup.moderators = supportGroup.moderators.filter(
        id => id.toString() !== req.user.id
      );
    }
    
    // Set member to inactive
    supportGroup.members[memberIndex].isActive = false;
    
    await supportGroup.save();
    res.json({ message: 'Successfully left group' });
  } catch (error) {
    console.error('Error leaving support group:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Handle join requests (approve/reject)
exports.handleJoinRequest = async (req, res) => {
  try {
    const { userId, action } = req.body;
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }
    
    const supportGroup = await SupportGroup.findById(req.params.id);
    
    if (!supportGroup) {
      return res.status(404).json({ message: 'Support group not found' });
    }
    
    // Check if user is a moderator
    if (!supportGroup.moderators.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to manage join requests' });
    }
    
    // Find the join request
    const requestIndex = supportGroup.joinRequests.findIndex(
      request => request.user.toString() === userId && request.status === 'pending'
    );
    
    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Join request not found' });
    }
    
    // Update request status
    supportGroup.joinRequests[requestIndex].status = action === 'approve' ? 'approved' : 'rejected';
    
    // If approved, add to members
    if (action === 'approve') {
      // Check if already a member (but inactive)
      const existingMember = supportGroup.members.find(
        member => member.user.toString() === userId
      );
      
      if (existingMember) {
        existingMember.isActive = true;
      } else {
        supportGroup.members.push({
          user: userId,
          joinedAt: Date.now(),
          isActive: true
        });
      }
    }
    
    await supportGroup.save();
    res.json({ message: `Request ${action === 'approve' ? 'approved' : 'rejected'}`, supportGroup });
  } catch (error) {
    console.error('Error handling join request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a discussion in a support group
exports.createDiscussion = async (req, res) => {
  try {
    const { title, content, isAnonymous, anonymousPersonaId, tags, attachments } = req.body;
    
    const supportGroup = await SupportGroup.findById(req.params.id);
    
    if (!supportGroup) {
      return res.status(404).json({ message: 'Support group not found' });
    }
    
    // Check if user is a member
    const isMember = supportGroup.members.some(
      member => member.user.toString() === req.user.id && member.isActive
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Must be a member to post discussions' });
    }
    
    const newDiscussion = new SupportGroupDiscussion({
      group: req.params.id,
      title,
      content,
      author: req.user.id,
      isAnonymous: isAnonymous || false,
      anonymousPersona: anonymousPersonaId,
      tags: tags || [],
      attachments: attachments || []
    });
    
    const discussion = await newDiscussion.save();
    
    res.status(201).json(await SupportGroupDiscussion.findById(discussion._id)
      .populate('author', 'firstName lastName profileImage')
      .populate('anonymousPersona', 'displayName avatar'));
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get discussions for a support group
exports.getDiscussions = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'latest' } = req.query;
    
    const supportGroup = await SupportGroup.findById(req.params.id);
    
    if (!supportGroup) {
      return res.status(404).json({ message: 'Support group not found' });
    }
    
    // Check if private and user is a member
    if (supportGroup.isPrivate && req.user) {
      const isMember = supportGroup.members.some(
        member => member.user.toString() === req.user.id && member.isActive
      );
      
      if (!isMember) {
        return res.status(403).json({ message: 'Must be a member to view discussions' });
      }
    } else if (supportGroup.isPrivate && !req.user) {
      return res.status(403).json({ message: 'Must be a member to view discussions' });
    }
    
    // Determine sort order
    let sort = {};
    switch (sortBy) {
      case 'latest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'popular':
        sort = { views: -1 };
        break;
      case 'mostComments':
        sort = { 'replies.length': -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }
    
    const options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
      sort
    };
    
    const discussions = await SupportGroupDiscussion.find(
      { group: req.params.id, isActive: true },
      null,
      options
    )
      .populate('author', 'firstName lastName profileImage')
      .populate('anonymousPersona', 'displayName avatar')
      .select('-replies');
    
    const total = await SupportGroupDiscussion.countDocuments({ 
      group: req.params.id,
      isActive: true
    });
    
    res.json({
      discussions,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single discussion with replies
exports.getDiscussionById = async (req, res) => {
  try {
    const { discussionId } = req.params;
    
    const discussion = await SupportGroupDiscussion.findById(discussionId)
      .populate('author', 'firstName lastName profileImage')
      .populate('anonymousPersona', 'displayName avatar')
      .populate('replies.author', 'firstName lastName profileImage')
      .populate('replies.anonymousPersona', 'displayName avatar');
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    const supportGroup = await SupportGroup.findById(discussion.group);
    
    // Check if private and user is a member
    if (supportGroup.isPrivate && req.user) {
      const isMember = supportGroup.members.some(
        member => member.user.toString() === req.user.id && member.isActive
      );
      
      if (!isMember) {
        return res.status(403).json({ message: 'Must be a member to view this discussion' });
      }
    } else if (supportGroup.isPrivate && !req.user) {
      return res.status(403).json({ message: 'Must be a member to view this discussion' });
    }
    
    // Increment view count
    discussion.views += 1;
    await discussion.save();
    
    res.json(discussion);
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a reply to a discussion
exports.addReply = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content, isAnonymous, anonymousPersonaId } = req.body;
    
    const discussion = await SupportGroupDiscussion.findById(discussionId);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    const supportGroup = await SupportGroup.findById(discussion.group);
    
    // Check if user is a member
    const isMember = supportGroup.members.some(
      member => member.user.toString() === req.user.id && member.isActive
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Must be a member to reply' });
    }
    
    const reply = {
      content,
      author: req.user.id,
      isAnonymous: isAnonymous || false,
      anonymousPersona: anonymousPersonaId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    discussion.replies.push(reply);
    await discussion.save();
    
    // Populate the newly added reply
    const updatedDiscussion = await SupportGroupDiscussion.findById(discussionId)
      .populate('author', 'firstName lastName profileImage')
      .populate('anonymousPersona', 'displayName avatar')
      .populate('replies.author', 'firstName lastName profileImage')
      .populate('replies.anonymousPersona', 'displayName avatar');
    
    const newReply = updatedDiscussion.replies[updatedDiscussion.replies.length - 1];
    
    res.status(201).json(newReply);
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add reaction to a discussion or reply
exports.addReaction = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { type, replyId } = req.body;
    
    if (!['support', 'thanks', 'insightful', 'relatable', 'helpful'].includes(type)) {
      return res.status(400).json({ message: 'Invalid reaction type' });
    }
    
    const discussion = await SupportGroupDiscussion.findById(discussionId);
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    const supportGroup = await SupportGroup.findById(discussion.group);
    
    // Check if user is a member
    const isMember = supportGroup.members.some(
      member => member.user.toString() === req.user.id && member.isActive
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Must be a member to react' });
    }
    
    // Add reaction to either discussion or specific reply
    if (replyId) {
      const replyIndex = discussion.replies.findIndex(
        reply => reply._id.toString() === replyId
      );
      
      if (replyIndex === -1) {
        return res.status(404).json({ message: 'Reply not found' });
      }
      
      // Check if user already reacted
      const existingReaction = discussion.replies[replyIndex].reactions.findIndex(
        reaction => reaction.user.toString() === req.user.id && reaction.type === type
      );
      
      if (existingReaction !== -1) {
        // Remove existing reaction (toggle off)
        discussion.replies[replyIndex].reactions.splice(existingReaction, 1);
      } else {
        // Add new reaction
        discussion.replies[replyIndex].reactions.push({
          user: req.user.id,
          type,
          createdAt: Date.now()
        });
      }
    } else {
      // Reaction to main discussion
      const existingReaction = discussion.reactions.findIndex(
        reaction => reaction.user.toString() === req.user.id && reaction.type === type
      );
      
      if (existingReaction !== -1) {
        // Remove existing reaction (toggle off)
        discussion.reactions.splice(existingReaction, 1);
      } else {
        // Add new reaction
        discussion.reactions.push({
          user: req.user.id,
          type,
          createdAt: Date.now()
        });
      }
    }
    
    await discussion.save();
    
    res.json({ message: 'Reaction updated', success: true });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all support groups for a user
exports.getUserGroups = async (req, res) => {
  try {
    // Find all groups where user is a member
    const groups = await SupportGroup.find({
      'members.user': req.user.id,
      'members.isActive': true
    })
      .populate('moderators', 'firstName lastName profileImage')
      .select('-members -joinRequests');
    
    res.json(groups);
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Manage moderators
exports.manageGroupModerators = async (req, res) => {
  try {
    const { userId, action } = req.body;
    
    if (!['add', 'remove'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }
    
    const supportGroup = await SupportGroup.findById(req.params.id);
    
    if (!supportGroup) {
      return res.status(404).json({ message: 'Support group not found' });
    }
    
    // Check if user is a moderator
    if (!supportGroup.moderators.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to manage moderators' });
    }
    
    // Check if user exists and is a member
    const isMember = supportGroup.members.some(
      member => member.user.toString() === userId && member.isActive
    );
    
    if (!isMember) {
      return res.status(400).json({ message: 'User must be an active member to be a moderator' });
    }
    
    if (action === 'add') {
      // Add as moderator if not already
      if (!supportGroup.moderators.includes(userId)) {
        supportGroup.moderators.push(userId);
      } else {
        return res.status(400).json({ message: 'User is already a moderator' });
      }
    } else {
      // Remove as moderator
      if (supportGroup.moderators.includes(userId)) {
        // Prevent removing the last moderator
        if (supportGroup.moderators.length <= 1) {
          return res.status(400).json({ message: 'Cannot remove the last moderator' });
        }
        
        supportGroup.moderators = supportGroup.moderators.filter(
          id => id.toString() !== userId
        );
      } else {
        return res.status(400).json({ message: 'User is not a moderator' });
      }
    }
    
    await supportGroup.save();
    res.json({ 
      message: `User successfully ${action === 'add' ? 'added to' : 'removed from'} moderators`,
      supportGroup 
    });
  } catch (error) {
    console.error('Error managing moderators:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get support group statistics
exports.getSupportGroupStats = async (req, res) => {
  try {
    const totalGroups = await SupportGroup.countDocuments();
    
    // Get category distribution
    const categoryStats = await SupportGroup.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get most active groups
    const mostActiveGroups = await SupportGroup.find()
      .sort({ 'members.length': -1 })
      .limit(5)
      .select('name category members');
    
    let userStats = {};
    
    if (req.user) {
      const userGroups = await SupportGroup.countDocuments({
        'members.user': req.user.id,
        'members.isActive': true
      });
      
      const userModeratedGroups = await SupportGroup.countDocuments({
        moderators: req.user.id
      });
      
      userStats = {
        joinedGroups: userGroups,
        moderatedGroups: userModeratedGroups
      };
    }
    
    res.json({
      totalGroups,
      categoryStats,
      mostActiveGroups,
      userStats
    });
  } catch (error) {
    console.error('Error getting support group stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 