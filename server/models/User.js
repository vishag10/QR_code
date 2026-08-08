const mongoose = require('mongoose');

/**
 * User Schema
 * Stores admin users. Passwords are stored as bcrypt hashes.
 * Never store plain-text passwords.
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required.'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters.'],
      maxlength: [30, 'Username cannot exceed 30 characters.'],
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      // Note: Always store bcrypt hash — never plain text.
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('User', userSchema);
