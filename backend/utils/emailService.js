const nodemailer = require('nodemailer');

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASSWORD || 'password'
  }
});

/**
 * Send verification email
 * @param {string} to - Recipient email address
 * @param {string} token - Verification token
 * @param {string} username - User's name
 * @returns {Promise} - Email sending result
 */
exports.sendVerificationEmail = async (to, token, username) => {
  const verificationLink = `${process.env.API_BASE_URL}/api/verification/email/verify/${token}`;
  
  const mailOptions = {
    from: `"Linker" <${process.env.EMAIL_FROM || 'noreply@linker.com'}>`,
    to,
    subject: 'Verify Your Email at Linker',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #8B5FBF;">Linker</h1>
        </div>
        
        <p>Hello ${username || 'there'},</p>
        
        <p>Thank you for starting the verification process at Linker. To verify your professional email address, please click the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #8B5FBF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify My Email</a>
        </div>
        
        <p>This verification link will expire in 24 hours. If you did not request this verification, please ignore this email.</p>
        
        <p>Best regards,<br>The Linker Team</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
          <p>This is an automated email, please do not reply. If you need assistance, please contact our support team.</p>
        </div>
      </div>
    `
  };
  
  return transporter.sendMail(mailOptions);
}; 