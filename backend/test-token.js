const jwt = require('jsonwebtoken');

// JWT secret (must match baseGeek's secret)
const JWT_SECRET = 'e96335fedffb854e850eef650989f75e1c577bb1e0e95921901e726e951fd58f1f511f0c8aafe9e6657f854f09d9ff3ec35877a3027220766b4b063bb70d0654';

// Test user data
const testUser = {
  id: '507f1f77bcf86cd799439011', // Test user ID
  email: 'test@example.com',
  username: 'testuser'
};

// Generate token
const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '24h' });

console.log('Test JWT Token:');
console.log(token);
console.log('\nUse this token in your API tests:');
console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3001/api/foods`);