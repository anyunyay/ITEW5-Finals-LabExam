# Render Environment Variables

## Copy these EXACT values to your Render dashboard

Go to: https://dashboard.render.com → Your Service → Environment

---

## Environment Variables to Add

### 1. MONGODB_URI
```
mongodb+srv://admin_db_user:qsZJZMWDDtPyaIpf@4itb-itew5-finals-labex.ci35w7p.mongodb.net/?appName=4ITB-ITEW5-Finals-LabExam
```

### 2. JWT_SECRET
**⚠️ GENERATE A NEW SECRET - DO NOT USE THE DEVELOPMENT ONE!**

Run this command to generate:
```bash
openssl rand -base64 32
```

Or use: https://generate-secret.vercel.app/32

Example output (yours will be different):
```
xK9mP2nQ5rT8wY1zA4bC6dE7fG0hJ3kL5mN8pQ1rS4tU7vW0xY3zA6bC9dE2fG5h
```

### 3. GOOGLE_CLIENT_ID
```
your_google_client_id.apps.googleusercontent.com
```

### 4. GOOGLE_CLIENT_SECRET
```
your_google_client_secret
```

### 5. GOOGLE_CALLBACK_URL
```
https://sports-pwa-backend.onrender.com/api/auth/google/callback
```

### 6. CLIENT_URL
```
https://itew-5-finals-lab-exam.vercel.app
```

### 7. NODE_ENV
```
production
```

---

## How to Add in Render

1. Go to https://dashboard.render.com
2. Click your service: **sports-pwa-backend**
3. Click **Environment** in the left sidebar
4. Click **Add Environment Variable**
5. For each variable above:
   - Enter the **Key** (e.g., `MONGODB_URI`)
   - Enter the **Value** (copy from above)
   - Click **Add**
6. After adding all variables, click **Save Changes**
7. Render will automatically redeploy your service

---

## Verification

After deployment, check the logs:
1. Go to **Logs** tab in Render
2. Look for:
   ```
   ✅ MongoDB connected successfully
   ✅ Server running on port 5000
   ```

If you see errors:
- Check that all environment variables are set correctly
- Ensure no extra spaces or newlines
- Verify MongoDB connection string is correct

---

## Important Notes

⚠️ **JWT_SECRET:**
- Must be strong (32+ characters)
- Must be different from development
- Keep it secret, never commit to Git

⚠️ **URLs:**
- No trailing slashes
- Must be exact matches
- Case-sensitive

⚠️ **After Changes:**
- Render auto-redeploys when you save
- Wait 2-3 minutes for deployment
- Check logs for any errors

---

## Quick Copy Format

If you prefer to copy all at once, here's the format for Render's bulk add:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=YOUR_GENERATED_SECRET_HERE
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://sports-pwa-backend.onrender.com/api/auth/google/callback
CLIENT_URL=https://itew-5-finals-lab-exam.vercel.app
NODE_ENV=production
```

**Remember to replace `YOUR_GENERATED_SECRET_HERE` with your actual generated JWT secret!**
