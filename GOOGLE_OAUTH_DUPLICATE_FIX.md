# Google OAuth Duplicate Field Error - Fix Summary

## Problem
When users attempted to sign in with Google OAuth, they encountered this error:
```json
{
  "error": {
    "message": "Username already exists",
    "code": "DUPLICATE_FIELD"
  }
}
```

This occurred when:
1. A user registered with email/password (local auth) first
2. Later tried to log in with Google OAuth using the same email
3. The system attempted to link the Google account to the existing user
4. MongoDB threw a duplicate key error on the `username` field

## Root Cause
In `server/config/passport.js`, when linking a Google account to an existing local user:
- The code used `user.save()` which triggered Mongoose validation
- The `username` field has a `unique: true` constraint
- Even though the username wasn't changing, MongoDB's unique index validation was triggered
- This caused a duplicate field error

## Solution
Changed the account linking logic in `server/config/passport.js` to use `User.updateOne()` instead of `user.save()`:

```javascript
// OLD CODE (caused error):
user.googleId = id;
user.authProvider = 'google';
user.password = undefined;
await user.save(); // ❌ Triggers validation on username

// NEW CODE (fixed):
await User.updateOne(
  { _id: user._id },
  {
    $set: {
      googleId: id,
      authProvider: 'google',
      displayName: displayName || user.displayName,
      avatar: avatar || user.avatar
    },
    $unset: { password: '' }
  }
);
user = await User.findById(user._id); // ✅ Fetch updated user
```

## What This Fix Does

### For New Google Users
- Creates a new account with Google profile information
- No username required (only for local auth)
- Works as expected ✅

### For Existing Local Users Switching to Google
- Finds existing user by email
- Links Google ID to the account
- Switches `authProvider` from 'local' to 'google'
- Removes password (no longer needed)
- **Keeps the username** (for data consistency)
- Updates display name and avatar from Google profile
- Uses direct MongoDB update to bypass validation ✅

### For Returning Google Users
- Finds user by Google ID
- Updates profile information if changed
- Logs them in successfully ✅

## Testing the Fix

### Manual Testing Steps

1. **Test Scenario 1: New Google User**
   - Go to login page
   - Click "Continue with Google"
   - Select a Google account that hasn't been used before
   - Should successfully create account and log in ✅

2. **Test Scenario 2: Existing Local User → Google Login**
   - Register with email/password (e.g., test@example.com)
   - Log out
   - Click "Continue with Google"
   - Use the same email (test@example.com)
   - Should successfully link accounts and log in ✅
   - No duplicate field error ✅

3. **Test Scenario 3: Returning Google User**
   - After completing Scenario 1 or 2
   - Log out
   - Click "Continue with Google" again
   - Should log in without any errors ✅

### Expected Behavior
- ✅ No "Username already exists" error
- ✅ No "DUPLICATE_FIELD" error
- ✅ Smooth account linking for existing users
- ✅ Returning users can log in normally

## Files Modified
- `server/config/passport.js` - Updated Google OAuth strategy to use `updateOne()` for account linking

## Database Impact
- Existing users are not affected
- Users who previously had errors can now log in successfully
- Username field is preserved when linking accounts
- Password field is properly removed when switching to Google auth

## Additional Notes
- The `username` field remains in the database for users who switch from local to Google auth
- This is intentional for data consistency and doesn't cause issues
- The `authProvider` field correctly indicates which authentication method is active
- Users cannot log in with password after switching to Google (password is removed)
