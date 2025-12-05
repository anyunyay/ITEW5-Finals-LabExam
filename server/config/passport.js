import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

/**
 * Configure Passport with Google OAuth 2.0 Strategy
 */
const configurePassport = () => {
  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          // Extract user information from Google profile
          const { id, emails, displayName, photos } = profile;
          const email = emails && emails.length > 0 ? emails[0].value : null;
          const avatar = photos && photos.length > 0 ? photos[0].value : null;

          if (!email) {
            return done(new Error('No email found in Google profile'), null);
          }

          // Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: id });

          if (user) {
            // User exists, update their information if needed
            let updated = false;

            if (user.displayName !== displayName) {
              user.displayName = displayName;
              updated = true;
            }

            if (user.avatar !== avatar) {
              user.avatar = avatar;
              updated = true;
            }

            if (updated) {
              await user.save();
            }

            return done(null, user);
          }

          // Check if user exists with this email (from local auth)
          user = await User.findOne({ email });

          if (user) {
            // User exists with email but different auth provider
            // Link the Google account to existing user
            user.googleId = id;
            user.authProvider = 'google';
            user.displayName = displayName || user.displayName;
            user.avatar = avatar || user.avatar;
            
            // Use updateOne to avoid validation issues with username field
            // This allows us to keep the username but switch to Google auth
            await User.updateOne(
              { _id: user._id },
              {
                $set: {
                  googleId: id,
                  authProvider: 'google',
                  displayName: displayName || user.displayName,
                  avatar: avatar || user.avatar
                },
                $unset: { password: '' }
              }
            );
            
            // Fetch the updated user
            user = await User.findById(user._id);
            return done(null, user);
          }

          // Create new user with Google OAuth
          // Note: username is intentionally omitted (will be null)
          // The sparse index allows multiple users with null username
          user = new User({
            googleId: id,
            email,
            displayName: displayName || email.split('@')[0],
            avatar,
            authProvider: 'google',
            username: null // Explicitly set to null for clarity
          });

          await user.save();
          return done(null, user);
        } catch (error) {
          console.error('Google OAuth error:', error);
          return done(error, null);
        }
      }
    )
  );

  // Serialize user for session (not used with JWT, but required by Passport)
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session (not used with JWT, but required by Passport)
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

export default configurePassport;
