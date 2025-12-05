# Username Index Fix - Quick Start

## The Problem
```
Error: E11000 duplicate key error
username: null already exists
```

Google OAuth users can't register because MongoDB treats `null` as a duplicate value.

---

## The Solution (3 Steps)

### Step 1: Run Migration Script (2 minutes)

```bash
cd server
node fix-username-index.js
```

**What it does:**
- Drops existing username index
- Creates new sparse unique index
- Allows multiple `username: null` values

### Step 2: Restart Server

```bash
cd server
npm run dev
```

### Step 3: Test Google OAuth

1. Go to your app
2. Click "Continue with Google"
3. Should work without errors ✅

---

## What Changed

### Code Changes
1. ✅ `server/models/User.js` - Added `default: null` to username field
2. ✅ `server/config/passport.js` - Explicitly set `username: null` for Google users
3. ✅ `server/fix-username-index.js` - Migration script created

### Database Changes
- Username index is now **sparse** (allows multiple null values)
- Local users still have unique usernames
- Google OAuth users can have `username: null`

---

## Expected Output

```
🚀 Starting username index fix...
✅ Connected to MongoDB
🗑️  Dropping existing username_1 index...
✅ Dropped username_1 index
🔨 Creating new sparse unique index on username...
✅ Created sparse unique index on username
✅ Username index fix completed successfully!
```

---

## Verification

### Quick Test
```bash
# Should return index with sparse: true
mongo your_connection_string --eval "db.users.getIndexes()"
```

### In Your App
- ✅ New Google users can register
- ✅ Multiple Google users can exist
- ✅ No duplicate key errors
- ✅ Local users still have unique usernames

---

## Troubleshooting

### "MONGODB_URI not found"
→ Check `server/.env` file exists and has `MONGODB_URI`

### "Cannot drop index"
→ Index might not exist or has different name
→ Check with: `db.users.getIndexes()`

### "E11000 duplicate key error" (during migration)
→ You have duplicate usernames (not null)
→ Clean up duplicates first

---

## Manual Fix (If Script Fails)

Using MongoDB shell:
```javascript
use your_database
db.users.dropIndex("username_1")
db.users.createIndex(
  { username: 1 },
  { unique: true, sparse: true, name: "username_1" }
)
```

---

## Files Modified

- `server/models/User.js` - Schema updated
- `server/config/passport.js` - Google OAuth updated
- `server/fix-username-index.js` - Migration script (new)

---

## Need More Help?

See `USERNAME_INDEX_FIX_GUIDE.md` for detailed documentation.

---

**Status:** Ready to run
**Time Required:** 2-3 minutes
**Risk Level:** Low (non-destructive, only updates index)
