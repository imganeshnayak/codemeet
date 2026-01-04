/**
 * Database Check Script
 * 
 * This script checks if your issues have the reportedBy field
 * and shows which issues are missing it.
 * 
 * Usage: npx ts-node scripts/check-issue-reporters.ts
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Issue from '../src/models/Issue';
import User from '../src/models/User';

dotenv.config();

async function checkIssueReporters() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/civichub';
    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database\n');

    // Count total issues
    const totalIssues = await Issue.countDocuments();
    console.log(`📊 Total Issues in Database: ${totalIssues}`);

    // Count issues with reportedBy
    const issuesWithReporter = await Issue.countDocuments({ reportedBy: { $exists: true, $ne: null } });
    console.log(`✅ Issues with reportedBy: ${issuesWithReporter}`);

    // Count issues without reportedBy
    const issuesWithoutReporter = await Issue.countDocuments({ reportedBy: { $exists: false } });
    console.log(`❌ Issues without reportedBy: ${issuesWithoutReporter}\n`);

    if (issuesWithoutReporter > 0) {
      console.log('📋 Issues missing reportedBy field:');
      console.log('─'.repeat(80));
      
      const problematicIssues = await Issue.find({ reportedBy: { $exists: false } })
        .select('_id title category status createdAt')
        .limit(10);

      problematicIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.title}`);
        console.log(`   ID: ${issue._id}`);
        console.log(`   Category: ${issue.category} | Status: ${issue.status}`);
        console.log(`   Created: ${issue.createdAt}`);
        console.log();
      });

      if (issuesWithoutReporter > 10) {
        console.log(`... and ${issuesWithoutReporter - 10} more\n`);
      }

      console.log('💡 To fix this, run: npx ts-node scripts/fix-issue-reporter.ts\n');
    }

    // Show user information
    console.log('\n👥 Users in Database:');
    console.log('─'.repeat(80));
    const users = await User.find().select('_id name email').limit(5);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   ID: ${user._id}\n`);
    });

    // Show issues per user
    console.log('\n📈 Issues per User:');
    console.log('─'.repeat(80));
    const issuesByUser = await Issue.aggregate([
      { $match: { reportedBy: { $exists: true, $ne: null } } },
      { $group: { _id: '$reportedBy', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { userName: '$user.name', userEmail: '$user.email', count: 1 } },
      { $sort: { count: -1 } },
    ]);

    if (issuesByUser.length === 0) {
      console.log('No issues assigned to any user yet.\n');
    } else {
      issuesByUser.forEach((item, index) => {
        console.log(`${index + 1}. ${item.userName} (${item.userEmail}): ${item.count} issues`);
      });
    }

    console.log('\n✨ Check complete!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

checkIssueReporters();
