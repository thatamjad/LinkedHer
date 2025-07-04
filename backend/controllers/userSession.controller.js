const UserSession = require('../models/userSession.model');
const User = require('../models/user.model');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

// Create a new session
exports.createSession = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { isAnonymousMode = false } = req.body;
  
  // Extract IP address and user agent
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  
  // Parse user agent
  const parser = new UAParser(userAgent);
  const browserInfo = parser.getBrowser();
  const osInfo = parser.getOS();
  const deviceInfo = parser.getDevice();
  
  // Get geo location from IP
  const geo = geoip.lookup(ipAddress);
  
  // Set expiry (24 hours from now)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  
  // Create session
  const session = new UserSession({
    userId,
    sessionId: uuidv4(),
    ipAddress,
    userAgent,
    device: deviceInfo.vendor ? `${deviceInfo.vendor} ${deviceInfo.model}` : 'Unknown',
    browser: `${browserInfo.name} ${browserInfo.version}`,
    os: `${osInfo.name} ${osInfo.version}`,
    location: geo ? {
      country: geo.country,
      region: geo.region,
      city: geo.city,
      coordinates: geo.ll
    } : null,
    expiresAt,
    isMobile: deviceInfo.type === 'mobile',
    isAnonymousMode,
    lastActivity: new Date()
  });
  
  // Check for suspicious activity
  const riskScore = await assessSessionRisk(userId, session);
  session.riskScore = riskScore;
  
  if (riskScore > 70) {
    session.status = 'suspicious';
    session.anomalyDetected = true;
  }
  
  await session.save();
  
  // If session is suspicious, we might want to notify the user
  if (session.status === 'suspicious') {
    // In a real implementation, send an email or notification
    console.log(`Suspicious login detected for user ${userId}`);
  }
  
  // Register device with user
  const user = await User.findById(userId);
  user.registerDevice(session.sessionId, session.device);
  await user.save();
  
  res.status(201).json({
    success: true,
    data: {
      sessionId: session.sessionId,
      expiresAt: session.expiresAt
    }
  });
});

// Get all active sessions for the current user
exports.getUserSessions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const sessions = await UserSession.getActiveSessions(userId);
  
  res.status(200).json({
    success: true,
    data: sessions
  });
});

// Revoke a specific session
exports.revokeSession = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { sessionId } = req.params;
  
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: 'Session ID is required'
    });
  }
  
  const session = await UserSession.findOne({ 
    userId, 
    sessionId,
    status: 'active'
  });
  
  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session not found or already expired'
    });
  }
  
  session.status = 'revoked';
  await session.save();
  
  res.status(200).json({
    success: true,
    message: 'Session revoked successfully'
  });
});

// Revoke all sessions except the current one
exports.revokeAllOtherSessions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const currentSessionId = req.headers['x-session-id'];
  
  if (!currentSessionId) {
    return res.status(400).json({
      success: false,
      message: 'Current session ID is required'
    });
  }
  
  const result = await UserSession.updateMany(
    { 
      userId, 
      sessionId: { $ne: currentSessionId },
      status: 'active'
    },
    { status: 'revoked' }
  );
  
  res.status(200).json({
    success: true,
    message: `Revoked ${result.nModified} sessions successfully`
  });
});

// Update session activity
exports.updateSessionActivity = asyncHandler(async (req, res) => {
  const sessionId = req.headers['x-session-id'];
  
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: 'Session ID is required'
    });
  }
  
  const session = await UserSession.findOne({ sessionId, status: 'active' });
  
  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session not found or expired'
    });
  }
  
  session.lastActivity = new Date();
  await session.save();
  
  res.status(200).json({
    success: true,
    message: 'Session activity updated'
  });
});

// Internal function to assess session risk
async function assessSessionRisk(userId, newSession) {
  let riskScore = 0;
  const anomalyReasons = [];
  
  // Get user's recent sessions
  const recentSessions = await UserSession.find({ 
    userId,
    status: 'active',
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
  }).sort({ createdAt: -1 }).limit(5);
  
  if (recentSessions.length > 0) {
    // Check for unusual location
    const usuaLocations = recentSessions.map(s => s.location?.country).filter(Boolean);
    if (
      newSession.location && 
      newSession.location.country && 
      usuaLocations.length > 0 && 
      !usuaLocations.includes(newSession.location.country)
    ) {
      riskScore += 30;
      anomalyReasons.push('unusual_location');
    }
    
    // Check for unusual device
    const usualDevices = recentSessions.map(s => s.device).filter(Boolean);
    if (
      newSession.device && 
      usualDevices.length > 0 && 
      !usualDevices.includes(newSession.device)
    ) {
      riskScore += 20;
      anomalyReasons.push('unusual_device');
    }
    
    // Check for rapid location change
    const mostRecentSession = recentSessions[0];
    if (
      mostRecentSession && 
      mostRecentSession.location && 
      newSession.location &&
      mostRecentSession.location.country !== newSession.location.country &&
      Date.now() - new Date(mostRecentSession.createdAt).getTime() < 12 * 60 * 60 * 1000 // 12 hours
    ) {
      riskScore += 40;
      anomalyReasons.push('rapid_location_change');
    }
  }
  
  // Check time of day (if between 1am and 5am local time)
  const hour = new Date().getHours();
  if (hour >= 1 && hour <= 5) {
    riskScore += 10;
    anomalyReasons.push('unusual_time');
  }
  
  // Update session with anomaly reasons
  if (anomalyReasons.length > 0) {
    newSession.anomalyReasons = anomalyReasons;
    newSession.anomalyDetected = true;
  }
  
  return Math.min(riskScore, 100); // Cap at 100
}

// Mark session as suspicious
exports.markSessionSuspicious = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { reason } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: 'Session ID is required'
    });
  }
  
  const session = await UserSession.findOne({ sessionId });
  
  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    });
  }
  
  session.markSuspicious(reason);
  await session.save();
  
  res.status(200).json({
    success: true,
    message: 'Session marked as suspicious'
  });
}); 