// Test script to verify the newly created test accounts
const axios = require('axios');

async function testNewAccounts() {
  const accounts = [
    {
      email: 'testuser@linker.com',
      password: 'TestPassword123!'
    },
    {
      email: 'demo@linker.com',
      password: 'TestPassword123!'
    }
  ];

  for (const account of accounts) {
    try {
      console.log(`\n🔐 Testing login for: ${account.email}`);
      
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: account.email,
        password: account.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Login successful!', {
        status: response.status,
        hasToken: !!response.data.token,
        hasUser: !!response.data.user,
        userEmail: response.data.user?.email,
        userId: response.data.user?.id
      });
      
    } catch (error) {
      console.error(`❌ Login failed for ${account.email}:`, {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        details: error.response?.data
      });
    }
  }
}

if (require.main === module) {
  testNewAccounts();
}
