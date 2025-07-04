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