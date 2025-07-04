import { updateSessionActivity } from '../services/securityService';

// Session activity constants
const ACTIVITY_INTERVAL = 5 * 60 * 1000; // 5 minutes
const SESSION_CHECK_INTERVAL = 60 * 1000; // 1 minute

let lastActivity = Date.now();
let activityInterval = null;
let sessionCheckInterval = null;

/**
 * Initialize session monitoring
 * @param {object} store - Redux store (if applicable)
 * @param {function} onSessionExpired - Callback when session expires
 */
export const initSessionMonitor = (store, onSessionExpired) => {
  // Update last activity on user interactions
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  
  activityEvents.forEach(event => {
    window.addEventListener(event, updateLastActivity, true);
  });
  
  // Set up intervals
  activityInterval = setInterval(reportActivity, ACTIVITY_INTERVAL);
  sessionCheckInterval = setInterval(() => checkSession(onSessionExpired), SESSION_CHECK_INTERVAL);
  
  // Initial activity report
  reportActivity();
};

/**
 * Update last activity timestamp
 */
const updateLastActivity = () => {
  lastActivity = Date.now();
};

/**
 * Report user activity to the server
 */
const reportActivity = async () => {
  try {
    // Only report if there's been activity since last report
    if (Date.now() - lastActivity < ACTIVITY_INTERVAL * 2) {
      await updateSessionActivity();
    }
  } catch (error) {
    console.error('Failed to report session activity:', error);
  }
};

/**
 * Check if the session is still valid
 * @param {function} onSessionExpired - Callback when session expires
 */
const checkSession = (onSessionExpired) => {
  const sessionId = localStorage.getItem('sessionId');
  const sessionExpiry = localStorage.getItem('sessionExpiry');
  
  if (!sessionId || !sessionExpiry) {
    return;
  }
  
  // Check if session has expired
  if (new Date(sessionExpiry) < new Date()) {
    cleanup();
    
    // Call the callback if provided
    if (typeof onSessionExpired === 'function') {
      onSessionExpired();
    }
  }
};

/**
 * Check if current session is in anonymous mode
 * @returns {boolean} True if in anonymous mode
 */
export const isAnonymousMode = () => {
  return localStorage.getItem('anonymousMode') === 'true';
};

/**
 * Switch to anonymous mode
 * @param {string} personaId - ID of the anonymous persona
 */
export const switchToAnonymousMode = (personaId) => {
  localStorage.setItem('anonymousMode', 'true');
  localStorage.setItem('currentPersonaId', personaId);
  
  // You might want to trigger some UI changes or notifications here
};

/**
 * Switch back to professional mode
 */
export const switchToProfessionalMode = () => {
  localStorage.setItem('anonymousMode', 'false');
  localStorage.removeItem('currentPersonaId');
  
  // You might want to trigger some UI changes or notifications here
};

/**
 * Get the current persona ID if in anonymous mode
 * @returns {string|null} Current persona ID or null
 */
export const getCurrentPersonaId = () => {
  return isAnonymousMode() ? localStorage.getItem('currentPersonaId') : null;
};

/**
 * Clean up session monitoring
 */
export const cleanup = () => {
  // Remove event listeners
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  
  activityEvents.forEach(event => {
    window.removeEventListener(event, updateLastActivity, true);
  });
  
  // Clear intervals
  if (activityInterval) {
    clearInterval(activityInterval);
    activityInterval = null;
  }
  
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
    sessionCheckInterval = null;
  }
}; 