const Mentorship = require('../models/mentorship.model');
const User = require('../models/user.model');
const Profile = require('../models/profile.model');

// Personality traits used for compatibility matching
const PERSONALITY_TRAITS = [
  'communication_style', 
  'learning_preference', 
  'feedback_approach', 
  'work_style', 
  'goal_orientation'
];

/**
 * Calculate compatibility score between mentor and mentee
 * @param {Object} mentorProfile - Mentor's profile data
 * @param {Object} menteeProfile - Mentee's profile data
 * @returns {Number} - Compatibility score (0-100)
 */
const calculateCompatibilityScore = (mentorProfile, menteeProfile) => {
  let score = 0;
  let totalFactors = 0;

  // Personality matching (30% of total score)
  if (mentorProfile.personalityTraits && menteeProfile.personalityTraits) {
    let personalityScore = 0;
    let traitCount = 0;
    
    PERSONALITY_TRAITS.forEach(trait => {
      if (mentorProfile.personalityTraits[trait] && menteeProfile.personalityTraits[trait]) {
        // Different scoring based on trait:
        // Some traits are better when similar (learning_preference)
        // Others are better complementary (communication_style might benefit from diversity)
        if (['learning_preference', 'work_style'].includes(trait)) {
          // For these traits, similarity is preferred (0 = no match, 10 = exact match)
          const similarity = 10 - Math.abs(mentorProfile.personalityTraits[trait] - menteeProfile.personalityTraits[trait]) * 2;
          personalityScore += similarity;
        } else {
          // For these traits, complementary styles can be beneficial
          // Score higher if they're different but not complete opposites
          const difference = Math.abs(mentorProfile.personalityTraits[trait] - menteeProfile.personalityTraits[trait]);
          const complementaryScore = difference <= 2 ? 5 : (difference >= 3 && difference <= 4) ? 10 : 7;
          personalityScore += complementaryScore;
        }
        traitCount++;
      }
    });

    if (traitCount > 0) {
      score += (personalityScore / (traitCount * 10)) * 30; // 30% weight to personality
      totalFactors += 30;
    }
  }

  // Industry & skills matching (40% of total score)
  if (mentorProfile.industry && menteeProfile.industry) {
    // Industry match
    if (mentorProfile.industry === menteeProfile.industry) {
      score += 20; // Same industry
    } else if (mentorProfile.relatedIndustries && mentorProfile.relatedIndustries.includes(menteeProfile.industry)) {
      score += 10; // Related industry
    }
    totalFactors += 20;

    // Skills match
    if (mentorProfile.skills && menteeProfile.skills && menteeProfile.skillsToImprove) {
      const mentorSkillsSet = new Set(mentorProfile.skills.map(skill => skill.toLowerCase()));
      const desiredSkillsCount = menteeProfile.skillsToImprove.length;
      
      if (desiredSkillsCount > 0) {
        let matchedSkills = 0;
        menteeProfile.skillsToImprove.forEach(skill => {
          if (mentorSkillsSet.has(skill.toLowerCase())) {
            matchedSkills++;
          }
        });
        
        score += (matchedSkills / desiredSkillsCount) * 20; // Skills match (20%)
        totalFactors += 20;
      }
    }
  }

  // Experience level match (15% of total score)
  if (mentorProfile.experienceYears !== undefined && menteeProfile.experienceYears !== undefined) {
    // Ideal mentor has 3-15 years more experience than mentee
    const expDifference = mentorProfile.experienceYears - menteeProfile.experienceYears;
    
    if (expDifference >= 3 && expDifference <= 15) {
      score += 15; // Ideal experience gap
    } else if (expDifference > 0) {
      score += 10; // Any positive experience gap
    }
    totalFactors += 15;
  }

  // Career goals alignment (15% of total score)
  if (mentorProfile.careerGoals && menteeProfile.careerGoals) {
    let goalMatchCount = 0;
    let menteeGoalCount = 0;
    
    menteeProfile.careerGoals.forEach(menteeGoal => {
      if (mentorProfile.careerAchievements && mentorProfile.careerAchievements.some(
        achievement => achievement.toLowerCase().includes(menteeGoal.toLowerCase())
      )) {
        goalMatchCount++;
      }
      menteeGoalCount++;
    });
    
    if (menteeGoalCount > 0) {
      score += (goalMatchCount / menteeGoalCount) * 15;
      totalFactors += 15;
    }
  }

  // Normalize score if we have data
  return totalFactors > 0 ? Math.round((score / totalFactors) * 100) : 50;
};

// Get potential mentors for a user
exports.findPotentialMentors = async (req, res) => {
  try {
    const userId = req.user.id;
    const menteeProfile = await Profile.findOne({ user: userId });
    
    if (!menteeProfile) {
      return res.status(404).json({ message: 'Profile not found. Please complete your profile first.' });
    }

    // Find users who are offering mentorship
    const potentialMentors = await Profile.find({ 
      user: { $ne: userId }, 
      offersMentorship: true 
    }).populate('user', 'name email');

    // Calculate compatibility scores for each potential mentor
    const mentorsWithScores = [];
    for (const mentorProfile of potentialMentors) {
      const compatibilityScore = calculateCompatibilityScore(mentorProfile, menteeProfile);
      mentorsWithScores.push({
        mentor: mentorProfile,
        compatibilityScore
      });
    }

    // Sort by compatibility score (highest first)
    mentorsWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return res.status(200).json(mentorsWithScores);
  } catch (error) {
    console.error('Error finding potential mentors:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Request mentorship
exports.requestMentorship = async (req, res) => {
  try {
    const { mentorId, focusAreas, goals } = req.body;
    const menteeId = req.user.id;

    // Check if user is requesting themselves as mentor
    if (mentorId === menteeId) {
      return res.status(400).json({ message: 'You cannot mentor yourself.' });
    }

    // Check if a mentorship already exists
    const existingMentorship = await Mentorship.findOne({
      mentor: mentorId,
      mentee: menteeId,
      status: { $in: ['pending', 'active'] }
    });

    if (existingMentorship) {
      return res.status(400).json({ 
        message: existingMentorship.status === 'pending' 
          ? 'You already have a pending request with this mentor.' 
          : 'You already have an active mentorship with this mentor.' 
      });
    }

    // Get mentor and mentee profiles for compatibility score
    const mentorProfile = await Profile.findOne({ user: mentorId });
    const menteeProfile = await Profile.findOne({ user: menteeId });

    if (!mentorProfile || !menteeProfile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    const compatibilityScore = calculateCompatibilityScore(mentorProfile, menteeProfile);

    // Create new mentorship request
    const mentorship = new Mentorship({
      mentor: mentorId,
      mentee: menteeId,
      status: 'pending',
      compatibilityScore,
      focusAreas,
      goals: goals.map(goal => ({ description: goal }))
    });

    await mentorship.save();

    // Could trigger a notification to the mentor here

    return res.status(201).json({ 
      message: 'Mentorship request sent successfully',
      mentorship 
    });
  } catch (error) {
    console.error('Error requesting mentorship:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Accept or decline mentorship request
exports.respondToMentorshipRequest = async (req, res) => {
  try {
    const { mentorshipId, action } = req.body;
    const userId = req.user.id;
    
    const mentorship = await Mentorship.findById(mentorshipId);
    
    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship request not found.' });
    }
    
    // Check if user is the mentor
    if (mentorship.mentor.toString() !== userId) {
      return res.status(403).json({ message: 'You can only respond to your own mentorship requests.' });
    }
    
    // Check if request is still pending
    if (mentorship.status !== 'pending') {
      return res.status(400).json({ message: `This mentorship is already ${mentorship.status}.` });
    }
    
    if (action === 'accept') {
      mentorship.status = 'active';
      mentorship.startDate = new Date();
      // Default to 3 months mentorship period
      mentorship.endDate = new Date(new Date().setMonth(new Date().getMonth() + 3));
    } else if (action === 'decline') {
      mentorship.status = 'declined';
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "accept" or "decline".' });
    }
    
    await mentorship.save();
    
    return res.status(200).json({
      message: `Mentorship ${action === 'accept' ? 'accepted' : 'declined'} successfully.`,
      mentorship
    });
  } catch (error) {
    console.error('Error responding to mentorship request:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all mentorships (for a user)
exports.getMentorships = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.query.role; // 'mentor' or 'mentee'
    const status = req.query.status; // 'pending', 'active', 'completed', 'declined'
    
    let query = {};
    
    // Filter by role
    if (role === 'mentor') {
      query.mentor = userId;
    } else if (role === 'mentee') {
      query.mentee = userId;
    } else {
      // If no role specified, get all mentorships where user is either mentor or mentee
      query.$or = [{ mentor: userId }, { mentee: userId }];
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    const mentorships = await Mentorship.find(query)
      .populate('mentor', 'name email')
      .populate('mentee', 'name email')
      .sort({ updatedAt: -1 });
      
    return res.status(200).json(mentorships);
  } catch (error) {
    console.error('Error getting mentorships:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update mentorship (add meetings, goals, feedback)
exports.updateMentorship = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    const { addMeeting, updateGoal, addFeedback } = req.body;
    const userId = req.user.id;
    
    const mentorship = await Mentorship.findById(mentorshipId);
    
    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found.' });
    }
    
    // Check if user is part of this mentorship
    if (mentorship.mentor.toString() !== userId && mentorship.mentee.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to update this mentorship.' });
    }
    
    // Check if mentorship is active
    if (mentorship.status !== 'active') {
      return res.status(400).json({ message: 'You can only update active mentorships.' });
    }
    
    // Add meeting
    if (addMeeting) {
      mentorship.meetings.push({
        date: addMeeting.date || new Date(),
        notes: addMeeting.notes || '',
        completed: addMeeting.completed || false
      });
    }
    
    // Update goal
    if (updateGoal && updateGoal.goalId) {
      const goalIndex = mentorship.goals.findIndex(
        goal => goal._id.toString() === updateGoal.goalId
      );
      
      if (goalIndex !== -1) {
        if (updateGoal.description) {
          mentorship.goals[goalIndex].description = updateGoal.description;
        }
        if (updateGoal.status) {
          mentorship.goals[goalIndex].status = updateGoal.status;
        }
      }
    }
    
    // Add feedback
    if (addFeedback) {
      mentorship.feedbackSessions.push({
        date: new Date(),
        mentorFeedback: userId === mentorship.mentor.toString() ? addFeedback.feedback : '',
        menteeFeedback: userId === mentorship.mentee.toString() ? addFeedback.feedback : ''
      });
    }
    
    // Update timestamps
    mentorship.updatedAt = new Date();
    
    await mentorship.save();
    
    return res.status(200).json({
      message: 'Mentorship updated successfully.',
      mentorship
    });
  } catch (error) {
    console.error('Error updating mentorship:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Complete a mentorship
exports.completeMentorship = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    const { finalFeedback } = req.body;
    const userId = req.user.id;
    
    const mentorship = await Mentorship.findById(mentorshipId);
    
    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found.' });
    }
    
    // Check if user is part of this mentorship
    if (mentorship.mentor.toString() !== userId && mentorship.mentee.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to complete this mentorship.' });
    }
    
    // Check if mentorship is active
    if (mentorship.status !== 'active') {
      return res.status(400).json({ message: `This mentorship is already ${mentorship.status}.` });
    }
    
    // Add final feedback
    if (finalFeedback) {
      mentorship.feedbackSessions.push({
        date: new Date(),
        mentorFeedback: userId === mentorship.mentor.toString() ? finalFeedback : '',
        menteeFeedback: userId === mentorship.mentee.toString() ? finalFeedback : ''
      });
    }
    
    // Mark as completed
    mentorship.status = 'completed';
    mentorship.endDate = new Date();
    
    await mentorship.save();
    
    return res.status(200).json({
      message: 'Mentorship completed successfully.',
      mentorship
    });
  } catch (error) {
    console.error('Error completing mentorship:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get mentorship statistics for a user
exports.getMentorshipStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = {
      asMentor: {
        total: 0,
        active: 0,
        completed: 0,
        totalHoursMentoring: 0
      },
      asMentee: {
        total: 0,
        active: 0,
        completed: 0,
        totalHoursMentored: 0
      }
    };
    
    // Get mentorships as mentor
    const asMentor = await Mentorship.find({ mentor: userId });
    
    // Get mentorships as mentee
    const asMentee = await Mentorship.find({ mentee: userId });
    
    // Calculate stats as mentor
    stats.asMentor.total = asMentor.length;
    stats.asMentor.active = asMentor.filter(m => m.status === 'active').length;
    stats.asMentor.completed = asMentor.filter(m => m.status === 'completed').length;
    
    let mentorHours = 0;
    asMentor.forEach(mentorship => {
      mentorship.meetings.forEach(meeting => {
        if (meeting.completed) {
          // Assume each meeting is 1 hour if not specified
          mentorHours += 1;
        }
      });
    });
    stats.asMentor.totalHoursMentoring = mentorHours;
    
    // Calculate stats as mentee
    stats.asMentee.total = asMentee.length;
    stats.asMentee.active = asMentee.filter(m => m.status === 'active').length;
    stats.asMentee.completed = asMentee.filter(m => m.status === 'completed').length;
    
    let menteeHours = 0;
    asMentee.forEach(mentorship => {
      mentorship.meetings.forEach(meeting => {
        if (meeting.completed) {
          // Assume each meeting is 1 hour if not specified
          menteeHours += 1;
        }
      });
    });
    stats.asMentee.totalHoursMentored = menteeHours;
    
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error getting mentorship stats:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};