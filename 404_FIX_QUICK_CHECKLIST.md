# 404 Error - Quick Fix Checklist

## ✅ Completed Fixes

- [x] Fixed hardcoded localhost URL in `RegisterPage.tsx`
- [x] Now uses `VITE_API_URL` environment variable

---

## 🔍 Immediate Actions Required

### 1. Verify Backend URL (2 minutes)

Open terminal and test:
```bash
curl https://tanya-itew5-finals-labexam.onrender.com/api/health
```

**If you get a response:** ✅ Backend is working, skip to step 3

**If you get 404 or timeout:** ⚠️ Continue to step 2

---

### 2. Find Your Actual Backend URL (3 minutes)

1. Go to https://dashboard.render.com
2. Log in
3. Find your backend service (look for Node.js/Express service)
4. Copy the URL shown at the top (e.g., `https://your-service.onrender.com`)
5. Test it:
   ```bash
   curl https://YOUR-ACTUAL-URL.onrender.com/api/health
   ```

**If it works:** Continue to step 3

**If it doesn't work:**
- Check if service is running (green status)
- Check logs for errors
- May need to redeploy

---

### 3. Update Environment Variables (5 minutes)

#### A. Update Local Files

**File: `client/.env`**
```env
VITE_API_URL=https://YOUR-ACTUAL-BACKEND-URL.onrender.com
```

**File: `client/.env.production`**
```env
VITE_API_URL=https://YOUR-ACTUAL-BACKEND-URL.onrender.com
```

**File: `server/.env`**
```env
GOOGLE_CALLBACK_URL=https://YOUR-ACTUAL-BACKEND-URL.onrender.com/api/auth/google/callback
```

#### B. Update Vercel (Frontend)

1. Go to https://vercel.com/dashboard
2. Select your project: `eti-itew5-finals-labexam`
3. Settings → Environment Variables
4. Find `VITE_API_URL`
5. Edit and update to your actual backend URL
6. Save
7. Redeploy: Deployments → Latest → Redeploy

#### C. Update Render (Backend)

1. Go to https://dashboard.render.com
2. Select your backend service
3. Environment tab
4. Verify `CLIENT_URL` = `https://eti-itew5-finals-labexam.vercel.app`
5. Verify `GOOGLE_CALLBACK_URL` matches your backend URL
6. Save (auto-redeploys)

---

### 4. Update Google OAuth (3 minutes)

1. Go to https://console.cloud.google.com
2. Select your project
3. APIs & Services → Credentials
4. Click your OAuth 2.0 Client ID
5. Under "Authorized redirect URIs", add:
   ```
   https://YOUR-ACTUAL-BACKEND-URL.onrender.com/api/auth/google/callback
   ```
6. Save
7. Wait 5 minutes for changes to propagate

---

### 5. Test Everything (5 minutes)

#### Test Backend
```bash
curl https://YOUR-BACKEND-URL.onrender.com/api/health
```
Expected: JSON response with status "ok"

#### Test Frontend
1. Open https://eti-itew5-finals-labexam.vercel.app
2. Open browser console (F12)
3. Try to register or login
4. Check Network tab - should see requests to your backend URL
5. Should NOT see 404 errors

#### Test Google OAuth
1. Click "Continue with Google"
2. Should redirect to Google
3. Select account
4. Should redirect back to your app
5. Should be logged in

---

## 🚨 If Still Getting 404

### Check 1: Backend Service Status
- Is it running? (Green in Render dashboard)
- Check logs for errors
- Try manual deploy

### Check 2: URL Typos
- No trailing slashes
- Exact match between all configs
- Case-sensitive

### Check 3: Deployment Status
- Frontend deployed? (Check Vercel)
- Backend deployed? (Check Render)
- Wait 2-3 minutes after deployment

### Check 4: Browser Cache
- Clear browser cache
- Try incognito/private window
- Hard refresh (Ctrl+Shift+R)

---

## 📋 Verification Commands

```bash
# Test backend health
curl https://YOUR-BACKEND-URL.onrender.com/api/health

# Test auth endpoint
curl https://YOUR-BACKEND-URL.onrender.com/api/auth/google
# Should redirect (302) or return HTML

# Check frontend environment
# Open browser console on your Vercel site:
console.log(import.meta.env.VITE_API_URL)
# Should show your backend URL
```

---

## ✅ Success Criteria

You're done when:
- [ ] Backend health check returns 200
- [ ] Frontend loads without errors
- [ ] Can register with email/password
- [ ] Can login with email/password
- [ ] "Continue with Google" redirects to Google
- [ ] Google OAuth completes successfully
- [ ] No 404 errors in browser console

---

## 🆘 Still Stuck?

1. Check `404_ERROR_FIX.md` for detailed troubleshooting
2. Review backend logs in Render dashboard
3. Review frontend logs in Vercel dashboard
4. Check browser console for specific error messages

---

## 📝 Summary

**What was fixed:**
- RegisterPage now uses environment variable instead of hardcoded localhost

**What you need to do:**
1. Verify your actual backend URL
2. Update all environment variables to match
3. Redeploy both services
4. Update Google OAuth settings
5. Test the complete flow

**Time estimate:** 15-20 minutes total
