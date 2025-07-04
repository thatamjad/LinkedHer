// Simple test script to check API connectivity
const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API connection...');
    
    // Test basic connectivity
    const response = await axios.post('http://localhost:5000/api/auth/test-login', {}, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    console.log('Success! Response:', {
      success: response.data.success,
      hasToken: !!response.data.token,
      hasUser: !!response.data.user,
      userEmail: response.data.user?.email
    });
    
  } catch (error) {
    console.error('Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

testAPI();
