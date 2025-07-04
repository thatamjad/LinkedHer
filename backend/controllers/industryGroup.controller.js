const IndustryGroup = require('../models/industryGroup.model');
const User = require('../models/user.model');
const Post = require('../models/post.model');

// Create a new industry group
exports.createIndustryGroup = async (req, res) => {
  try {
    const { name, description, industry, imageUrl, coverImage, guidelines, isPrivate } = req.body;
    
    // Check if group with same name already exists
    const existingGroup = await IndustryGroup.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({ message: 'A group with this name already exists' });
    }
    
    const newGroup = new IndustryGroup({
      name,
      description,
      industry,
      imageUrl,
      coverImage,
      guidelines: guidelines || 'Be respectful and supportive of other members. Share resources that can help women in this industry grow professionally.',
      isPrivate: isPrivate || false,
      createdBy: req.user.id,
      members: [{
        user: req.user.id,
        role: 'admin',
        joinedAt: Date.now()
      }]
    });
    
    const industryGroup = await newGroup.save();
    res.status(201).json(industryGroup);
  } catch (error) {
    console.error('Error creating industry group:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all industry groups with filtering
exports.getIndustryGroups = async (req, res) => {
  try {
    const { industry, search, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    
    if (industry) {
      filter.industry = industry;
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
    
    const groups = await IndustryGroup.find(filter, null, options)
      .populate('createdBy', 'firstName lastName profileImage')
      .populate('members.user', 'firstName lastName profileImage')
      .select('-resources -events -posts');
    
    const total = await IndustryGroup.countDocuments(filter);
    
    res.json({
      groups,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching industry groups:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single industry group by ID
exports.getIndustryGroupById = async (req, res) => {
  try {
    const industryGroup = await IndustryGroup.findById(req.params.id)
      .populate('createdBy', 'firstName lastName profileImage')
      .populate('members.user', 'firstName lastName profileImage')
      .populate('posts')
      .populate('resources.addedBy', 'firstName lastName profileImage')
      .populate('events.organizer', 'firstName lastName profileImage');
    
    if (!industryGroup) {
      return res.status(404).json({ message: 'Industry group not found' });
    }
    
    // Check if private and user is a member
    if (industryGroup.isPrivate && req.user) {
      const isMember = industryGroup.members.some(
        member => member.user._id.toString() === req.user.id
      );
      
      if (!isMember) {
        return res.status(403).json({ message: 'This is a private group' });
      }
    } else if (industryGroup.isPrivate && !req.user) {
      return res.status(403).json({ message: 'This is a private group' });
    }
    
    res.json(industryGroup);
  } catch (error) {
    console.error('Error fetching industry group:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update an industry group
exports.updateIndustryGroup = async (req, res) => {
  try {
    const industryGroup = await IndustryGroup.findById(req.params.id);
    
    if (!industryGroup) {
      return res.status(404).json({ message: 'Industry group not found' });
    }
    
    // Check if user is admin or moderator
    const userMembership = industryGroup.members.find(
      member => member.user.toString() === req.user.id
    );
    
    if (!userMembership || !['admin', 'moderator'].includes(userMembership.role)) {
      return res.status(403).json({ message: 'Not authorized to update this group' });
    }
    
    const updatableFields = [
      'name', 'description', 'industry', 'imageUrl', 
      'coverImage', 'guidelines', 'isPrivate'
    ];
    
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        industryGroup[field] = req.body[field];
      }
    });
    
    industryGroup.updatedAt = Date.now();
    const updatedGroup = await industryGroup.save();
    res.json(updatedGroup);
  } catch (error) {
    console.error('Error updating industry group:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Join an industry group
exports.joinIndustryGroup = async (req, res) => {
  try {
    const industryGroup = await IndustryGroup.findById(req.params.id);
    
    if (!industryGroup) {
      return res.status(404).json({ message: 'Industry group not found' });
    }
    
    // Check if user is already a member
    const existingMember = industryGroup.members.find(
      member => member.user.toString() === req.user.id
    );
    
    if (existingMember) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }
    
    // Add user as member
    industryGroup.members.push({
      user: req.user.id,
      role: 'member',
      joinedAt: Date.now()
    });
    
    industryGroup.updatedAt = Date.now();
    await industryGroup.save();
    res.json({ message: 'Successfully joined group', success: true });
  } catch (error) {
    console.error('Error joining industry group:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Leave an industry group
exports.leaveIndustryGroup = async (req, res) => {
  try {
    const industryGroup = await IndustryGroup.findById(req.params.id);
    
    if (!industryGroup) {
      return res.status(404).json({ message: 'Industry group not found' });
    }
    
    // Check if user is a member
    const memberIndex = industryGroup.members.findIndex(
      member => member.user.toString() === req.user.id
    );
    
    if (memberIndex === -1) {
      return res.status(400).json({ message: 'Not a member of this group' });
    }
    
    // Check if user is the only admin
    const isOnlyAdmin = 
      industryGroup.members[memberIndex].role === 'admin' && 
      industryGroup.members.filter(member => member.role === 'admin').length === 1;
    
    if (isOnlyAdmin) {
      return res.status(400).json({ 
        message: 'You are the only admin. Assign another admin before leaving.' 
      });
    }
    
    // Remove user from members
    industryGroup.members.splice(memberIndex, 1);
    
    industryGroup.updatedAt = Date.now();
    await industryGroup.save();
    res.json({ message: 'Successfully left group' });
  } catch (error) {
    console.error('Error leaving industry group:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Change member role in industry group
exports.changeMemberRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;
    
    if (!['admin', 'moderator', 'member'].includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const industryGroup = await IndustryGroup.findById(req.params.id);
    
    if (!industryGroup) {
      return res.status(404).json({ message: 'Industry group not found' });
    }
    
    // Check if requester is admin
    const requesterMembership = industryGroup.members.find(
      member => member.user.toString() === req.user.id
    );
    
    if (!requesterMembership || requesterMembership.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can change member roles' });
    }
    
    // Find target user
    const targetMemberIndex = industryGroup.members.findIndex(
      member => member.user.toString() === userId
    );
    
    if (targetMemberIndex === -1) {
      return res.status(404).json({ message: 'User is not a member of this group' });
    }
    
    // Check if demoting the only admin
    if (
      industryGroup.members[targetMemberIndex].role === 'admin' &&
      newRole !== 'admin' &&
      industryGroup.members.filter(member => member.role === 'admin').length === 1
    ) {
      return res.status(400).json({ message: 'Cannot demote the only admin' });
    }
    
    // Update role
    industryGroup.members[targetMemberIndex].role = newRole;
    
    industryGroup.updatedAt = Date.now();
    await industryGroup.save();
    res.json({ message: `User role updated to ${newRole}`, success: true });
  } catch (error) {
    console.error('Error changing member role:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a resource to industry group
exports.addResource = async (req, res) => {
  try {
    const { title, description, url, type, tags } = req.body;
    
    const industryGroup = await IndustryGroup.findById(req.params.id);
    
    if (!industryGroup) {
      return res.status(404).json({ message: 'Industry group not found' });
    }
    
    // Check if user is a member
    const isMember = industryGroup.members.some(
      member => member.user.toString() === req.user.id
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Must be a member to add resources' });
    }
    
    const newResource = {
      title,
      description,
      url,
      type,
      addedBy: req.user.id,
      addedAt: Date.now(),
      tags: tags || []
    };
    
    industryGroup.resources.push(newResource);
    industryGroup.updatedAt = Date.now();
    
    await industryGroup.save();
    
    // Populate user data for the new resource
    const updatedGroup = await IndustryGroup.findById(req.params.id)
      .populate('resources.addedBy', 'firstName lastName profileImage');
    
    const addedResource = updatedGroup.resources[updatedGroup.resources.length - 1];
    
    res.status(201).json(addedResource);
  } catch (error) {
    console.error('Error adding resource:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upvote a resource
exports.upvoteResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    
    const industryGroup = await IndustryGroup.findById(req.params.id);
    
    if (!industryGroup) {
      return res.status(404).json({ message: 'Industry group not found' });
    }
    
    // Check if user is a member
    const isMember = industryGroup.members.some(
      member => member.user.toString() === req.user.id
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Must be a member to upvote resources' });
    }
    
    // Find the resource
    const resourceIndex = industryGroup.resources.findIndex(
      resource => resource._id.toString() === resourceId
    );
    
    if (resourceIndex === -1) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // Check if user already upvoted
    const upvoteIndex = industryGroup.resources[resourceIndex].upvotes.findIndex(
      userId => userId.toString() === req.user.id
    );
    
    if (upvoteIndex !== -1) {
      // Remove upvote (toggle)
      industryGroup.resources[resourceIndex].upvotes.splice(upvoteIndex, 1);
    } else {
      // Add upvote
      industryGroup.resources[resourceIndex].upvotes.push(req.user.id);
    }
    
    industryGroup.updatedAt = Date.now();
    await industryGroup.save();
    
    res.json({ 
      message: upvoteIndex !== -1 ? 'Upvote removed' : 'Resource upvoted',
      upvotes: industryGroup.resources[resourceIndex].upvotes.length
    });
  } catch (error) {
    console.error('Error upvoting resource:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create an event in industry group
exports.createEvent = async (req, res) => {
  try {
    const { 
      title, description, date, location, virtual, platform, link, address 
    } = req.body;
    
    const industryGroup = await IndustryGroup.findById(req.params.id);
    
    if (!industryGroup) {
      return res.status(404).json({ message: 'Industry group not found' });
    }
    
    // Check if user is a member
    const userMembership = industryGroup.members.find(
      member => member.user.toString() === req.user.id
    );
    
    if (!userMembership) {
      return res.status(403).json({ message: 'Must be a member to create events' });
    }
    
    // Check if user has permission (admin, moderator, or normal member if group allows)
    const isAdminOrModerator = ['admin', 'moderator'].includes(userMembership.role);
    
    if (!isAdminOrModerator) {
      return res.status(403).json({ message: 'Not authorized to create events' });
    }
    
    const newEvent = {
      title,
      description,
      date,
      location: {
        virtual: virtual || false,
        platform,
        link,
        address
      },
      attendees: [{
        user: req.user.id,
        status: 'going'
      }],
      organizer: req.user.id
    };
    
    industryGroup.events.push(newEvent);
    industryGroup.updatedAt = Date.now();
    
    await industryGroup.save();
    
    // Populate user data for the new event
    const updatedGroup = await IndustryGroup.findById(req.params.id)
      .populate('events.organizer', 'firstName lastName profileImage')
      .populate('events.attendees.user', 'firstName lastName profileImage');
    
    const addedEvent = updatedGroup.events[updatedGroup.events.length - 1];
    
    res.status(201).json(addedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Respond to an event
exports.respondToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.body;
    
    if (!['going', 'interested', 'not_going'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const industryGroup = await IndustryGroup.findById(req.params.id);
    
    if (!industryGroup) {
      return res.status(404).json({ message: 'Industry group not found' });
    }
    
    // Check if user is a member
    const isMember = industryGroup.members.some(
      member => member.user.toString() === req.user.id
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Must be a member to respond to events' });
    }
    
    // Find the event
    const eventIndex = industryGroup.events.findIndex(
      event => event._id.toString() === eventId
    );
    
    if (eventIndex === -1) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user already responded
    const attendeeIndex = industryGroup.events[eventIndex].attendees.findIndex(
      attendee => attendee.user.toString() === req.user.id
    );
    
    if (attendeeIndex !== -1) {
      // Update response
      industryGroup.events[eventIndex].attendees[attendeeIndex].status = status;
    } else {
      // Add new response
      industryGroup.events[eventIndex].attendees.push({
        user: req.user.id,
        status
      });
    }
    
    industryGroup.updatedAt = Date.now();
    await industryGroup.save();
    
    res.json({ message: 'Event response updated', status });
  } catch (error) {
    console.error('Error responding to event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all industry groups for a user
exports.getUserGroups = async (req, res) => {
  try {
    // Find all groups where user is a member
    const groups = await IndustryGroup.find({
      'members.user': req.user.id
    })
      .populate('createdBy', 'firstName lastName profileImage')
      .select('-resources -events -posts -members');
    
    res.json(groups);
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get industry group statistics
exports.getIndustryGroupStats = async (req, res) => {
  try {
    const totalGroups = await IndustryGroup.countDocuments();
    
    // Get industry distribution
    const industryStats = await IndustryGroup.aggregate([
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get most active groups
    const mostActiveGroups = await IndustryGroup.find()
      .sort({ 'members.length': -1 })
      .limit(5)
      .select('name industry members');
    
    let userStats = {};
    
    if (req.user) {
      const userGroups = await IndustryGroup.find({
        'members.user': req.user.id
      });
      
      const adminGroups = userGroups.filter(group =>
        group.members.some(
          member => member.user.toString() === req.user.id && member.role === 'admin'
        )
      );
      
      userStats = {
        joinedGroups: userGroups.length,
        adminGroups: adminGroups.length
      };
    }
    
    res.json({
      totalGroups,
      industryStats,
      mostActiveGroups,
      userStats
    });
  } catch (error) {
    console.error('Error getting industry group stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 