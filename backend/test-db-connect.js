// Quick DB connectivity test script
require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crud';

(async () => {
  try {
    console.log('Attempting to connect to MongoDB at', uri);
    const conn = await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB:', conn.connection.host);
    console.log('📛 Database:', conn.connection.name);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:', err.message || err);
    process.exit(1);
  }
})();
