const AnonymousPersona = require('../models/anonymousPersona.model');
const UserSession = require('../models/userSession.model');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');

// Generate routing path for anonymous traffic
exports.generateRoutingPath = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { personaId } = req.params;
  
  if (!personaId) {
    return res.status(400).json({
      success: false,
      message: 'Persona ID is required'
    });
  }
  
  // Verify persona ownership
  const isOwner = await AnonymousPersona.validatePersonaOwnership(userId, personaId);
  
  if (!isOwner) {
    return res.status(403).json({
      success: false,
      message: 'You do not own this persona'
    });
  }
  
  // Get the persona
  const persona = await AnonymousPersona.findOne({ personaId });
  
  if (!persona) {
    return res.status(404).json({
      success: false,
      message: 'Persona not found'
    });
  }
  
  // Generate routing path
  const routingPath = persona.generateRoutingPath();
  
  if (!routingPath) {
    return res.status(400).json({
      success: false,
      message: 'Multi-path routing is disabled for this persona'
    });
  }
  
  // Mark session as anonymous mode if it exists
  const sessionId = req.headers['x-session-id'];
  if (sessionId) {
    await UserSession.updateOne(
      { sessionId },
      { isAnonymousMode: true }
    );
  }
  
  res.status(200).json({
    success: true,
    data: {
      routingPath,
      stealthAddress: persona.cryptoData.stealthAddress
    }
  });
});

// Generate random delay parameters for network requests
exports.getRandomDelayParams = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { personaId } = req.params;
  
  if (!personaId) {
    return res.status(400).json({
      success: false,
      message: 'Persona ID is required'
    });
  }
  
  // Verify persona ownership
  const isOwner = await AnonymousPersona.validatePersonaOwnership(userId, personaId);
  
  if (!isOwner) {
    return res.status(403).json({
      success: false,
      message: 'You do not own this persona'
    });
  }
  
  // Get the persona
  const persona = await AnonymousPersona.findOne({ personaId });
  
  if (!persona) {
    return res.status(404).json({
      success: false,
      message: 'Persona not found'
    });
  }
  
  // Check if timing noise is enabled
  if (!persona.cryptoData.mixingParameters?.timingNoise) {
    return res.status(400).json({
      success: false,
      message: 'Timing noise is disabled for this persona'
    });
  }
  
  // Get delay parameters
  const minDelay = persona.cryptoData.mixingParameters.randomDelay?.min || 50;
  const maxDelay = persona.cryptoData.mixingParameters.randomDelay?.max || 500;
  
  res.status(200).json({
    success: true,
    data: {
      minDelay,
      maxDelay
    }
  });
});

// Generate randomized HTTP headers for anonymization
exports.getRandomizedHeaders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { personaId } = req.params;
  
  if (!personaId) {
    return res.status(400).json({
      success: false,
      message: 'Persona ID is required'
    });
  }
  
  // Verify persona ownership
  const isOwner = await AnonymousPersona.validatePersonaOwnership(userId, personaId);
  
  if (!isOwner) {
    return res.status(403).json({
      success: false,
      message: 'You do not own this persona'
    });
  }
  
  // Get the persona
  const persona = await AnonymousPersona.findOne({ personaId });
  
  if (!persona) {
    return res.status(404).json({
      success: false,
      message: 'Persona not found'
    });
  }
  
  // Check if header randomization is enabled
  if (!persona.cryptoData.fingerPrintingProtection?.randomizeHeaders) {
    return res.status(400).json({
      success: false,
      message: 'Header randomization is disabled for this persona'
    });
  }
  
  // Generate randomized headers
  const randomizedHeaders = generateRandomizedHeaders(
    persona.cryptoData.fingerPrintingProtection.mimicCommonBrowsers
  );
  
  res.status(200).json({
    success: true,
    data: {
      headers: randomizedHeaders
    }
  });
});

// Update anonymous persona security settings
exports.updateSecuritySettings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { personaId } = req.params;
  const { securitySettings } = req.body;
  
  if (!personaId) {
    return res.status(400).json({
      success: false,
      message: 'Persona ID is required'
    });
  }
  
  if (!securitySettings) {
    return res.status(400).json({
      success: false,
      message: 'Security settings are required'
    });
  }
  
  // Verify persona ownership
  const isOwner = await AnonymousPersona.validatePersonaOwnership(userId, personaId);
  
  if (!isOwner) {
    return res.status(403).json({
      success: false,
      message: 'You do not own this persona'
    });
  }
  
  // Get the persona
  const persona = await AnonymousPersona.findOne({ personaId });
  
  if (!persona) {
    return res.status(404).json({
      success: false,
      message: 'Persona not found'
    });
  }
  
  // Update security settings
  if (securitySettings.autoSwitchTimeout) {
    if (typeof securitySettings.autoSwitchTimeout.enabled === 'boolean') {
      persona.securitySettings.autoSwitchTimeout.enabled = securitySettings.autoSwitchTimeout.enabled;
    }
    
    if (securitySettings.autoSwitchTimeout.timeoutMinutes) {
      persona.securitySettings.autoSwitchTimeout.timeoutMinutes = securitySettings.autoSwitchTimeout.timeoutMinutes;
    }
  }
  
  if (typeof securitySettings.purgeSessionOnLogout === 'boolean') {
    persona.securitySettings.purgeSessionOnLogout = securitySettings.purgeSessionOnLogout;
  }
  
  if (typeof securitySettings.notifySuspiciousActivity === 'boolean') {
    persona.securitySettings.notifySuspiciousActivity = securitySettings.notifySuspiciousActivity;
  }
  
  await persona.save();
  
  res.status(200).json({
    success: true,
    data: persona.securitySettings,
    message: 'Security settings updated successfully'
  });
});

// Update metadata protection settings
exports.updateMetadataSettings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { personaId } = req.params;
  const { metadataSettings } = req.body;
  
  if (!personaId) {
    return res.status(400).json({
      success: false,
      message: 'Persona ID is required'
    });
  }
  
  if (!metadataSettings) {
    return res.status(400).json({
      success: false,
      message: 'Metadata settings are required'
    });
  }
  
  // Verify persona ownership
  const isOwner = await AnonymousPersona.validatePersonaOwnership(userId, personaId);
  
  if (!isOwner) {
    return res.status(403).json({
      success: false,
      message: 'You do not own this persona'
    });
  }
  
  // Get the persona
  const persona = await AnonymousPersona.findOne({ personaId });
  
  if (!persona) {
    return res.status(404).json({
      success: false,
      message: 'Persona not found'
    });
  }
  
  // Update metadata settings
  const metadataKeys = [
    'stripExifData', 
    'obfuscateTimestamps', 
    'routeThroughProxy',
    'randomizeFileMetadata',
    'preventBrowserFingerprinting',
    'addMetadataNoise'
  ];
  
  metadataKeys.forEach(key => {
    if (typeof metadataSettings[key] === 'boolean') {
      persona.metadataSettings[key] = metadataSettings[key];
    }
  });
  
  await persona.save();
  
  res.status(200).json({
    success: true,
    data: persona.metadataSettings,
    message: 'Metadata settings updated successfully'
  });
});

// Update network mixing parameters
exports.updateMixingParameters = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { personaId } = req.params;
  const { mixingParameters } = req.body;
  
  if (!personaId) {
    return res.status(400).json({
      success: false,
      message: 'Persona ID is required'
    });
  }
  
  if (!mixingParameters) {
    return res.status(400).json({
      success: false,
      message: 'Mixing parameters are required'
    });
  }
  
  // Verify persona ownership
  const isOwner = await AnonymousPersona.validatePersonaOwnership(userId, personaId);
  
  if (!isOwner) {
    return res.status(403).json({
      success: false,
      message: 'You do not own this persona'
    });
  }
  
  // Get the persona
  const persona = await AnonymousPersona.findOne({ personaId });
  
  if (!persona) {
    return res.status(404).json({
      success: false,
      message: 'Persona not found'
    });
  }
  
  // Ensure cryptoData structure exists
  if (!persona.cryptoData.mixingParameters) {
    persona.cryptoData.mixingParameters = {};
  }
  
  // Update mixing parameters
  if (typeof mixingParameters.timingNoise === 'boolean') {
    persona.cryptoData.mixingParameters.timingNoise = mixingParameters.timingNoise;
  }
  
  if (typeof mixingParameters.multiPathRouting === 'boolean') {
    persona.cryptoData.mixingParameters.multiPathRouting = mixingParameters.multiPathRouting;
  }
  
  if (mixingParameters.randomDelay) {
    if (!persona.cryptoData.mixingParameters.randomDelay) {
      persona.cryptoData.mixingParameters.randomDelay = {};
    }
    
    if (mixingParameters.randomDelay.min) {
      persona.cryptoData.mixingParameters.randomDelay.min = mixingParameters.randomDelay.min;
    }
    
    if (mixingParameters.randomDelay.max) {
      persona.cryptoData.mixingParameters.randomDelay.max = mixingParameters.randomDelay.max;
    }
  }
  
  if (mixingParameters.proxyHops) {
    // Ensure proxy hops is between 1 and 5
    persona.cryptoData.mixingParameters.proxyHops = Math.min(
      Math.max(1, mixingParameters.proxyHops),
      5
    );
  }
  
  await persona.save();
  
  res.status(200).json({
    success: true,
    message: 'Mixing parameters updated successfully'
  });
});

// Helper function to generate randomized HTTP headers
function generateRandomizedHeaders(mimicCommonBrowsers = true) {
  const headers = {};
  
  if (mimicCommonBrowsers) {
    // Common user agents
    const commonUserAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
    ];
    
    // Pick a random user agent
    headers['User-Agent'] = commonUserAgents[Math.floor(Math.random() * commonUserAgents.length)];
    
    // Add common headers
    headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8';
    headers['Accept-Language'] = 'en-US,en;q=0.5';
    headers['Accept-Encoding'] = 'gzip, deflate, br';
    headers['DNT'] = Math.random() > 0.5 ? '1' : null;
    headers['Connection'] = 'keep-alive';
    headers['Upgrade-Insecure-Requests'] = '1';
    headers['Cache-Control'] = Math.random() > 0.5 ? 'max-age=0' : 'no-cache';
  } else {
    // Generate completely random headers
    // This is more for demonstration, in reality you'd want more sophisticated randomization
    headers['X-Request-ID'] = crypto.randomBytes(16).toString('hex');
    headers['X-Routing-ID'] = crypto.randomBytes(8).toString('hex');
    headers['X-Session-Variation'] = Math.floor(Math.random() * 100).toString();
  }
  
  return headers;
} 