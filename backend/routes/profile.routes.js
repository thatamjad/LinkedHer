const express = require('express');
const router = express.Router();

const { 
  createOrUpdateProfile, 
  getCurrentProfile, 
  getProfileByUserId,
  addExperience,
  updateExperience,
  deleteExperience,
  addEducation,
  updateEducation,
  deleteEducation,
  addSkill,
  deleteSkill
} = require('../controllers/profile.controller');

const { authenticateUser } = require('../middleware/auth.middleware');
const { isVerified } = require('../middleware/verification');

// @route   POST /api/profile
// @desc    Create or update user profile
// @access  Private
router.post('/', authenticateUser, isVerified, createOrUpdateProfile);

// @route   GET /api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', authenticateUser, getCurrentProfile);

// @route   GET /api/profile/user/:userId
// @desc    Get profile by user ID
// @access  Private
router.get('/user/:userId', getProfileByUserId);

// @route   POST /api/profile/experience
// @desc    Add experience to profile
// @access  Private
router.post('/experience', authenticateUser, isVerified, addExperience);

// @route   PUT /api/profile/experience/:expId
// @desc    Update experience
// @access  Private
router.put('/experience/:expId', authenticateUser, isVerified, updateExperience);

// @route   DELETE /api/profile/experience/:expId
// @desc    Delete experience
// @access  Private
router.delete('/experience/:expId', authenticateUser, isVerified, deleteExperience);

// @route   POST /api/profile/education
// @desc    Add education to profile
// @access  Private
router.post('/education', authenticateUser, isVerified, addEducation);

// @route   PUT /api/profile/education/:eduId
// @desc    Update education
// @access  Private
router.put('/education/:eduId', authenticateUser, isVerified, updateEducation);

// @route   DELETE /api/profile/education/:eduId
// @desc    Delete education
// @access  Private
router.delete('/education/:eduId', authenticateUser, isVerified, deleteEducation);

// @route   POST /api/profile/skills
// @desc    Add skill to profile
// @access  Private
router.post('/skills', authenticateUser, isVerified, addSkill);

// @route   DELETE /api/profile/skills/:skillId
// @desc    Delete skill
// @access  Private
router.delete('/skills/:skillId', authenticateUser, isVerified, deleteSkill);

module.exports = router; 