# Troubleshooting: Profile Statistics Not Showing

## Problem
The pie chart and issue counts are not showing in the user profile page.

## Root Cause
Issues in your database don't have the `reportedBy` field, so the profile API can't find them when filtering by user ID.

## Step-by-Step Solution

### Step 1: Check Your Database

Run this script to diagnose the issue:

```bash
cd backend
npx ts-node scripts/check-issue-reporters.ts
```

This will show you:
- How many issues exist in total
- How many have the `reportedBy` field
- How many are missing it
- List of problematic issues
- All users in the database
- Issues count per user

### Step 2: Fix Missing reportedBy Fields

#### Option A: Automatic Fix (Recommended)

```bash
cd backend
npx ts-node scripts/fix-issue-reporter.ts
```

This will automatically assign all issues without `reportedBy` to the first user in your database.

#### Option B: Manual Fix via MongoDB

1. **Find your User ID:**
   - Open MongoDB Compass
   - Browse to your database → `users` collection
   - Find your user and copy the `_id` value

2. **Update all issues:**
   ```javascript
   // In MongoDB Compass or mongo shell
   db.issues.updateMany(
     { reportedBy: { $exists: false } },
     { $set: { reportedBy: ObjectId("YOUR_USER_ID_HERE") } }
   )
   ```

3. **Verify:**
   ```javascript
   db.issues.find({ reportedBy: ObjectId("YOUR_USER_ID_HERE") }).count()
   ```

#### Option C: Fix Specific Issue

For the PSTest2 issue specifically:

```javascript
db.issues.updateOne(
  { _id: ObjectId("68eb7279fa7f71ae1d5e21a5") },
  { $set: { reportedBy: ObjectId("YOUR_USER_ID_HERE") } }
)
```

### Step 3: Verify in Browser

1. **Open Browser Console** (F12)
2. **Navigate to Profile page**
3. **Check console logs** - You should see:
   ```
   Profile API Response: {success: true, data: {...}}
   User Stats: {totalIssues: X, totalCommunities: Y, ...}
   ```

4. **Expected Behavior:**
   - If `totalIssues > 0`: Pie chart and statistics cards appear
   - If `totalIssues === 0`: Empty state with "No Issues Reported Yet" message

### Step 4: Test the Complete Flow

1. **Login** to your account
2. **Go to Profile page**
3. **Verify you see:**
   - ✅ Your user information in header
   - ✅ Badge showing "X Issues Reported"
   - ✅ Pie chart (if you have issues)
   - ✅ Statistics cards showing Pending/In Progress/Resolved counts
   - ✅ Recent activity list

## What Was Fixed

### Backend Changes

1. **Profile Controller** (`backend/src/controllers/profileController.ts`)
   - Changed from `createdBy` to `reportedBy` (line 25, 32, 175)
   - Now correctly queries issues by the `reportedBy` field

### Frontend Changes

2. **Profile Page** (`frontend/src/pages/Profile.tsx`)
   - Added console logging for debugging
   - Added empty state for when totalIssues === 0
   - Better error handling
   - Shows "No Issues Reported Yet" with CTA button

### Scripts Created

3. **Check Script** (`backend/scripts/check-issue-reporters.ts`)
   - Diagnoses database issues
   - Shows which issues are missing reportedBy

4. **Fix Script** (`backend/scripts/fix-issue-reporter.ts`)
   - Automatically fixes missing reportedBy fields
   - Assigns issues to first user

## Common Issues & Solutions

### Issue: "Profile API Response: undefined"
**Solution:** Backend server is not running or wrong API URL
```bash
cd backend
npm run dev
```

### Issue: "User Stats: {totalIssues: 0, ...}"
**Solution:** No issues assigned to your user - run the fix script

### Issue: "401 Unauthorized"
**Solution:** Token expired or invalid - logout and login again

### Issue: Pie chart shows but no data
**Solution:** Check if issuesByStatus object is populated:
```javascript
// In browser console
console.log(userStats.issuesByStatus)
// Should show: {pending: X, 'in-progress': Y, resolved: Z}
```

## Prevention for Future

To prevent this issue from happening again:

### 1. Make reportedBy Required (Optional Enhancement)

Edit `backend/src/models/Issue.ts`:

```typescript
reportedBy: {
  type: Schema.Types.ObjectId,
  ref: 'User',
  required: true, // Change from false to true
},
```

### 2. Always Use Authentication When Creating Issues

Make sure users are logged in before they can report issues.

### 3. Add Validation in Frontend

Check if user is authenticated before showing the report form.

## Quick Test

After fixing, test with these steps:

1. **Create a new test issue:**
   - Go to Report page
   - Fill in all fields
   - Submit issue

2. **Check Profile:**
   - Navigate to Profile
   - Verify count increased
   - Check pie chart updated

3. **Verify in Console:**
   ```javascript
   // Should show your stats
   localStorage.getItem('jan_awaaz_token') // Token exists
   ```

## Need More Help?

If issues persist, check:
1. Browser console for errors
2. Backend terminal for API errors
3. MongoDB data using check script
4. Network tab in DevTools for API responses

## Summary

The profile statistics weren't showing because:
- ❌ Issues didn't have `reportedBy` field
- ❌ Profile API couldn't find user's issues
- ✅ Fixed by updating profile controller
- ✅ Fixed by adding reportedBy to existing issues
- ✅ Added better error handling and empty states
