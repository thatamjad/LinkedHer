const AnalyticsEvent = require('../models/analyticsEvent.model');
const BetaTester = require('../models/betaTester.model');
const BugReport = require('../models/bugReport.model');
const TestScenario = require('../models/testScenario.model');
const ABTest = require('../models/abTest.model');

// Track a new analytics event
exports.trackEvent = async (req, res) => {
  try {
    const {
      eventType,
      userId,
      betaTesterId,
      anonymousId,
      sessionId,
      featureArea,
      data,
      deviceInfo,
      location,
      abTestInfo,
      performanceMetrics,
      userExperienceMetrics,
      testScenario
    } = req.body;
    
    // Validate required fields
    if (!eventType) {
      return res.status(400).json({
        success: false,
        message: 'Event type is required'
      });
    }
    
    // At least one ID type is required
    if (!userId && !betaTesterId && !anonymousId && !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'At least one ID type (userId, betaTesterId, anonymousId, or sessionId) is required'
      });
    }
    
    // Create new analytics event
    const analyticsEvent = new AnalyticsEvent({
      eventType,
      user: userId,
      betaTester: betaTesterId,
      anonymousId,
      sessionId,
      featureArea,
      timestamp: new Date(),
      data: data || {},
      deviceInfo: deviceInfo || {},
      location: location || {},
      abTestInfo: abTestInfo || {},
      performanceMetrics: performanceMetrics || {},
      userExperienceMetrics: userExperienceMetrics || {},
      testScenario
    });
    
    await analyticsEvent.save();
    
    // If event is from a beta tester, update their last active timestamp
    if (betaTesterId) {
      await BetaTester.findByIdAndUpdate(
        betaTesterId,
        { lastActive: new Date() }
      );
    }
    
    res.status(201).json({
      success: true,
      message: 'Event tracked successfully',
      data: {
        eventId: analyticsEvent._id
      }
    });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track event',
      error: error.message
    });
  }
};

// Get event counts by type
exports.getEventCounts = async (req, res) => {
  try {
    const { startDate, endDate, featureArea, groupBy } = req.query;
    
    const query = {};
    
    // Apply date filters if provided
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    // Apply feature area filter if provided
    if (featureArea) query.featureArea = featureArea;
    
    // Determine group by field
    let groupByField = '$eventType';
    if (groupBy === 'featureArea') {
      groupByField = '$featureArea';
    } else if (groupBy === 'device') {
      groupByField = '$deviceInfo.deviceType';
    } else if (groupBy === 'page') {
      groupByField = '$location.page';
    }
    
    const counts = await AnalyticsEvent.aggregate([
      { $match: query },
      {
        $group: {
          _id: groupByField,
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: counts
    });
  } catch (error) {
    console.error('Error getting event counts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get event counts',
      error: error.message
    });
  }
};

// Get events timeline
exports.getEventsTimeline = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      eventType, 
      featureArea, 
      interval
    } = req.query;
    
    const query = {};
    
    // Apply filters if provided
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    if (eventType) query.eventType = eventType;
    if (featureArea) query.featureArea = featureArea;
    
    // Determine time interval format
    let timeFormat;
    let groupByInterval;
    
    switch (interval) {
      case 'hour':
        timeFormat = '%Y-%m-%d %H:00';
        groupByInterval = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
          hour: { $hour: '$timestamp' }
        };
        break;
      case 'day':
        timeFormat = '%Y-%m-%d';
        groupByInterval = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        };
        break;
      case 'week':
        timeFormat = '%Y-W%U';
        groupByInterval = {
          year: { $year: '$timestamp' },
          week: { $week: '$timestamp' }
        };
        break;
      case 'month':
        timeFormat = '%Y-%m';
        groupByInterval = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' }
        };
        break;
      default:
        timeFormat = '%Y-%m-%d';
        groupByInterval = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        };
    }
    
    const timeline = await AnalyticsEvent.aggregate([
      { $match: query },
      {
        $group: {
          _id: groupByInterval,
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' }
        }
      },
      {
        $project: {
          _id: 0,
          timeInterval: { $dateToString: { format: timeFormat, date: '$timestamp' } },
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { timeInterval: 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: timeline
    });
  } catch (error) {
    console.error('Error getting events timeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get events timeline',
      error: error.message
    });
  }
};

// Get user activity metrics
exports.getUserActivityMetrics = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      userType, // 'all', 'beta_testers', 'regular'
      betaTesterId,
      userId 
    } = req.query;
    
    const query = {};
    
    // Apply date filters if provided
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    // Apply user type filter
    if (userType === 'beta_testers') {
      query.betaTester = { $exists: true, $ne: null };
    } else if (userType === 'regular') {
      query.betaTester = { $exists: false };
      query.user = { $exists: true, $ne: null };
    }
    
    // Apply specific user filter if provided
    if (betaTesterId) query.betaTester = betaTesterId;
    if (userId) query.user = userId;
    
    // Get active user counts
    const activeUsers = await AnalyticsEvent.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          dailyActiveUsers: { $addToSet: {
            user: '$user',
            day: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
            }
          }},
          weeklyActiveUsers: { $addToSet: {
            user: '$user',
            week: {
              $dateToString: { format: '%Y-W%U', date: '$timestamp' }
            }
          }},
          monthlyActiveUsers: { $addToSet: {
            user: '$user',
            month: {
              $dateToString: { format: '%Y-%m', date: '$timestamp' }
            }
          }},
          totalUniqueUsers: { $addToSet: '$user' }
        }
      }
    ]);
    
    // Get feature usage by area
    const featureUsage = await AnalyticsEvent.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$featureArea',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' }
        }
      },
      {
        $project: {
          featureArea: '$_id',
          count: 1,
          uniqueUserCount: { $size: '$uniqueUsers' },
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get user retention (if date range is provided)
    let retentionData = null;
    if (startDate && endDate) {
      // This is a simplified retention calculation
      // For a more comprehensive implementation, consider using a dedicated analytics system
      retentionData = await calculateRetention(new Date(startDate), new Date(endDate), query);
    }
    
    res.status(200).json({
      success: true,
      data: {
        activeUsers: activeUsers[0] || {
          dailyActiveUsers: [],
          weeklyActiveUsers: [],
          monthlyActiveUsers: [],
          totalUniqueUsers: []
        },
        featureUsage,
        retentionData
      }
    });
  } catch (error) {
    console.error('Error getting user activity metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user activity metrics',
      error: error.message
    });
  }
};

// Get beta testing metrics dashboard
exports.getBetaTestingDashboard = async (req, res) => {
  try {
    // Get beta tester stats
    const testerStats = await BetaTester.aggregate([
      { 
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgEngagement: { $avg: '$engagementScore' }
        }
      }
    ]);
    
    // Get active testers in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeTesterCount = await AnalyticsEvent.aggregate([
      {
        $match: {
          betaTester: { $exists: true, $ne: null },
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: '$betaTester'
        }
      },
      {
        $count: 'activeCount'
      }
    ]);
    
    // Get test scenario completion stats
    const scenarioStats = await TestScenario.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgCompleted: { $avg: '$completionStats.completed' },
          totalAssigned: { $sum: '$completionStats.assigned' },
          totalCompleted: { $sum: '$completionStats.completed' }
        }
      }
    ]);
    
    // Get bug report stats
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
    
    // Get A/B test stats
    const abTestStats = await ABTest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get recent activity (last 20 events)
    const recentActivity = await AnalyticsEvent.find({
      betaTester: { $exists: true, $ne: null }
    })
      .sort({ timestamp: -1 })
      .limit(20)
      .populate('betaTester', 'user')
      .populate('testScenario', 'title')
      .exec();
    
    res.status(200).json({
      success: true,
      data: {
        testerStats,
        activeTesterCount: activeTesterCount[0]?.activeCount || 0,
        scenarioStats,
        bugStats,
        featureAreaCoverage,
        abTestStats,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Error getting beta testing dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get beta testing dashboard',
      error: error.message
    });
  }
};

// Helper function to calculate retention
async function calculateRetention(startDate, endDate, baseQuery = {}) {
  try {
    // Get the date range in days
    const dayDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    // If less than 7 days, can't calculate meaningful retention
    if (dayDiff < 7) {
      return { error: 'Date range too short for retention calculation' };
    }
    
    // Get all users who had activity on day 0
    const day0Users = await AnalyticsEvent.aggregate([
      {
        $match: {
          ...baseQuery,
          timestamp: {
            $gte: startDate,
            $lt: new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: '$user'
        }
      }
    ]);
    
    const day0UserIds = day0Users.map(u => u._id);
    
    // Calculate retention for each day after day 0
    const retentionByDay = [];
    
    for (let i = 1; i <= Math.min(dayDiff, 30); i++) { // Limit to 30 days
      const dayStart = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const returningUsers = await AnalyticsEvent.aggregate([
        {
          $match: {
            user: { $in: day0UserIds },
            timestamp: {
              $gte: dayStart,
              $lt: dayEnd
            }
          }
        },
        {
          $group: {
            _id: '$user'
          }
        },
        {
          $count: 'returningCount'
        }
      ]);
      
      const returningCount = returningUsers[0]?.returningCount || 0;
      
      retentionByDay.push({
        day: i,
        date: dayStart.toISOString().split('T')[0],
        returningCount,
        retentionRate: day0UserIds.length > 0 ? returningCount / day0UserIds.length : 0
      });
    }
    
    return {
      initialUserCount: day0UserIds.length,
      retentionByDay
    };
  } catch (error) {
    console.error('Error calculating retention:', error);
    return { error: error.message };
  }
} 