const SupportGroupDiscussion = require('../models/supportGroupDiscussion.model');
const SupportGroup = require('../models/supportGroup.model');
const User = require('../models/user.model');
const AnonymousPersona = require('../models/anonymousPersona.model');
const mongoose = require('mongoose');

// Create a new discussion in a support group
exports.createDiscussion = async (req, res) => {
  try {
    const { title, content, tags, isAnonymous, anonymousPersonaId, attachments } = req.body;
    const groupId = req.params.groupId;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    // Check if group exists and user is a member
    const supportGroup = await SupportGroup.findById(groupId);
    
    if (!supportGroup) {
      return res.status(404).json({ message: 'Support group not found' });
    }
    
    const isMember = supportGroup.members.some(member => 
      member.user.toString() === req.user.id && member.isActive
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'You must be a member to create discussions' });
    }
    
    // If anonymous, verify that persona belongs to user
    if (isAnonymous && anonymousPersonaId) {
      const persona = await AnonymousPersona.findById(anonymousPersonaId);
      
      if (!persona || persona.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Invalid anonymous persona' });
      }
    }
    
    const newDiscussion = new SupportGroupDiscussion({
      group: groupId,
      title,
      content,
      author: req.user.id,
      isAnonymous: isAnonymous || false,
      anonymousPersona: isAnonymous ? anonymousPersonaId : null,
      tags: tags || [],
      attachments: attachments || []
    });
    
    const savedDiscussion = await newDiscussion.save();
    
    // Populate author or anonymous persona
    const populatedDiscussion = await SupportGroupDiscussion.findById(savedDiscussion._id)
      .populate('author', 'firstName lastName profileImage')
      .populate('anonymousPersona', 'displayName avatar')
      .populate('group', 'name');
    
    res.status(201).json(populatedDiscussion);
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all discussions in a support group
exports.getDiscussions = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const { search, tag, isPinned, limit = 10, page = 1 } = req.query;
    
    // Check if group exists and user is a member
    const supportGroup = await SupportGroup.findById(groupId);
    
    if (!supportGroup) {
      return res.status(404).json({ message: 'Support group not found' });
    }
    
    const isMember = supportGroup.members.some(member => 
      member.user.toString() === req.user.id && member.isActive
    );
    
    if (!isMember && supportGroup.isPrivate) {
      return res.status(403).json({ message: 'You must be a member to view discussions in private groups' });
    }
    
    // Build query
    const query = { group: groupId, isActive: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    if (isPinned === 'true') {
      query.isPinned = true;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const discussions = await SupportGroupDiscussion.find(query)
      .populate('author', 'firstName lastName profileImage')
      .populate('anonymousPersona', 'displayName avatar')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ isPinned: -1, createdAt: -1 });
    
    const total = await SupportGroupDiscussion.countDocuments(query);
    
    res.status(200).json({
      discussions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single discussion by id
exports.getDiscussionById = async (req, res) => {
  try {
    const discussionId = req.params.id;
    
    const discussion = await SupportGroupDiscussion.findById(discussionId)
      .populate('author', 'firstName lastName profileImage')
      .populate('anonymousPersona', 'displayName avatar')
      .populate('group', 'name isPrivate')
      .populate('replies.author', 'firstName lastName profileImage')
      .populate('replies.anonymousPersona', 'displayName avatar');
    
    if (!discussion || !discussion.isActive) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    // Check if group is private and user is a member
    if (discussion.group.isPrivate) {
      const supportGroup = await SupportGroup.findById(discussion.group._id);
      const isMember = supportGroup.members.some(member => 
        member.user.toString() === req.user.id && member.isActive
      );
      
      if (!isMember) {
        return res.status(403).json({ message: 'You must be a member to view discussions in private groups' });
      }
    }
    
    // Increment view count
    discussion.views += 1;
    await discussion.save();
    
    res.status(200).json(discussion);
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a discussion (author or moderator only)
exports.updateDiscussion = async (req, res) => {
  try {
    const discussionId = req.params.id;
    const { title, content, tags, attachments } = req.body;
    
    const discussion = await SupportGroupDiscussion.findById(discussionId);
    
    if (!discussion || !discussion.isActive) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    // Check if user is author or moderator
    const isAuthor = discussion.author.toString() === req.user.id;
    
    if (!isAuthor) {
      // Check if user is a moderator
      const supportGroup = await SupportGroup.findById(discussion.group);
      const isModerator = supportGroup.moderators.includes(mongoose.Types.ObjectId(req.user.id));
      
      if (!isModerator) {
        return res.status(403).json({ message: 'Only the author or moderators can update this discussion' });
      }
    }
    
    // Update fields if provided
    if (title) discussion.title = title;
    if (content) discussion.content = content;
    if (tags) discussion.tags = tags;
    if (attachments) discussion.attachments = attachments;
    
    // Mark as edited if author is updating
    if (isAuthor) {
      discussion.isEdited = true;
    }
    
    await discussion.save();
    
    const updatedDiscussion = await SupportGroupDiscussion.findById(discussionId)
      .populate('author', 'firstName lastName profileImage')
      .populate('anonymousPersona', 'displayName avatar')
      .populate('group', 'name');
    
    res.status(200).json(updatedDiscussion);
  } catch (error) {
    console.error('Error updating discussion:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete/Deactivate a discussion (author or moderator only)
exports.deleteDiscussion = async (req, res) => {
  try {
    const discussionId = req.params.id;
    
    const discussion = await SupportGroupDiscussion.findById(discussionId);
    
    if (!discussion || !discussion.isActive) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    // Check if user is author or moderator
    const isAuthor = discussion.author.toString() === req.user.id;
    
    if (!isAuthor) {
      // Check if user is a moderator
      const supportGroup = await SupportGroup.findById(discussion.group);
      const isModerator = supportGroup.moderators.includes(mongoose.Types.ObjectId(req.user.id));
      
      if (!isModerator) {
        return res.status(403).json({ message: 'Only the author or moderators can delete this discussion' });
      }
    }
    
    // Set as inactive (soft delete)
    discussion.isActive = false;
    await discussion.save();
    
    res.status(200).json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a reply to a discussion
exports.addReply = async (req, res) => {
  try {
    const discussionId = req.params.id;
    const { content, isAnonymous, anonymousPersonaId } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Reply content is required' });
    }
    
    const discussion = await SupportGroupDiscussion.findById(discussionId);
    
    if (!discussion || !discussion.isActive) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    // Check if user is a member of the group
    const supportGroup = await SupportGroup.findById(discussion.group);
    const isMember = supportGroup.members.some(member => 
      member.user.toString() === req.user.id && member.isActive
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'You must be a member to reply to discussions' });
    }
    
    // If anonymous, verify that persona belongs to user
    if (isAnonymous && anonymousPersonaId) {
      const persona = await AnonymousPersona.findById(anonymousPersonaId);
      
      if (!persona || persona.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Invalid anonymous persona' });
      }
    }
    
    // Add reply
    const newReply = {
      content,
      author: req.user.id,
      isAnonymous: isAnonymous || false,
      anonymousPersona: isAnonymous ? anonymousPersonaId : null
    };
    
    discussion.replies.push(newReply);
    await discussion.save();
    
    // Retrieve updated discussion with populated fields
    const updatedDiscussion = await SupportGroupDiscussion.findById(discussionId)
      .populate('author', 'firstName lastName profileImage')
      .populate('anonymousPersona', 'displayName avatar')
      .populate('replies.author', 'firstName lastName profileImage')
      .populate('replies.anonymousPersona', 'displayName avatar');
    
    res.status(201).json(updatedDiscussion);
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a reply (author or moderator only)
exports.updateReply = async (req, res) => {
  try {
    const discussionId = req.params.id;
    const replyId = req.params.replyId;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Reply content is required' });
    }
    
    const discussion = await SupportGroupDiscussion.findById(discussionId);
    
    if (!discussion || !discussion.isActive) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    // Find the reply
    const replyIndex = discussion.replies.findIndex(reply => 
      reply._id.toString() === replyId
    );
    
    if (replyIndex === -1) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    // Check if user is author or moderator
    const isAuthor = discussion.replies[replyIndex].author.toString() === req.user.id;
    
    if (!isAuthor) {
      // Check if user is a moderator
      const supportGroup = await SupportGroup.findById(discussion.group);
      const isModerator = supportGroup.moderators.includes(mongoose.Types.ObjectId(req.user.id));
      
      if (!isModerator) {
        return res.status(403).json({ message: 'Only the author or moderators can update this reply' });
      }
    }
    
    // Update reply
    discussion.replies[replyIndex].content = content;
    discussion.replies[replyIndex].isEdited = true;
    discussion.replies[replyIndex].updatedAt = Date.now();
    
    await discussion.save();
    
    // Retrieve updated discussion with populated fields
    const updatedDiscussion = await SupportGroupDiscussion.findById(discussionId)
      .populate('author', 'firstName lastName profileImage')
      .populate('anonymousPersona', 'displayName avatar')
      .populate('replies.author', 'firstName lastName profileImage')
      .populate('replies.anonymousPersona', 'displayName avatar');
    
    res.status(200).json(updatedDiscussion);
  } catch (error) {
    console.error('Error updating reply:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a reply (author or moderator only)
exports.deleteReply = async (req, res) => {
  try {
    const discussionId = req.params.id;
    const replyId = req.params.replyId;
    
    const discussion = await SupportGroupDiscussion.findById(discussionId);
    
    if (!discussion || !discussion.isActive) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    // Find the reply
    const replyIndex = discussion.replies.findIndex(reply => 
      reply._id.toString() === replyId
    );
    
    if (replyIndex === -1) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    // Check if user is author or moderator
    const isAuthor = discussion.replies[replyIndex].author.toString() === req.user.id;
    
    if (!isAuthor) {
      // Check if user is a moderator
      const supportGroup = await SupportGroup.findById(discussion.group);
      const isModerator = supportGroup.moderators.includes(mongoose.Types.ObjectId(req.user.id));
      
      if (!isModerator) {
        return res.status(403).json({ message: 'Only the author or moderators can delete this reply' });
      }
    }
    
    // Remove the reply
    discussion.replies.splice(replyIndex, 1);
    await discussion.save();
    
    res.status(200).json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add reaction to a discussion
exports.addReaction = async (req, res) => {
  try {
    const discussionId = req.params.id;
    const { type } = req.body;
    
    if (!type || !['support', 'thanks', 'insightful', 'relatable', 'helpful'].includes(type)) {
      return res.status(400).json({ message: 'Valid reaction type is required' });
    }
    
    const discussion = await SupportGroupDiscussion.findById(discussionId);
    
    if (!discussion || !discussion.isActive) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    // Check if user already reacted with the same type
    const existingReactionIndex = discussion.reactions.findIndex(reaction => 
      reaction.user.toString() === req.user.id && reaction.type === type
    );
    
    if (existingReactionIndex !== -1) {
      // Remove reaction if already exists
      discussion.reactions.splice(existingReactionIndex, 1);
    } else {
      // Add new reaction
      discussion.reactions.push({
        user: req.user.id,
        type
      });
    }
    
    await discussion.save();
    
    res.status(200).json({ message: `Reaction ${existingReactionIndex !== -1 ? 'removed' : 'added'} successfully` });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add reaction to a reply
exports.addReplyReaction = async (req, res) => {
  try {
    const discussionId = req.params.id;
    const replyId = req.params.replyId;
    const { type } = req.body;
    
    if (!type || !['support', 'thanks', 'insightful', 'relatable', 'helpful'].includes(type)) {
      return res.status(400).json({ message: 'Valid reaction type is required' });
    }
    
    const discussion = await SupportGroupDiscussion.findById(discussionId);
    
    if (!discussion || !discussion.isActive) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    // Find the reply
    const replyIndex = discussion.replies.findIndex(reply => 
      reply._id.toString() === replyId
    );
    
    if (replyIndex === -1) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    // Check if user already reacted with the same type
    const existingReactionIndex = discussion.replies[replyIndex].reactions.findIndex(reaction => 
      reaction.user.toString() === req.user.id && reaction.type === type
    );
    
    if (existingReactionIndex !== -1) {
      // Remove reaction if already exists
      discussion.replies[replyIndex].reactions.splice(existingReactionIndex, 1);
    } else {
      // Add new reaction
      discussion.replies[replyIndex].reactions.push({
        user: req.user.id,
        type
      });
    }
    
    await discussion.save();
    
    res.status(200).json({ message: `Reaction ${existingReactionIndex !== -1 ? 'removed' : 'added'} successfully` });
  } catch (error) {
    console.error('Error adding reply reaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Pin/unpin discussion (moderator only)
exports.togglePinned = async (req, res) => {
  try {
    const discussionId = req.params.id;
    
    const discussion = await SupportGroupDiscussion.findById(discussionId);
    
    if (!discussion || !discussion.isActive) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    // Check if user is a moderator
    const supportGroup = await SupportGroup.findById(discussion.group);
    const isModerator = supportGroup.moderators.includes(mongoose.Types.ObjectId(req.user.id));
    
    if (!isModerator) {
      return res.status(403).json({ message: 'Only moderators can pin/unpin discussions' });
    }
    
    // Toggle pinned status
    discussion.isPinned = !discussion.isPinned;
    await discussion.save();
    
    res.status(200).json({ 
      message: `Discussion ${discussion.isPinned ? 'pinned' : 'unpinned'} successfully`,
      isPinned: discussion.isPinned
    });
  } catch (error) {
    console.error('Error toggling pinned status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Flag discussion for moderation (any member)
exports.flagDiscussion = async (req, res) => {
  try {
    const discussionId = req.params.id;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Reason for flagging is required' });
    }
    
    const discussion = await SupportGroupDiscussion.findById(discussionId);
    
    if (!discussion || !discussion.isActive) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    // Set moderator flag
    discussion.isModeratorFlagged = true;
    await discussion.save();
    
    // TODO: Create a notification for moderators
    
    res.status(200).json({ message: 'Discussion flagged for moderation' });
  } catch (error) {
    console.error('Error flagging discussion:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 