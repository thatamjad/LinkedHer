import axios from 'axios';
import { 
  generateRoutingPath, 
  getRandomDelayParams, 
  getRandomizedHeaders 
} from '../services/securityService';
import { isAnonymousMode, getCurrentPersonaId } from './sessionMonitor';

// Constants
const ROUTE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let routingPathCache = null;
let routingPathTimestamp = 0;
let delayParams = { min: 50, max: 500 };
let customHeaders = {};

/**
 * Initialize network mixing middleware
 */
export const initNetworkMixing = async () => {
  // Intercept requests when in anonymous mode
  axios.interceptors.request.use(async (config) => {
    // Skip if not in anonymous mode
    if (!isAnonymousMode()) {
      return config;
    }
    
    const personaId = getCurrentPersonaId();
    if (!personaId) {
      return config;
    }
    
    try {
      // Add routing information
      const routingPath = await getRoutingPath(personaId);
      if (routingPath) {
        config.headers['x-routing-path'] = JSON.stringify(routingPath);
        config.headers['x-stealth-address'] = routingPath.stealthAddress;
      }
      
      // Add randomized headers
      const headers = await getHeaders(personaId);
      if (headers) {
        Object.keys(headers).forEach(key => {
          if (headers[key] !== null) {
            config.headers[key] = headers[key];
          }
        });
      }
      
      // Add random delay
      await addRandomDelay(personaId);
      
    } catch (error) {
      console.error('Error applying network mixing:', error);
    }
    
    return config;
  });
};

/**
 * Get routing path for the current persona
 * @param {string} personaId - ID of the anonymous persona
 * @returns {object|null} Routing path information
 */
const getRoutingPath = async (personaId) => {
  const now = Date.now();
  
  // Return cached path if still valid
  if (routingPathCache && (now - routingPathTimestamp < ROUTE_CACHE_DURATION)) {
    return routingPathCache;
  }
  
  try {
    // Get new routing path
    const response = await generateRoutingPath(personaId);
    
    if (response.success) {
      routingPathCache = response.data;
      routingPathTimestamp = now;
      return routingPathCache;
    }
  } catch (error) {
    console.error('Failed to get routing path:', error);
    return null;
  }
};

/**
 * Get randomized headers for the current persona
 * @param {string} personaId - ID of the anonymous persona
 * @returns {object|null} Randomized headers
 */
const getHeaders = async (personaId) => {
  try {
    // We only need to get headers once per session
    if (Object.keys(customHeaders).length === 0) {
      const response = await getRandomizedHeaders(personaId);
      
      if (response.success) {
        customHeaders = response.data.headers;
      }
    }
    
    return customHeaders;
  } catch (error) {
    console.error('Failed to get randomized headers:', error);
    return null;
  }
};

/**
 * Add random delay to requests
 * @param {string} personaId - ID of the anonymous persona
 */
const addRandomDelay = async (personaId) => {
  try {
    // Get delay parameters if we don't have them yet
    if (!delayParams) {
      const response = await getRandomDelayParams(personaId);
      
      if (response.success) {
        delayParams = response.data;
      }
    }
    
    // Add random delay
    const delay = Math.floor(
      Math.random() * (delayParams.max - delayParams.min + 1) + delayParams.min
    );
    
    return new Promise(resolve => setTimeout(resolve, delay));
  } catch (error) {
    console.error('Failed to apply random delay:', error);
  }
};

/**
 * Clear network mixing cache
 */
export const clearNetworkMixingCache = () => {
  routingPathCache = null;
  routingPathTimestamp = 0;
  customHeaders = {};
};

/**
 * Update mixing parameters
 * @param {object} params - New mixing parameters
 */
export const updateMixingParams = (params) => {
  if (params.randomDelay) {
    delayParams = params.randomDelay;
  }
  
  // Force refresh of routing path
  routingPathCache = null;
  routingPathTimestamp = 0;
}; 