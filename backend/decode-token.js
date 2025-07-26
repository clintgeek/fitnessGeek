const jwt = require('jsonwebtoken');

// JWT secret - should match baseGeek's secret
const JWT_SECRET = 'e96335fedffb854e850eef650989f75e1c577bb1e0e95921901e726e951fd58f1f511f0c8aafe9e6657f854f09d9ff3ec35877a3027220766b4b063bb70d0654';

// Get token from command line argument
const token = process.argv[2];

if (!token) {
  console.log('Usage: node decode-token.js <token>');
  process.exit(1);
}

try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('Decoded token:');
  console.log(JSON.stringify(decoded, null, 2));
} catch (error) {
  console.error('Error decoding token:', error.message);
}