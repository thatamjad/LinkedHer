// Quick database debug script
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });

const User = require('./backend/models/user.model');
const Profile = require('./backend/models/profile.model');
const Achievement = require('./backend/models/achievement.model');

// Connect to MongoDB
mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27018/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Connection error:', err));

async function debugData() {
  try {
    const testUser = await User.findOne({ email: 'test@example.com' });
    console.log('Test user ID:', testUser?._id.toString());
    
    const profiles = await Profile.find({});
    console.log('Profiles found:', profiles.length);
    if (profiles.length > 0) {
      console.log('Profile user IDs:', profiles.map(p => p.user.toString()));
    }
    
    const achievements = await Achievement.find({});
    console.log('Achievements found:', achievements.length);
    if (achievements.length > 0) {
      console.log('Achievement user IDs:', achievements.map(a => a.user.toString()));
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugData();
