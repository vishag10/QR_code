const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * POST /api/submissions
 * Public — Visitor submission from the QR code form.
 */
router.post('/', async (req, res) => {
  try {
    const { fullName, phoneNumber } = req.body;

    // Basic presence validation
    if (!fullName || !phoneNumber) {
      return res
        .status(400)
        .json({ message: 'Full name and phone number are required.' });
    }

    // Sanitize inputs
    const cleanName = fullName.trim();
    const cleanPhone = phoneNumber.trim();

    // Create and persist submission
    const submission = new Submission({
      fullName: cleanName,
      phoneNumber: cleanPhone,
    });

    await submission.save();

    res.status(201).json({
      message: 'Thank you! Your details have been submitted successfully.',
      data: {
        id: submission._id,
        fullName: submission.fullName,
        createdAt: submission.createdAt,
      },
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(' ') });
    }
    console.error('Submission save error:', error);
    res.status(500).json({ message: 'Internal server error. Please try again.' });
  }
});

/**
 * GET /api/submissions
 * Protected (JWT required) — Admin dashboard data.
 * Supports optional query params:
 *   ?search=<term>   — searches fullName and phoneNumber
 *   ?limit=<n>       — max records (default: all)
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, limit } = req.query;

    let query = {};

    // Text / phone search filter
    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query = {
        $or: [
          { fullName: { $regex: escaped, $options: 'i' } },
          { phoneNumber: { $regex: escaped, $options: 'i' } },
        ],
      };
    }

    const totalCount = await Submission.countDocuments({});
    const filteredCount = await Submission.countDocuments(query);

    let queryBuilder = Submission.find(query).sort({ createdAt: -1 });

    if (limit && Number(limit) > 0) {
      queryBuilder = queryBuilder.limit(Number(limit));
    }

    const submissions = await queryBuilder.lean();

    res.json({
      totalCount,
      filteredCount,
      data: submissions,
    });
  } catch (error) {
    console.error('Fetch submissions error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
