# Username Index Fix - Complete Guide

## Problem

MongoDB treats `username: null` as a duplicate key when multiple Google OAuth users try to register. This happens because the unique index on the username field doesn't allow multiple null values by default.

**Error Message:**
```
E11000 duplicate key error collection: users index: username_1 dup key: { username: null }
```

## Solution

Use a **sparse unique index** on the username field. A sparse index only includes documents where the field exists and has a non-null value. This allows multiple users to have `username: null` without triggering duplicate key errors.

---

## Changes Applied

### 1. ✅ User Model Updated
**File:** `server/models/User.js`

Added explicit `default: null` and clarified the sparse index:

```javascript
username: {
  type: String,
  required: function() {
    return this.authProvider === 'local';
  },
  unique: true,
  sparse: true, // Allows multiple null values without duplicate key error
  trim: true,
  minlength: [3, 'Username must be at least 3 characters long'],
  maxlength: [30, 'Username cannot exceed 30 characters'],
  default: null // Explicitly set default to null for Google OAuth users
}
```

### 2. ✅ Passport Configuration Updated
**File:** `server/config/passport.js`

Explicitly set `username: null` for Google OAuth users:

```javascript
user = new User({
  googleId: id,
  email,
  displayName: displayName || email.split('@')[0],
  avatar,
  authProvider: 'google',
  username: null // Explicitly set to null for clarity
});
```

### 3. ✅ Migration Script Created
**File:** `server/fix-username-index.js`

Script to drop and recreate the username index as sparse.

---

## How to Apply the Fix

### Step 1: Run the Migration Script

This script will drop the existing username index and recreate it as a sparse unique index.

```bash
cd server
node fix-username-index.js
```

**Expected Output:**
```
🚀 Starting username index fix...

🔄 Connecting to MongoDB...
✅ Connected to MongoDB

📋 Current indexes:
  - _id_: {"_id":1}
  - username_1: {"username":1} (unique)
  - email_1: {"email":1} (unique)
  - googleId_1: {"googleId":1} (unique) (sparse)

🔍 Found username_1 index
⚠️  Index is NOT sparse - needs to be recreated

🗑️  Dropping existing username_1 index...
✅ Dropped username_1 index

🔨 Creating new sparse unique index on username...
✅ Created sparse unique index on username

📋 Updated indexes:
  - _id_: {"_id":1}
  - email_1: {"email":1} (unique)
  - googleId_1: {"googleId":1} (unique) (sparse)
  - username_1: {"username":1} (unique) (sparse)

🔍 Checking for users with null usernames...
   Found 2 user(s) with null username
   Found 2 Google OAuth user(s)

✅ Username index fix completed successfully!

📝 Summary:
   - Username field now has sparse unique index
   - Multiple users can have username: null
   - Google OAuth users will not trigger duplicate key errors
   - Local users still have unique username requirement

🔌 Disconnected from MongoDB
```

### Step 2: Restart Your Server

After running the migration, restart your server:

```bash
cd server
npm run dev
```

### Step 3: Test Google OAuth

1. Try logging in with Google
2. Should work without duplicate key errors
3. Multiple Google users can now register

---

## Verification

### Check the Index in MongoDB

If you have MongoDB Compass or mongo shell access:

```javascript
// Connect to your database
use your_database_name

// List all indexes on users collection
db.users.getIndexes()

// Look for username_1 index - should show:
{
  "v": 2,
  "key": { "username": 1 },
  "name": "username_1",
  "unique": true,
  "sparse": true  // ← This should be present
}
```

### Test Scenarios

#### ✅ Scenario 1: New Google User
```javascript
// Should succeed
{
  email: "user1@gmail.com",
  googleId: "123456",
  authProvider: "google",
  username: null
}
```

#### ✅ Scenario 2: Another Google User
```javascript
// Should also succeed (multiple null usernames allowed)
{
  email: "user2@gmail.com",
  googleId: "789012",
  authProvider: "google",
  username: null
}
```

#### ✅ Scenario 3: Local User
```javascript
// Should succeed (unique username)
{
  email: "user3@example.com",
  username: "john_doe",
  authProvider: "local"
}
```

#### ❌ Scenario 4: Duplicate Username
```javascript
// Should fail (duplicate username not allowed)
{
  email: "user4@example.com",
  username: "john_doe", // ← Same as above
  authProvider: "local"
}
// Error: E11000 duplicate key error (username)
```

---

## Troubleshooting

### Error: "Cannot drop index username_1"

**Cause:** Index doesn't exist or has a different name

**Solution:**
1. Check existing indexes:
   ```javascript
   db.users.getIndexes()
   ```
2. Find the username index name
3. Update the script if needed

### Error: "E11000 duplicate key error"

**Cause:** You have multiple users with the same username (not null)

**Solution:**
1. Find duplicate usernames:
   ```javascript
   db.users.aggregate([
     { $match: { username: { $ne: null } } },
     { $group: { _id: "$username", count: { $sum: 1 } } },
     { $match: { count: { $gt: 1 } } }
   ])
   ```
2. Clean up duplicates manually
3. Run the migration script again

### Error: "MONGODB_URI not found"

**Cause:** Environment variables not loaded

**Solution:**
1. Ensure `.env` file exists in `server/` directory
2. Check that `MONGODB_URI` is set in `.env`
3. Run from the `server/` directory

### Migration Script Doesn't Run

**Cause:** ES modules not configured

**Solution:**
1. Check `server/package.json` has `"type": "module"`
2. Or rename script to `fix-username-index.mjs`

---

## Manual Fix (Alternative)

If you prefer to fix manually using MongoDB shell or Compass:

### Using MongoDB Shell

```javascript
// Connect to your database
use your_database_name

// Drop the existing index
db.users.dropIndex("username_1")

// Create new sparse unique index
db.users.createIndex(
  { username: 1 },
  { unique: true, sparse: true, name: "username_1" }
)

// Verify
db.users.getIndexes()
```

### Using MongoDB Compass

1. Connect to your database
2. Select the `users` collection
3. Go to the "Indexes" tab
4. Find `username_1` index
5. Click "Drop Index"
6. Click "Create Index"
7. Set:
   - Field: `username`
   - Type: `1` (ascending)
   - Options: Check "unique" and "sparse"
   - Name: `username_1`
8. Click "Create"

---

## Production Deployment

### For Render/Heroku/Railway

1. **Run migration locally first** (recommended)
2. **Or** add migration to deployment script:

```json
// package.json
{
  "scripts": {
    "start": "node server.js",
    "migrate": "node fix-username-index.js",
    "deploy": "npm run migrate && npm start"
  }
}
```

### For MongoDB Atlas

1. Run the migration script from your local machine
2. It will connect to Atlas using your `MONGODB_URI`
3. Changes apply immediately to production database

**⚠️ Warning:** Always backup your database before running migrations in production!

---

## Rollback Plan

If something goes wrong:

### Restore Original Index

```javascript
// Drop the sparse index
db.users.dropIndex("username_1")

// Create non-sparse unique index (original)
db.users.createIndex(
  { username: 1 },
  { unique: true, name: "username_1" }
)
```

**Note:** This will fail if you have multiple users with `username: null`

---

## Testing Checklist

After applying the fix:

- [ ] Migration script runs successfully
- [ ] Server starts without errors
- [ ] Can register new local user with username
- [ ] Can register new Google OAuth user (no username)
- [ ] Can register multiple Google OAuth users
- [ ] Cannot register duplicate usernames (local users)
- [ ] Existing users can still log in
- [ ] No duplicate key errors in logs

---

## Summary

**What Changed:**
- ✅ User model explicitly sets `username: null` for Google OAuth users
- ✅ Passport config explicitly sets `username: null` when creating Google users
- ✅ Migration script drops and recreates username index as sparse

**Result:**
- ✅ Multiple Google OAuth users can exist with `username: null`
- ✅ Local users still have unique username requirement
- ✅ No duplicate key errors for Google OAuth login

**Time to Apply:** 2-3 minutes

---

## Support

If you encounter issues:

1. Check MongoDB logs for detailed error messages
2. Verify your MongoDB version supports sparse indexes (MongoDB 2.6+)
3. Ensure you have proper permissions to drop/create indexes
4. Review the migration script output for specific errors

---

**Last Updated:** December 5, 2024
