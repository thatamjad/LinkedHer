const Profile = require('../models/profile.model');
const User = require('../models/user.model');
const { handleAsync } = require('../utils/errorHandler');

// Create or update a user's profile
exports.createOrUpdateProfile = handleAsync(async (req, res) => {
  const { headline, websites, certifications, languages, visibility } = req.body;

  // Build profile object
  const profileData = {
    user: req.user.id,
    headline,
    websites,
    certifications,
    languages,
  };
  
  if (visibility) {
    profileData.privacySettings = { profileVisibility: visibility };
  }
  
  let profile = await Profile.findOneAndUpdate(
    { user: req.user.id },
    { $set: profileData },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  
  return res.status(200).json({
    success: true,
    data: profile
  });
});

// Get current user's profile
exports.getCurrentProfile = handleAsync(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user.id })
    .populate('user', 'firstName lastName email profileImage verificationStatus');
  
  if (!profile) {
    return res.status(404).json({
      success: false,
      error: 'Profile not found'
    });
  }
  
  // Check profile visibility before returning
  if (profile.privacySettings.profileVisibility === 'private' && (!req.user || req.user.id.toString() !== profile.user.id.toString())) {
    // You can decide what to return for private profiles
    // Option 1: 403 Forbidden
    return res.status(403).json({
      success: false,
      error: 'This profile is private'
    });
    // Option 2: A limited view of the profile
    // return res.status(200).json({ success: true, data: { user: profile.user, isPrivate: true }});
  }
  
  return res.status(200).json({
    success: true,
    data: profile
  });
});

// Get profile by user ID
exports.getProfileByUserId = handleAsync(async (req, res) => {
  const profile = await Profile.findOne({ user: req.params.userId })
    .populate('user', 'firstName lastName email profileImage verificationStatus');
  
  if (!profile) {
    return res.status(404).json({
      success: false,
      error: 'Profile not found'
    });
  }
  
  // Check profile visibility
  if (profile.visibility === 'private' && req.user.id !== req.params.userId) {
    return res.status(403).json({
      success: false,
      error: 'This profile is private'
    });
  }
  
  return res.status(200).json({
    success: true,
    data: profile
  });
});

// Add experience
exports.addExperience = handleAsync(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user.id });
  
  if (!profile) {
    return res.status(404).json({
      success: false,
      error: 'Profile not found'
    });
  }
  
  profile.experience.unshift(req.body);
  await profile.save();
  
  return res.status(200).json({
    success: true,
    data: profile
  });
});

// Update experience
exports.updateExperience = handleAsync(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user.id });
  
  if (!profile) {
    return res.status(404).json({
      success: false,
      error: 'Profile not found'
    });
  }
  
  // Find experience index
  const expIndex = profile.experience.findIndex(exp => exp.id === req.params.expId);
  
  if (expIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Experience not found'
    });
  }
  
  // Update experience
  profile.experience[expIndex] = {
    ...profile.experience[expIndex].toObject(),
    ...req.body
  };
  
  await profile.save();
  
  return res.status(200).json({
    success: true,
    data: profile
  });
});

// Delete experience
exports.deleteExperience = handleAsync(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user.id });
  
  if (!profile) {
    return res.status(404).json({
      success: false,
      error: 'Profile not found'
    });
  }
  
  // Remove experience
  profile.experience = profile.experience.filter(exp => exp.id !== req.params.expId);
  await profile.save();
  
  return res.status(200).json({
    success: true,
    data: profile
  });
});

// Add education
exports.addEducation = handleAsync(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user.id });
  
  if (!profile) {
    return res.status(404).json({
      success: false,
      error: 'Profile not found'
    });
  }
  
  profile.education.unshift(req.body);
  await profile.save();
  
  return res.status(200).json({
    success: true,
    data: profile
  });
});

// Update education
exports.updateEducation = handleAsync(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user.id });
  
  if (!profile) {
    return res.status(404).json({
      success: false,
      error: 'Profile not found'
    });
  }
  
  // Find education index
  const eduIndex = profile.education.findIndex(edu => edu.id === req.params.eduId);
  
  if (eduIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Education not found'
    });
  }
  
  // Update education
  profile.education[eduIndex] = {
    ...profile.education[eduIndex].toObject(),
    ...req.body
  };
  
  await profile.save();
  
  return res.status(200).json({
    success: true,
    data: profile
  });
});

// Delete education
exports.deleteEducation = handleAsync(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user.id });
  
  if (!profile) {
    return res.status(404).json({
      success: false,
      error: 'Profile not found'
    });
  }
  
  // Remove education
  profile.education = profile.education.filter(edu => edu.id !== req.params.eduId);
  await profile.save();
  
  return res.status(200).json({
    success: true,
    data: profile
  });
});

// Add skill
exports.addSkill = handleAsync(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user.id });
  
  if (!profile) {
    return res.status(404).json({
      success: false,
      error: 'Profile not found'
    });
  }
  
  // Check if skill already exists
  if (profile.skills.some(skill => skill.name.toLowerCase() === req.body.name.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: 'Skill already exists'
    });
  }
  
  profile.skills.push(req.body);
  await profile.save();
  
  return res.status(200).json({
    success: true,
    data: profile
  });
});

// Delete skill
exports.deleteSkill = handleAsync(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user.id });
  
  if (!profile) {
    return res.status(404).json({
      success: false,
      error: 'Profile not found'
    });
  }
  
  // Remove skill
  profile.skills = profile.skills.filter(skill => skill.id !== req.params.skillId);
  await profile.save();
  
  return res.status(200).json({
    success: true,
    data: profile
  });
}); 