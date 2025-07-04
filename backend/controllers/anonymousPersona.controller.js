const AnonymousPersona = require('../models/anonymousPersona.model');
const User = require('../models/user.model');
const cryptoUtils = require('../utils/cryptoUtils');
const { createAnonymousToken } = require('../middleware/anonymousAuth.middleware');

/**
 * Controller for anonymous persona management
 * Implements the cryptographic anonymity system features
 */

// Create a new anonymous persona
const createPersona = async (req, res) => {
  try {
    // Check if user is verified (only verified users can use anonymous mode)
    if (req.user.verificationStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Only verified users can create anonymous personas'
      });
    }

    // Count existing personas for this user
    const existingCount = await AnonymousPersona.countDocuments({ userId: req.user._id });
    
    // Limit the number of personas per user
    const maxPersonas = process.env.MAX_PERSONAS_PER_USER || 3;
    if (existingCount >= maxPersonas) {
      return res.status(400).json({
        success: false,
        message: `Maximum of ${maxPersonas} anonymous personas allowed per user`
      });
    }

    // Generate cryptographic identity
    const { publicKeyHash, stealthAddress, displayName, salt, privateIdentity } = 
      await cryptoUtils.generateAnonymousPersona(req.user._id);

    // Create persona document
    const persona = new AnonymousPersona({
      userId: req.user._id,
      personaId: AnonymousPersona.generatePersonaId(),
      displayName,
      avatarUrl: '', // Will be set later or use default
      cryptoData: {
        publicKeyHash,
        stealthAddress,
        salt
      }
    });

    await persona.save();

    // Generate token for this persona
    const token = await createAnonymousToken(persona.personaId);

    // Return the persona (public data only) and private identity
    return res.status(201).json({
      success: true,
      message: 'Anonymous persona created successfully',
      persona: {
        personaId: persona.personaId,
        displayName: persona.displayName,
        avatarUrl: persona.avatarUrl,
        stealthAddress: persona.cryptoData.stealthAddress,
        createdAt: persona.createdAt
      },
      // This data should be securely stored by the client and never sent back to the server
      privateIdentity,
      token
    });
  } catch (error) {
    console.error('Create anonymous persona error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create anonymous persona'
    });
  }
};

// Get all personas for the current user
const getMyPersonas = async (req, res) => {
  try {
    const personas = await AnonymousPersona.find({ userId: req.user._id });
    
    // Map to safe objects (removing userId and other sensitive data)
    const safePersonas = personas.map(persona => ({
      personaId: persona.personaId,
      displayName: persona.displayName,
      avatarUrl: persona.avatarUrl,
      stealthAddress: persona.cryptoData.stealthAddress,
      createdAt: persona.createdAt,
      isActive: persona.isActive
    }));
    
    return res.json({
      success: true,
      personas: safePersonas
    });
  } catch (error) {
    console.error('Get personas error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve anonymous personas'
    });
  }
};

// Update persona display name or avatar
const updatePersona = async (req, res) => {
  try {
    const { personaId } = req.params;
    const { displayName, avatarUrl } = req.body;
    
    // Verify ownership
    const persona = await AnonymousPersona.findOne({ 
      personaId, 
      userId: req.user._id 
    });
    
    if (!persona) {
      return res.status(404).json({
        success: false,
        message: 'Persona not found or you do not have permission'
      });
    }
    
    // Update allowed fields
    if (displayName) persona.displayName = displayName;
    if (avatarUrl) persona.avatarUrl = avatarUrl;
    
    await persona.save();
    
    return res.json({
      success: true,
      message: 'Persona updated successfully',
      persona: {
        personaId: persona.personaId,
        displayName: persona.displayName,
        avatarUrl: persona.avatarUrl
      }
    });
  } catch (error) {
    console.error('Update persona error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update persona'
    });
  }
};

// Delete a persona
const deletePersona = async (req, res) => {
  try {
    const { personaId } = req.params;
    
    // Verify ownership
    const result = await AnonymousPersona.findOneAndDelete({ 
      personaId, 
      userId: req.user._id 
    });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Persona not found or you do not have permission'
      });
    }
    
    return res.json({
      success: true,
      message: 'Persona deleted successfully'
    });
  } catch (error) {
    console.error('Delete persona error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete persona'
    });
  }
};

// Switch to a specific persona and get authentication token
const switchPersona = async (req, res) => {
  try {
    const { personaId } = req.params;
    
    // Verify ownership
    const persona = await AnonymousPersona.findOne({ 
      personaId, 
      userId: req.user._id 
    });
    
    if (!persona) {
      return res.status(404).json({
        success: false,
        message: 'Persona not found or you do not have permission'
      });
    }
    
    // Generate new token for this persona
    const token = await createAnonymousToken(persona.personaId);
    
    // Refresh cryptographic identity for enhanced security
    await persona.refreshCryptoIdentity();
    await persona.save();
    
    return res.json({
      success: true,
      message: 'Switched to anonymous persona',
      persona: {
        personaId: persona.personaId,
        displayName: persona.displayName,
        avatarUrl: persona.avatarUrl,
        stealthAddress: persona.cryptoData.stealthAddress
      },
      token
    });
  } catch (error) {
    console.error('Switch persona error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to switch persona'
    });
  }
};

// Get anonymous persona by ID (public endpoint)
const getPersonaById = async (req, res) => {
  try {
    const { personaId } = req.params;
    
    // Find persona but only return public data
    const persona = await AnonymousPersona.findOne({ personaId });
    
    if (!persona) {
      return res.status(404).json({
        success: false,
        message: 'Persona not found'
      });
    }
    
    // Return only public data
    return res.json({
      success: true,
      persona: {
        personaId: persona.personaId,
        displayName: persona.displayName,
        avatarUrl: persona.avatarUrl,
        // Never include userId or link to professional identity
      }
    });
  } catch (error) {
    console.error('Get persona error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve persona'
    });
  }
};

module.exports = {
  createPersona,
  getMyPersonas,
  updatePersona,
  deletePersona,
  switchPersona,
  getPersonaById
}; 