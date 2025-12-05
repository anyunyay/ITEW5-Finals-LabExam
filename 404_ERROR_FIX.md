# 404 NOT_FOUND Error - Fix Guide

## Error Details
```
404: NOT_FOUND
Code: NOT_FOUND
ID: hkg1::xsrpq-1764934923148-31cd1507c780
```

This error indicates the frontend cannot reach the backend API.

---

## Root Causes Identified

### 1. ❌ Hardcoded localhost URL in RegisterPage
**File:** `client/src/pages/RegisterPage.tsx`
**Issue:** Google OAuth redirect was hardcoded to `http://localhost:5000`
**Status:** ✅ FIXED

### 2. ⚠️ Backend URL Mismatch
**Current backend URL in .env:** `https://tanya-itew5-finals-labexam.onrender.com`
**Expected backend URL:** `https://sports-pwa-backend.onrender.com` (per documentation)

**Possible Issues:**
- Backend service doesn't exist at the URL
- Backend service is sleeping (Render free tier)
- Backend service failed to deploy
- Wrong URL configured

---

## Fixes Applied

### ✅ Fix 1: RegisterPage Hardcoded URL
Changed from:
```typescript
window.location.href = 'http://localhost:5000/api/auth/google';
```

To:
```typescript
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
window.location.href = `${apiUrl}/api/auth/google`;
```

---

## Verification Steps

### Step 1: Check Backend Status

Test if your backend is accessible:

```bash
# Test the backend URL from your .env
curl https://tanya-itew5-finals-labexam.onrender.com/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Sports PWA Task Manager API is running",
  "timestamp": "2024-12-05T...",
  "version": "1.0.0"
}
```

**If you get 404:**
- Backend is not deployed at this URL
- Service name is wrong
- Service is not running

### Step 2: Check Render Dashboard

1. Go to https://dashboard.render.com
2. Find your backend service
3. Check the actual URL (should be in the service details)
4. Verify the service is running (not sleeping or failed)

### Step 3: Update Environment Variables

If your backend URL is different, update these files:

#### A. Client Environment (Development)
**File:** `client/.env`
```env
VITE_API_URL=https://YOUR-ACTUAL-BACKEND-URL.onrender.com
```

#### B. Client Environment (Production)
**File:** `client/.env.production`
```env
VITE_API_URL=https://YOUR-ACTUAL-BACKEND-URL.onrender.com
```

#### C. Server Environment
**File:** `server/.env`
```env
CLIENT_URL=https://eti-itew5-finals-labexam.vercel.app
GOOGLE_CALLBACK_URL=https://YOUR-ACTUAL-BACKEND-URL.onrender.com/api/auth/google/callback
```

#### D. Vercel Environment Variables
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Update `VITE_API_URL` to your actual backend URL
5. Redeploy

#### E. Render Environment Variables
1. Go to https://dashboard.render.com
2. Select your backend service
3. Go to Environment
4. Update `CLIENT_URL` to match your Vercel frontend URL
5. Update `GOOGLE_CALLBACK_URL` to match your backend URL
6. Save (will auto-redeploy)

### Step 4: Update Google OAuth Configuration

1. Go to https://console.cloud.google.com
2. Select your project
3. Go to APIs & Services → Credentials
4. Click your OAuth 2.0 Client ID
5. Under "Authorized redirect URIs", ensure you have:
   ```
   https://YOUR-ACTUAL-BACKEND-URL.onrender.com/api/auth/google/callback
   ```
6. Save

---

## Common Issues & Solutions

### Issue 1: Backend Service Sleeping (Render Free Tier)
**Symptom:** First request takes 30+ seconds or times out
**Solution:** 
- Wait for service to wake up (can take 30-60 seconds)
- Consider upgrading to paid tier for always-on service
- Make a health check request first to wake it up

### Issue 2: Wrong Backend URL
**Symptom:** 404 on all API requests
**Solution:**
1. Check Render dashboard for actual service URL
2. Update all environment variables
3. Redeploy both frontend and backend

### Issue 3: CORS Errors After Fixing 404
**Symptom:** Backend responds but CORS blocks requests
**Solution:**
1. Verify `CLIENT_URL` in backend matches your Vercel URL exactly
2. No trailing slashes
3. Redeploy backend after changing

### Issue 4: Google OAuth Still Fails
**Symptom:** OAuth redirect fails or shows error
**Solution:**
1. Verify `GOOGLE_CALLBACK_URL` matches backend URL
2. Update Google Cloud Console redirect URIs
3. Wait 5 minutes for Google to propagate changes
4. Clear browser cache and try again

---

## Testing Checklist

After applying fixes:

### Backend Tests
- [ ] `curl https://YOUR-BACKEND-URL.onrender.com/api/health` returns 200
- [ ] Backend logs show no errors
- [ ] Service is running (not sleeping)

### Frontend Tests
- [ ] Open browser console
- [ ] Check `import.meta.env.VITE_API_URL` shows correct URL
- [ ] Network tab shows requests going to correct backend
- [ ] No 404 errors in console

### Authentication Tests
- [ ] Can register with email/password
- [ ] Can login with email/password
- [ ] Can click "Continue with Google" (redirects to Google)
- [ ] Google OAuth completes successfully
- [ ] Redirected back to dashboard after OAuth

---

## Quick Fix Commands

### 1. Rebuild and Redeploy Frontend
```bash
cd client
npm run build
# Then redeploy on Vercel (automatic if connected to Git)
```

### 2. Restart Backend
```bash
# In Render dashboard:
# Manual Deploy → Deploy latest commit
```

### 3. Test Backend Locally
```bash
cd server
npm run dev
# Should start on http://localhost:5000
```

### 4. Test Frontend Locally
```bash
cd client
npm run dev
# Should start on http://localhost:5173
```

---

## Environment Variable Summary

### What You Need to Know

**Backend URL:** The URL where your Express server is deployed
- Example: `https://tanya-itew5-finals-labexam.onrender.com`
- Find it in Render dashboard

**Frontend URL:** The URL where your React app is deployed
- Example: `https://eti-itew5-finals-labexam.vercel.app`
- Find it in Vercel dashboard

**These MUST match in:**
1. Client `.env` files → `VITE_API_URL` = Backend URL
2. Server `.env` file → `CLIENT_URL` = Frontend URL
3. Vercel environment variables → `VITE_API_URL` = Backend URL
4. Render environment variables → `CLIENT_URL` = Frontend URL
5. Google OAuth redirect URIs → `{Backend URL}/api/auth/google/callback`

---

## Files Modified

1. ✅ `client/src/pages/RegisterPage.tsx` - Fixed hardcoded localhost URL
2. ⚠️ `client/.env` - May need backend URL update
3. ⚠️ `client/.env.production` - May need backend URL update
4. ⚠️ `server/.env` - May need frontend URL update

---

## Next Steps

1. **Verify your actual backend URL** from Render dashboard
2. **Update all environment variables** to match
3. **Redeploy both services**
4. **Test the authentication flow**
5. **Check for any remaining errors**

---

## Support Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Google OAuth Setup Guide](./GOOGLE_OAUTH_PRODUCTION_SETUP.md)
- [Deployment Summary](./DEPLOYMENT_SUMMARY.md)

---

**Status:** ✅ RegisterPage fixed, ⚠️ Backend URL verification needed
