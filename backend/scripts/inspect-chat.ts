import connectDB from '../src/config/database';
import mongoose from 'mongoose';
import ChatHistory from '../src/models/ChatHistory';

const run = async () => {
  try {
    await connectDB();
    console.log('Connected to DB for inspect');

    const items = await ChatHistory.find().sort({ createdAt: -1 }).limit(20).lean();
    console.log(`Found ${items.length} chat history documents (most recent first):`);

    for (const doc of items) {
      console.log('---');
      console.log('sessionId:', doc.sessionId);
      console.log('userId:', doc.userId);
      console.log('messages:');
      for (const m of doc.messages) {
        console.log(`  [${m.role}] ${m.content}`);
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Inspect failed', err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
};

run();
