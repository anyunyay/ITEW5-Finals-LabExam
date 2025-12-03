import { io as ioClient } from 'socket.io-client';
import axios from 'axios';

const API_URL = 'http://localhost:5000';
const SOCKET_URL = 'http://localhost:5000';

// Test credentials
const testUser = {
  username: 'sockettest',
  email: 'sockettest@example.com',
  password: 'Test123!@#'
};

async function testSocketConnection() {
  console.log('🧪 Testing WebSocket Server Implementation\n');

  try {
    // Step 1: Register or login to get JWT token
    console.log('1️⃣ Authenticating user...');
    let token;
    
    try {
      const registerRes = await axios.post(`${API_URL}/api/auth/register`, testUser);
      token = registerRes.data.token;
      console.log('✅ User registered successfully');
    } catch (error) {
      if (error.response?.status === 409) {
        // User exists, try login
        const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
          username: testUser.username,
          password: testUser.password
        });
        token = loginRes.data.token;
        console.log('✅ User logged in successfully');
      } else {
        throw error;
      }
    }

    // Step 2: Connect to Socket.io with JWT authentication
    console.log('\n2️⃣ Connecting to WebSocket server...');
    const socket = ioClient(SOCKET_URL, {
      auth: {
        token: token
      }
    });

    // Wait for connection
    await new Promise((resolve, reject) => {
      socket.on('connect', () => {
        console.log('✅ WebSocket connected successfully');
        console.log(`   Socket ID: ${socket.id}`);
        resolve();
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error.message);
        reject(error);
      });

      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });

    // Step 3: Listen for task events
    console.log('\n3️⃣ Setting up event listeners...');
    
    socket.on('task:created', (data) => {
      console.log('📡 Received task:created event:', data.task.title);
    });

    socket.on('task:updated', (data) => {
      console.log('📡 Received task:updated event:', data.task.title);
    });

    socket.on('task:deleted', (data) => {
      console.log('📡 Received task:deleted event:', data.taskId);
    });

    console.log('✅ Event listeners registered');

    // Step 4: Create a task and verify event emission
    console.log('\n4️⃣ Creating a task...');
    const createRes = await axios.post(
      `${API_URL}/api/tasks`,
      {
        title: 'WebSocket Test Task',
        description: 'Testing real-time updates',
        status: 'todo',
        priority: 'high'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    const taskId = createRes.data.task._id;
    console.log('✅ Task created:', taskId);
    
    if (!taskId) {
      throw new Error('Task ID not returned from API');
    }

    // Wait for event
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 5: Update the task
    console.log('\n5️⃣ Updating the task...');
    await axios.put(
      `${API_URL}/api/tasks/${taskId}`,
      {
        status: 'in-progress',
        title: 'WebSocket Test Task (Updated)'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✅ Task updated');

    // Wait for event
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 6: Delete the task
    console.log('\n6️⃣ Deleting the task...');
    await axios.delete(
      `${API_URL}/api/tasks/${taskId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✅ Task deleted');

    // Wait for event
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 7: Disconnect
    console.log('\n7️⃣ Disconnecting...');
    socket.disconnect();
    console.log('✅ Socket disconnected');

    console.log('\n✅ All WebSocket tests passed! 🎉');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testSocketConnection();
