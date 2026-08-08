const mongoose = require('mongoose');

/**
 * Submission Schema
 * Stores visitor exhibition form entries.
 * Timestamps (createdAt, updatedAt) are auto-managed by Mongoose.
 */
const submissionSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required.'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters.'],
      maxlength: [100, 'Full name cannot exceed 100 characters.'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required.'],
      trim: true,
      match: [
        /^[6-9]\d{9}$/,
        'Please enter a valid 10-digit phone number starting with 6-9.',
      ],
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
    versionKey: false,
  }
);

// Index for faster admin searches on name and phone
submissionSchema.index({ fullName: 'text', phoneNumber: 1 });
submissionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Submission', submissionSchema);
