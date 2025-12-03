# TaskContext Usage Guide

## Overview

The TaskContext provides centralized state management for task-related operations in the application. It handles all CRUD operations for tasks with built-in loading states and error handling.

## Features

- ✅ Centralized task state management
- ✅ Automatic JWT token attachment via Axios interceptor
- ✅ Loading states for async operations
- ✅ User-friendly error messages
- ✅ Automatic 401 handling (redirects to login)
- ✅ Network error handling

## Setup

The TaskProvider is already integrated in `App.tsx`:

```tsx
<AuthProvider>
  <TaskProvider>
    <Router>
      {/* Your app routes */}
    </Router>
  </TaskProvider>
</AuthProvider>
```

## Usage

### Import the hook

```tsx
import { useTask } from '../context/TaskContext';
```

### Access task state and methods

```tsx
function MyComponent() {
  const {
    tasks,           // Array of tasks
    loading,         // Boolean loading state
    error,           // Error message string or null
    fetchTasks,      // Fetch all tasks
    fetchTaskById,   // Fetch single task
    createTask,      // Create new task
    updateTask,      // Update existing task
    deleteTask,      // Delete task
    clearError,      // Clear error message
  } = useTask();

  // Your component logic
}
```

## API Methods

### fetchTasks()

Fetches all tasks for the authenticated user.

```tsx
useEffect(() => {
  fetchTasks();
}, [fetchTasks]);
```

### fetchTaskById(id: string)

Fetches a specific task by ID. Returns the task or null if error.

```tsx
const task = await fetchTaskById('task-id-123');
if (task) {
  console.log('Task loaded:', task);
}
```

### createTask(taskData: CreateTaskData)

Creates a new task. Returns the created task or null if error.

```tsx
const newTask = await createTask({
  title: 'Complete sprint training',
  description: '5x100m sprints',
  status: 'todo',
  priority: 'high',
});

if (newTask) {
  console.log('Task created:', newTask);
}
```

### updateTask(id: string, taskData: UpdateTaskData)

Updates an existing task. Returns the updated task or null if error.

```tsx
const updated = await updateTask('task-id-123', {
  status: 'completed',
});

if (updated) {
  console.log('Task updated:', updated);
}
```

### deleteTask(id: string)

Deletes a task. Returns true if successful, false if error.

```tsx
const success = await deleteTask('task-id-123');
if (success) {
  console.log('Task deleted');
}
```

### clearError()

Clears the current error message.

```tsx
if (error) {
  // Display error to user
  setTimeout(() => clearError(), 5000); // Clear after 5 seconds
}
```

## Example: Dashboard Component

```tsx
import React, { useEffect } from 'react';
import { useTask } from '../context/TaskContext';

function DashboardPage() {
  const { tasks, loading, error, fetchTasks, createTask, clearError } = useTask();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTask = await createTask({
      title: 'New Task',
      description: 'Task description',
      status: 'todo',
      priority: 'medium',
    });

    if (newTask) {
      console.log('Task created successfully');
    }
  };

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div>
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
      
      <h1>My Tasks ({tasks.length})</h1>
      
      <form onSubmit={handleCreateTask}>
        {/* Form fields */}
        <button type="submit">Create Task</button>
      </form>

      <div className="task-list">
        {tasks.map(task => (
          <div key={task.id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <span>Status: {task.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Error Handling

The TaskContext automatically handles:

- **401 Unauthorized**: Clears auth data and redirects to login
- **Network errors**: Shows "Network error. Please check your connection."
- **Server errors**: Displays the error message from the API
- **Unknown errors**: Shows "An unexpected error occurred"

All errors are stored in the `error` state and can be cleared with `clearError()`.

## Task Data Types

### Task

```typescript
interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}
```

### CreateTaskData

```typescript
interface CreateTaskData {
  title: string;
  description: string;
  status?: 'todo' | 'in-progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}
```

### UpdateTaskData

```typescript
interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}
```

## API Configuration

The API base URL is configured via environment variable:

```env
VITE_API_URL=http://localhost:5000
```

If not set, it defaults to `http://localhost:5000`.

## JWT Token

The Axios interceptor automatically attaches the JWT token from localStorage to all requests:

```
Authorization: Bearer <token>
```

The token is stored by the AuthContext when users log in or register.
