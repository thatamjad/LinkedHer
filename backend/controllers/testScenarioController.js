const TestScenario = require('../models/testScenario.model');
const BetaTester = require('../models/betaTester.model');
const AnalyticsEvent = require('../models/analyticsEvent.model');

// Create a new test scenario
exports.createTestScenario = async (req, res) => {
  try {
    const {
      title,
      description,
      featureArea,
      priority,
      steps,
      expectedDuration,
      metrics,
      feedbackQuestions,
      completionCriteria
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !featureArea || !steps || !steps.length) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Create new test scenario
    const testScenario = new TestScenario({
      title,
      description,
      featureArea,
      priority: priority || 'medium',
      steps,
      expectedDuration,
      metrics: metrics || [],
      feedbackQuestions: feedbackQuestions || [],
      completionCriteria,
      status: 'draft',
      createdBy: req.user._id,
      completionStats: {
        assigned: 0,
        started: 0,
        completed: 0
      }
    });
    
    await testScenario.save();
    
    res.status(201).json({
      success: true,
      message: 'Test scenario created successfully',
      data: testScenario
    });
  } catch (error) {
    console.error('Error creating test scenario:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test scenario',
      error: error.message
    });
  }
};

// Get all test scenarios with optional filtering
exports.getAllTestScenarios = async (req, res) => {
  try {
    const { featureArea, status, priority, sort } = req.query;
    const query = {};
    
    // Apply filters if provided
    if (featureArea) query.featureArea = featureArea;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    // Determine sort order
    let sortOption = { createdAt: -1 }; // Default sort by creation date (newest first)
    if (sort === 'priority') {
      const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
      sortOption = { priority: 1 }; // Sort by priority (high to low)
    } else if (sort === 'completion') {
      sortOption = { 'completionStats.completed': -1 };
    }
    
    const scenarios = await TestScenario.find(query)
      .sort(sortOption)
      .populate('createdBy', 'name email')
      .populate('assignedTesters', 'user')
      .exec();
    
    res.status(200).json({
      success: true,
      count: scenarios.length,
      data: scenarios
    });
  } catch (error) {
    console.error('Error getting test scenarios:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get test scenarios',
      error: error.message
    });
  }
};

// Get a single test scenario by ID
exports.getTestScenarioById = async (req, res) => {
  try {
    const scenarioId = req.params.id;
    
    const scenario = await TestScenario.findById(scenarioId)
      .populate('createdBy', 'name email')
      .populate({
        path: 'assignedTesters',
        populate: {
          path: 'user',
          select: 'name email profileImage'
        }
      })
      .exec();
    
    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: 'Test scenario not found'
      });
    }
    
    // Get scenario completion data
    const completionEvents = await AnalyticsEvent.find({
      eventType: 'test_scenario_completed',
      'data.scenarioId': scenarioId
    }).populate('betaTester', 'user');
    
    // Get feedback data
    const feedbackEvents = await AnalyticsEvent.find({
      eventType: 'test_scenario_feedback',
      'data.scenarioId': scenarioId
    }).populate('betaTester', 'user');
    
    res.status(200).json({
      success: true,
      data: {
        scenario,
        completionEvents,
        feedbackEvents
      }
    });
  } catch (error) {
    console.error('Error getting test scenario:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get test scenario',
      error: error.message
    });
  }
};

// Update a test scenario
exports.updateTestScenario = async (req, res) => {
  try {
    const scenarioId = req.params.id;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updateData.createdBy;
    delete updateData.createdAt;
    delete updateData.completionStats;
    
    const updatedScenario = await TestScenario.findByIdAndUpdate(
      scenarioId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!updatedScenario) {
      return res.status(404).json({
        success: false,
        message: 'Test scenario not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Test scenario updated successfully',
      data: updatedScenario
    });
  } catch (error) {
    console.error('Error updating test scenario:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update test scenario',
      error: error.message
    });
  }
};

// Submit feedback for a test scenario
exports.submitFeedback = async (req, res) => {
  try {
    const scenarioId = req.params.id;
    const { testerId, feedback, completionTime, ratings } = req.body;
    
    // Validate required fields
    if (!testerId || !feedback) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Check if tester exists
    const tester = await BetaTester.findById(testerId);
    if (!tester) {
      return res.status(404).json({
        success: false,
        message: 'Beta tester not found'
      });
    }
    
    // Check if scenario exists
    const scenario = await TestScenario.findById(scenarioId);
    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: 'Test scenario not found'
      });
    }
    
    // Update test scenario completion stats
    await TestScenario.findByIdAndUpdate(
      scenarioId,
      {
        $inc: { 'completionStats.completed': 1 },
        $push: { 'completionStats.completedBy': testerId }
      }
    );
    
    // Update beta tester record
    await BetaTester.findByIdAndUpdate(
      testerId,
      {
        $push: {
          feedbackSubmitted: {
            scenarioId,
            completedDate: new Date(),
            feedbackQuality: calculateFeedbackQuality(feedback)
          }
        },
        $inc: { engagementScore: 5 } // Increase engagement score
      }
    );
    
    // Log feedback event
    const analyticsEvent = new AnalyticsEvent({
      eventType: 'test_scenario_feedback',
      betaTester: testerId,
      testScenario: scenarioId,
      featureArea: scenario.featureArea,
      data: {
        scenarioId,
        feedback,
        completionTime,
        ratings
      }
    });
    await analyticsEvent.save();
    
    // Log completion event
    const completionEvent = new AnalyticsEvent({
      eventType: 'test_scenario_completed',
      betaTester: testerId,
      testScenario: scenarioId,
      featureArea: scenario.featureArea,
      data: {
        scenarioId,
        completionTime
      }
    });
    await completionEvent.save();
    
    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
};

// Get analytics for all test scenarios
exports.getTestScenarioAnalytics = async (req, res) => {
  try {
    // Get completion rates by feature area
    const completionByFeature = await TestScenario.aggregate([
      {
        $group: {
          _id: '$featureArea',
          totalScenarios: { $sum: 1 },
          totalAssigned: { $sum: '$completionStats.assigned' },
          totalCompleted: { $sum: '$completionStats.completed' },
          completionRate: {
            $avg: {
              $cond: [
                { $gt: ['$completionStats.assigned', 0] },
                { $divide: ['$completionStats.completed', '$completionStats.assigned'] },
                0
              ]
            }
          }
        }
      },
      { $sort: { completionRate: -1 } }
    ]);
    
    // Get average completion time by feature area
    const avgCompletionTime = await AnalyticsEvent.aggregate([
      { $match: { eventType: 'test_scenario_completed' } },
      {
        $lookup: {
          from: 'testscenarios',
          localField: 'testScenario',
          foreignField: '_id',
          as: 'scenario'
        }
      },
      { $unwind: '$scenario' },
      {
        $group: {
          _id: '$scenario.featureArea',
          avgTime: { $avg: '$data.completionTime' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get average ratings by feature area
    const avgRatings = await AnalyticsEvent.aggregate([
      { $match: { eventType: 'test_scenario_feedback' } },
      {
        $lookup: {
          from: 'testscenarios',
          localField: 'testScenario',
          foreignField: '_id',
          as: 'scenario'
        }
      },
      { $unwind: '$scenario' },
      {
        $group: {
          _id: '$scenario.featureArea',
          avgRating: { $avg: { $avg: '$data.ratings' } },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        completionByFeature,
        avgCompletionTime,
        avgRatings
      }
    });
  } catch (error) {
    console.error('Error getting test scenario analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get test scenario analytics',
      error: error.message
    });
  }
};

// Helper function to calculate feedback quality
function calculateFeedbackQuality(feedback) {
  // Simple heuristic based on feedback length
  if (!feedback) return 'poor';
  
  const length = feedback.length;
  
  if (length < 50) return 'poor';
  if (length < 200) return 'average';
  if (length < 500) return 'good';
  return 'excellent';
} 