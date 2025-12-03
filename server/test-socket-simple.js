import { io as ioClient } from 'socket.io-client';
import axios from 'axios';

const API_URL = 'http://localhost:5000';
const SOCKET_URL = 'http://localhost:5000';

async function testWebSocket() {
  console.log('🧪 WebSocket Real-Time Events Test\n');

  try {
    // Login to get token
    console.log('1️⃣ Logging in...');
    const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
      username: 'sockettest',
      password: 'Test123!@#'
    });
    const token = loginRes.data.token;
    console.log('✅ Authenticated\n');

    // Connect to WebSocket
    console.log('2️⃣ Connecting to WebSocket...');
    const socket = ioClient(SOCKET_URL, {
      auth: { token }
    });

    await new Promise((resolve, reject) => {
      socket.on('connect', () => {
        console.log('✅ Connected - Socket ID:', socket.id);
        resolve();
      });
      socket.on('connect_error', (err) => reject(err));
      setTimeout(() => reject(new Error('Timeout')), 5000);
    });

    // Setup event listeners
    console.log('\n3️⃣ Listening for events...');
    let eventsReceived = [];

    socket.on('task:created', (data) => {
      console.log('📡 task:created -', data.task.title);
      eventsReceived.push('created');
    });

    socket.on('task:updated', (data) => {
      console.log('📡 task:updated -', data.task.title);
      eventsReceived.push('updated');
    });

    socket.on('task:deleted', (data) => {
      console.log('📡 task:deleted -', data.taskId);
      eventsReceived.push('deleted');
    });

    console.log('✅ Event listeners ready\n');

    // Create task
    console.log('4️⃣ Creating task...');
    const createRes = await axios.post(
      `${API_URL}/api/tasks`,
      { title: 'WebSocket Test', status: 'todo', priority: 'high' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const taskId = createRes.data.task._id;
    console.log('✅ Task created:', taskId);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Update task
    console.log('\n5️⃣ Updating task...');
    await axios.put(
      `${API_URL}/api/tasks/${taskId}`,
      { status: 'in-progress' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Task updated');
    await new Promise(resolve => setTimeout(resolve, 300));

    // Delete task
    console.log('\n6️⃣ Deleting task...');
    await axios.delete(
      `${API_URL}/api/tasks/${taskId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Task deleted');
    await new Promise(resolve => setTimeout(resolve, 300));

    // Verify events
    console.log('\n7️⃣ Verifying events...');
    console.log('Events received:', eventsReceived);
    
    if (eventsReceived.includes('created') && 
        eventsReceived.includes('updated') && 
        eventsReceived.includes('deleted')) {
      console.log('✅ All events received correctly!\n');
    } else {
      console.log('⚠️ Some events missing:', eventsReceived, '\n');
    }

    socket.disconnect();
    console.log('✅ WebSocket test completed! 🎉\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

testWebSocket();
