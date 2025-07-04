const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

/**
 * Cryptographic utilities for the anonymous mode
 * This provides the core functionality for:
 * 1. Zero-knowledge proof style anonymous persona generation
 * 2. Stealth addressing using simplified ring signatures
 * 3. Metadata stripping for uploaded files
 * 4. Secure session isolation between modes
 */

// Generate a zero-knowledge proof inspired anonymous persona
// In a production system, this would use a proper ZKP library
const generateAnonymousPersona = async (userId) => {
  try {
    // Generate a cryptographically secure random key pair
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });
    
    // Generate a secure salt
    const salt = crypto.randomBytes(16).toString('hex');
    
    // Create a hash of the public key as the persona identifier
    // This way the persona cannot be traced back to the user
    const publicKeyHash = crypto.createHash('sha256')
      .update(publicKey)
      .digest('hex');
      
    // Generate stealth address using ring signature concept
    // In a real implementation, this would use actual ring signatures
    const stealthAddress = generateStealthAddress(publicKeyHash, salt);
    
    // Generate a random but memorable display name
    const displayName = generateRandomDisplayName();
    
    return {
      publicKeyHash,
      stealthAddress,
      displayName,
      salt,
      // This should be returned to the client but never stored on the server
      privateIdentity: {
        privateKey,
        salt
      }
    };
  } catch (error) {
    console.error('Error generating anonymous persona:', error);
    throw new Error('Failed to generate anonymous identity');
  }
};

// Generate a stealth address using simplified ring signature concept
const generateStealthAddress = (publicKeyHash, salt) => {
  // In a real implementation, this would use proper ring signatures
  // For now, we'll simulate the concept
  const mixInFactor = process.env.ANONYMITY_MIX_FACTOR || 5;
  
  // Create a deterministic but unlinkable address
  return crypto.createHmac('sha256', salt)
    .update(publicKeyHash)
    .update(Date.now().toString()) // Add temporal separation
    .update(mixInFactor.toString())
    .digest('hex');
};

// Generate a random but human-friendly display name
const generateRandomDisplayName = () => {
  const adjectives = [
    'Brave', 'Curious', 'Dynamic', 'Energetic', 'Fearless',
    'Graceful', 'Honest', 'Insightful', 'Joyful', 'Kind',
    'Luminous', 'Mindful', 'Noble', 'Optimistic', 'Peaceful',
    'Quiet', 'Resilient', 'Sincere', 'Thoughtful', 'Unique',
    'Vibrant', 'Wise', 'Zealous'
  ];
  
  const nouns = [
    'Aurora', 'Breeze', 'Comet', 'Dove', 'Eagle',
    'Falcon', 'Galaxy', 'Horizon', 'Iris', 'Journey',
    'Kite', 'Lotus', 'Meadow', 'Nova', 'Ocean',
    'Phoenix', 'Quasar', 'River', 'Star', 'Tiger',
    'Universe', 'Voice', 'Wave', 'Zenith'
  ];
  
  // Add a random number for uniqueness
  const randomNum = Math.floor(Math.random() * 1000);
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adjective}${noun}${randomNum}`;
};

// Strip metadata from uploaded images to enhance anonymity
const stripMetadata = async (filePath) => {
  try {
    // In a real implementation, we would use libraries like ExifTool
    // For this implementation, we'll simulate the process
    
    // Get file extension to determine processing method
    const ext = path.extname(filePath).toLowerCase();
    
    // Process based on file type
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      // For images - in a real implementation we would strip EXIF data
      console.log(`Stripping metadata from image: ${filePath}`);
      
      // Return the path to the stripped file
      // In a real implementation, this would be a new file with metadata removed
      return filePath;
    } else if (['.mp4', '.mov', '.webm'].includes(ext)) {
      // For videos - in a real implementation we would strip metadata
      console.log(`Stripping metadata from video: ${filePath}`);
      
      // Return the path to the stripped file
      return filePath;
    }
    
    // If not a recognized file type, return the original
    return filePath;
  } catch (error) {
    console.error('Error stripping metadata:', error);
    // Return original file if stripping fails
    return filePath;
  }
};

// Create a content signature for verifying post integrity
const signContent = (content, privateKey) => {
  try {
    const sign = crypto.createSign('SHA256');
    sign.update(content);
    sign.end();
    return sign.sign(privateKey, 'hex');
  } catch (error) {
    console.error('Error signing content:', error);
    return null;
  }
};

// Verify a content signature for integrity checking
const verifySignature = (content, signature, publicKey) => {
  try {
    const verify = crypto.createVerify('SHA256');
    verify.update(content);
    verify.end();
    return verify.verify(publicKey, signature, 'hex');
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
};

// Generate a secure session token for anonymous mode
const generateAnonymousSessionToken = (personaId, userAgent) => {
  // Create a session token that doesn't reveal the user's identity
  const sessionData = {
    personaId,
    timestamp: Date.now(),
    userAgent: userAgent || 'unknown'
  };
  
  // Encrypt the session data
  const key = process.env.ANONYMOUS_SESSION_SECRET;
  
  return crypto.createHmac('sha256', key)
    .update(JSON.stringify(sessionData))
    .digest('hex');
};

// Hash content for integrity checking
const hashContent = (content) => {
  return crypto.createHash('sha256')
    .update(typeof content === 'string' ? content : JSON.stringify(content))
    .digest('hex');
};

/**
 * Encrypt anonymous session data
 */
const encryptAnonymousSession = (data) => {
  const key = process.env.ANONYMOUS_SESSION_SECRET;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

/**
 * Decrypt anonymous session data
 */
const decryptAnonymousSession = (encryptedData) => {
  const key = process.env.ANONYMOUS_SESSION_SECRET;
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
};

module.exports = {
  generateAnonymousPersona,
  generateStealthAddress,
  generateRandomDisplayName,
  stripMetadata,
  signContent,
  verifySignature,
  generateAnonymousSessionToken,
  hashContent,
  encryptAnonymousSession,
  decryptAnonymousSession
}; 