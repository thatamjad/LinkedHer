const Report = require('../models/Report');
const contentModeration = require('../utils/contentModeration');

const createProfessionalReport = async (req, res) => {
  try {
    const { reportType, contentType, contentId, description, evidence, reportedUserId } = req.body;
    const report = new Report({
      reportType,
      contentType,
      contentId,
      description,
      evidence,
      reporterUserId: req.user._id,
      reportedUserId,
      isAnonymous: false
    });
    const aiAnalysis = await contentModeration.analyzeText(description);
    if (aiAnalysis) {
      report.aiModerated = true;
      report.aiConfidenceScore = aiAnalysis.overallScore;
      report.aiCategories = Object.keys(aiAnalysis.categories).filter(cat => aiAnalysis.categories[cat]);
    }
    await report.save();
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error creating professional report' });
  }
};

const createAnonymousReport = async (req, res) => {
  try {
    const { reportType, contentType, contentId, description } = req.body;
    const report = new Report({
      reportType,
      contentType,
      contentId,
      description,
      reporterPersonaHash: req.anonymousPersona.personaId,
      isAnonymous: true
    });
    const aiAnalysis = await contentModeration.analyzeText(description);
    if (aiAnalysis) {
      report.aiModerated = true;
      report.aiConfidenceScore = aiAnalysis.overallScore;
      report.aiCategories = Object.keys(aiAnalysis.categories).filter(cat => aiAnalysis.categories[cat]);
    }
    await report.save();
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error creating anonymous report' });
  }
};

const getReports = async (req, res) => {
  try {
    const { status, reportType, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (reportType) query.reportType = reportType;
    const skip = (page - 1) * limit;
    const reports = await Report.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1, severityScore: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('reporterUserId', 'firstName lastName email')
      .populate('reportedUserId', 'firstName lastName email')
      .populate('moderatorId', 'firstName lastName');
    const total = await Report.countDocuments(query);
    res.status(200).json({
      success: true,
      data: reports,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching reports' });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporterUserId', 'firstName lastName email')
      .populate('reportedUserId', 'firstName lastName email')
      .populate('moderatorId', 'firstName lastName');
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching report' });
  }
};

const updateReport = async (req, res) => {
  try {
    const { status, moderationNotes, resolutionAction } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    if (status) report.status = status;
    if (moderationNotes) report.moderationNotes = moderationNotes;
    if (resolutionAction) report.resolutionAction = resolutionAction;
    if (status === 'resolved' || status === 'dismissed') {
      report.resolutionDate = new Date();
      report.moderatorId = req.user._id;
    }
    await report.save();
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error updating report' });
  }
};

const getReportStats = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });
    const reportsByType = await Report.aggregate([
      { $group: { _id: '$reportType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.status(200).json({
      success: true,
      data: { totalReports, pendingReports, resolvedReports, reportsByType }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching report stats' });
  }
};

module.exports = {
  createProfessionalReport,
  createAnonymousReport,
  getReports,
  getReportById,
  updateReport,
  getReportStats
};
