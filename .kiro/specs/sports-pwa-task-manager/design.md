# Design Document

## Overview

The Sports PWA Task Manager is a full-stack Progressive Web Application that combines task management with real-time collaboration and offline capabilities. The system uses a three-tier architecture: React frontend (Client Application), Express.js backend (API Server), and MongoDB database. The sports theme provides an engaging, energetic user experience with visual elements inspired by athletics and competition.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────┐
│         Client Application              │
│  (React SPA + Service Worker + PWA)     │
│                                         │
│  - React Router (4+ pages)              │
│  - Redux/Context (State Management)     │
│  - Socket.io Client (Real-time)         │
│  - Service Worker (Offline/Cache)       │
└──────────────┬──────────────────────────┘
               │ HTTP/REST + WebSocket
               │
┌──────────────▼──────────────────────────┐
│          API Server                     │
│     (Express.js + Socket.io)            │
│                                         │
│  - REST API Endpoints                   │
│  - Authentication Middleware            │
│  - Google OAuth Integration             │
│  - WebSocket Server                     │
└──────────────┬──────────────────────────┘
               │ MongoDB Driver
               │
┌──────────────▼──────────────────────────┐
│       MongoDB Atlas                     │
│     (Cloud-hosted Database)             │
│                                         │
│  - Users Collection                     │
│  - Tasks Collection                     │
└─────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18+ (SPA framework)
- React Router v6 (Client-side routing)
- Socket.io Client (Real-time communication)
- Workbox (Service Worker management)
- Axios (HTTP client)
- CSS Modules or Styled Components (Sports-themed styling)

**Backend:**
- Node.js with Express.js (REST API)
- Socket.io (WebSocket server)
- Passport.js (Authentication strategies)
- Passport-Google-OAuth20 (Google OAuth)
- bcrypt (Password hashing)
- jsonwebtoken (JWT tokens)
- Mongoose (MongoDB ODM)

**Database:**
- MongoDB Atlas (Cloud-hosted)

**Build Tools:**
- Composer (Project orchestration)
- Vite or Create React App (Frontend bundling)
- Nodemon (Backend hot-reload)

## Components and Interfaces

### Frontend Components

#### 1. Page Components

**LoginPage**
- Purpose: Handle user authentication (local and OAuth)
- Features: Login form, Google OAuth button, link to registration
- Sports Theme: Stadium entrance visual metaphor

**RegisterPage**
- Purpose: New user registration
- Features: Registration form with validation
- Sports Theme: Team signup visual metaphor

**DashboardPage**
- Purpose: Main task management interface
- Features: Task list, create task button, real-time updates indicator
- Sports Theme: Scoreboard/game plan layout

**TaskDetailPage**
- Purpose: View and edit individual task
- Features: Task form, delete button, status updates
- Sports Theme: Play card or training session design

**ProfilePage** (Optional 4th page)
- Purpose: User profile and settings
- Features: User info, logout, app settings
- Sports Theme: Player profile card design

#### 2. Shared Components

**Navigation**
- Responsive nav bar with sports team colors
- Active route highlighting
- User avatar/name display

**TaskCard**
- Individual task display component
- Status indicators (To Do, In Progress, Complete) styled as game states
- Quick action buttons

**OfflineIndicator**
- Connection status banner
- Sync status for queued operations

**InstallPrompt**
- PWA installation prompt component
- Dismissible banner or modal

#### 3. Service Worker

**Caching Strategy:**
- Cache-first for static assets (HTML, CSS, JS, images)
- Network-first with cache fallback for API calls
- Background sync for offline task operations

### Backend Components

#### 1. API Routes

**Authentication Routes** (`/api/auth`)
- POST `/register` - Create new user account
- POST `/login` - Authenticate with username/password
- GET `/google` - Initiate Google OAuth flow
- GET `/google/callback` - Handle OAuth callback
- GET `/me` - Get current user info (protected)

**Task Routes** (`/api/tasks`)
- GET `/` - Get all tasks for authenticated user
- POST `/` - Create new task
- GET `/:id` - Get specific task
- PUT `/:id` - Update task
- DELETE `/:id` - Delete task

All task routes require authentication middleware.

#### 2. Middleware

**authMiddleware**
- Verify JWT token from Authorization header
- Attach user object to request
- Return 401 for invalid/missing tokens

**errorHandler**
- Centralized error handling
- Format error responses consistently
- Log errors for debugging

#### 3. WebSocket Events

**Client → Server:**
- `authenticate` - Provide JWT for socket connection
- `task:subscribe` - Subscribe to task updates

**Server → Client:**
- `task:created` - New task created
- `task:updated` - Task modified
- `task:deleted` - Task removed
- `connection:status` - Connection state changes

### Database Schema

#### Users Collection

```javascript
{
  _id: ObjectId,
  username: String (unique, required for local auth),
  email: String (unique, required),
  password: String (hashed, required for local auth),
  googleId: String (unique, optional for OAuth users),
  displayName: String,
  avatar: String (URL),
  authProvider: String (enum: ['local', 'google']),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- username (unique, sparse)
- email (unique)
- googleId (unique, sparse)

#### Tasks Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  title: String (required),
  description: String,
  status: String (enum: ['todo', 'in-progress', 'completed']),
  priority: String (enum: ['low', 'medium', 'high']),
  dueDate: Date (optional),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- userId (for efficient user task queries)
- status (for filtering)
- createdAt (for sorting)

## Data Models

### Frontend State Management

**Auth State:**
```javascript
{
  user: {
    id: string,
    username: string,
    email: string,
    displayName: string,
    avatar: string
  } | null,
  token: string | null,
  isAuthenticated: boolean,
  loading: boolean
}
```

**Tasks State:**
```javascript
{
  tasks: Task[],
  loading: boolean,
  error: string | null,
  syncQueue: PendingOperation[]
}
```

**App State:**
```javascript
{
  isOnline: boolean,
  isInstalled: boolean,
  showInstallPrompt: boolean,
  socketConnected: boolean
}
```

### API Request/Response Formats

**Register Request:**
```json
{
  "username": "athlete123",
  "email": "athlete@example.com",
  "password": "securePassword123"
}
```

**Login Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "athlete123",
    "email": "athlete@example.com",
    "displayName": "Athlete 123"
  }
}
```

**Task Object:**
```json
{
  "id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "title": "Complete sprint training",
  "description": "5x100m sprints with 2min rest",
  "status": "in-progress",
  "priority": "high",
  "dueDate": "2025-12-10T18:00:00Z",
  "createdAt": "2025-12-03T10:00:00Z",
  "updatedAt": "2025-12-03T14:30:00Z"
}
```

## Error Handling

### Frontend Error Handling

**Network Errors:**
- Detect offline state using `navigator.onLine`
- Queue operations when offline
- Display user-friendly offline messages
- Retry failed requests when connection restored

**Authentication Errors:**
- Redirect to login on 401 responses
- Clear invalid tokens from storage
- Display session expiration messages

**Validation Errors:**
- Display field-level validation messages
- Prevent form submission with invalid data
- Highlight problematic fields

### Backend Error Handling

**Standard Error Response Format:**
```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

**Error Categories:**
- 400 Bad Request - Invalid input data
- 401 Unauthorized - Missing or invalid authentication
- 403 Forbidden - Insufficient permissions
- 404 Not Found - Resource doesn't exist
- 409 Conflict - Duplicate resource (e.g., username exists)
- 500 Internal Server Error - Unexpected server errors

**Error Logging:**
- Log all errors with timestamps and request context
- Sanitize sensitive data before logging
- Use different log levels (error, warn, info, debug)

## Testing Strategy

### Frontend Testing

**Unit Tests:**
- Component rendering and props
- State management logic
- Utility functions
- Service Worker caching logic

**Integration Tests:**
- User authentication flows
- Task CRUD operations
- Real-time update handling
- Offline/online transitions

**E2E Tests:**
- Complete user journeys (register → login → create task → logout)
- PWA installation flow
- Cross-browser compatibility

### Backend Testing

**Unit Tests:**
- Route handlers
- Middleware functions
- Database models and validation
- Authentication logic

**Integration Tests:**
- API endpoint responses
- Database operations
- WebSocket event handling
- OAuth flow

**API Tests:**
- Request/response validation
- Authentication and authorization
- Error handling
- Rate limiting (if implemented)

### Testing Tools

- Jest (Unit and integration tests)
- React Testing Library (Component tests)
- Supertest (API endpoint tests)
- Playwright or Cypress (E2E tests)
- MongoDB Memory Server (Test database)

## Sports Theme Design Guidelines

### Visual Identity

**Color Palette:**
- Primary: Energetic blue (#0066CC) - Team spirit
- Secondary: Victory green (#00AA44) - Success/completion
- Accent: Championship gold (#FFB700) - Highlights
- Warning: Referee yellow (#FFC107) - Alerts
- Danger: Red card (#DC3545) - Errors/deletions
- Neutral: Stadium gray (#6C757D) - Secondary text

**Typography:**
- Headers: Bold, athletic-style fonts (e.g., Bebas Neue, Oswald)
- Body: Clean, readable sans-serif (e.g., Roboto, Inter)

**Iconography:**
- Use sports-related icons where appropriate
- Trophy for completed tasks
- Whistle for notifications
- Stopwatch for due dates
- Medal for priorities

**Layout Metaphors:**
- Dashboard as scoreboard
- Tasks as plays or training sessions
- Status progression as game quarters
- User profile as player card

## Deployment Considerations

### Environment Variables

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

**Backend (.env):**
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sports-pwa
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
NODE_ENV=development
```

### Composer Configuration

**composer.json:**
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "dev:client": "cd client && npm run dev",
    "dev:server": "cd server && npm run dev"
  }
}
```

### PWA Manifest

**public/manifest.json:**
```json
{
  "name": "Sports Task Manager",
  "short_name": "SportsTasks",
  "description": "Manage your tasks with a sports-themed PWA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0066CC",
  "theme_color": "#0066CC",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## Security Considerations

1. **Password Security:** Use bcrypt with salt rounds ≥ 10
2. **JWT Security:** Use strong secret, set reasonable expiration (24h)
3. **CORS:** Configure appropriate origins for production
4. **Input Validation:** Sanitize all user inputs on backend
5. **HTTPS:** Require HTTPS in production for PWA and OAuth
6. **OAuth Security:** Validate state parameter, use PKCE if possible
7. **Rate Limiting:** Implement rate limiting on auth endpoints
8. **XSS Protection:** Sanitize rendered user content
9. **MongoDB Injection:** Use Mongoose parameterized queries
