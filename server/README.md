# Sports PWA Task Manager - API Server

Express.js backend server for the Sports PWA Task Manager application.

## Setup

1. Copy the environment variables template:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your MongoDB Atlas URI and other configuration values.

3. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

See `.env.example` for all required environment variables.

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and update `MONGODB_URI` in `.env`

## API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Root
- `GET /` - API welcome message

## Development

The server uses nodemon for hot-reloading during development. Any changes to the code will automatically restart the server.

## Port

Default port: 5000 (configurable via PORT environment variable)
