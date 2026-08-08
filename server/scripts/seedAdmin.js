/**
 * seedAdmin.js
 * ─────────────────────────────────────────────────────────
 * One-time script to create the initial admin user.
 * Run with: npm run seed
 *
 * Credentials:
 *   Username : nandhan
 *   Password : Nandhan@123
 *
 * Safe to run multiple times — skips if user already exists.
 */

// DNS fix: use Google's public DNS to resolve MongoDB Atlas SRV records
require('dns').setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ADMIN_USERNAME = 'nandhan';
const ADMIN_PASSWORD = 'Nandhan@123';
const BCRYPT_ROUNDS = 12;

async function seedAdmin() {
  try {
    console.log('🔗  Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅  Connected to MongoDB');

    // Check if admin already exists
    const existing = await User.findOne({ username: ADMIN_USERNAME });
    if (existing) {
      console.log(
        `ℹ️   Admin user "${ADMIN_USERNAME}" already exists. No changes made.`
      );
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash password with bcrypt
    console.log(`🔒  Hashing password with ${BCRYPT_ROUNDS} salt rounds...`);
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // Create admin document
    await User.create({
      username: ADMIN_USERNAME,
      password: hashedPassword,
    });

    console.log('');
    console.log('✅  Admin user created successfully!');
    console.log('───────────────────────────────');
    console.log(`   Username : ${ADMIN_USERNAME}`);
    console.log(`   Password : ${ADMIN_PASSWORD}`);
    console.log('───────────────────────────────');
    console.log('⚠️   Change the password after first login in production.\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌  Error seeding admin:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedAdmin();
