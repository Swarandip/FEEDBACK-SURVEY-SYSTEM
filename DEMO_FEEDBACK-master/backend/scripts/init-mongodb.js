/**
 * MongoDB Initialization Script
 * Verifies connection and lists collections.
 * Run from backend: node scripts/init-mongodb.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/feedback_survey_system';

async function init() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const names = collections.map((c) => c.name);
    console.log('Collections:', names.length ? names.join(', ') : '(none yet - will be created on first use)');

    await mongoose.disconnect();
    console.log('✅ Init complete. Run "npm run seed" to populate sample data.');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('\nMake sure MongoDB is installed and running:');
    console.log('  - Windows: net start MongoDB');
    console.log('  - Linux/Mac: sudo systemctl start mongod (or: mongod)');
    process.exit(1);
  }
}

init();
