import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

/**
 * Configure Socket.io server with authentication
 * @param {http.Server} httpServer - HTTP server instance
 * @returns {Server} Socket.io server instance
 */
export const configureSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach user info to socket
      socket.userId = decoded.id;
      socket.user = decoded;
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      next(new Error('Invalid authentication token'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId} (Socket ID: ${socket.id})`);

    // Join user to their personal room for targeted broadcasts
    socket.join(`user:${socket.userId}`);

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`❌ User disconnected: ${socket.userId} (Reason: ${reason})`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  return io;
};

/**
 * Emit task event to all connected clients of a specific user
 * @param {Server} io - Socket.io server instance
 * @param {string} userId - User ID to emit to
 * @param {string} event - Event name
 * @param {object} data - Event data
 */
export const emitTaskEvent = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
  console.log(`📡 Emitted ${event} to user ${userId}`);
};

export default configureSocket;
