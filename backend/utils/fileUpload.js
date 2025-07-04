const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
const secureUploadDir = path.join(uploadDir, 'verification');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

if (!fs.existsSync(secureUploadDir)) {
  fs.mkdirSync(secureUploadDir);
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