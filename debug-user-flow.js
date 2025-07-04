// Simple test to debug the user ID issue
const axios = require('axios');

async function debugUserFlow() {
  try {
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/test-login', {}, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    });
    
    console.log('✅ Login successful');
    console.log('   User ID:', loginResponse.data.user.id);
    
    const token = loginResponse.data.token;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    console.log('\n2. Creating a test achievement...');
    const achievementResponse = await axios.post('http://localhost:5000/api/achievements', {
      title: 'Test Achievement',
      description: 'This is a test achievement created via API',
      category: 'career',
      achievedAt: new Date().toISOString()
    }, {
      headers,
      withCredentials: true
    });
    
    console.log('✅ Achievement created:', achievementResponse.data._id);
    
    console.log('\n3. Fetching achievements...');
    const getAchievementsResponse = await axios.get('http://localhost:5000/api/achievements/my', {
      headers,
      withCredentials: true
    });
    
    console.log('✅ Achievements retrieved:', getAchievementsResponse.data.data.length);
    if (getAchievementsResponse.data.data.length > 0) {
      console.log('   First achievement:', getAchievementsResponse.data.data[0].title);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugUserFlow();
