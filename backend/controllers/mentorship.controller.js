const Mentorship = require('../models/mentorship.model');
const MentorProfile = require('../models/mentorProfile.model');
const User = require('../models/user.model');

// Create a mentor profile
exports.createMentorProfile = async (req, res) => {
  try {
    // Check if user already has a mentor profile
    const existingProfile = await MentorProfile.findOne({ user: req.user.id });
    if (existingProfile) {
      return res.status(400).json({ message: 'Mentor profile already exists for this user' });
    }

    const newMentorProfile = new MentorProfile({
      user: req.user.id,
      ...req.body
    });

    const mentorProfile = await newMentorProfile.save();
    res.status(201).json(mentorProfile);
  } catch (error) {
    console.error('Error creating mentor profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get mentor profile
exports.getMentorProfile = async (req, res) => {
  try {
    const mentorProfile = await MentorProfile.findOne({ user: req.params.userId })
      .populate('user', 'firstName lastName profileImage');
    
    if (!mentorProfile) {
      return res.status(404).json({ message: 'Mentor profile not found' });
    }
    
    res.json(mentorProfile);
  } catch (error) {
    console.error('Error fetching mentor profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update mentor profile
exports.updateMentorProfile = async (req, res) => {
  try {
    const mentorProfile = await MentorProfile.findOne({ user: req.user.id });
    
    if (!mentorProfile) {
      return res.status(404).json({ message: 'Mentor profile not found' });
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      mentorProfile[key] = req.body[key];
    });
    
    const updatedProfile = await mentorProfile.save();
    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating mentor profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all active mentors with filtering
exports.getActiveMentors = async (req, res) => {
  try {
    const { specialization, industry, mentorshipStyle, page = 1, limit = 10 } = req.query;
    
    const filter = { isActive: true };
    
    if (specialization) {
      filter.specializations = specialization;
    }
    
    if (industry) {
      filter.industries = industry;
    }
    
    if (mentorshipStyle) {
      filter.mentorshipStyle = mentorshipStyle;
    }
    
    const options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
      sort: { 'rating.average': -1 }
    };
    
    const mentors = await MentorProfile.find(filter, null, options)
      .populate('user', 'firstName lastName profileImage');
    
    const total = await MentorProfile.countDocuments(filter);
    
    res.json({
      mentors,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Request mentorship
exports.requestMentorship = async (req, res) => {
  try {
    const { mentorId, focusAreas, goals } = req.body;
    
    // Verify mentor exists
    const mentorProfile = await MentorProfile.findOne({ user: mentorId, isActive: true });
    if (!mentorProfile) {
      return res.status(404).json({ message: 'Active mentor not found' });
    }
    
    // Check if mentorship already exists
    const existingMentorship = await Mentorship.findOne({
      mentor: mentorId,
      mentee: req.user.id
    });
    
    if (existingMentorship) {
      return res.status(400).json({ message: 'Mentorship request already exists' });
    }
    
    // Check mentor capacity
    if (mentorProfile.availability.currentMentees >= mentorProfile.availability.maxMentees) {
      return res.status(400).json({ message: 'Mentor has reached maximum capacity' });
    }
    
    // Create mentorship request
    const newMentorship = new Mentorship({
      mentor: mentorId,
      mentee: req.user.id,
      focusAreas,
      goals: goals.map(goal => ({ description: goal }))
    });
    
    const mentorship = await newMentorship.save();
    
    res.status(201).json(mentorship);
  } catch (error) {
    console.error('Error requesting mentorship:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Respond to mentorship request
exports.respondToRequest = async (req, res) => {
  try {
    const { mentorshipId, action } = req.body;
    
    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }
    
    const mentorship = await Mentorship.findById(mentorshipId);
    
    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }
    
    // Verify the logged-in user is the mentor
    if (mentorship.mentor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Update mentorship status
    mentorship.status = action === 'accept' ? 'active' : 'rejected';
    
    // If accepting, update mentor's current mentee count
    if (action === 'accept') {
      await MentorProfile.findOneAndUpdate(
        { user: req.user.id },
        { $inc: { 'availability.currentMentees': 1 } }
      );
    }
    
    const updatedMentorship = await mentorship.save();
    
    res.json(updatedMentorship);
  } catch (error) {
    console.error('Error responding to mentorship request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all mentorships for a user (either as mentor or mentee)
exports.getUserMentorships = async (req, res) => {
  try {
    const { role = 'all', status } = req.query;
    
    let filter = {};
    
    if (role === 'mentor') {
      filter.mentor = req.user.id;
    } else if (role === 'mentee') {
      filter.mentee = req.user.id;
    } else {
      filter.$or = [{ mentor: req.user.id }, { mentee: req.user.id }];
    }
    
    if (status) {
      filter.status = status;
    }
    
    const mentorships = await Mentorship.find(filter)
      .populate('mentor', 'firstName lastName profileImage')
      .populate('mentee', 'firstName lastName profileImage')
      .sort({ createdAt: -1 });
    
    res.json(mentorships);
  } catch (error) {
    console.error('Error fetching user mentorships:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a meeting to mentorship
exports.scheduleMeeting = async (req, res) => {
  try {
    const { mentorshipId, scheduledFor, duration, meetingLink } = req.body;
    
    const mentorship = await Mentorship.findById(mentorshipId);
    
    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }
    
    // Verify user is part of the mentorship
    if (mentorship.mentor.toString() !== req.user.id && mentorship.mentee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Add meeting
    mentorship.meetings.push({
      scheduledFor,
      duration,
      meetingLink
    });
    
    const updatedMentorship = await mentorship.save();
    
    res.json(updatedMentorship);
  } catch (error) {
    console.error('Error scheduling meeting:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update meeting status
exports.updateMeetingStatus = async (req, res) => {
  try {
    const { mentorshipId, meetingId, status, notes } = req.body;
    
    const mentorship = await Mentorship.findById(mentorshipId);
    
    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }
    
    // Verify user is part of the mentorship
    if (mentorship.mentor.toString() !== req.user.id && mentorship.mentee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Find meeting
    const meeting = mentorship.meetings.id(meetingId);
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // Update meeting
    meeting.status = status;
    if (notes) {
      meeting.notes = notes;
    }
    
    const updatedMentorship = await mentorship.save();
    
    res.json(updatedMentorship);
  } catch (error) {
    console.error('Error updating meeting status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add feedback for mentorship
exports.provideFeedback = async (req, res) => {
  try {
    const { mentorshipId, rating, feedback } = req.body;
    
    const mentorship = await Mentorship.findById(mentorshipId);
    
    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }
    
    // Determine if user is mentor or mentee
    const isMentor = mentorship.mentor.toString() === req.user.id;
    const isMentee = mentorship.mentee.toString() === req.user.id;
    
    if (!isMentor && !isMentee) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Add feedback based on role
    if (isMentor) {
      mentorship.feedback.mentorRating = rating;
      mentorship.feedback.mentorFeedback = feedback;
    } else {
      mentorship.feedback.menteeRating = rating;
      mentorship.feedback.menteeFeedback = feedback;
      
      // Add testimonial to mentor's profile if rating is provided
      if (rating) {
        await MentorProfile.findOneAndUpdate(
          { user: mentorship.mentor },
          { 
            $push: { 
              testimonials: { 
                mentee: req.user.id, 
                content: feedback, 
                rating 
              } 
            } 
          }
        );
      }
    }
    
    const updatedMentorship = await mentorship.save();
    
    res.json(updatedMentorship);
  } catch (error) {
    console.error('Error providing feedback:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Complete mentorship
exports.completeMentorship = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    
    const mentorship = await Mentorship.findById(mentorshipId);
    
    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }
    
    // Verify user is part of the mentorship
    if (mentorship.mentor.toString() !== req.user.id && mentorship.mentee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Update mentorship status
    mentorship.status = 'completed';
    mentorship.endDate = new Date();
    
    // Reduce mentor's current mentee count
    await MentorProfile.findOneAndUpdate(
      { user: mentorship.mentor },
      { $inc: { 'availability.currentMentees': -1 } }
    );
    
    const updatedMentorship = await mentorship.save();
    
    res.json(updatedMentorship);
  } catch (error) {
    console.error('Error completing mentorship:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get mentorship statistics
exports.getMentorshipStats = async (req, res) => {
  try {
    const totalMentors = await MentorProfile.countDocuments({ isActive: true });
    const totalActiveMentorships = await Mentorship.countDocuments({ status: 'active' });
    const totalCompletedMentorships = await Mentorship.countDocuments({ status: 'completed' });
    
    let userStats = {};
    
    if (req.user) {
      const mentorProfile = await MentorProfile.findOne({ user: req.user.id });
      const mentorshipCount = await Mentorship.countDocuments({ 
        $or: [{ mentor: req.user.id }, { mentee: req.user.id }] 
      });
      
      userStats = {
        isMentor: !!mentorProfile,
        mentorshipCount
      };
    }
    
    res.json({
      totalMentors,
      totalActiveMentorships,
      totalCompletedMentorships,
      userStats
    });
  } catch (error) {
    console.error('Error getting mentorship stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 