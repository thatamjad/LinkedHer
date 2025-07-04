const BugReport = require('../models/bugReport.model');
const BetaTester = require('../models/betaTester.model');
const AnalyticsEvent = require('../models/analyticsEvent.model');

// Submit a new bug report
exports.submitBugReport = async (req, res) => {
  try {
    const {
      title,
      description,
      testerId,
      featureArea,
      severity,
      reproducibility,
      deviceInfo,
      reproductionSteps,
      expectedBehavior,
      actualBehavior,
      screenshots,
      consoleErrors,
      relatedTestScenario
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !testerId || !featureArea || !severity || !reproducibility || !actualBehavior) {
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
    
    // Create new bug report
    const bugReport = new BugReport({
      title,
      description,
      reporter: testerId,
      featureArea,
      severity,
      reproducibility,
      deviceInfo: deviceInfo || {},
      reproductionSteps: reproductionSteps || [],
      expectedBehavior,
      actualBehavior,
      screenshots: screenshots || [],
      consoleErrors,
      status: 'new',
      priority: determinePriority(severity, reproducibility),
      relatedTestScenario
    });
    
    await bugReport.save();
    
    // Update beta tester stats
    await BetaTester.findByIdAndUpdate(
      testerId,
      {
        $inc: { 
          bugsReported: 1,
          engagementScore: calculateEngagementPoints(severity) 
        }
      }
    );
    
    // Log bug report event
    const analyticsEvent = new AnalyticsEvent({
      eventType: 'bug_reported',
      betaTester: testerId,
      featureArea,
      data: {
        bugReportId: bugReport._id,
        severity,
        reproducibility
      }
    });
    await analyticsEvent.save();
    
    res.status(201).json({
      success: true,
      message: 'Bug report submitted successfully',
      data: bugReport
    });
  } catch (error) {
    console.error('Error submitting bug report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit bug report',
      error: error.message
    });
  }
};

// Get all bug reports with optional filtering
exports.getAllBugReports = async (req, res) => {
  try {
    const { status, severity, featureArea, sort, priority } = req.query;
    const query = {};
    
    // Apply filters if provided
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (featureArea) query.featureArea = featureArea;
    if (priority) query.priority = priority;
    
    // Determine sort order
    let sortOption = { createdAt: -1 }; // Default sort by creation date (newest first)
    if (sort === 'priority') {
      sortOption = { priority: 1 }; // Sort by priority (high to low)
    } else if (sort === 'severity') {
      sortOption = { severity: 1 }; // Sort by severity (high to low)
    }
    
    const bugReports = await BugReport.find(query)
      .sort(sortOption)
      .populate('reporter', 'user')
      .populate({
        path: 'reporter',
        populate: {
          path: 'user',
          select: 'name email profileImage'
        }
      })
      .populate('assignedTo', 'name email')
      .exec();
    
    res.status(200).json({
      success: true,
      count: bugReports.length,
      data: bugReports
    });
  } catch (error) {
    console.error('Error getting bug reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bug reports',
      error: error.message
    });
  }
};

// Get a single bug report by ID
exports.getBugReportById = async (req, res) => {
  try {
    const reportId = req.params.id;
    
    const report = await BugReport.findById(reportId)
      .populate({
        path: 'reporter',
        populate: {
          path: 'user',
          select: 'name email profileImage'
        }
      })
      .populate('assignedTo', 'name email profileImage')
      .populate('relatedTestScenario', 'title description')
      .populate('duplicateOf', 'title _id')
      .exec();
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Bug report not found'
      });
    }
    
    // Get similar bug reports
    const similarReports = await BugReport.find({
      _id: { $ne: reportId },
      featureArea: report.featureArea,
      $or: [
        { title: { $regex: report.title.split(' ')[0], $options: 'i' } },
        { description: { $regex: report.title.split(' ')[0], $options: 'i' } }
      ]
    })
      .limit(5)
      .select('title severity status createdAt')
      .exec();
    
    res.status(200).json({
      success: true,
      data: {
        report,
        similarReports
      }
    });
  } catch (error) {
    console.error('Error getting bug report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bug report',
      error: error.message
    });
  }
};

// Update a bug report's status
exports.updateBugStatus = async (req, res) => {
  try {
    const reportId = req.params.id;
    const { status, assignedTo, priority, resolution, comment } = req.body;
    
    // Build update object
    const updateData = {};
    if (status) updateData.status = status;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (priority) updateData.priority = priority;
    
    // Add resolution data if resolving the bug
    if (['fixed', 'wont_fix', 'cannot_reproduce', 'duplicate'].includes(status)) {
      updateData.resolution = resolution || {};
      if (status === 'fixed') {
        updateData.resolution.resolvedDate = new Date();
      }
    }
    
    // Add comment if provided
    if (comment) {
      updateData.$push = {
        comments: {
          user: req.user._id,
          content: comment,
          timestamp: new Date()
        }
      };
    }
    
    const updatedReport = await BugReport.findByIdAndUpdate(
      reportId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedReport) {
      return res.status(404).json({
        success: false,
        message: 'Bug report not found'
      });
    }
    
    // Log status change event
    const analyticsEvent = new AnalyticsEvent({
      eventType: 'bug_status_changed',
      user: req.user._id,
      featureArea: updatedReport.featureArea,
      data: {
        bugReportId: reportId,
        oldStatus: req.body.oldStatus,
        newStatus: status,
        assignedTo
      }
    });
    await analyticsEvent.save();
    
    res.status(200).json({
      success: true,
      message: 'Bug report updated successfully',
      data: updatedReport
    });
  } catch (error) {
    console.error('Error updating bug report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bug report',
      error: error.message
    });
  }
};

// Add a comment to a bug report
exports.addComment = async (req, res) => {
  try {
    const reportId = req.params.id;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }
    
    const updatedReport = await BugReport.findByIdAndUpdate(
      reportId,
      {
        $push: {
          comments: {
            user: req.user._id,
            content,
            timestamp: new Date()
          }
        }
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedReport) {
      return res.status(404).json({
        success: false,
        message: 'Bug report not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      data: updatedReport.comments[updatedReport.comments.length - 1]
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

// Mark a bug report as duplicate
exports.markAsDuplicate = async (req, res) => {
  try {
    const reportId = req.params.id;
    const { duplicateId, comment } = req.body;
    
    if (!duplicateId) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate report ID is required'
      });
    }
    
    // Check if duplicate report exists
    const duplicateReport = await BugReport.findById(duplicateId);
    if (!duplicateReport) {
      return res.status(404).json({
        success: false,
        message: 'Duplicate report not found'
      });
    }
    
    const updateData = {
      status: 'duplicate',
      duplicateOf: duplicateId,
      resolution: {
        fixDescription: `Duplicate of bug report #${duplicateId}`,
        resolvedDate: new Date()
      }
    };
    
    // Add comment if provided
    if (comment) {
      updateData.$push = {
        comments: {
          user: req.user._id,
          content: comment,
          timestamp: new Date()
        }
      };
    }
    
    const updatedReport = await BugReport.findByIdAndUpdate(
      reportId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedReport) {
      return res.status(404).json({
        success: false,
        message: 'Bug report not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Bug report marked as duplicate',
      data: updatedReport
    });
  } catch (error) {
    console.error('Error marking as duplicate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark as duplicate',
      error: error.message
    });
  }
};

// Get bug report analytics
exports.getBugReportAnalytics = async (req, res) => {
  try {
    // Get bug counts by status
    const bugsByStatus = await BugReport.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get bug counts by feature area
    const bugsByFeature = await BugReport.aggregate([
      {
        $group: {
          _id: '$featureArea',
          count: { $sum: 1 },
          open: {
            $sum: {
              $cond: [
                { $in: ['$status', ['new', 'confirmed', 'in_progress']] },
                1,
                0
              ]
            }
          },
          resolved: {
            $sum: {
              $cond: [
                { $in: ['$status', ['fixed', 'wont_fix', 'cannot_reproduce', 'duplicate']] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get bug counts by severity
    const bugsBySeverity = await BugReport.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 },
          open: {
            $sum: {
              $cond: [
                { $in: ['$status', ['new', 'confirmed', 'in_progress']] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    // Get resolution time stats
    const resolutionTimeStats = await BugReport.aggregate([
      {
        $match: {
          status: 'fixed',
          'resolution.resolvedDate': { $exists: true }
        }
      },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ['$resolution.resolvedDate', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          },
          severity: 1
        }
      },
      {
        $group: {
          _id: '$severity',
          avgResolutionTime: { $avg: '$resolutionTime' },
          minResolutionTime: { $min: '$resolutionTime' },
          maxResolutionTime: { $max: '$resolutionTime' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        bugsByStatus,
        bugsByFeature,
        bugsBySeverity,
        resolutionTimeStats
      }
    });
  } catch (error) {
    console.error('Error getting bug report analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bug report analytics',
      error: error.message
    });
  }
};

// Helper function to determine priority based on severity and reproducibility
function determinePriority(severity, reproducibility) {
  // Critical bugs that are always reproducible get urgent priority
  if (severity === 'critical' && reproducibility === 'always') {
    return 'urgent';
  }
  
  // Critical or high severity bugs get high priority
  if (severity === 'critical' || (severity === 'high' && reproducibility !== 'rarely')) {
    return 'high';
  }
  
  // Medium severity or high severity with rare reproduction get medium priority
  if (severity === 'medium' || (severity === 'high' && reproducibility === 'rarely')) {
    return 'medium';
  }
  
  // All other bugs get low priority
  return 'low';
}

// Helper function to calculate engagement points based on severity
function calculateEngagementPoints(severity) {
  switch (severity) {
    case 'critical':
      return 10;
    case 'high':
      return 7;
    case 'medium':
      return 5;
    case 'low':
      return 3;
    default:
      return 3;
  }
} 