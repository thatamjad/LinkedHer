require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/linkedher',
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpiration: process.env.JWT_EXPIRY || '1h',
  jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRY || '7d',
  verificationExpirationDays: process.env.VERIFICATION_WINDOW_DAYS || 7,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
  emailFrom: process.env.EMAIL_FROM || 'noreply@linkedher.com',
  smtpConfig: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  }
};