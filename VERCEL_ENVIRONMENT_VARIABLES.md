# Vercel Environment Variables

## Copy this EXACT value to your Vercel dashboard

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

---

## Environment Variable to Add

### VITE_API_URL

**Key:**
```
VITE_API_URL
```

**Value:**
```
https://sports-pwa-backend.onrender.com
```

**Environment:**
- ✅ Production
- ✅ Preview (optional)
- ✅ Development (optional)

---

## How to Add in Vercel

### Method 1: Dashboard

1. Go to https://vercel.com/dashboard
2. Click your project: **itew-5-finals-lab-exam**
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar
5. Click **Add New**
6. Enter:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://sports-pwa-backend.onrender.com`
   - **Environment:** Select **Production** (and optionally Preview/Development)
7. Click **Save**
8. Go to **Deployments** tab
9. Click **⋯** on the latest deployment
10. Click **Redeploy**

### Method 2: Vercel CLI

```bash
cd client
vercel env add VITE_API_URL production
# When prompted, enter: https://sports-pwa-backend.onrender.com

# Redeploy
vercel --prod
```

---

## Verification

After redeployment, verify the environment variable is working:

1. Visit: https://itew-5-finals-lab-exam.vercel.app
2. Open browser console (F12)
3. Type:
   ```javascript
   console.log(import.meta.env.VITE_API_URL);
   ```
4. Should output: `https://sports-pwa-backend.onrender.com`

If it shows `undefined`:
- Environment variable not set correctly
- Need to redeploy after adding variable
- Variable name must start with `VITE_` for Vite

---

## Important Notes

⚠️ **Variable Name:**
- Must start with `VITE_` for Vite to expose it to the client
- Case-sensitive: `VITE_API_URL` not `vite_api_url`

⚠️ **Value:**
- No trailing slash
- Must be exact: `https://sports-pwa-backend.onrender.com`
- Not: `https://sports-pwa-backend.onrender.com/`

⚠️ **After Adding:**
- Must redeploy for changes to take effect
- Go to Deployments → Redeploy
- Or push a new commit to trigger deployment

---

## Testing

### Test API Connection

After deployment, test if the frontend can reach the backend:

1. Visit: https://itew-5-finals-lab-exam.vercel.app
2. Open browser console
3. Try to login or register
4. Check Network tab for API calls
5. Should see requests to: `https://sports-pwa-backend.onrender.com/api/...`

If you see errors:
- Check environment variable is set
- Verify backend is running
- Check for CORS errors
- Ensure backend `CLIENT_URL` is set correctly

---

## Additional Environment Variables (Optional)

If you need to add more environment variables in the future:

### For Development
```bash
vercel env add VARIABLE_NAME development
```

### For Preview
```bash
vercel env add VARIABLE_NAME preview
```

### For All Environments
```bash
vercel env add VARIABLE_NAME production preview development
```

---

## Quick Reference

**Your Production URLs:**
```
Frontend: https://itew-5-finals-lab-exam.vercel.app
Backend:  https://sports-pwa-backend.onrender.com
```

**Environment Variable:**
```
VITE_API_URL=https://sports-pwa-backend.onrender.com
```

**Redeploy Command:**
```bash
cd client
vercel --prod --force
```
