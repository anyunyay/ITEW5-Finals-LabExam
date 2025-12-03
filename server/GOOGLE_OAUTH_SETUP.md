# Google OAuth 2.0 Setup Guide

This guide explains how to configure and use Google OAuth 2.0 authentication in the Sports PWA Task Manager.

## Prerequisites

1. A Google Cloud Platform account
2. The server running on `http://localhost:5000` (or your configured port)
3. The client running on `http://localhost:5173` (or your configured CLIENT_URL)

## Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Sports PWA Task Manager"
4. Click "Create"

### Step 2: Enable Google+ API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type (or "Internal" if using Google Workspace)
3. Click "Create"
4. Fill in the required fields:
   - App name: "Sports PWA Task Manager"
   - User support email: Your email
   - Developer contact email: Your email
5. Click "Save and Continue"
6. Skip "Scopes" section (click "Save and Continue")
7. Add test users if needed (for development)
8. Click "Save and Continue"

### Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Configure:
   - Name: "Sports PWA Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (your frontend URL)
     - `http://localhost:5000` (your backend URL)
   - Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback`
5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

### Step 5: Update Environment Variables

Update your `server/.env` file with the credentials:

```env
GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLIENT_URL=http://localhost:5173
```

## How It Works

### Authentication Flow

1. **User clicks "Login with Google"** on the frontend
2. **Frontend redirects** to `GET /api/auth/google`
3. **Backend redirects** to Google's OAuth consent screen
4. **User authorizes** the application
5. **Google redirects** back to `GET /api/auth/google/callback`
6. **Backend processes** the OAuth response:
   - Extracts user profile (email, name, avatar)
   - Creates new user OR updates existing user
   - Generates JWT token
7. **Backend redirects** to frontend with token: `CLIENT_URL/auth/callback?token=JWT_TOKEN`
8. **Frontend extracts** token from URL and stores it

### User Account Linking

The system intelligently handles different scenarios:

- **New Google user**: Creates a new account with `authProvider: 'google'`
- **Existing Google user**: Updates profile information if changed
- **Existing local user with same email**: Links Google account to existing user, switches to OAuth

### API Endpoints

#### `GET /api/auth/google`
Initiates the Google OAuth flow.

**Query Parameters**: None

**Response**: Redirects to Google OAuth consent screen

---

#### `GET /api/auth/google/callback`
Handles the OAuth callback from Google.

**Query Parameters** (provided by Google):
- `code`: Authorization code
- `state`: State parameter (for CSRF protection)

**Success Response**: Redirects to `CLIENT_URL/auth/callback?token=JWT_TOKEN`

**Error Response**: Redirects to `CLIENT_URL/login?error=ERROR_CODE`

Error codes:
- `oauth_failed`: OAuth authentication failed
- `no_user`: User object not created
- `callback_failed`: Error processing callback

## Frontend Integration

### Example React Implementation

```javascript
// Login page - Google OAuth button
const handleGoogleLogin = () => {
  // Redirect to backend OAuth endpoint
  window.location.href = 'http://localhost:5000/api/auth/google';
};

// OAuth callback page - Extract and store token
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const error = params.get('error');

  if (token) {
    // Store token in localStorage
    localStorage.setItem('authToken', token);
    
    // Fetch user info
    fetchUserInfo(token);
    
    // Redirect to dashboard
    navigate('/dashboard');
  } else if (error) {
    // Handle error
    console.error('OAuth error:', error);
    navigate('/login');
  }
}, []);
```

## Testing

### Manual Testing

1. Start the server: `npm run dev` (from server directory)
2. Navigate to: `http://localhost:5000/api/auth/google`
3. You should be redirected to Google's login page
4. After authorizing, you should be redirected back with a token

### Testing with Frontend

1. Start both server and client
2. Click "Login with Google" button
3. Complete Google OAuth flow
4. Verify token is stored and user is authenticated

## Security Considerations

1. **HTTPS Required in Production**: Google OAuth requires HTTPS for production apps
2. **Secure Token Storage**: Store JWT tokens securely (httpOnly cookies recommended for production)
3. **Token Expiration**: JWT tokens expire after 24 hours (configurable in `utils/jwt.js`)
4. **Client Secret**: Never expose `GOOGLE_CLIENT_SECRET` to the frontend
5. **CORS Configuration**: Ensure CORS is properly configured for your frontend origin

## Troubleshooting

### "redirect_uri_mismatch" Error
- Verify the redirect URI in Google Console matches exactly: `http://localhost:5000/api/auth/google/callback`
- Check for trailing slashes
- Ensure the protocol (http/https) matches

### "invalid_client" Error
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Check for extra spaces or newlines in `.env` file

### User Not Created
- Check MongoDB connection
- Verify User model schema allows Google OAuth fields
- Check server logs for detailed error messages

### Token Not Generated
- Verify JWT_SECRET is set in `.env`
- Check `utils/jwt.js` for token generation logic

## Production Deployment

When deploying to production:

1. Update authorized origins and redirect URIs in Google Console
2. Use HTTPS for all URLs
3. Update `.env` with production values:
   ```env
   GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/google/callback
   CLIENT_URL=https://your-frontend-domain.com
   ```
4. Consider using environment-specific OAuth clients (dev, staging, prod)
5. Implement proper error logging and monitoring

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/rfc6749#section-10)
