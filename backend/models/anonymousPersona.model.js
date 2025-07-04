const mongoose = require('mongoose');
const crypto = require('crypto');

const AnonymousPersonaSchema = new mongoose.Schema(
  {
    // Reference to the real user (stored securely, never exposed publicly)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Cryptographically generated persona identifier
    personaId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Public-facing display name for the anonymous persona
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    // Generated or selected avatar for anonymous persona
    avatarUrl: {
      type: String,
      default: '',
    },
    // Cryptographic information (stored securely)
    cryptoData: {
      // Public key representation (safe to store)
      publicKeyHash: {
        type: String,
        required: true,
      },
      // Ring signature information for stealth addressing
      stealthAddress: {
        type: String,
        required: true,
      },
      // Optional salt used in identity generation
      salt: {
        type: String,
      },
      // Enhanced network mixing parameters
      mixingParameters: {
        // Noise addition to timing patterns
        timingNoise: {
          type: Boolean,
          default: true
        },
        // Random delay in milliseconds for network requests
        randomDelay: {
          min: {
            type: Number,
            default: 50 // ms
          },
          max: {
            type: Number,
            default: 500 // ms
          }
        },
        // Route traffic through multiple proxies
        multiPathRouting: {
          type: Boolean,
          default: true
        },
        // Number of proxy hops for multi-path routing
        proxyHops: {
          type: Number,
          default: 3,
          min: 1,
          max: 5
        }
      },
      // For network traffic fingerprinting protection
      fingerPrintingProtection: {
        // Randomize HTTP headers
        randomizeHeaders: {
          type: Boolean,
          default: true
        },
        // Mimic common browser patterns
        mimicCommonBrowsers: {
          type: Boolean,
          default: true
        }
      }
    },
    // Used for metadata isolation and obfuscation
    metadataSettings: {
      stripExifData: {
        type: Boolean,
        default: true,
      },
      obfuscateTimestamps: {
        type: Boolean,
        default: true,
      },
      routeThroughProxy: {
        type: Boolean,
        default: true,
      },
      // Enhanced metadata protection
      randomizeFileMetadata: {
        type: Boolean,
        default: true
      },
      // Prevent browser fingerprinting
      preventBrowserFingerprinting: {
        type: Boolean,
        default: true
      },
      // Add noise to metadata
      addMetadataNoise: {
        type: Boolean,
        default: true
      }
    },
    // Controls for the persona
    isActive: {
      type: Boolean,
      default: true,
    },
    // For disappearing content defaults
    defaultContentLifespan: {
      type: Number, // In hours, 0 means permanent
      default: 24,
    },
    // Enhanced security settings
    securitySettings: {
      // Auto-switch back to professional mode after inactivity
      autoSwitchTimeout: {
        enabled: {
          type: Boolean,
          default: true
        },
        timeoutMinutes: {
          type: Number,
          default: 30
        }
      },
      // Delete all session data on logout
      purgeSessionOnLogout: {
        type: Boolean,
        default: true
      },
      // Notification on suspicious activity
      notifySuspiciousActivity: {
        type: Boolean,
        default: true
      }
    }
  },
  {
    timestamps: true,
  }
);

// Static method to generate a new persona identifier
AnonymousPersonaSchema.statics.generatePersonaId = function() {
  // Create a strong, unique identifier
  const bytes = crypto.randomBytes(32);
  return bytes.toString('hex');
};

// Static method to generate a stealth address
AnonymousPersonaSchema.statics.generateStealthAddress = function() {
  // In a real implementation, this would use more advanced cryptography
  // For now, we'll use a simplified version
  const bytes = crypto.randomBytes(32);
  return bytes.toString('hex');
};

// Helper method to validate a persona belongs to a user
AnonymousPersonaSchema.statics.validatePersonaOwnership = async function(userId, personaId) {
  const persona = await this.findOne({ personaId, userId });
  return !!persona;
};

// Instance method to refresh cryptographic identity
AnonymousPersonaSchema.methods.refreshCryptoIdentity = async function() {
  // Generate new cryptographic information
  const salt = crypto.randomBytes(16).toString('hex');
  const stealthAddress = AnonymousPersonaSchema.statics.generateStealthAddress();
  
  // Update the cryptographic data
  this.cryptoData.salt = salt;
  this.cryptoData.stealthAddress = stealthAddress;
  
  return this;
};

// New method to generate a temporary one-time routing path
AnonymousPersonaSchema.methods.generateRoutingPath = function() {
  if (!this.cryptoData.mixingParameters.multiPathRouting) {
    return null;
  }
  
  const hops = this.cryptoData.mixingParameters.proxyHops;
  const routingPath = [];
  
  // Generate a random routing path through multiple proxies
  // In a real implementation, this would select from actual proxy servers
  for (let i = 0; i < hops; i++) {
    routingPath.push({
      nodeId: crypto.randomBytes(8).toString('hex'),
      encryptionKey: crypto.randomBytes(16).toString('hex'),
      ttl: 300 // Time to live in seconds
    });
  }
  
  return routingPath;
};

// Remove sensitive data when converting to JSON
AnonymousPersonaSchema.methods.toJSON = function() {
  const persona = this.toObject();
  
  // Remove the link to the actual user
  delete persona.userId;
  
  // Remove sensitive cryptographic data
  delete persona.cryptoData.salt;
  
  return persona;
};

module.exports = mongoose.model('AnonymousPersona', AnonymousPersonaSchema); 