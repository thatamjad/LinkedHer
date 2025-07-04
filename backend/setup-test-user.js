/**
 * This script creates a test user that can be used for development purposes
 * Run it with: node setup-test-user.js
 */

console.log('Creating test user...');
require('./utils/createTestUser');
console.log('If successful, you can now use the test login at: /api/auth/test-login');
console.log('Or login with:');
console.log('Email: testuser@auraconnect.com');
console.log('Password: TestPassword123!'); 