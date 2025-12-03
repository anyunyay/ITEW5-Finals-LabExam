import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

/**
 * Authentication middleware to verify JWT tokens
 * Extracts token from Authorization header, verifies it, and attaches user to request
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: {
          message: 'Authentication required. No token provided.',
          code: 'NO_TOKEN'
        }
      });
    }

    // Check if the header follows the "Bearer <token>" format
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          message: 'Invalid authorization header format. Use "Bearer <token>".',
          code: 'INVALID_AUTH_FORMAT'
        }
      });
    }

    // Extract the token
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token) {
      return res.status(401).json({
        error: {
          message: 'Authentication required. Token is empty.',
          code: 'EMPTY_TOKEN'
        }
      });
    }

    // Verify the token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        error: {
          message: error.message,
          code: 'TOKEN_VERIFICATION_FAILED'
        }
      });
    }

    // Fetch user from database to ensure user still exists
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        error: {
          message: 'User not found. Token may be invalid.',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    // Attach user information to request object
    req.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      authProvider: user.authProvider,
      avatar: user.avatar
    };

    // Attach the full user document if needed
    req.userDoc = user;

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      error: {
        message: 'Internal server error during authentication',
        code: 'AUTH_INTERNAL_ERROR'
      }
    });
  }
};
