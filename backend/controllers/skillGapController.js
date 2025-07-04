const SkillGap = require('../models/skillGap.model');
const Profile = require('../models/profile.model');
const User = require('../models/user.model');

// Industry to skills mapping
const INDUSTRY_SKILLS_MAP = {
  'software_development': [
    { name: 'JavaScript', importance: 5 },
    { name: 'React', importance: 4 },
    { name: 'Node.js', importance: 4 },
    { name: 'Python', importance: 4 },
    { name: 'Cloud Computing', importance: 4 },
    { name: 'Docker', importance: 3 },
    { name: 'Kubernetes', importance: 3 },
    { name: 'Database Design', importance: 4 },
    { name: 'API Development', importance: 5 },
    { name: 'Testing', importance: 4 }
  ],
  'data_science': [
    { name: 'Python', importance: 5 },
    { name: 'R', importance: 4 },
    { name: 'Machine Learning', importance: 5 },
    { name: 'SQL', importance: 4 },
    { name: 'Data Visualization', importance: 4 },
    { name: 'Statistics', importance: 5 },
    { name: 'Deep Learning', importance: 4 },
    { name: 'Big Data Tools', importance: 3 },
    { name: 'Natural Language Processing', importance: 3 },
    { name: 'Data Cleaning', importance: 4 }
  ],
  'product_management': [
    { name: 'Product Strategy', importance: 5 },
    { name: 'User Research', importance: 4 },
    { name: 'Agile Methodologies', importance: 4 },
    { name: 'Roadmapping', importance: 5 },
    { name: 'Data Analysis', importance: 4 },
    { name: 'Stakeholder Management', importance: 5 },
    { name: 'Wireframing', importance: 3 },
    { name: 'Market Analysis', importance: 4 },
    { name: 'A/B Testing', importance: 4 },
    { name: 'Product Metrics', importance: 5 }
  ],
  'marketing': [
    { name: 'Content Marketing', importance: 4 },
    { name: 'Social Media Marketing', importance: 4 },
    { name: 'SEO', importance: 4 },
    { name: 'Email Marketing', importance: 4 },
    { name: 'Analytics', importance: 5 },
    { name: 'Brand Management', importance: 4 },
    { name: 'Marketing Automation', importance: 4 },
    { name: 'Customer Segmentation', importance: 5 },
    { name: 'Campaign Management', importance: 5 },
    { name: 'Content Strategy', importance: 4 }
  ],
  'design': [
    { name: 'UI Design', importance: 5 },
    { name: 'UX Research', importance: 5 },
    { name: 'Wireframing', importance: 4 },
    { name: 'Figma', importance: 4 },
    { name: 'Adobe Creative Suite', importance: 3 },
    { name: 'Design Systems', importance: 4 },
    { name: 'Prototyping', importance: 4 },
    { name: 'Visual Design', importance: 4 },
    { name: 'Accessibility', importance: 4 },
    { name: 'User Testing', importance: 5 }
  ],
  'leadership': [
    { name: 'Team Management', importance: 5 },
    { name: 'Strategic Planning', importance: 5 },
    { name: 'Conflict Resolution', importance: 4 },
    { name: 'Decision Making', importance: 5 },
    { name: 'Delegation', importance: 4 },
    { name: 'Coaching', importance: 4 },
    { name: 'Change Management', importance: 4 },
    { name: 'Budget Management', importance: 4 },
    { name: 'Performance Reviews', importance: 4 },
    { name: 'Communication', importance: 5 }
  ]
};

// Resource database (in a real app, this would be a database of learning resources)
const LEARNING_RESOURCES = {
  // Technical skills
  'JavaScript': [
    { title: 'Modern JavaScript for Women in Tech', url: 'https://example.com/js-for-women', type: 'course', estimatedTimeHours: 15 },
    { title: 'JavaScript: The Good Parts', url: 'https://example.com/js-good-parts', type: 'book', estimatedTimeHours: 8 }
  ],
  'Python': [
    { title: 'Python for Data Science', url: 'https://example.com/python-data', type: 'course', estimatedTimeHours: 20 },
    { title: 'Automate the Boring Stuff with Python', url: 'https://example.com/automate-python', type: 'book', estimatedTimeHours: 10 }
  ],
  'React': [
    { title: 'React for Women Engineers', url: 'https://example.com/react-women', type: 'course', estimatedTimeHours: 18 },
    { title: 'Building Modern UIs with React', url: 'https://example.com/react-ui', type: 'workshop', estimatedTimeHours: 6 }
  ],
  // Leadership skills
  'Team Management': [
    { title: 'Women's Leadership: Team Building and Management', url: 'https://example.com/women-leadership', type: 'course', estimatedTimeHours: 12 },
    { title: 'Inclusive Team Management', url: 'https://example.com/inclusive-team', type: 'workshop', estimatedTimeHours: 4 }
  ],
  'Strategic Planning': [
    { title: 'Strategic Vision for Women Leaders', url: 'https://example.com/strategic-vision', type: 'course', estimatedTimeHours: 10 },
    { title: 'Strategic Planning Framework', url: 'https://example.com/strategic-framework', type: 'article', estimatedTimeHours: 1 }
  ],
  // Default for other skills
  'default': [
    { title: 'Online Course Recommendations', url: 'https://example.com/courses', type: 'course', estimatedTimeHours: 10 },
    { title: 'Mentorship Programs', url: 'https://example.com/mentorship', type: 'mentor', estimatedTimeHours: 20 }
  ]
};

/**
 * Get learning resources for a skill
 * @param {String} skill - Skill name
 * @returns {Array} - Array of learning resources
 */
const getLearningResources = (skill) => {
  return LEARNING_RESOURCES[skill] || LEARNING_RESOURCES['default'];
};

/**
 * Calculate skill gap score
 * @param {Number} requiredLevel - Required proficiency level (1-5)
 * @param {Number} currentLevel - Current proficiency level (1-5)
 * @returns {Number} - Gap score
 */
const calculateGapScore = (requiredLevel, currentLevel) => {
  // If current skill level is not provided, assume it's 0
  currentLevel = currentLevel || 0;
  
  // Gap is the difference between required and current
  const rawGap = Math.max(0, requiredLevel - currentLevel);
  
  // Normalize gap to a 0-5 scale
  return Math.min(5, rawGap);
};

// Create or update skill gap analysis
exports.createOrUpdateSkillGap = async (req, res) => {
  try {
    const userId = req.user.id;
    const { industry, targetRole } = req.body;
    
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found. Please complete your profile first.' });
    }
    
    // Find required skills for the industry
    const requiredSkills = INDUSTRY_SKILLS_MAP[industry] || [];
    if (requiredSkills.length === 0) {
      return res.status(400).json({ message: 'Industry not supported for skill gap analysis.' });
    }
    
    // Process current skills from profile
    const currentSkillsMap = {};
    if (profile.skills) {
      profile.skills.forEach(skill => {
        if (typeof skill === 'object' && skill.name && skill.proficiency) {
          currentSkillsMap[skill.name.toLowerCase()] = skill.proficiency;
        } else if (typeof skill === 'string') {
          // Assume moderate proficiency if only skill name is provided
          currentSkillsMap[skill.toLowerCase()] = 3;
        }
      });
    }
    
    // Calculate skill gaps and prepare recommendations
    const processedRequiredSkills = [];
    const recommendations = [];
    
    requiredSkills.forEach(requiredSkill => {
      const skillLower = requiredSkill.name.toLowerCase();
      const currentProficiency = currentSkillsMap[skillLower];
      const gapScore = calculateGapScore(requiredSkill.importance, currentProficiency);
      
      processedRequiredSkills.push({
        name: requiredSkill.name,
        importance: requiredSkill.importance,
        gap: gapScore
      });
      
      // If there's a significant gap (3 or higher), add to recommendations
      if (gapScore >= 3) {
        const resources = getLearningResources(requiredSkill.name);
        const priority = gapScore * requiredSkill.importance; // Higher gap and importance means higher priority
        
        recommendations.push({
          skill: requiredSkill.name,
          resources,
          priority: Math.min(10, Math.round(priority * 1.5)) // Scale to 1-10
        });
      }
    });
    
    // Sort recommendations by priority
    recommendations.sort((a, b) => b.priority - a.priority);
    
    // Prepare progress tracking data
    const progressTracking = processedRequiredSkills
      .filter(skill => skill.gap > 0)
      .map(skill => ({
        skill: skill.name,
        startingLevel: currentSkillsMap[skill.name.toLowerCase()] || 0,
        currentLevel: currentSkillsMap[skill.name.toLowerCase()] || 0,
        targetLevel: skill.importance
      }));
    
    // Find existing skill gap analysis or create new one
    let skillGap = await SkillGap.findOne({ user: userId });
    
    if (skillGap) {
      // Update existing
      skillGap.industry = industry;
      skillGap.targetRole = targetRole || skillGap.targetRole;
      skillGap.currentSkills = profile.skills || [];
      skillGap.requiredSkills = processedRequiredSkills;
      skillGap.recommendations = recommendations;
      
      // Keep existing progress tracking but add any new skills
      const existingSkills = new Set(skillGap.progressTracking.map(item => item.skill));
      progressTracking.forEach(item => {
        if (!existingSkills.has(item.skill)) {
          skillGap.progressTracking.push(item);
        }
      });
      
      skillGap.lastUpdated = new Date();
    } else {
      // Create new
      skillGap = new SkillGap({
        user: userId,
        industry,
        targetRole,
        currentSkills: profile.skills || [],
        requiredSkills: processedRequiredSkills,
        recommendations,
        progressTracking
      });
    }
    
    await skillGap.save();
    
    return res.status(200).json({
      message: 'Skill gap analysis completed successfully',
      skillGap
    });
  } catch (error) {
    console.error('Error in skill gap analysis:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get user's skill gap analysis
exports.getUserSkillGap = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const skillGap = await SkillGap.findOne({ user: userId });
    
    if (!skillGap) {
      return res.status(404).json({ message: 'No skill gap analysis found. Please create one first.' });
    }
    
    return res.status(200).json(skillGap);
  } catch (error) {
    console.error('Error getting skill gap analysis:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update skill progress
exports.updateSkillProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skill, newLevel } = req.body;
    
    if (!skill || newLevel === undefined) {
      return res.status(400).json({ message: 'Skill name and new level are required.' });
    }
    
    if (newLevel < 1 || newLevel > 5) {
      return res.status(400).json({ message: 'Skill level must be between 1 and 5.' });
    }
    
    const skillGap = await SkillGap.findOne({ user: userId });
    
    if (!skillGap) {
      return res.status(404).json({ message: 'No skill gap analysis found. Please create one first.' });
    }
    
    // Find and update the skill in progress tracking
    const skillIndex = skillGap.progressTracking.findIndex(
      item => item.skill.toLowerCase() === skill.toLowerCase()
    );
    
    if (skillIndex === -1) {
      return res.status(404).json({ message: 'Skill not found in your progress tracking.' });
    }
    
    skillGap.progressTracking[skillIndex].currentLevel = newLevel;
    skillGap.progressTracking[skillIndex].lastUpdated = new Date();
    
    // Recalculate gap
    const requiredSkill = skillGap.requiredSkills.find(
      item => item.name.toLowerCase() === skill.toLowerCase()
    );
    
    if (requiredSkill) {
      requiredSkill.gap = calculateGapScore(requiredSkill.importance, newLevel);
    }
    
    // Update current skills in the main list
    const currentSkillIndex = skillGap.currentSkills.findIndex(
      item => {
        if (typeof item === 'object') {
          return item.name.toLowerCase() === skill.toLowerCase();
        }
        return item.toLowerCase() === skill.toLowerCase();
      }
    );
    
    if (currentSkillIndex !== -1) {
      if (typeof skillGap.currentSkills[currentSkillIndex] === 'object') {
        skillGap.currentSkills[currentSkillIndex].proficiency = newLevel;
      } else {
        // Convert string to object with proficiency
        skillGap.currentSkills[currentSkillIndex] = {
          name: skillGap.currentSkills[currentSkillIndex],
          proficiency: newLevel
        };
      }
    } else {
      // Add new skill to current skills
      skillGap.currentSkills.push({
        name: skill,
        proficiency: newLevel
      });
    }
    
    skillGap.lastUpdated = new Date();
    await skillGap.save();
    
    // Update user profile as well
    const profile = await Profile.findOne({ user: userId });
    if (profile) {
      const profileSkillIndex = profile.skills ? profile.skills.findIndex(
        item => {
          if (typeof item === 'object') {
            return item.name.toLowerCase() === skill.toLowerCase();
          }
          return item.toLowerCase() === skill.toLowerCase();
        }
      ) : -1;
      
      if (profileSkillIndex !== -1) {
        if (typeof profile.skills[profileSkillIndex] === 'object') {
          profile.skills[profileSkillIndex].proficiency = newLevel;
        } else {
          // Convert string to object with proficiency
          profile.skills[profileSkillIndex] = {
            name: profile.skills[profileSkillIndex],
            proficiency: newLevel
          };
        }
      } else {
        // Add to profile skills if not exists
        if (!profile.skills) {
          profile.skills = [];
        }
        profile.skills.push({
          name: skill,
          proficiency: newLevel
        });
      }
      
      await profile.save();
    }
    
    return res.status(200).json({
      message: 'Skill progress updated successfully',
      skillGap
    });
  } catch (error) {
    console.error('Error updating skill progress:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get learning recommendations
exports.getLearningRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const skillGap = await SkillGap.findOne({ user: userId });
    
    if (!skillGap) {
      return res.status(404).json({ message: 'No skill gap analysis found. Please create one first.' });
    }
    
    // Get recommendations, sorted by priority
    const recommendations = [...skillGap.recommendations].sort((a, b) => b.priority - a.priority);
    
    return res.status(200).json(recommendations);
  } catch (error) {
    console.error('Error getting learning recommendations:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get skill gap statistics
exports.getSkillGapStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const skillGap = await SkillGap.findOne({ user: userId });
    
    if (!skillGap) {
      return res.status(404).json({ message: 'No skill gap analysis found. Please create one first.' });
    }
    
    // Calculate overall statistics
    const totalSkills = skillGap.requiredSkills.length;
    const skillsWithGaps = skillGap.requiredSkills.filter(skill => skill.gap > 0).length;
    const criticalGaps = skillGap.requiredSkills.filter(skill => skill.gap >= 4).length;
    const averageGap = skillGap.requiredSkills.reduce((sum, skill) => sum + skill.gap, 0) / totalSkills;
    
    // Calculate progress statistics
    const skillsImproved = skillGap.progressTracking.filter(
      skill => skill.currentLevel > skill.startingLevel
    ).length;
    
    const overallImprovement = skillGap.progressTracking.reduce(
      (sum, skill) => sum + (skill.currentLevel - skill.startingLevel), 0
    );
    
    // Calculate percentage complete toward target
    const totalProgressPoints = skillGap.progressTracking.reduce(
      (sum, skill) => sum + (skill.targetLevel - skill.startingLevel), 0
    );
    
    const achievedProgressPoints = skillGap.progressTracking.reduce(
      (sum, skill) => sum + (skill.currentLevel - skill.startingLevel), 0
    );
    
    const progressPercentage = totalProgressPoints > 0
      ? Math.round((achievedProgressPoints / totalProgressPoints) * 100)
      : 0;
    
    // Prepare stats object
    const stats = {
      totalSkills,
      skillsWithGaps,
      criticalGaps,
      averageGap: parseFloat(averageGap.toFixed(1)),
      skillsImproved,
      overallImprovement,
      progressPercentage,
      lastUpdated: skillGap.lastUpdated
    };
    
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error getting skill gap statistics:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};