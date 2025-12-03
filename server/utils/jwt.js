import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object containing id, username, email
 * @returns {string} JWT token
 */
export const generateToken = (user) => {
  const payload = {
    id: user._id || user.id,
    username: user.username,
    email: user.email,
    authProvider: user.authProvider
  };

  const options = {
    expiresIn: '24h' // Token expires in 24 hours
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};
