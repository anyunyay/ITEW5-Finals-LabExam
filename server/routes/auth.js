import express from 'express';
import passport from 'passport';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with username, email, and password
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Input validation
    if (!username || !email || !password) {
      return res.status(400).json({
        error: {
          message: 'Please provide username, email, and password',
          code: 'MISSING_FIELDS',
          details: {
            username: !username ? 'Username is required' : undefined,
            email: !email ? 'Email is required' : undefined,
            password: !password ? 'Password is required' : undefined
          }
        }
      });
    }

    // Validate username length
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({
        error: {
          message: 'Username must be between 3 and 30 characters',
          code: 'INVALID_USERNAME_LENGTH'
        }
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        error: {
          message: 'Password must be at least 6 characters long',
          code: 'INVALID_PASSWORD_LENGTH'
        }
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: {
          message: 'Please provide a valid email address',
          code: 'INVALID_EMAIL_FORMAT'
        }
      });
    }

    // Check if user already exists with username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({
        error: {
          message: 'Username already exists',
          code: 'DUPLICATE_USERNAME'
        }
      });
    }

    // Check if user already exists with email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({
        error: {
          message: 'Email already exists',
          code: 'DUPLICATE_EMAIL'
        }
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      authProvider: 'local',
      displayName: username // Default display name to username
    });

    // Save user to database (password will be hashed by pre-save middleware)
    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    // Return success response with token and user info
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        authProvider: user.authProvider,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });

      return res.status(400).json({
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors
        }
      });
    }

    // Handle duplicate key errors (shouldn't happen due to pre-checks, but just in case)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        error: {
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
          code: 'DUPLICATE_FIELD'
        }
      });
    }

    // Generic error response
    res.status(500).json({
      error: {
        message: 'An error occurred during registration',
        code: 'REGISTRATION_ERROR'
      }
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user with username/email and password
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Input validation - require either username or email, and password
    if ((!username && !email) || !password) {
      return res.status(400).json({
        error: {
          message: 'Please provide username or email, and password',
          code: 'MISSING_CREDENTIALS'
        }
      });
    }

    // Find user by username or email
    const query = username ? { username } : { email };
    const user = await User.findOne(query);

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Check if user is using local authentication
    if (user.authProvider !== 'local') {
      return res.status(401).json({
        error: {
          message: `This account uses ${user.authProvider} authentication. Please login with ${user.authProvider}.`,
          code: 'WRONG_AUTH_PROVIDER'
        }
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return success response with token and user info
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        authProvider: user.authProvider,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);

    // Generic error response
    res.status(500).json({
      error: {
        message: 'An error occurred during login',
        code: 'LOGIN_ERROR'
      }
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Protected
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.status(200).json({
      user: req.user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: {
        message: 'An error occurred while fetching user data',
        code: 'FETCH_USER_ERROR'
      }
    });
  }
});

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth flow
 * @access  Public
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Handle Google OAuth callback
 * @access  Public
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`
  }),
  async (req, res) => {
    try {
      // User is authenticated via Passport, available in req.user
      const user = req.user;

      if (!user) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=no_user`);
      }

      // Generate JWT token for the authenticated user
      const token = generateToken(user);

      // Redirect to frontend with token
      // Frontend will extract token from URL and store it
      const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?token=${token}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=callback_failed`);
    }
  }
);

export default router;
