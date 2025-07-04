const Profile = require('../models/profile.model');
const User = require('../models/user.model');
const asyncHandler = require('express-async-handler');

// Get privacy settings for current user's profile
exports.getPrivacySettings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const profile = await Profile.findOne({ user: userId });
  
  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: profile.privacySettings
  });
});

// Update profile privacy settings
exports.updatePrivacySettings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { privacySettings } = req.body;
  
  if (!privacySettings) {
    return res.status(400).json({
      success: false,
      message: 'Privacy settings are required'
    });
  }
  
  const profile = await Profile.findOne({ user: userId });
  
  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found'
    });
  }
  
  // Update profile-level privacy settings
  if (privacySettings.profileVisibility) {
    profile.privacySettings.profileVisibility = privacySettings.profileVisibility;
  }
  
  // Update section-level visibility
  if (privacySettings.sectionVisibility) {
    // Validate section names
    const validSections = ['headline', 'experience', 'education', 'skills', 'certifications', 'languages'];
    
    for (const section in privacySettings.sectionVisibility) {
      if (validSections.includes(section)) {
        profile.privacySettings.sectionVisibility[section] = privacySettings.sectionVisibility[section];
      }
    }
  }
  
  // Update connections visibility
  if (privacySettings.connectionsVisibility) {
    profile.privacySettings.connectionsVisibility = privacySettings.connectionsVisibility;
  }
  
  // Update search discovery settings
  if (privacySettings.searchDiscovery) {
    if (typeof privacySettings.searchDiscovery.includeInSearch === 'boolean') {
      profile.privacySettings.searchDiscovery.includeInSearch = privacySettings.searchDiscovery.includeInSearch;
    }
    
    if (typeof privacySettings.searchDiscovery.allowProfileIndexing === 'boolean') {
      profile.privacySettings.searchDiscovery.allowProfileIndexing = privacySettings.searchDiscovery.allowProfileIndexing;
    }
  }
  
  // Update activity visibility
  if (privacySettings.activityVisibility) {
    if (privacySettings.activityVisibility.posts) {
      profile.privacySettings.activityVisibility.posts = privacySettings.activityVisibility.posts;
    }
    
    if (privacySettings.activityVisibility.comments) {
      profile.privacySettings.activityVisibility.comments = privacySettings.activityVisibility.comments;
    }
    
    if (privacySettings.activityVisibility.likes) {
      profile.privacySettings.activityVisibility.likes = privacySettings.activityVisibility.likes;
    }
  }
  
  await profile.save();
  
  res.status(200).json({
    success: true,
    data: profile.privacySettings,
    message: 'Privacy settings updated successfully'
  });
});

// Update visibility for a specific profile item
exports.updateItemVisibility = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { section, itemId, visibility } = req.body;
  
  if (!section || !itemId || !visibility) {
    return res.status(400).json({
      success: false,
      message: 'Section, item ID, and visibility are required'
    });
  }
  
  // Validate section name
  const validSections = ['experience', 'education', 'skills', 'certifications', 'languages', 'websites'];
  if (!validSections.includes(section)) {
    return res.status(400).json({
      success: false,
      message: `Invalid section name. Must be one of: ${validSections.join(', ')}`
    });
  }
  
  // Validate visibility value
  const validVisibility = ['public', 'connections', 'private'];
  if (!validVisibility.includes(visibility)) {
    return res.status(400).json({
      success: false,
      message: `Invalid visibility value. Must be one of: ${validVisibility.join(', ')}`
    });
  }
  
  const profile = await Profile.findOne({ user: userId });
  
  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found'
    });
  }
  
  // Find and update the specific item
  if (!profile[section] || !Array.isArray(profile[section])) {
    return res.status(404).json({
      success: false,
      message: `Section "${section}" not found or is not an array`
    });
  }
  
  const itemIndex = profile[section].findIndex(item => item._id.toString() === itemId);
  
  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Item not found in ${section}`
    });
  }
  
  // Update the visibility of the item
  profile[section][itemIndex].visibility = visibility;
  await profile.save();
  
  res.status(200).json({
    success: true,
    message: `Visibility for ${section} item updated successfully`
  });
});

// Get a profile with visibility applied based on viewer's relationship
exports.getProfileWithVisibility = asyncHandler(async (req, res) => {
  const viewerId = req.user?.id; // May be undefined for public view
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }
  
  // Get the profile
  const profile = await Profile.findOne({ user: userId }).populate('user', 'firstName lastName profileImage verificationStatus');
  
  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found'
    });
  }
  
  // Determine viewer's relationship to profile owner
  let viewerRelation = 'public'; // Default for unauthenticated users
  
  if (viewerId) {
    if (viewerId === userId) {
      viewerRelation = 'self';
    } else {
      // Check if they are connected
      // This would depend on your connection/friend model
      // For now, we'll just check as an example
      // const isConnected = await Connection.exists({ 
      //   $or: [
      //     { requestor: viewerId, recipient: userId, status: 'accepted' },
      //     { requestor: userId, recipient: viewerId, status: 'accepted' }
      //   ]
      // });
      
      // if (isConnected) {
      //   viewerRelation = 'connection';
      // }
      
      // For now, just assume they're not connected
      viewerRelation = 'public';
    }
  }
  
  // Apply visibility filters based on viewer's relation
  const visibleProfile = profile.getVisibleProfileFor(viewerRelation);
  
  res.status(200).json({
    success: true,
    data: visibleProfile
  });
}); 