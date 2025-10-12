import connectDB from '../src/config/database';
import mongoose from 'mongoose';
import User from '../src/models/User';
import Issue from '../src/models/Issue';

const run = async () => {
  try {
    await connectDB();
    console.log('Connected for issue model test');

    // Create a temporary user
    const tempEmail = `test.user.${Date.now()}@example.com`;
    const user = await User.create({ name: 'Test User', email: tempEmail, password: 'password123' });
    console.log('Created temp user:', user._id.toString());

    // Create an issue
    const issue = await Issue.create({
      title: 'Test pothole',
      description: 'There is a test pothole on the road',
      category: 'pothole',
      priority: 'medium',
      location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Test Address' },
      reportedBy: user._id,
      images: [],
    } as any);

    console.log('Created issue:', issue._id.toString());

    // Read it back
    const found = await Issue.findById(issue._id).lean();
    console.log('Found issue title:', found?.title);

    // Update status
    const updated = await Issue.findByIdAndUpdate(issue._id, { status: 'in-progress' }, { new: true });
    console.log('Updated status to:', updated?.status);

    // Delete
    await Issue.findByIdAndDelete(issue._id);
    console.log('Deleted issue');

    // Cleanup user
    await User.findByIdAndDelete(user._id);
    console.log('Deleted temp user');

    await mongoose.disconnect();
    console.log('Disconnected after test');
    process.exit(0);
  } catch (err) {
    console.error('Issue model test failed:', err);
    try { await mongoose.disconnect(); } catch {};
    process.exit(1);
  }
};

run();
