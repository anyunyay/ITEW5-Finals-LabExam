# Deployment Quick Reference Card

## 🚀 Recommended Setup for Your PWA

```
Frontend (PWA) → Vercel
Backend (API)  → Render
Database       → MongoDB Atlas
```

---

## ⚡ 15-Minute Deployment

### 1. Deploy Backend (5 min)
```bash
1. Go to render.com
2. New Web Service
3. Connect GitHub repo
4. Root Directory: server
5. Add environment variables
6. Deploy
7. Copy URL: https://your-backend.onrender.com
```

### 2. Deploy Frontend (5 min)
```bash
1. Go to vercel.com
2. New Project
3. Connect GitHub repo
4. Root Directory: client
5. Add VITE_API_URL=https://your-backend.onrender.com
6. Deploy
7. Copy URL: https://your-frontend.vercel.app
```

### 3. Connect Services (5 min)
```bash
1. Update Render: CLIENT_URL=https://your-frontend.vercel.app
2. Update Google OAuth with both URLs
3. Redeploy both services
4. Test!
```

---

## 📋 Environment Variables Checklist

### Backend (Render) - 7 Variables
```bash
✓ MONGODB_URI
✓ JWT_SECRET
✓ GOOGLE_CLIENT_ID
✓ GOOGLE_CLIENT_SECRET
✓ GOOGLE_CALLBACK_URL
✓ CLIENT_URL
✓ NODE_ENV=production
```

### Frontend (Vercel) - 1 Variable
```bash
✓ VITE_API_URL
```

---

## 🔗 URLs to Update

### Google Cloud Console
```
Authorized JavaScript origins:
→ https://your-frontend.vercel.app

Authorized redirect URIs:
→ https://your-backend.onrender.com/api/auth/google/callback
```

### Backend Environment
```
CLIENT_URL → https://your-frontend.vercel.app
GOOGLE_CALLBACK_URL → https://your-backend.onrender.com/api/auth/google/callback
```

### Frontend Environment
```
VITE_API_URL → https://your-backend.onrender.com
```

---

## ✅ Testing Checklist

```bash
□ Frontend loads
□ API calls work
□ Login works
□ Google OAuth works
□ Socket.IO connects
□ Tasks CRUD works
□ Real-time updates work
□ PWA installs
□ Offline mode works
```

---

## 🆘 Common Issues

### CORS Error
```
Fix: Update CLIENT_URL in backend
Redeploy backend
```

### OAuth Error
```
Fix: Update Google Cloud Console URLs
Wait 5 minutes
```

### Socket Not Connecting
```
Fix: Check VITE_API_URL in frontend
Verify Socket.IO CORS in backend
```

### Backend Slow (30s)
```
Reason: Render free tier spins down
Solution: Upgrade to $7/month or accept delay
```

---

## 💰 Cost Summary

### Free Tier
```
Vercel:  $0/month
Render:  $0/month (with spin-down)
MongoDB: $0/month
Total:   $0/month
```

### Production
```
Vercel Pro:      $20/month
Render Standard: $7/month
MongoDB M10:     $57/month
Total:           $84/month
```

---

## 📚 Documentation Files

```
BEST_DEPLOYMENT_ARCHITECTURE.md    ← Full guide
DEPLOYMENT_OPTIONS_COMPARISON.md   ← Compare options
GOOGLE_OAUTH_VERCEL_FIX.md        ← OAuth setup
VERCEL_PWA_DEPLOYMENT_GUIDE.md    ← PWA details
DEPLOYMENT_QUICK_REFERENCE.md     ← This file
```

---

## 🎯 Your Current Status

Based on your URL: `itew-5-finals-lab-exam-5k2g2hw5o-mark-aldrin-m-quipits-projects.vercel.app`

```
✓ Backend deployed on Vercel
⚠️ Need to deploy frontend separately
⚠️ Need to migrate backend to Render (recommended)
```

### Next Steps:
```
1. Deploy client/ folder to Vercel separately
2. Consider migrating backend to Render for Socket.IO
3. Update environment variables
4. Update Google OAuth URLs
```

---

## 🔧 Quick Commands

### Check Backend Health
```bash
curl https://your-backend.onrender.com/api/health
```

### View Logs
```bash
# Render
render logs -s your-service-name

# Vercel
vercel logs your-project-name --prod
```

### Redeploy
```bash
# Render: Auto-redeploys on git push

# Vercel
vercel --prod --force
```

---

## 📞 Support

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Your Guides: See documentation files above

---

**Ready to deploy? Follow BEST_DEPLOYMENT_ARCHITECTURE.md! 🚀**
