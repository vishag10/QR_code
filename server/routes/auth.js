const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * POST /api/auth/login
 * Admin authentication — returns JWT on success.
 * Public route — no middleware required.
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: 'Username and password are required.' });
    }

    // Find user (username is stored lowercase)
    const user = await User.findOne({ username: username.trim().toLowerCase() });
    if (!user) {
      // Generic message to prevent user enumeration
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    // Compare password against stored bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    // Sign JWT (24-hour expiry)
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful.',
      token,
      username: user.username,
      expiresIn: 86400, // seconds (24h)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
