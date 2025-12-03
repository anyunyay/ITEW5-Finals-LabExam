# WebSocket Implementation Documentation

## Overview

The Sports PWA Task Manager now includes real-time WebSocket functionality using Socket.io. This enables instant updates across all connected clients when tasks are created, updated, or deleted.

## Implementation Details

### 1. Socket.io Server Configuration

**File:** `server/config/socket.js`

The WebSocket server is configured with:
- JWT-based authentication middleware
- User-specific rooms for targeted event broadcasting
- Connection and disconnection event handling
- Error handling for socket operations

### 2. Server Integration

**File:** `server/server.js`

Changes made:
- Created HTTP server using `createServer()` to support Socket.io
- Configured Socket.io instance with CORS settings
- Made `io` instance available to routes via `app.locals.io`
- Updated server startup to use `httpServer.listen()` instead of `app.listen()`

### 3. Task Routes Integration

**File:** `server/routes/tasks.js`

Real-time events are emitted for:
- **task:created** - When a new task is created
- **task:updated** - When a task is modified
- **task:deleted** - When a task is removed

Each event includes relevant task data and is broadcast only to the authenticated user who owns the task.

## Authentication

WebSocket connections require JWT authentication:

```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token-here'
  }
});
```

The server validates the token and attaches user information to the socket connection.

## Events

### Client → Server

No custom events are currently required. Authentication happens during connection.

### Server → Client

#### task:created
Emitted when a new task is created.

**Payload:**
```json
{
  "task": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "title": "Complete sprint training",
    "description": "5x100m sprints with 2min rest",
    "status": "todo",
    "priority": "high",
    "createdAt": "2025-12-03T10:00:00Z",
    "updatedAt": "2025-12-03T10:00:00Z"
  }
}
```

#### task:updated
Emitted when a task is modified.

**Payload:**
```json
{
  "task": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "title": "Complete sprint training",
    "description": "5x100m sprints with 2min rest",
    "status": "in-progress",
    "priority": "high",
    "createdAt": "2025-12-03T10:00:00Z",
    "updatedAt": "2025-12-03T14:30:00Z"
  }
}
```

#### task:deleted
Emitted when a task is removed.

**Payload:**
```json
{
  "taskId": "507f1f77bcf86cd799439012"
}
```

## Client Implementation Example

```javascript
import { io } from 'socket.io-client';

// Connect with JWT token
const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('token')
  }
});

// Listen for connection
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

// Listen for task events
socket.on('task:created', (data) => {
  console.log('New task created:', data.task);
  // Update UI with new task
});

socket.on('task:updated', (data) => {
  console.log('Task updated:', data.task);
  // Update UI with modified task
});

socket.on('task:deleted', (data) => {
  console.log('Task deleted:', data.taskId);
  // Remove task from UI
});

// Handle connection errors
socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});

// Handle disconnection
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
```

## Testing

### Manual Testing

1. Start the server: `npm run dev`
2. Run the WebSocket test: `node test-socket-simple.js`

The test will:
- Authenticate a user
- Connect to the WebSocket server
- Create, update, and delete a task
- Verify that all events are received

### Expected Output

```
🧪 WebSocket Real-Time Events Test

1️⃣ Logging in...
✅ Authenticated

2️⃣ Connecting to WebSocket...
✅ Connected - Socket ID: xyz123

3️⃣ Listening for events...
✅ Event listeners ready

4️⃣ Creating task...
📡 task:created - WebSocket Test
✅ Task created

5️⃣ Updating task...
📡 task:updated - WebSocket Test
✅ Task updated

6️⃣ Deleting task...
📡 task:deleted - [task-id]
✅ Task deleted

7️⃣ Verifying events...
Events received: ['created', 'updated', 'deleted']
✅ All events received correctly!

✅ WebSocket test completed! 🎉
```

## Server Logs

When WebSocket operations occur, you'll see logs like:

```
✅ User connected: 69305a51fe13f249d23fd795 (Socket ID: Msx4qd85m5mg4qgmAAAB)
📡 Emitted task:created to user 69305a51fe13f249d23fd795
📡 Emitted task:updated to user 69305a51fe13f249d23fd795
📡 Emitted task:deleted to user 69305a51fe13f249d23fd795
❌ User disconnected: 69305a51fe13f249d23fd795 (Reason: transport close)
```

## Security

- All WebSocket connections require valid JWT authentication
- Events are only broadcast to the user who owns the tasks
- User-specific rooms prevent cross-user event leakage
- CORS is configured to only allow connections from the frontend origin

## Requirements Satisfied

This implementation satisfies the following requirements:

- **7.1** - WebSocket connections established for authenticated users
- **7.2** - Task events (created, updated, deleted) are broadcast to connected clients
- **7.4** - Connection and disconnection events are properly handled

## Next Steps

For frontend integration (Task 17):
1. Install `socket.io-client` in the React app
2. Create a socket context/hook for managing connections
3. Connect to the WebSocket server with the user's JWT token
4. Listen for task events and update the UI accordingly
5. Implement automatic reconnection on connection loss
6. Display connection status to the user
