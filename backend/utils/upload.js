const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

// Storage configuration for profile images
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/profiles');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile-${req.user.id}-${uniqueSuffix}${ext}`);
  }
});

// Storage configuration for post media
const postMediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/media');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `post-${req.user.id}-${uniqueSuffix}${ext}`);
  }
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && allowedTypes.test(ext)) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
  }
};

// Create multer upload instances
const profileImageUpload = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFileFilter
});

const postMediaUpload = multer({
  storage: postMediaStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: imageFileFilter
});

/**
 * Process uploaded image and create optimized versions
 * @param {string} filePath - Path to the uploaded file
 * @returns {Promise<Object>} - Object with paths to optimized images
 */
const processImage = async (filePath) => {
  const filename = path.basename(filePath);
  const directory = path.dirname(filePath);
  const extension = path.extname(filename);
  const nameWithoutExt = filename.replace(extension, '');
  
  // Create thumbnail
  const thumbnailPath = path.join(directory, `${nameWithoutExt}-thumbnail${extension}`);
  await sharp(filePath)
    .resize(300, 300, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toFile(thumbnailPath);
  
  // Create medium-sized image
  const mediumPath = path.join(directory, `${nameWithoutExt}-medium${extension}`);
  await sharp(filePath)
    .resize(800, 800, { fit: 'inside' })
    .jpeg({ quality: 85 })
    .toFile(mediumPath);
  
  // Get image dimensions
  const metadata = await sharp(filePath).metadata();
  
  return {
    original: filePath,
    thumbnail: thumbnailPath,
    medium: mediumPath,
    dimensions: {
      width: metadata.width,
      height: metadata.height
    }
  };
};

module.exports = {
  profileImageUpload,
  postMediaUpload,
  processImage
}; 