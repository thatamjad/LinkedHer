const CollaborativeProject = require('../models/collaborativeProject.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

// Create a new collaborative project
exports.createProject = async (req, res) => {
  try {
    const { 
      title, description, category, skillsNeeded, stage, 
      status, tags, isPrivate, applicationProcess 
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required' });
    }
    
    const newProject = new CollaborativeProject({
      title,
      description,
      category,
      founder: req.user.id,
      members: [{
        user: req.user.id,
        role: 'co_founder',
        joinedAt: Date.now(),
        isActive: true,
        permissions: {
          canEdit: true,
          canInvite: true,
          canManageResources: true
        }
      }],
      skillsNeeded: skillsNeeded || [],
      stage: stage || 'idea',
      status: status || 'seeking_members',
      tags: tags || [],
      isPrivate: isPrivate !== undefined ? isPrivate : false,
      applicationProcess: applicationProcess || {
        isOpen: true,
        questions: [
          { question: 'Why are you interested in this project?', isRequired: true },
          { question: 'What skills and experience can you contribute?', isRequired: true }
        ]
      }
    });
    
    const savedProject = await newProject.save();
    
    // Populate founder info
    const populatedProject = await CollaborativeProject.findById(savedProject._id)
      .populate('founder', 'firstName lastName profileImage')
      .populate('members.user', 'firstName lastName profileImage');
    
    res.status(201).json(populatedProject);
  } catch (error) {
    console.error('Error creating collaborative project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all collaborative projects with filtering options
exports.getProjects = async (req, res) => {
  try {
    const { 
      category, stage, status, search, skillNeeded, 
      limit = 10, page = 1 
    } = req.query;
    
    // Build query
    const query = {};
    
    // For non-private projects or projects where user is a member
    const memberProjects = await CollaborativeProject.find({
      'members.user': req.user.id,
      'members.isActive': true
    }).select('_id');
    
    const memberProjectIds = memberProjects.map(project => project._id);
    
    query.$or = [
      { isPrivate: false },
      { _id: { $in: memberProjectIds } }
    ];
    
    if (category) {
      query.category = category;
    }
    
    if (stage) {
      query.stage = stage;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (skillNeeded) {
      query['skillsNeeded.skill'] = skillNeeded;
    }
    
    if (search) {
      query.$and = [
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
          ]
        }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const projects = await CollaborativeProject.find(query)
      .populate('founder', 'firstName lastName profileImage')
      .populate('members.user', 'firstName lastName profileImage')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await CollaborativeProject.countDocuments(query);
    
    res.status(200).json({
      projects,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching collaborative projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single collaborative project by id
exports.getProjectById = async (req, res) => {
  try {
    const project = await CollaborativeProject.findById(req.params.id)
      .populate('founder', 'firstName lastName profileImage')
      .populate('members.user', 'firstName lastName profileImage')
      .populate('applications.user', 'firstName lastName profileImage')
      .populate('resources.addedBy', 'firstName lastName');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if private and user is not a member
    if (project.isPrivate) {
      const isMember = project.members.some(member => 
        member.user._id.toString() === req.user.id && member.isActive
      );
      
      if (!isMember) {
        return res.status(403).json({ message: 'This is a private project' });
      }
    }
    
    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching collaborative project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a collaborative project (member with edit permission only)
exports.updateProject = async (req, res) => {
  try {
    const project = await CollaborativeProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is a member with edit permission
    const member = project.members.find(member => 
      member.user.toString() === req.user.id && member.isActive
    );
    
    if (!member) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }
    
    if (!member.permissions.canEdit) {
      return res.status(403).json({ message: 'You do not have permission to edit this project' });
    }
    
    const { 
      title, description, category, skillsNeeded, stage, 
      status, tags, isPrivate, applicationProcess 
    } = req.body;
    
    // Update fields if provided
    if (title) project.title = title;
    if (description) project.description = description;
    if (category) project.category = category;
    if (skillsNeeded) project.skillsNeeded = skillsNeeded;
    if (stage) project.stage = stage;
    if (status) project.status = status;
    if (tags) project.tags = tags;
    if (isPrivate !== undefined) project.isPrivate = isPrivate;
    if (applicationProcess) project.applicationProcess = applicationProcess;
    
    await project.save();
    
    // Return updated project with populated fields
    const updatedProject = await CollaborativeProject.findById(req.params.id)
      .populate('founder', 'firstName lastName profileImage')
      .populate('members.user', 'firstName lastName profileImage');
    
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Error updating collaborative project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Apply to join a project
exports.applyToProject = async (req, res) => {
  try {
    const { appliedFor, answers } = req.body;
    
    if (!appliedFor || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Role and answers are required' });
    }
    
    const project = await CollaborativeProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if applications are open
    if (!project.applicationProcess.isOpen) {
      return res.status(400).json({ message: 'Applications are currently closed' });
    }
    
    // Check if user is already a member
    const isMember = project.members.some(member => 
      member.user.toString() === req.user.id && member.isActive
    );
    
    if (isMember) {
      return res.status(400).json({ message: 'You are already a member of this project' });
    }
    
    // Check if user already has a pending application
    const existingApplication = project.applications.find(app => 
      app.user.toString() === req.user.id && app.status === 'pending'
    );
    
    if (existingApplication) {
      return res.status(400).json({ message: 'You already have a pending application' });
    }
    
    // Create new application
    project.applications.push({
      user: req.user.id,
      appliedFor,
      answers,
      status: 'pending',
      appliedAt: Date.now()
    });
    
    await project.save();
    
    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error applying to project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Handle application (founder or member with invite permission)
exports.handleApplication = async (req, res) => {
  try {
    const { applicationId, action } = req.body;
    
    if (!applicationId || !action || !['accept', 'reject', 'waitlist'].includes(action)) {
      return res.status(400).json({ message: 'Invalid request parameters' });
    }
    
    const project = await CollaborativeProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user has permission to handle applications
    const member = project.members.find(member => 
      member.user.toString() === req.user.id && member.isActive
    );
    
    const isFounder = project.founder.toString() === req.user.id;
    
    if (!isFounder && (!member || !member.permissions.canInvite)) {
      return res.status(403).json({ 
        message: 'Only the founder or members with invite permission can handle applications' 
      });
    }
    
    // Find the application
    const applicationIndex = project.applications.findIndex(app => 
      app._id.toString() === applicationId && app.status === 'pending'
    );
    
    if (applicationIndex === -1) {
      return res.status(404).json({ message: 'Application not found or already processed' });
    }
    
    const userId = project.applications[applicationIndex].user;
    const appliedFor = project.applications[applicationIndex].appliedFor;
    
    // Update application status
    if (action === 'accept') {
      project.applications[applicationIndex].status = 'accepted';
      
      // Add user as member
      project.members.push({
        user: userId,
        role: appliedFor,
        joinedAt: Date.now(),
        isActive: true,
        permissions: {
          canEdit: false,
          canInvite: false,
          canManageResources: false
        }
      });
      
      // Update skills needed if applicable
      const skillIndex = project.skillsNeeded.findIndex(skill => 
        skill.skill.toLowerCase() === appliedFor.toLowerCase() && !skill.isFilled
      );
      
      if (skillIndex !== -1) {
        project.skillsNeeded[skillIndex].isFilled = true;
      }
    } else if (action === 'reject') {
      project.applications[applicationIndex].status = 'rejected';
    } else {
      project.applications[applicationIndex].status = 'waitlisted';
    }
    
    await project.save();
    
    res.status(200).json({ 
      message: `Application ${
        action === 'accept' ? 'accepted' : 
        action === 'reject' ? 'rejected' : 'waitlisted'
      } successfully` 
    });
  } catch (error) {
    console.error('Error handling application:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a resource to a project (member with resource permission only)
exports.addResource = async (req, res) => {
  try {
    const { title, description, url, type } = req.body;
    
    if (!title || !url || !type) {
      return res.status(400).json({ message: 'Title, URL, and type are required' });
    }
    
    const project = await CollaborativeProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is a member with resource permission
    const member = project.members.find(member => 
      member.user.toString() === req.user.id && member.isActive
    );
    
    if (!member) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }
    
    if (!member.permissions.canManageResources) {
      return res.status(403).json({ 
        message: 'You do not have permission to add resources to this project' 
      });
    }
    
    // Add resource
    project.resources.push({
      title,
      description: description || '',
      url,
      type,
      addedBy: req.user.id,
      addedAt: Date.now()
    });
    
    await project.save();
    
    // Return updated project with populated fields
    const updatedProject = await CollaborativeProject.findById(req.params.id)
      .populate('resources.addedBy', 'firstName lastName');
    
    res.status(201).json(updatedProject.resources[updatedProject.resources.length - 1]);
  } catch (error) {
    console.error('Error adding resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a milestone to a project (member with edit permission only)
exports.addMilestone = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    
    if (!title || !dueDate) {
      return res.status(400).json({ message: 'Title and due date are required' });
    }
    
    const project = await CollaborativeProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is a member with edit permission
    const member = project.members.find(member => 
      member.user.toString() === req.user.id && member.isActive
    );
    
    if (!member) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }
    
    if (!member.permissions.canEdit) {
      return res.status(403).json({ 
        message: 'You do not have permission to add milestones to this project' 
      });
    }
    
    // Add milestone
    project.milestones.push({
      title,
      description: description || '',
      dueDate: new Date(dueDate),
      isCompleted: false
    });
    
    await project.save();
    
    res.status(201).json(project.milestones[project.milestones.length - 1]);
  } catch (error) {
    console.error('Error adding milestone:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update milestone status (member with edit permission only)
exports.updateMilestone = async (req, res) => {
  try {
    const { milestoneId, isCompleted } = req.body;
    
    if (!milestoneId || isCompleted === undefined) {
      return res.status(400).json({ message: 'Milestone ID and completion status are required' });
    }
    
    const project = await CollaborativeProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is a member with edit permission
    const member = project.members.find(member => 
      member.user.toString() === req.user.id && member.isActive
    );
    
    if (!member) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }
    
    if (!member.permissions.canEdit) {
      return res.status(403).json({ 
        message: 'You do not have permission to update milestones in this project' 
      });
    }
    
    // Find the milestone
    const milestoneIndex = project.milestones.findIndex(milestone => 
      milestone._id.toString() === milestoneId
    );
    
    if (milestoneIndex === -1) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    
    // Update milestone
    project.milestones[milestoneIndex].isCompleted = isCompleted;
    
    if (isCompleted) {
      project.milestones[milestoneIndex].completedAt = Date.now();
    } else {
      project.milestones[milestoneIndex].completedAt = null;
    }
    
    await project.save();
    
    res.status(200).json({ 
      message: `Milestone marked as ${isCompleted ? 'completed' : 'incomplete'}` 
    });
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update member permissions (founder only)
exports.updateMemberPermissions = async (req, res) => {
  try {
    const { memberId, permissions } = req.body;
    
    if (!memberId || !permissions) {
      return res.status(400).json({ message: 'Member ID and permissions are required' });
    }
    
    const project = await CollaborativeProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is the founder
    if (project.founder.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the project founder can update member permissions' });
    }
    
    // Find the member
    const memberIndex = project.members.findIndex(member => 
      member.user.toString() === memberId && member.isActive
    );
    
    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Member not found or inactive' });
    }
    
    // Update permissions
    if (permissions.canEdit !== undefined) {
      project.members[memberIndex].permissions.canEdit = permissions.canEdit;
    }
    
    if (permissions.canInvite !== undefined) {
      project.members[memberIndex].permissions.canInvite = permissions.canInvite;
    }
    
    if (permissions.canManageResources !== undefined) {
      project.members[memberIndex].permissions.canManageResources = permissions.canManageResources;
    }
    
    await project.save();
    
    res.status(200).json({ message: 'Member permissions updated successfully' });
  } catch (error) {
    console.error('Error updating member permissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove a member (founder or self-removal)
exports.removeMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    
    const project = await CollaborativeProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is the founder or removing self
    const isFounder = project.founder.toString() === req.user.id;
    const isSelfRemoval = memberId === req.user.id;
    
    if (!isFounder && !isSelfRemoval) {
      return res.status(403).json({ 
        message: 'Only the project founder can remove members, or you can remove yourself' 
      });
    }
    
    // Find the member
    const memberIndex = project.members.findIndex(member => 
      member.user.toString() === memberId && member.isActive
    );
    
    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Member not found or already inactive' });
    }
    
    // Check if trying to remove founder
    if (project.founder.toString() === memberId && !isSelfRemoval) {
      return res.status(400).json({ message: 'Cannot remove the project founder' });
    }
    
    // Set member as inactive
    project.members[memberIndex].isActive = false;
    
    await project.save();
    
    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a meeting to a project (member with edit permission only)
exports.addMeeting = async (req, res) => {
  try {
    const { title, description, date, duration, location, meetingLink } = req.body;
    
    if (!title || !date || !duration || !location) {
      return res.status(400).json({ 
        message: 'Title, date, duration, and location type are required' 
      });
    }
    
    const project = await CollaborativeProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is a member with edit permission
    const member = project.members.find(member => 
      member.user.toString() === req.user.id && member.isActive
    );
    
    if (!member) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }
    
    if (!member.permissions.canEdit) {
      return res.status(403).json({ 
        message: 'You do not have permission to add meetings to this project' 
      });
    }
    
    // Create attendee list with all active members as tentative
    const attendees = project.members
      .filter(member => member.isActive)
      .map(member => ({
        user: member.user,
        status: member.user.toString() === req.user.id ? 'attending' : 'tentative'
      }));
    
    // Add meeting
    project.meetings.push({
      title,
      description: description || '',
      date: new Date(date),
      duration: parseInt(duration),
      location,
      meetingLink: meetingLink || '',
      attendees
    });
    
    await project.save();
    
    // Return updated project with populated attendees
    const updatedProject = await CollaborativeProject.findById(req.params.id)
      .populate('meetings.attendees.user', 'firstName lastName profileImage');
    
    res.status(201).json(updatedProject.meetings[updatedProject.meetings.length - 1]);
  } catch (error) {
    console.error('Error adding meeting:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update meeting attendance status
exports.updateAttendance = async (req, res) => {
  try {
    const { meetingId, status } = req.body;
    
    if (!meetingId || !status || !['attending', 'tentative', 'not_attending'].includes(status)) {
      return res.status(400).json({ message: 'Meeting ID and valid status are required' });
    }
    
    const project = await CollaborativeProject.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is a member
    const isMember = project.members.some(member => 
      member.user.toString() === req.user.id && member.isActive
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }
    
    // Find the meeting
    const meetingIndex = project.meetings.findIndex(meeting => 
      meeting._id.toString() === meetingId
    );
    
    if (meetingIndex === -1) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Find user in attendees
    const attendeeIndex = project.meetings[meetingIndex].attendees.findIndex(attendee => 
      attendee.user.toString() === req.user.id
    );
    
    if (attendeeIndex === -1) {
      // Add user to attendees if not found
      project.meetings[meetingIndex].attendees.push({
        user: req.user.id,
        status
      });
    } else {
      // Update status
      project.meetings[meetingIndex].attendees[attendeeIndex].status = status;
    }
    
    await project.save();
    
    res.status(200).json({ 
      message: `Attendance status updated to ${status}` 
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 