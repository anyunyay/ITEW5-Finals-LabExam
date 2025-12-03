# Sports PWA Task Manager

A full-stack Progressive Web Application with a sports theme for task management, featuring real-time updates, offline capabilities, and Google OAuth authentication.

## Project Structure

```
sports-pwa-task-manager/
├── client/              # React frontend application
│   └── package.json
├── server/              # Express.js backend API
│   └── package.json
├── composer.json        # Composer configuration
├── package.json         # Root workspace configuration
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB Atlas account (for cloud database)

## Getting Started

### 1. Install Dependencies

Install all dependencies for both client and server:

```bash
npm run install:all
```

### 2. Environment Configuration

Create `.env` files in both client and server directories (see Environment Variables section below).

### 3. Run Development Servers

Start both frontend and backend concurrently:

```bash
npm run dev
```

This will start:
- Client application on `http://localhost:3000`
- API server on `http://localhost:5000`

## Environment Variables

### Server (.env)

Create `server/.env`:

```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sports-pwa
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
NODE_ENV=development
```

### Client (.env)

Create `client/.env`:

```
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Available Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run install:all` - Install dependencies for all workspaces
- `npm run build` - Build the client application for production

## Features

- ✅ User authentication (local and Google OAuth)
- ✅ Real-time task updates via WebSocket
- ✅ Offline support with Service Worker
- ✅ Progressive Web App (installable)
- ✅ Sports-themed UI
- ✅ RESTful API
- ✅ Cloud-hosted MongoDB

## Tech Stack

**Frontend:**
- React 18
- React Router v6
- Socket.io Client
- Workbox (Service Worker)
- Vite

**Backend:**
- Node.js
- Express.js
- Socket.io
- Passport.js (Google OAuth)
- Mongoose
- JWT

**Database:**
- MongoDB Atlas

## License

MIT
