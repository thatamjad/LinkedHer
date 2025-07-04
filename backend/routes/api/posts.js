const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../../middleware/auth');
const { isVerified } = require('../../middleware/verification');
const ProfessionalPost = require('../../models/ProfessionalPost');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/posts';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'post-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// @route   POST api/posts/professional
// @desc    Create a professional post
// @access  Private
router.post('/professional', [auth, upload.single('image')], async (req, res) => {  try {
    const newPost = new ProfessionalPost({
      userId: req.user._id,
      content: req.body.content,
      postType: req.body.postType || 'TEXT'
    });

    if (req.file) {
      newPost.imageUrl = `/uploads/posts/${req.file.filename}`;
    }

    const post = await newPost.save();
    
    // Populate user details for frontend
    const populatedPost = await ProfessionalPost.findById(post._id)
      .populate('userId', ['firstName', 'lastName', 'profilePicture', 'headline']);
    
    res.json(populatedPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/posts/professional
// @desc    Get all professional posts
// @access  Private
router.get('/professional', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const posts = await ProfessionalPost.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', ['firstName', 'lastName', 'profilePicture', 'headline']);
    
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/posts/professional/:id
// @desc    Get professional post by ID
// @access  Private
router.get('/professional/:id', auth, async (req, res) => {
  try {
    const post = await ProfessionalPost.findById(req.params.id)
      .populate('userId', ['firstName', 'lastName', 'profilePicture', 'headline']);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/posts/professional/:id
// @desc    Delete a professional post
// @access  Private
router.delete('/professional/:id', auth, async (req, res) => {
  try {
    const post = await ProfessionalPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Check user
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Delete image if exists
    if (post.imageUrl) {
      const imagePath = path.join(__dirname, '..', '..', '..', post.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await post.remove();
    
    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/posts/professional/:id/like
// @desc    Like a professional post
// @access  Private
router.post('/professional/:id/like', auth, async (req, res) => {
  try {
    const post = await ProfessionalPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Check if the post has already been liked by this user
    if (post.likes.some(like => like.toString() === req.user._id.toString())) {
      return res.status(400).json({ msg: 'Post already liked' });
    }
    
    post.likes.unshift(req.user._id);
    
    await post.save();
    
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/posts/professional/:id/like
// @desc    Unlike a professional post
// @access  Private
router.delete('/professional/:id/like', auth, async (req, res) => {
  try {
    const post = await ProfessionalPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Check if the post has not yet been liked by this user
    if (!post.likes.some(like => like.toString() === req.user._id.toString())) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }
    
    // Remove the like
    post.likes = post.likes.filter(like => like.toString() !== req.user._id.toString());
    
    await post.save();
    
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/posts/professional/:id/comment
// @desc    Comment on a professional post
// @access  Private
router.post('/professional/:id/comment', auth, async (req, res) => {
  try {
    if (!req.body.text || !req.body.text.trim()) {
      return res.status(400).json({ msg: 'Comment text is required' });
    }
    
    const post = await ProfessionalPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    const newComment = {
      userId: req.user._id,
      text: req.body.text,
      createdAt: Date.now()
    };
    
    post.comments.unshift(newComment);
    
    await post.save();
    
    // Find newly saved comment and populate user data
    const savedComment = post.comments[0];
    
    // Return the comment with userId field populated
    const populatedPost = await ProfessionalPost.findById(post._id)
      .populate('comments.userId', ['firstName', 'lastName', 'profilePicture']);
    
    // Find the added comment in the populated result
    const populatedComment = populatedPost.comments.find(
      c => c._id.toString() === savedComment._id.toString()
    );
    
    res.json(populatedComment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/posts/professional/:id/comment/:comment_id
// @desc    Delete comment
// @access  Private
router.delete('/professional/:id/comment/:comment_id', auth, async (req, res) => {
  try {
    const post = await ProfessionalPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Pull out comment
    const comment = post.comments.find(
      comment => comment._id.toString() === req.params.comment_id
    );
    
    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }
    
    // Check user
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Get remove index
    post.comments = post.comments.filter(
      comment => comment._id.toString() !== req.params.comment_id
    );
    
    await post.save();
    
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resource not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router; 