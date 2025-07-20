const express = require('express');
const router = express.Router();
const axios = require('axios');

const BASEGEEK_URL = process.env.BASEGEEK_URL || 'https://basegeek.clintgeek.com';

/**
 * @route POST /api/auth/login
 * @desc Login user via baseGeek
 * @access Public
 */
router.post('/login', async (req, res, next) => {
  try {
    const { identifier, password, app } = req.body;

    console.log(`Login attempt for user: ${identifier}`);

    // Forward login request to baseGeek
    const response = await axios.post(`${BASEGEEK_URL}/api/auth/login`, {
      identifier,
      password,
      app: app || 'fitnessgeek'
    });

    const { token, refreshToken, user } = response.data;

    console.log(`Login successful for user: ${user.username || user.email}`);

    res.json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          app: user.app
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    } else if (error.response?.status === 429) {
      res.status(429).json({
        success: false,
        error: { message: 'Too many login attempts' }
      });
    } else {
      res.status(500).json({
        success: false,
        error: { message: 'Login failed' }
      });
    }
  }
});

/**
 * @route POST /api/auth/register
 * @desc Register new user via baseGeek
 * @access Public
 */
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password, app } = req.body;

    console.log(`Registration attempt for user: ${username || email}`);

    // Forward registration request to baseGeek
    const response = await axios.post(`${BASEGEEK_URL}/api/auth/register`, {
      username,
      email,
      password,
      app: app || 'fitnessgeek'
    });

    const { token, refreshToken, user } = response.data;

    console.log(`Registration successful for user: ${user.username || user.email}`);

    res.status(201).json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          app: user.app
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);

    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.message || 'Registration failed';
      res.status(400).json({
        success: false,
        error: { message: errorMessage }
      });
    } else {
      res.status(500).json({
        success: false,
        error: { message: 'Registration failed' }
      });
    }
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication token required' }
      });
    }

    // Get user profile from baseGeek
    const response = await axios.get(`${BASEGEEK_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    res.json({
      success: true,
      data: {
        user: response.data.user
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get current user error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get user profile' }
    });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Logout user (client-side token removal)
 * @access Public
 */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;