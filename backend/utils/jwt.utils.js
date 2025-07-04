const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate JWT access token
 * @param {Object} payload - User data to include in token
 * @returns {String} JWT access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiration
  });
};

/**
 * Generate JWT refresh token
 * @param {Object} payload - User data to include in token
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d'
  });
};

/**
 * Verify JWT access token
 * @param {String} token - JWT token to verify
 * @returns {Object|Error} Decoded token or error
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

/**
 * Verify JWT refresh token
 * @param {String} token - JWT refresh token to verify
 * @returns {Object|Error} Decoded token or error
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Set refresh token in HTTP-only cookie
 * @param {Object} res - Express response object
 * @param {String} token - JWT refresh token
 */
const setRefreshTokenCookie = (res, token) => {
  // Determine expiry
  const refreshExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
  const expiryDays = parseInt(refreshExpiry.split('d')[0]) || 7;
  const expiryMs = expiryDays * 24 * 60 * 60 * 1000;

  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: expiryMs
  });
};

/**
 * Clear refresh token cookie
 * @param {Object} res - Express response object
 */
const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken');
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie
}; 