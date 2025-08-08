const jwt = require('jsonwebtoken');

// Test JWT token validation
const JWT_SECRET = 'e96335fedffb854e850eef650989f75e1c577bb1e0e95921901e726e951fd58f1f511f0c8aafe9e6657f854f09d9ff3ec35877a3027220766b4b063bb70d0654';

// Create a test token
const testPayload = {
  id: 'test-user-123',
  email: 'test@example.com',
  username: 'testuser'
};

try {
  // Create a token
  const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '1h' });
  console.log('✅ Created test token:', token.substring(0, 50) + '...');
  
  // Verify the token
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('✅ Token verified successfully:', decoded);
  
  // Test with a sample token from localStorage (if available)
  console.log('\n🔍 Testing with actual geek_token from localStorage...');
  console.log('You can test this by copying a token from your browser\'s localStorage and pasting it here');
  
} catch (error) {
  console.error('❌ JWT test failed:', error.message);
}