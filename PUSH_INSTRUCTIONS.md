# GitHub Push Instructions

## Issue
GitHub's push protection detected Google OAuth credentials in the commit history.

## Solution Options

### Option 1: Use GitHub's Bypass (Quick)
GitHub provided bypass URLs in the error message. You can:

1. Go to the URLs provided in the error:
   - https://github.com/anyunyay/ITEW5-Finals-LabExam/security/secret-scanning/unblock-secret/36QQHeEKzuRTCNl2uZ4RCiVfNS3
   - https://github.com/anyunyay/ITEW5-Finals-LabExam/security/secret-scanning/unblock-secret/36QQHgP7gKBnPMRMGILgyP7YYFD

2. Click "Allow secret" for each one

3. Then push again:
   ```bash
   git push origin main
   ```

### Option 2: Rotate Credentials (Recommended for Production)
Since the credentials are already exposed in your repository history:

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Navigate to your project
3. Go to APIs & Services → Credentials
4. Delete the old OAuth 2.0 Client ID
5. Create a new OAuth 2.0 Client ID
6. Update your .env files with new credentials
7. Update Vercel and Render environment variables
8. Then push the code

### Option 3: Force Push (Use with Caution)
If you want to completely remove the credentials from history:

```bash
# This will rewrite history - use with caution!
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch DEPLOYMENT_SUMMARY.md GOOGLE_OAUTH_PRODUCTION_SETUP.md PRODUCTION_DEPLOYMENT_GUIDE.md RENDER_ENVIRONMENT_VARIABLES.md server/.env.production.example" \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push origin main --force
```

**Warning:** This rewrites history and can cause issues for other collaborators.

## Recommended Approach

For a school project or development:
1. Use Option 1 (bypass) to push quickly
2. The credentials are already in .env files which are gitignored
3. For production, rotate credentials later

For production:
1. Use Option 2 (rotate credentials)
2. Never commit credentials to git
3. Always use environment variables

## Current Status

All code changes are complete and ready:
- ✅ Google OAuth duplicate field error fixed
- ✅ 404 error fixed
- ✅ Username null handling fixed
- ✅ Credentials removed from documentation
- ✅ Migration script created

Just need to push to GitHub using one of the options above.
