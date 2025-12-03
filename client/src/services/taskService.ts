import api from './api';

export interface Task {
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

export interface CreateTaskData {
  title: string;
  description: string;
  status?: 'todo' | 'in-progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

/**
 * Get all tasks for the authenticated user
 */
export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get('/api/tasks');
  return response.data;
};

/**
 * Get a specific task by ID
 */
export const getTaskById = async (id: string): Promise<Task> => {
  const response = await api.get(`/api/tasks/${id}`);
  return response.data;
};

/**
 * Create a new task
 */
export const createTask = async (taskData: CreateTaskData): Promise<Task> => {
  const response = await api.post('/api/tasks', taskData);
  return response.data;
};

/**
 * Update an existing task
 */
export const updateTask = async (id: string, taskData: UpdateTaskData): Promise<Task> => {
  const response = await api.put(`/api/tasks/${id}`, taskData);
  return response.data;
};

/**
 * Delete a task
 */
export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/api/tasks/${id}`);
};
