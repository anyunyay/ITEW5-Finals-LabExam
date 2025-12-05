# Production Deployment Guide

## Your Production URLs

```
Frontend: https://itew-5-finals-lab-exam.vercel.app
Backend:  https://sports-pwa-backend.onrender.com
```

---

## 🚀 Step-by-Step Deployment

### Step 1: Deploy Backend to Render (10 minutes)

#### 1.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

#### 1.2 Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:

```
Name: sports-pwa-backend
Region: Oregon (US West)
Branch: main
Root Directory: server
Runtime: Node
Build Command: npm install
Start Command: npm start
```

#### 1.3 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these **EXACT** variables:

```bash
MONGODB_URI=mongodb+srv://admin_db_user:qsZJZMWDDtPyaIpf@4itb-itew5-finals-labex.ci35w7p.mongodb.net/?appName=4ITB-ITEW5-Finals-LabExam

JWT_SECRET=GENERATE_NEW_SECRET_HERE

GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

GOOGLE_CLIENT_SECRET=your_google_client_secret

GOOGLE_CALLBACK_URL=https://sports-pwa-backend.onrender.com/api/auth/google/callback

CLIENT_URL=https://itew-5-finals-lab-exam.vercel.app

NODE_ENV=production
```

**IMPORTANT: Generate a new JWT_SECRET!**

Run this command:
```bash
openssl rand -base64 32
```

Or use: https://generate-secret.vercel.app/32

Copy the output and use it as your JWT_SECRET.

#### 1.4 Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for first deployment
3. Verify deployment at: https://sports-pwa-backend.onrender.com

---

### Step 2: Deploy Frontend to Vercel (5 minutes)

#### 2.1 Prepare Frontend

The frontend is already configured to use environment variables.

#### 2.2 Deploy to Vercel

**Option A: Vercel CLI**
```bash
cd client
npm install -g vercel
vercel login
vercel --prod
```

**Option B: Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:

```
Project Name: itew-5-finals-lab-exam
Framework Preset: Vite
Root Directory: client
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### 2.3 Add Environment Variables

In Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add this variable:

```bash
VITE_API_URL=https://sports-pwa-backend.onrender.com
```

3. Select **Production** environment
4. Click **Save**

#### 2.4 Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Your app will be live at: https://itew-5-finals-lab-exam.vercel.app

---

### Step 3: Configure Google OAuth (5 minutes)

#### 3.1 Update Google Cloud Console

1. Go to https://console.cloud.google.com/
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Click your OAuth 2.0 Client ID
5. Update **Authorized JavaScript origins**:

```
https://itew-5-finals-lab-exam.vercel.app
```

6. Update **Authorized redirect URIs**:

```
https://sports-pwa-backend.onrender.com/api/auth/google/callback
```

7. Click **Save**
8. **Wait 5 minutes** for changes to propagate

---

### Step 4: Verify Deployment (5 minutes)

#### 4.1 Test Backend

Open browser and visit:
```
https://sports-pwa-backend.onrender.com
```

You should see a response (might be 401 Unauthorized, which is normal).

#### 4.2 Test Frontend

1. Visit: https://itew-5-finals-lab-exam.vercel.app
2. Check browser console for errors
3. Try logging in with email/password
4. Try "Continue with Google"

#### 4.3 Test Complete Flow

1. **Register/Login**
   - Create account or login
   - Should redirect to dashboard

2. **Google OAuth**
   - Click "Continue with Google"
   - Should redirect to Google
   - After authorization, should return to app
   - Should be logged in

3. **Create Task**
   - Click "Create Task"
   - Fill in details
   - Submit
   - Task should appear

4. **Real-time Updates**
   - Open app in two browser windows
   - Create task in one window
   - Should appear in other window

5. **PWA Installation**
   - Look for install icon in address bar
   - Click to install
   - App should open in standalone window

6. **Offline Mode**
   - Open installed PWA
   - Open DevTools → Network
   - Check "Offline"
   - Refresh page
   - App should still work with cached data

---

## 🔧 Troubleshooting

### Issue 1: Backend Not Responding

**Symptom:** First request takes 30+ seconds

**Cause:** Render free tier spins down after 15 minutes of inactivity

**Solution:** 
- Wait 30 seconds for backend to wake up
- Or upgrade to Render paid plan ($7/month) for always-on

### Issue 2: CORS Error

**Symptom:**
```
Access to fetch at 'https://sports-pwa-backend.onrender.com' 
from origin 'https://itew-5-finals-lab-exam.vercel.app' 
has been blocked by CORS policy
```

**Solution:**
1. Check `CLIENT_URL` in Render environment variables
2. Ensure it's exactly: `https://itew-5-finals-lab-exam.vercel.app`
3. No trailing slash
4. Redeploy backend

### Issue 3: Google OAuth Redirect Mismatch

**Symptom:**
```
Error: redirect_uri_mismatch
```

**Solution:**
1. Copy the exact URL from the error message
2. Add it to Google Cloud Console → Authorized redirect URIs
3. Ensure it's: `https://sports-pwa-backend.onrender.com/api/auth/google/callback`
4. Wait 5 minutes

### Issue 4: Environment Variables Not Working

**Symptom:** API calls fail, features don't work

**Solution:**

**Vercel:**
1. Go to Settings → Environment Variables
2. Verify `VITE_API_URL` is set
3. Must start with `VITE_` for Vite to pick it up
4. Redeploy after adding variables

**Render:**
1. Go to Environment tab
2. Verify all variables are set
3. Click "Save Changes" (auto-redeploys)

### Issue 5: Socket.IO Not Connecting

**Symptom:** Real-time updates don't work

**Solution:**
1. Check browser console for Socket.IO errors
2. Verify `VITE_API_URL` in frontend
3. Check backend logs in Render
4. Ensure Socket.IO CORS is configured correctly

### Issue 6: JWT Token Invalid

**Symptom:** "Invalid token" or "Token verification failed"

**Solution:**
1. Ensure `JWT_SECRET` is set in Render
2. Must be the same secret used to generate tokens
3. Generate a new strong secret if needed
4. Redeploy backend

---

## 📋 Deployment Checklist

### Pre-Deployment
- [x] Code is committed to GitHub
- [x] Frontend environment variables configured
- [x] Backend environment variables prepared
- [ ] JWT_SECRET generated (strong, 32+ characters)
- [ ] MongoDB Atlas IP whitelist updated (0.0.0.0/0)

### Backend Deployment (Render)
- [ ] Render account created
- [ ] Web service created
- [ ] Repository connected
- [ ] Root directory set to `server`
- [ ] All environment variables added
- [ ] Service deployed successfully
- [ ] Backend URL verified: https://sports-pwa-backend.onrender.com

### Frontend Deployment (Vercel)
- [ ] Vercel account created
- [ ] Project created
- [ ] Repository connected
- [ ] Root directory set to `client`
- [ ] `VITE_API_URL` environment variable added
- [ ] Project deployed successfully
- [ ] Frontend URL verified: https://itew-5-finals-lab-exam.vercel.app

### Integration
- [ ] Google Cloud Console updated with production URLs
- [ ] Waited 5 minutes after Google OAuth update
- [ ] Backend `CLIENT_URL` points to frontend
- [ ] Frontend `VITE_API_URL` points to backend

### Testing
- [ ] Frontend loads without errors
- [ ] Can register new account
- [ ] Can login with email/password
- [ ] Google OAuth works
- [ ] Can create tasks
- [ ] Can update tasks
- [ ] Can delete tasks
- [ ] Real-time updates work (Socket.IO)
- [ ] PWA installs correctly
- [ ] Offline mode works
- [ ] Service worker registered

---

## 🎯 Quick Test Commands

### Test Backend Health
```bash
curl https://sports-pwa-backend.onrender.com
```

### Test Frontend
```bash
curl https://itew-5-finals-lab-exam.vercel.app
```

### Check Environment Variables (Frontend)
Open browser console on your frontend:
```javascript
console.log(import.meta.env.VITE_API_URL);
// Should output: https://sports-pwa-backend.onrender.com
```

### View Backend Logs
```bash
# In Render dashboard
# Go to your service → Logs tab
```

### View Frontend Logs
```bash
# In Vercel dashboard
# Go to your project → Deployments → Click deployment → View Function Logs
```

---

## 📊 Expected Results

### After Successful Deployment:

✅ **Frontend:**
- Loads at https://itew-5-finals-lab-exam.vercel.app
- No console errors
- PWA installable
- Offline mode works

✅ **Backend:**
- Responds at https://sports-pwa-backend.onrender.com
- API endpoints work
- Socket.IO connects
- Authentication works

✅ **Integration:**
- Login works
- Google OAuth works
- Tasks CRUD works
- Real-time updates work
- No CORS errors

---

## 💰 Cost Summary

### Current Setup (Free Tier):
```
Vercel:  $0/month (100 GB bandwidth)
Render:  $0/month (750 hours, spins down after 15 min)
MongoDB: $0/month (512 MB storage)
Total:   $0/month
```

### Recommended for Production:
```
Vercel Pro:      $20/month (1 TB bandwidth, analytics)
Render Standard: $7/month (always-on, no spin down)
MongoDB M10:     $57/month (10 GB, dedicated cluster)
Total:           $84/month
```

---

## 🔐 Security Checklist

- [ ] JWT_SECRET is strong and unique (32+ characters)
- [ ] JWT_SECRET is different from development
- [ ] Google Client Secret is kept confidential
- [ ] MongoDB connection string is secure
- [ ] CORS is properly configured
- [ ] HTTPS is enabled (automatic on Vercel/Render)
- [ ] Environment variables are not in Git
- [ ] `.env` files are in `.gitignore`

---

## 📚 Additional Resources

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas:** https://docs.atlas.mongodb.com/
- **Google OAuth:** https://developers.google.com/identity/protocols/oauth2

---

## 🆘 Need Help?

### Check These Files:
- `BEST_DEPLOYMENT_ARCHITECTURE.md` - Detailed architecture guide
- `DEPLOYMENT_OPTIONS_COMPARISON.md` - Compare deployment options
- `GOOGLE_OAUTH_VERCEL_FIX.md` - OAuth troubleshooting
- `DEPLOYMENT_QUICK_REFERENCE.md` - Quick commands

### Common Commands:
```bash
# Redeploy frontend
cd client
vercel --prod --force

# View backend logs (Render dashboard)
# Go to your service → Logs tab

# Generate new JWT secret
openssl rand -base64 32

# Test API endpoint
curl https://sports-pwa-backend.onrender.com/api/health
```

---

## ✅ Success Criteria

Your deployment is successful when:

1. ✅ Frontend loads at https://itew-5-finals-lab-exam.vercel.app
2. ✅ No console errors
3. ✅ Can register/login
4. ✅ Google OAuth works
5. ✅ Can create/read/update/delete tasks
6. ✅ Real-time updates work
7. ✅ PWA installs correctly
8. ✅ Offline mode works
9. ✅ Service worker registered
10. ✅ No CORS errors

---

**Ready to deploy! Follow the steps above. 🚀**

**Estimated Time: 25 minutes**
