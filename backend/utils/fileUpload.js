const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Create uploads directory if it doesn't exist
// Use temp directory for cloud deployments where we can't write to /app
const isCloudDeployment = process.env.NODE_ENV === 'production' && process.env.RAILWAY_ENVIRONMENT;
const uploadDir = isCloudDeployment 
  ? path.join(os.tmpdir(), 'uploads') 
  : path.join(__dirname, '..', '..', 'uploads');
const secureUploadDir = path.join(uploadDir, 'verification');

// Safely create directories with error handling
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  if (!fs.existsSync(secureUploadDir)) {
    fs.mkdirSync(secureUploadDir, { recursive: true });
  }
} catch (error) {
  console.warn('Warning: Could not create upload directories:', error.message);
  console.warn('Using temporary directory for file uploads');
}

// Set storage for verification documents
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, secureUploadDir);
  },
  filename: function(req, file, cb) {
    // Generate secure filename with user ID prefix for better organization
    const userId = req.userId || 'unknown';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${userId}-${uniqueSuffix}${extension}`);
  }
});

// File filter for document uploads
const fileFilter = (req, file, cb) => {
  // Accept only images for verification
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for verification documents'), false);
  }
};

// Export the configured multer instance
const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = { upload }; 