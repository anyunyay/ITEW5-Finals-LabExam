# Google OAuth Production Setup

## Update Google Cloud Console for Production

### Your Production URLs:
```
Frontend: https://itew-5-finals-lab-exam.vercel.app
Backend:  https://sports-pwa-backend.onrender.com
```

---

## Step-by-Step Instructions

### Step 1: Access Google Cloud Console

1. Go to https://console.cloud.google.com/
2. Sign in with your Google account
3. Select your project (or the project where you created OAuth credentials)

### Step 2: Navigate to Credentials

1. Click the hamburger menu (☰) in the top left
2. Go to **APIs & Services**
3. Click **Credentials**

### Step 3: Edit OAuth 2.0 Client ID

1. Find your OAuth 2.0 Client ID in the list
2. Click the **pencil icon** (✏️) to edit
3. Or click the name to open details

### Step 4: Update Authorized JavaScript Origins

In the **Authorized JavaScript origins** section:

**Add these URLs:**
```
https://itew-5-finals-lab-exam.vercel.app
```

**Keep these for local development:**
```
http://localhost:5173
http://localhost:3000
```

**Final list should include:**
- `http://localhost:5173` (development)
- `http://localhost:3000` (development)
- `https://itew-5-finals-lab-exam.vercel.app` (production)

### Step 5: Update Authorized Redirect URIs

In the **Authorized redirect URIs** section:

**Add these URLs:**
```
https://sports-pwa-backend.onrender.com/api/auth/google/callback
```

**Keep these for local development:**
```
http://localhost:5000/api/auth/google/callback
```

**Final list should include:**
- `http://localhost:5000/api/auth/google/callback` (development)
- `https://sports-pwa-backend.onrender.com/api/auth/google/callback` (production)

### Step 6: Save Changes

1. Click **Save** at the bottom
2. **Wait 5-10 minutes** for changes to propagate globally
3. Google's servers need time to update

---

## Verification

After waiting 5-10 minutes, test the OAuth flow:

1. Visit: https://itew-5-finals-lab-exam.vercel.app
2. Click **"Continue with Google"**
3. Should redirect to Google login
4. After authorization, should redirect back to your app
5. Should be logged in successfully

---

## Troubleshooting

### Error: redirect_uri_mismatch

**Full Error:**
```
Error: redirect_uri_mismatch
The redirect URI in the request: https://sports-pwa-backend.onrender.com/api/auth/google/callback
does not match the ones authorized for the OAuth client.
```

**Solution:**
1. Copy the exact URL from the error message
2. Go back to Google Cloud Console
3. Add that exact URL to Authorized redirect URIs
4. Make sure there are no typos
5. No trailing slashes
6. Save and wait 5 minutes

### Error: origin_mismatch

**Solution:**
1. Check Authorized JavaScript origins
2. Add your frontend URL exactly: `https://itew-5-finals-lab-exam.vercel.app`
3. No trailing slash
4. Save and wait 5 minutes

### OAuth Still Not Working After 10 Minutes

**Check:**
1. URLs are exactly correct (no typos)
2. No trailing slashes
3. HTTPS (not HTTP) for production URLs
4. Client ID and Secret are correct in Render
5. Backend `GOOGLE_CALLBACK_URL` matches Google Console
6. Frontend `CLIENT_URL` in backend matches frontend URL

---

## Final Configuration Summary

### Google Cloud Console:

**Authorized JavaScript origins:**
- `http://localhost:5173`
- `https://itew-5-finals-lab-exam.vercel.app`

**Authorized redirect URIs:**
- `http://localhost:5000/api/auth/google/callback`
- `https://sports-pwa-backend.onrender.com/api/auth/google/callback`

### Render Environment Variables:

```
GOOGLE_CLIENT_ID=697126848110-hut8gcdo9u6m89d51cegv13splniabie.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://sports-pwa-backend.onrender.com/api/auth/google/callback
CLIENT_URL=https://itew-5-finals-lab-exam.vercel.app
```

---

## Testing Checklist

- [ ] Google Cloud Console updated
- [ ] Waited 5-10 minutes
- [ ] Visited frontend URL
- [ ] Clicked "Continue with Google"
- [ ] Redirected to Google login
- [ ] Authorized the app
- [ ] Redirected back to app
- [ ] Successfully logged in
- [ ] No errors in console

---

**After completing these steps, your Google OAuth will work in production! 🎉**
