const BetaTester = require('../models/betaTester.model');
const User = require('../models/user.model');
const TestScenario = require('../models/testScenario.model');
const AnalyticsEvent = require('../models/analyticsEvent.model');
const BugReport = require('../models/bugReport.model');

// Recruit a new beta tester
exports.recruitTester = async (req, res) => {
  try {
    const { userId, demographics, testingAreas } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if user is already a beta tester
    const existingTester = await BetaTester.findOne({ user: userId });
    if (existingTester) {
      return res.status(400).json({ success: false, message: 'User is already a beta tester' });
    }

    // Create new beta tester
    const betaTester = new BetaTester({
      user: userId,
      demographics,
      testingAreas: testingAreas || [],
      status: 'active',
      joinDate: new Date(),
      abTestGroup: assignToABTestGroup()
    });

    await betaTester.save();

    // Log recruitment event
    const analyticsEvent = new AnalyticsEvent({
      eventType: 'beta_tester_recruited',
      user: userId,
      betaTester: betaTester._id,
      featureArea: 'betaTesting',
      data: { demographics, testingAreas }
    });
    await analyticsEvent.save();

    res.status(201).json({ 
      success: true, 
      message: 'Beta tester recruited successfully', 
      data: betaTester 
    });
  } catch (error) {
    console.error('Error recruiting beta tester:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to recruit beta tester', 
      error: error.message 
    });
  }
};

// Get all beta testers with optional filtering
exports.getAllTesters = async (req, res) => {
  try {
    const { status, testingArea, experience, abTestGroup, sort } = req.query;
    const query = {};

    // Apply filters if provided
    if (status) query.status = status;
    if (testingArea) query['testingAreas.feature'] = testingArea;
    if (experience) query['demographics.experience'] = experience;
    if (abTestGroup) query.abTestGroup = abTestGroup;

    // Determine sort order
    let sortOption = { joinDate: -1 }; // Default sort by join date (newest first)
    if (sort === 'engagement') {
      sortOption = { engagementScore: -1 };
    } else if (sort === 'bugs') {
      sortOption = { bugsReported: -1 };
    }

    const testers = await BetaTester.find(query)
      .sort(sortOption)
      .populate('user', 'name email profileImage')
      .exec();

    res.status(200).json({ 
      success: true, 
      count: testers.length,
      data: testers 
    });
  } catch (error) {
    console.error('Error getting beta testers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get beta testers', 
      error: error.message 
    });
  }
};

// Get a single beta tester by ID
exports.getTesterById = async (req, res) => {
  try {
    const testerId = req.params.id;
    
    const tester = await BetaTester.findById(testerId)
      .populate('user', 'name email profileImage')
      .exec();
      
    if (!tester) {
      return res.status(404).json({ success: false, message: 'Beta tester not found' });
    }

    // Get tester's feedback statistics
    const feedbackStats = await TestScenario.aggregate([
      { $match: { 'assignedTesters': testerId } },
      { $group: {
          _id: null,
          totalAssigned: { $sum: 1 },
          completedCount: { 
            $sum: { 
              $cond: [
                { $in: [testerId, '$completionStats.completed'] }, 
                1, 
                0
              ] 
            } 
          }
        }
      }
    ]);

    // Get tester's bug reports
    const bugReports = await BugReport.find({ reporter: testerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    // Get tester's recent activity
    const recentActivity = await AnalyticsEvent.find({ betaTester: testerId })
      .sort({ timestamp: -1 })
      .limit(10)
      .exec();

    res.status(200).json({ 
      success: true, 
      data: {
        tester,
        feedbackStats: feedbackStats[0] || { totalAssigned: 0, completedCount: 0 },
        bugReports,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Error getting beta tester:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get beta tester', 
      error: error.message 
    });
  }
};

// Update a beta tester
exports.updateTester = async (req, res) => {
  try {
    const testerId = req.params.id;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updateData.user;
    delete updateData.joinDate;
    delete updateData.bugsReported;
    
    const updatedTester = await BetaTester.findByIdAndUpdate(
      testerId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!updatedTester) {
      return res.status(404).json({ success: false, message: 'Beta tester not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Beta tester updated successfully', 
      data: updatedTester 
    });
  } catch (error) {
    console.error('Error updating beta tester:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update beta tester', 
      error: error.message 
    });
  }
};

// Assign test scenarios to beta testers
exports.assignTestScenarios = async (req, res) => {
  try {
    const { testerIds, scenarioIds } = req.body;
    
    if (!testerIds || !Array.isArray(testerIds) || testerIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No testers specified' });
    }
    
    if (!scenarioIds || !Array.isArray(scenarioIds) || scenarioIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No test scenarios specified' });
    }
    
    // Update test scenarios to add testers
    await TestScenario.updateMany(
      { _id: { $in: scenarioIds } },
      { 
        $addToSet: { assignedTesters: { $each: testerIds } },
        $inc: { 'completionStats.assigned': testerIds.length }
      }
    );
    
    // Update each tester to add test scenarios
    for (const testerId of testerIds) {
      for (const scenarioId of scenarioIds) {
        await BetaTester.findByIdAndUpdate(
          testerId,
          { 
            $addToSet: { 
              testingAreas: { 
                scenarioId, 
                assignedDate: new Date() 
              } 
            } 
          }
        );
      }
    }
    
    res.status(200).json({ 
      success: true, 
      message: `${scenarioIds.length} test scenarios assigned to ${testerIds.length} testers` 
    });
  } catch (error) {
    console.error('Error assigning test scenarios:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to assign test scenarios', 
      error: error.message 
    });
  }
};

// Get beta testing analytics and metrics
exports.getBetaTestingAnalytics = async (req, res) => {
  try {
    // Get tester statistics
    const testerStats = await BetaTester.aggregate([
      { 
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgEngagement: { $avg: '$engagementScore' },
          totalBugs: { $sum: '$bugsReported' }
        }
      }
    ]);
    
    // Format tester statistics
    const formattedTesterStats = testerStats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        avgEngagement: stat.avgEngagement,
        totalBugs: stat.totalBugs
      };
      return acc;
    }, {});
    
    // Get test scenario statistics
    const scenarioStats = await TestScenario.aggregate([
      { 
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgCompletion: { $avg: { 
            $cond: [
              { $gt: ['$completionStats.assigned', 0] },
              { $divide: ['$completionStats.completed', '$completionStats.assigned'] },
              0
            ]
          }}
        }
      }
    ]);
    
    // Get bug report statistics
    const bugStats = await BugReport.aggregate([
      { 
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get feature area coverage
    const featureAreaCoverage = await TestScenario.aggregate([
      { 
        $group: {
          _id: '$featureArea',
          scenarioCount: { $sum: 1 },
          completedCount: { $sum: '$completionStats.completed' }
        }
      }
    ]);
    
    res.status(200).json({ 
      success: true, 
      data: {
        testerStats: formattedTesterStats,
        scenarioStats,
        bugStats,
        featureAreaCoverage
      }
    });
  } catch (error) {
    console.error('Error getting beta testing analytics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get beta testing analytics', 
      error: error.message 
    });
  }
};

// Helper function to assign users to A/B test groups evenly
function assignToABTestGroup() {
  const groups = ['A', 'B', 'control'];
  return groups[Math.floor(Math.random() * groups.length)];
} 