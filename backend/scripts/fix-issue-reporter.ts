/**
 * Migration Script: Add reportedBy field to existing issues
 * 
 * This script updates all issues that don't have a reportedBy field.
 * Run this once to fix existing data in the database.
 * 
 * Usage:
 * 1. Make sure backend server is NOT running
 * 2. Run: npx ts-node scripts/fix-issue-reporter.ts
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Issue from '../src/models/Issue';
import User from '../src/models/User';

// Load environment variables
dotenv.config();

async function fixIssueReporters() {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/civichub';
    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database');

    // Find all issues without reportedBy field
    const issuesWithoutReporter = await Issue.find({ 
      reportedBy: { $exists: false } 
    });

    console.log(`\nFound ${issuesWithoutReporter.length} issues without reportedBy field`);

    if (issuesWithoutReporter.length === 0) {
      console.log('✅ All issues already have reportedBy field!');
      await mongoose.connection.close();
      return;
    }

    // Get the first user as default reporter (you can modify this logic)
    const defaultUser = await User.findOne().sort({ createdAt: 1 });
    
    if (!defaultUser) {
      console.log('❌ No users found in database. Please create a user first.');
      await mongoose.connection.close();
      return;
    }

    console.log(`\nUsing default user: ${defaultUser.name} (${defaultUser.email})`);
    console.log('You can manually update specific issues later if needed.\n');

    // Update all issues without reportedBy
    const result = await Issue.updateMany(
      { reportedBy: { $exists: false } },
      { $set: { reportedBy: defaultUser._id } }
    );

    console.log(`✅ Updated ${result.modifiedCount} issues`);
    console.log('\nDetails of updated issues:');
    
    // Show updated issues
    const updatedIssues = await Issue.find({ 
      reportedBy: defaultUser._id 
    }).select('title category status createdAt');

    updatedIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.title} (${issue.category}) - ${issue.status}`);
    });

    console.log('\n✅ Migration completed successfully!');
    console.log('\nNote: If you want to assign specific issues to specific users,');
    console.log('you can update them manually in MongoDB or through the admin panel.');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error during migration:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the migration
fixIssueReporters();
