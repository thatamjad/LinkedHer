const MentalHealthResource = require('../models/mentalHealthResource.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

// Create a new mental health resource
exports.createResource = async (req, res) => {
  try {
    const { 
      title, description, category, resourceType, url, imageUrl, 
      tags, isAnonymousAccessible, contactInfo, costType, location 
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !category || !resourceType || !url) {
      return res.status(400).json({ 
        message: 'Title, description, category, resourceType, and url are required' 
      });
    }
    
    const newResource = new MentalHealthResource({
      title,
      description,
      category,
      resourceType,
      url,
      imageUrl: imageUrl || '',
      tags: tags || [],
      isAnonymousAccessible: isAnonymousAccessible !== undefined ? isAnonymousAccessible : true,
      contactInfo: contactInfo || {},
      costType: costType || 'free',
      location: location || { isGlobal: true },
      addedBy: req.user.id,
      isVerified: req.user.isAdmin || false // Auto-verify if added by admin
    });
    
    const savedResource = await newResource.save();
    
    res.status(201).json(savedResource);
  } catch (error) {
    console.error('Error creating mental health resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all mental health resources with filtering options
exports.getResources = async (req, res) => {
  try {
    const { 
      category, resourceType, search, costType, 
      isAnonymousAccessible, limit = 10, page = 1 
    } = req.query;
    
    // Build query
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (resourceType) {
      query.resourceType = resourceType;
    }
    
    if (costType) {
      query.costType = costType;
    }
    
    if (isAnonymousAccessible === 'true') {
      query.isAnonymousAccessible = true;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // If accessing from anonymous mode, only show anonymous-accessible resources
    if (req.isAnonymousMode) {
      query.isAnonymousAccessible = true;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const resources = await MentalHealthResource.find(query)
      .populate('addedBy', 'firstName lastName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ averageRating: -1, createdAt: -1 });
    
    const total = await MentalHealthResource.countDocuments(query);
    
    res.status(200).json({
      resources,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching mental health resources:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single mental health resource by id
exports.getResourceById = async (req, res) => {
  try {
    const resource = await MentalHealthResource.findById(req.params.id)
      .populate('addedBy', 'firstName lastName profileImage')
      .populate('reviews.user', 'firstName lastName profileImage');
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // If accessing from anonymous mode, check if accessible
    if (req.isAnonymousMode && !resource.isAnonymousAccessible) {
      return res.status(403).json({ 
        message: 'This resource is not available in anonymous mode' 
      });
    }
    
    res.status(200).json(resource);
  } catch (error) {
    console.error('Error fetching mental health resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a mental health resource (admin or original creator only)
exports.updateResource = async (req, res) => {
  try {
    const resource = await MentalHealthResource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // Check permissions (admin or original creator)
    if (!req.user.isAdmin && resource.addedBy.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: 'Only admins or the original creator can update this resource' 
      });
    }
    
    const { 
      title, description, category, resourceType, url, imageUrl, 
      tags, isAnonymousAccessible, contactInfo, costType, location, isVerified 
    } = req.body;
    
    // Update fields if provided
    if (title) resource.title = title;
    if (description) resource.description = description;
    if (category) resource.category = category;
    if (resourceType) resource.resourceType = resourceType;
    if (url) resource.url = url;
    if (imageUrl !== undefined) resource.imageUrl = imageUrl;
    if (tags) resource.tags = tags;
    if (isAnonymousAccessible !== undefined) resource.isAnonymousAccessible = isAnonymousAccessible;
    if (contactInfo) resource.contactInfo = contactInfo;
    if (costType) resource.costType = costType;
    if (location) resource.location = location;
    
    // Only admins can update verification status
    if (isVerified !== undefined && req.user.isAdmin) {
      resource.isVerified = isVerified;
    }
    
    await resource.save();
    
    res.status(200).json(resource);
  } catch (error) {
    console.error('Error updating mental health resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a mental health resource (admin or original creator only)
exports.deleteResource = async (req, res) => {
  try {
    const resource = await MentalHealthResource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // Check permissions (admin or original creator)
    if (!req.user.isAdmin && resource.addedBy.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: 'Only admins or the original creator can delete this resource' 
      });
    }
    
    await MentalHealthResource.deleteOne({ _id: req.params.id });
    
    res.status(200).json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting mental health resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a review to a mental health resource
exports.addReview = async (req, res) => {
  try {
    const { rating, comment, isAnonymous, anonymousPersonaId } = req.body;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Valid rating between 1-5 is required' });
    }
    
    const resource = await MentalHealthResource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // Check if user already reviewed
    const existingReview = resource.reviews.find(review => 
      !review.isAnonymous && review.user.toString() === req.user.id
    );
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this resource' });
    }
    
    // Create new review
    const newReview = {
      user: req.user.id,
      rating: parseInt(rating),
      comment: comment || '',
      isAnonymous: isAnonymous || false,
      anonymousPersona: isAnonymous ? anonymousPersonaId : null
    };
    
    // Add to reviews array
    resource.reviews.push(newReview);
    
    // Update average rating
    const totalRatings = resource.reviews.reduce((sum, review) => sum + review.rating, 0);
    resource.averageRating = totalRatings / resource.reviews.length;
    resource.reviewCount = resource.reviews.length;
    
    await resource.save();
    
    // Return updated resource with populated reviews
    const updatedResource = await MentalHealthResource.findById(req.params.id)
      .populate('reviews.user', 'firstName lastName profileImage')
      .populate('reviews.anonymousPersona', 'displayName avatar');
    
    res.status(201).json(updatedResource);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a review (admin, review author, or resource creator only)
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const resource = await MentalHealthResource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // Find the review
    const reviewIndex = resource.reviews.findIndex(review => 
      review._id.toString() === reviewId
    );
    
    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    const review = resource.reviews[reviewIndex];
    
    // Check permissions
    const isReviewAuthor = !review.isAnonymous && review.user.toString() === req.user.id;
    const isResourceCreator = resource.addedBy.toString() === req.user.id;
    
    if (!req.user.isAdmin && !isReviewAuthor && !isResourceCreator) {
      return res.status(403).json({ 
        message: 'Only admins, the review author, or resource creator can delete this review' 
      });
    }
    
    // Remove the review
    resource.reviews.splice(reviewIndex, 1);
    
    // Update average rating
    if (resource.reviews.length > 0) {
      const totalRatings = resource.reviews.reduce((sum, review) => sum + review.rating, 0);
      resource.averageRating = totalRatings / resource.reviews.length;
    } else {
      resource.averageRating = 0;
    }
    
    resource.reviewCount = resource.reviews.length;
    
    await resource.save();
    
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark a review as helpful
exports.markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const resource = await MentalHealthResource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // Find the review
    const reviewIndex = resource.reviews.findIndex(review => 
      review._id.toString() === reviewId
    );
    
    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Increment helpful count
    resource.reviews[reviewIndex].helpfulCount += 1;
    
    await resource.save();
    
    res.status(200).json({ message: 'Review marked as helpful' });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify a resource (admin only)
exports.verifyResource = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Only admins can verify resources' });
    }
    
    const resource = await MentalHealthResource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    resource.isVerified = !resource.isVerified;
    await resource.save();
    
    res.status(200).json({ 
      message: `Resource ${resource.isVerified ? 'verified' : 'unverified'} successfully`,
      isVerified: resource.isVerified
    });
  } catch (error) {
    console.error('Error verifying resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 