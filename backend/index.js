const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config');

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB Connected');
    // Setup test accounts in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Running in development mode, setting up test accounts...');
      const { createPermanentTestAccount } = require('./fix-test-account.js');
      createPermanentTestAccount().catch(err => {
        console.error('Failed to create permanent test accounts:', err);
      });
    }
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// Define Routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/verification', require('./routes/verification.routes'));
app.use('/api/jobs', require('./routes/api/jobs'));
app.use('/api/reports', require('./routes/api/reports'));
app.use('/api/anonymous', require('./routes/anonymous.routes'));

// Additional feature routes (when implemented)
// app.use('/api/mentorship', require('./routes/mentorshipRoutes'));
// app.use('/api/industry-groups', require('./routes/industryGroupRoutes'));
// app.use('/api/support-groups', require('./routes/supportGroup.routes'));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app; 