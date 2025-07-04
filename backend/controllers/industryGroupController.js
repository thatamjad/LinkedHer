const IndustryGroup = require('../models/industryGroup.model');
const User = require('../models/user.model');
const Post = require('../models/post.model');

// Create a new industry group
exports.createGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, industry, imageUrl, coverImage, guidelines, isPrivate } = req.body;
    
    // Check if group with same name already exists
    const existingGroup = await IndustryGroup.findOne({ name: name });
    if (existingGroup) {
      return res.status(400).json({ message: 'An industry group with this name already exists.' });
    }
    
    // Create new industry group
    const industryGroup = new IndustryGroup({
      name,
      description,
      industry,
      imageUrl,
      coverImage,
      guidelines: guidelines || 'Be respectful and supportive of other members. Share resources that can help women in this industry grow professionally.',
      isPrivate: isPrivate || false,
      createdBy: userId,
      members: [{ user: userId, role: 'admin', joinedAt: new Date() }] // Creator is automatically an admin
    });
    
    await industryGroup.save();
    
    return res.status(201).json({
      message: 'Industry group created successfully',
      group: industryGroup
    });
  } catch (error) {
    console.error('Error creating industry group:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all industry groups (with filtering options)
exports.getGroups = async (req, res) => {
  try {
    const { industry, search, sort = 'newest', limit = 10, page = 1 } = req.query;
    const userId = req.user.id;
    
    // Build query
    const query = {};
    
    // Filter by industry if specified
    if (industry) {
      query.industry = industry;
    }
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Public groups or groups where user is a member
    query.$or = [
      { isPrivate: false },
      { 'members.user': userId }
    ];
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Determine sort order
    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'members':
        sortOption = { 'members.length': -1 };
        break;
      case 'name':
        sortOption = { name: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    
    // Run query with pagination
    const groups = await IndustryGroup.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email');
    
    // Get total count for pagination
    const totalGroups = await IndustryGroup.countDocuments(query);
    
    // Mark which groups the user is a member of
    const groupsWithMembershipStatus = groups.map(group => {
      const isMember = group.members.some(member => member.user._id.toString() === userId);
      return {
        ...group.toObject(),
        isMember,
        memberRole: isMember ? group.members.find(member => member.user._id.toString() === userId).role : null
      };
    });
    
    return res.status(200).json({
      groups: groupsWithMembershipStatus,
      pagination: {
        total: totalGroups,
        pages: Math.ceil(totalGroups / limit),
        current: page,
        limit
      }
    });
  } catch (error) {
    console.error('Error getting industry groups:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific industry group by ID
exports.getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    
    const group = await IndustryGroup.findById(groupId)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email')
      .populate({
        path: 'posts',
        options: { sort: { createdAt: -1 }, limit: 10 },
        populate: { path: 'createdBy', select: 'name email' }
      });
    
    if (!group) {
      return res.status(404).json({ message: 'Industry group not found.' });
    }
    
    // Check if user can access this group (public or member)
    const isMember = group.members.some(member => member.user._id.toString() === userId);
    
    if (group.isPrivate && !isMember) {
      return res.status(403).json({ message: 'This group is private. You must join to view its contents.' });
    }
    
    // Add membership status to response
    const groupWithStatus = {
      ...group.toObject(),
      isMember,
      memberRole: isMember ? group.members.find(member => member.user._id.toString() === userId).role : null
    };
    
    return res.status(200).json(groupWithStatus);
  } catch (error) {
    console.error('Error getting industry group:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Join an industry group
exports.joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    
    const group = await IndustryGroup.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Industry group not found.' });
    }
    
    // Check if user is already a member
    const isMember = group.members.some(member => member.user.toString() === userId);
    
    if (isMember) {
      return res.status(400).json({ message: 'You are already a member of this group.' });
    }
    
    // Add user as member
    group.members.push({
      user: userId,
      role: 'member',
      joinedAt: new Date()
    });
    
    await group.save();
    
    return res.status(200).json({
      message: 'Successfully joined the industry group',
      group
    });
  } catch (error) {
    console.error('Error joining industry group:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Leave an industry group
exports.leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    
    const group = await IndustryGroup.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Industry group not found.' });
    }
    
    // Check if user is a member
    const memberIndex = group.members.findIndex(member => member.user.toString() === userId);
    
    if (memberIndex === -1) {
      return res.status(400).json({ message: 'You are not a member of this group.' });
    }
    
    // Check if user is the last admin
    const isAdmin = group.members[memberIndex].role === 'admin';
    
    if (isAdmin) {
      const adminCount = group.members.filter(member => member.role === 'admin').length;
      
      if (adminCount === 1) {
        return res.status(400).json({ 
          message: 'You are the last admin of this group. Please assign another admin before leaving.' 
        });
      }
    }
    
    // Remove user from members
    group.members.splice(memberIndex, 1);
    await group.save();
    
    return res.status(200).json({ message: 'Successfully left the industry group' });
  } catch (error) {
    console.error('Error leaving industry group:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update an industry group
exports.updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const { name, description, imageUrl, coverImage, guidelines, isPrivate } = req.body;
    
    const group = await IndustryGroup.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Industry group not found.' });
    }
    
    // Check if user is an admin
    const member = group.members.find(member => member.user.toString() === userId);
    
    if (!member || (member.role !== 'admin' && member.role !== 'moderator')) {
      return res.status(403).json({ message: 'You do not have permission to update this group.' });
    }
    
    // Check if name change and if it's already taken
    if (name && name !== group.name) {
      const existingGroup = await IndustryGroup.findOne({ name: name });
      if (existingGroup) {
        return res.status(400).json({ message: 'An industry group with this name already exists.' });
      }
      group.name = name;
    }
    
    // Update fields
    if (description) group.description = description;
    if (imageUrl) group.imageUrl = imageUrl;
    if (coverImage) group.coverImage = coverImage;
    if (guidelines) group.guidelines = guidelines;
    
    // Only admins can change privacy setting
    if (isPrivate !== undefined && member.role === 'admin') {
      group.isPrivate = isPrivate;
    }
    
    group.updatedAt = new Date();
    await group.save();
    
    return res.status(200).json({
      message: 'Industry group updated successfully',
      group
    });
  } catch (error) {
    console.error('Error updating industry group:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Change a member's role in the group
exports.changeMemberRole = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberId, newRole } = req.body;
    const userId = req.user.id;
    
    if (!['admin', 'moderator', 'member'].includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role. Must be admin, moderator, or member.' });
    }
    
    const group = await IndustryGroup.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Industry group not found.' });
    }
    
    // Check if requester is an admin
    const requesterMember = group.members.find(member => member.user.toString() === userId);
    
    if (!requesterMember || requesterMember.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can change member roles.' });
    }
    
    // Find the target member
    const memberIndex = group.members.findIndex(member => member.user.toString() === memberId);
    
    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Member not found in this group.' });
    }
    
    // Prevent demoting yourself if you're the last admin
    if (memberId === userId && newRole !== 'admin') {
      const adminCount = group.members.filter(member => member.role === 'admin').length;
      
      if (adminCount === 1) {
        return res.status(400).json({ 
          message: 'You are the last admin of this group. You cannot demote yourself.' 
        });
      }
    }
    
    // Update the role
    group.members[memberIndex].role = newRole;
    await group.save();
    
    return res.status(200).json({
      message: `Member role updated to ${newRole} successfully`,
      group
    });
  } catch (error) {
    console.error('Error changing member role:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Remove a member from the group
exports.removeMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberId } = req.body;
    const userId = req.user.id;
    
    const group = await IndustryGroup.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Industry group not found.' });
    }
    
    // Check if requester is an admin or moderator
    const requesterMember = group.members.find(member => member.user.toString() === userId);
    
    if (!requesterMember || (requesterMember.role !== 'admin' && requesterMember.role !== 'moderator')) {
      return res.status(403).json({ message: 'Only admins and moderators can remove members.' });
    }
    
    // Find the target member
    const memberIndex = group.members.findIndex(member => member.user.toString() === memberId);
    
    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Member not found in this group.' });
    }
    
    // Check if target is an admin and requester is not an admin
    if (group.members[memberIndex].role === 'admin' && requesterMember.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can remove other admins.' });
    }
    
    // Cannot remove yourself with this endpoint
    if (memberId === userId) {
      return res.status(400).json({ message: 'Use the leave group endpoint to remove yourself.' });
    }
    
    // Remove the member
    group.members.splice(memberIndex, 1);
    await group.save();
    
    return res.status(200).json({
      message: 'Member removed successfully',
      group
    });
  } catch (error) {
    console.error('Error removing member:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Add a resource to the group
exports.addResource = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { title, description, url, type, tags } = req.body;
    const userId = req.user.id;
    
    if (!title || !url || !type) {
      return res.status(400).json({ message: 'Title, URL, and type are required for resources.' });
    }
    
    const group = await IndustryGroup.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Industry group not found.' });
    }
    
    // Check if user is a member
    const isMember = group.members.some(member => member.user.toString() === userId);
    
    if (!isMember) {
      return res.status(403).json({ message: 'Only group members can add resources.' });
    }
    
    // Add the resource
    const newResource = {
      title,
      description: description || '',
      url,
      type,
      addedBy: userId,
      addedAt: new Date(),
      upvotes: [],
      tags: tags || []
    };
    
    group.resources.push(newResource);
    group.updatedAt = new Date();
    await group.save();
    
    return res.status(201).json({
      message: 'Resource added successfully',
      resource: newResource,
      group
    });
  } catch (error) {
    console.error('Error adding resource:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Remove a resource from the group
exports.removeResource = async (req, res) => {
  try {
    const { groupId, resourceId } = req.params;
    const userId = req.user.id;
    
    const group = await IndustryGroup.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Industry group not found.' });
    }
    
    // Find the resource
    const resourceIndex = group.resources.findIndex(resource => resource._id.toString() === resourceId);
    
    if (resourceIndex === -1) {
      return res.status(404).json({ message: 'Resource not found.' });
    }
    
    // Check if user is authorized (resource creator, admin, or moderator)
    const member = group.members.find(member => member.user.toString() === userId);
    const isResourceCreator = group.resources[resourceIndex].addedBy.toString() === userId;
    const canRemove = isResourceCreator || (member && (member.role === 'admin' || member.role === 'moderator'));
    
    if (!canRemove) {
      return res.status(403).json({ message: 'You do not have permission to remove this resource.' });
    }
    
    // Remove the resource
    group.resources.splice(resourceIndex, 1);
    group.updatedAt = new Date();
    await group.save();
    
    return res.status(200).json({
      message: 'Resource removed successfully',
      group
    });
  } catch (error) {
    console.error('Error removing resource:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Add an event to the group
exports.addEvent = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { title, description, date, location } = req.body;
    const userId = req.user.id;
    
    if (!title || !date) {
      return res.status(400).json({ message: 'Title and date are required for events.' });
    }
    
    const group = await IndustryGroup.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Industry group not found.' });
    }
    
    // Check if user has permission (admin or moderator)
    const member = group.members.find(member => member.user.toString() === userId);
    
    if (!member || (member.role !== 'admin' && member.role !== 'moderator')) {
      return res.status(403).json({ message: 'Only admins and moderators can add events.' });
    }
    
    // Add the event
    const newEvent = {
      title,
      description: description || '',
      date: new Date(date),
      location: location || { virtual: true },
      attendees: [{ user: userId, status: 'going' }], // Organizer is automatically attending
      organizer: userId
    };
    
    group.events.push(newEvent);
    group.updatedAt = new Date();
    await group.save();
    
    return res.status(201).json({
      message: 'Event created successfully',
      event: newEvent,
      group
    });
  } catch (error) {
    console.error('Error adding event:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update event attendance status
exports.updateEventAttendance = async (req, res) => {
  try {
    const { groupId, eventId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    
    if (!['going', 'interested', 'not_going'].includes(status)) {
      return res.status(400).json({ message: 'Status must be going, interested, or not_going.' });
    }
    
    const group = await IndustryGroup.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Industry group not found.' });
    }
    
    // Check if user is a member
    const isMember = group.members.some(member => member.user.toString() === userId);
    
    if (!isMember) {
      return res.status(403).json({ message: 'Only group members can update event attendance.' });
    }
    
    // Find the event
    const eventIndex = group.events.findIndex(event => event._id.toString() === eventId);
    
    if (eventIndex === -1) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    
    // Update attendance
    const attendeeIndex = group.events[eventIndex].attendees.findIndex(
      attendee => attendee.user.toString() === userId
    );
    
    if (attendeeIndex !== -1) {
      // Update existing attendance
      group.events[eventIndex].attendees[attendeeIndex].status = status;
    } else {
      // Add new attendance
      group.events[eventIndex].attendees.push({
        user: userId,
        status
      });
    }
    
    group.updatedAt = new Date();
    await group.save();
    
    return res.status(200).json({
      message: 'Event attendance updated successfully',
      event: group.events[eventIndex]
    });
  } catch (error) {
    console.error('Error updating event attendance:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get group statistics
exports.getGroupStats = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const group = await IndustryGroup.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Industry group not found.' });
    }
    
    // Calculate statistics
    const memberCount = group.members.length;
    const resourceCount = group.resources.length;
    const eventCount = group.events.length;
    const upcomingEvents = group.events.filter(event => new Date(event.date) > new Date()).length;
    const postCount = group.posts ? group.posts.length : 0;
    
    // Get member roles distribution
    const roleDistribution = {
      admin: group.members.filter(member => member.role === 'admin').length,
      moderator: group.members.filter(member => member.role === 'moderator').length,
      member: group.members.filter(member => member.role === 'member').length
    };
    
    // Get most popular resources by upvotes
    const topResources = [...group.resources]
      .sort((a, b) => b.upvotes.length - a.upvotes.length)
      .slice(0, 5)
      .map(resource => ({
        title: resource.title,
        upvotes: resource.upvotes.length,
        type: resource.type
      }));
    
    // Prepare stats response
    const stats = {
      memberCount,
      resourceCount,
      eventCount,
      upcomingEvents,
      postCount,
      roleDistribution,
      topResources,
      ageInDays: Math.ceil((new Date() - new Date(group.createdAt)) / (1000 * 60 * 60 * 24)),
      lastActive: group.updatedAt
    };
    
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error getting group statistics:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};