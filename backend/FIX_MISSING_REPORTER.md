# Fix Missing reportedBy Field in Issues

## Problem
Issues created without authentication don't have the `reportedBy` field, which causes them not to appear in the user's profile dashboard.

## Solution Options

### Option 1: Run Migration Script (Recommended)

1. Stop the backend server if it's running
2. Run the migration script:
   ```bash
   cd backend
   npx ts-node scripts/fix-issue-reporter.ts
   ```

This will automatically assign all issues without `reportedBy` to the first user in the database.

### Option 2: Manual MongoDB Update

If you want to manually assign issues to a specific user:

1. Get your user ID from MongoDB:
   ```javascript
   // In MongoDB Compass or mongo shell
   db.users.findOne({ email: "your-email@example.com" })
   ```
   Copy the `_id` value (e.g., `68eb7279fa7f71ae1d5e21a5`)

2. Update all issues to belong to that user:
   ```javascript
   db.issues.updateMany(
     { reportedBy: { $exists: false } },
     { $set: { reportedBy: ObjectId("YOUR_USER_ID_HERE") } }
   )
   ```

3. Verify the update:
   ```javascript
   db.issues.find({ reportedBy: ObjectId("YOUR_USER_ID_HERE") }).count()
   ```

### Option 3: Update Specific Issue

To update just the issue you mentioned (PSTest2):

```javascript
db.issues.updateOne(
  { _id: ObjectId("68eb7279fa7f71ae1d5e21a5") },
  { $set: { reportedBy: ObjectId("YOUR_USER_ID_HERE") } }
)
```

## Verification

After running any of the above solutions:

1. Restart the backend server
2. Login to your account
3. Go to the Profile page
4. Check if the issue statistics now show your issues

## Root Cause

The Issue model has `reportedBy` field as optional (`required: false`), which means issues can be created without a user. However, the profile controller only shows issues where `reportedBy` matches the current user's ID.

## Prevention

To prevent this in the future, consider:

1. Making `reportedBy` required in the Issue model
2. Always requiring authentication when creating issues
3. Adding a default user assignment in the issue controller

## Example: Check Your User ID

```javascript
// Find your user
db.users.findOne({ email: "your-email@example.com" })

// Result will show something like:
{
  "_id": ObjectId("68eb7279fa7f71ae1d5e21a5"),
  "name": "John Doe",
  "email": "your-email@example.com",
  ...
}
```

Use this `_id` value for the updates above.
