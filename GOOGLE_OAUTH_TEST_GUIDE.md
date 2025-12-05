# Google OAuth Fix - Testing Guide

## Quick Test Instructions

### Prerequisites
1. Server is running (backend)
2. Client is running (frontend)
3. Google OAuth credentials are configured in `.env` files

### Test Case 1: New Google User (First Time Login)
**Expected Result:** ✅ Account created successfully

1. Open the application in browser
2. Navigate to login page
3. Click "Continue with Google" button
4. Select a Google account that has **never** been used with this app
5. Complete Google authentication
6. **Expected:** Redirected to dashboard, logged in successfully
7. **Verify:** Check that user appears in database with `authProvider: 'google'`

---

### Test Case 2: Existing Local User Switches to Google
**Expected Result:** ✅ Accounts linked, no duplicate error

**Setup:**
1. Register a new account with email/password
   - Email: `testuser@example.com`
   - Username: `testuser`
   - Password: `password123`
2. Log out

**Test:**
1. Click "Continue with Google"
2. Select the Google account with email `testuser@example.com` (same email as registered)
3. Complete Google authentication
4. **Expected:** 
   - ✅ No "Username already exists" error
   - ✅ No "DUPLICATE_FIELD" error
   - ✅ Successfully logged in
   - ✅ Redirected to dashboard

**Verify in Database:**
```javascript
// User document should now have:
{
  username: "testuser",        // Preserved
  email: "testuser@example.com",
  googleId: "123456789...",    // Added
  authProvider: "google",      // Changed from 'local'
  password: undefined,         // Removed
  displayName: "Test User",    // From Google
  avatar: "https://..."        // From Google
}
```

---

### Test Case 3: Returning Google User
**Expected Result:** ✅ Login successful

**Prerequisites:** Complete Test Case 1 or 2 first

1. Log out from the application
2. Click "Continue with Google"
3. Select the same Google account used before
4. **Expected:**
   - ✅ Logged in immediately
   - ✅ No errors
   - ✅ Profile information updated if changed on Google

---

### Test Case 4: Local User After Switching to Google
**Expected Result:** ✅ Cannot login with password anymore

**Prerequisites:** Complete Test Case 2 first

1. Try to log in with the original username/password
2. **Expected:**
   - ❌ Login fails
   - Error message: "This account uses google authentication. Please login with google."

---

## Troubleshooting

### Error: "OAuth failed"
**Cause:** Google OAuth credentials not configured or callback URL mismatch

**Solution:**
1. Check `server/.env` has correct `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
2. Check `client/.env` has correct `VITE_GOOGLE_CLIENT_ID`
3. Verify callback URL in Google Cloud Console matches your backend URL

### Error: "No email found in Google profile"
**Cause:** Google account doesn't have email permission

**Solution:**
1. Check that OAuth scope includes 'email'
2. Verify in `server/routes/auth.js` that scope includes `['profile', 'email']`

### Error: Still getting "DUPLICATE_FIELD"
**Cause:** Changes not deployed or server not restarted

**Solution:**
1. Restart the server: `npm run dev` (in server directory)
2. Clear browser cache
3. Try again

---

## Database Verification Queries

### Check User After Google Login
```javascript
// In MongoDB shell or Compass
db.users.findOne({ email: "testuser@example.com" })
```

### Find All Google Users
```javascript
db.users.find({ authProvider: "google" })
```

### Find Users Who Switched from Local to Google
```javascript
db.users.find({ 
  authProvider: "google",
  username: { $exists: true }
})
```

---

## Success Criteria

All tests pass when:
- ✅ New Google users can register
- ✅ Existing local users can switch to Google without errors
- ✅ Returning Google users can log in
- ✅ No "DUPLICATE_FIELD" errors occur
- ✅ Account linking works seamlessly
- ✅ User data is preserved during account linking

---

## Quick Commands

### Start Server
```bash
cd server
npm run dev
```

### Start Client
```bash
cd client
npm run dev
```

### Check Server Logs
Watch for any errors during Google OAuth flow:
```
Google OAuth error: [error details]
```

### Test OAuth Endpoint
```bash
# Check if OAuth endpoint is accessible
curl http://localhost:5000/api/auth/google
# Should redirect to Google
```
