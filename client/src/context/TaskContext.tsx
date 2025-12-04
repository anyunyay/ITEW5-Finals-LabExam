import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  Task,
  CreateTaskData,
  UpdateTaskData,
  getTasks,
  getTaskById,
  createTask as createTaskAPI,
  updateTask as updateTaskAPI,
  deleteTask as deleteTaskAPI,
} from '../services/taskService';
import { socketService } from '../services/socketService';
import { useAuth } from './AuthContext';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  socketConnected: boolean;
  isOnline: boolean;
  isUsingCachedData: boolean;
}

interface TaskContextType extends TaskState {
  fetchTasks: () => Promise<void>;
  fetchTaskById: (id: string) => Promise<Task | null>;
  createTask: (taskData: CreateTaskData) => Promise<Task | null>;
  updateTask: (id: string, taskData: UpdateTaskData) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  clearError: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
  children: ReactNode;
}

const TASKS_CACHE_KEY = 'sports_pwa_tasks_cache';

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [taskState, setTaskState] = useState<TaskState>({
    tasks: [],
    loading: false,
    error: null,
    socketConnected: false,
    isOnline: navigator.onLine,
    isUsingCachedData: false,
  });

  /**
   * Save tasks to localStorage cache
   */
  const saveTasksToCache = useCallback((tasks: Task[]) => {
    try {
      localStorage.setItem(TASKS_CACHE_KEY, JSON.stringify({
        tasks,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Failed to cache tasks:', error);
    }
  }, []);

  /**
   * Load tasks from localStorage cache
   */
  const loadTasksFromCache = useCallback((): Task[] | null => {
    try {
      const cached = localStorage.getItem(TASKS_CACHE_KEY);
      if (cached) {
        const { tasks } = JSON.parse(cached);
        return tasks;
      }
    } catch (error) {
      console.error('Failed to load cached tasks:', error);
    }
    return null;
  }, []);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setTaskState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Handle real-time task created event
   */
  const handleTaskCreated = useCallback((data: { task: Task }) => {
    console.log('Real-time: Task created', data.task);
    setTaskState((prev) => {
      // Check if task already exists to avoid duplicates
      const exists = prev.tasks.some((t) => t.id === data.task.id);
      if (exists) return prev;
      
      return {
        ...prev,
        tasks: [...prev.tasks, data.task],
      };
    });
  }, []);

  /**
   * Handle real-time task updated event
   */
  const handleTaskUpdated = useCallback((data: { task: Task }) => {
    console.log('Real-time: Task updated', data.task);
    setTaskState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === data.task.id ? data.task : t)),
    }));
  }, []);

  /**
   * Handle real-time task deleted event
   */
  const handleTaskDeleted = useCallback((data: { taskId: string }) => {
    console.log('Real-time: Task deleted', data.taskId);
    setTaskState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== data.taskId),
    }));
  }, []);

  /**
   * Handle socket connection status changes
   */
  const handleConnectionStatus = useCallback((connected: boolean) => {
    console.log('Socket connection status:', connected);
    setTaskState((prev) => ({ ...prev, socketConnected: connected }));
  }, []);

  /**
   * Fetch all tasks for the authenticated user
   */
  const fetchTasks = useCallback(async () => {
    setTaskState((prev) => ({ ...prev, loading: true, error: null, isUsingCachedData: false }));
    
    // If offline, try to load from cache
    if (!navigator.onLine) {
      const cachedTasks = loadTasksFromCache();
      if (cachedTasks) {
        console.log('Loading tasks from cache (offline mode)');
        setTaskState((prev) => ({
          ...prev,
          tasks: cachedTasks,
          loading: false,
          error: null,
          isUsingCachedData: true,
        }));
        return;
      } else {
        setTaskState((prev) => ({
          ...prev,
          loading: false,
          error: 'No cached data available. Please connect to the internet.',
          isUsingCachedData: false,
        }));
        return;
      }
    }

    // Online: fetch from server
    try {
      const tasks = await getTasks();
      saveTasksToCache(tasks);
      setTaskState((prev) => ({
        ...prev,
        tasks,
        loading: false,
        error: null,
        isUsingCachedData: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
      
      // If fetch fails, try to load from cache as fallback
      const cachedTasks = loadTasksFromCache();
      if (cachedTasks) {
        console.log('Loading tasks from cache (network error fallback)');
        setTaskState((prev) => ({
          ...prev,
          tasks: cachedTasks,
          loading: false,
          error: 'Using cached data. ' + errorMessage,
          isUsingCachedData: true,
        }));
      } else {
        setTaskState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          isUsingCachedData: false,
        }));
      }
    }
  }, [loadTasksFromCache, saveTasksToCache]);

  /**
   * Set up online/offline event listeners
   */
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network connection restored');
      setTaskState((prev) => ({ ...prev, isOnline: true, isUsingCachedData: false }));
      // Automatically refetch tasks when coming back online
      if (isAuthenticated) {
        fetchTasks();
      }
    };

    const handleOffline = () => {
      console.log('Network connection lost');
      setTaskState((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAuthenticated, fetchTasks]);

  /**
   * Set up socket connection and event listeners
   */
  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect socket with JWT token
      socketService.connect(token);

      // Subscribe to task events
      socketService.onTaskCreated(handleTaskCreated);
      socketService.onTaskUpdated(handleTaskUpdated);
      socketService.onTaskDeleted(handleTaskDeleted);

      // Subscribe to connection status
      socketService.onConnectionStatusChange(handleConnectionStatus);

      // Cleanup on unmount or when auth changes
      return () => {
        socketService.offTaskCreated(handleTaskCreated);
        socketService.offTaskUpdated(handleTaskUpdated);
        socketService.offTaskDeleted(handleTaskDeleted);
        socketService.offConnectionStatusChange(handleConnectionStatus);
        socketService.disconnect();
      };
    } else {
      // Disconnect socket if not authenticated
      socketService.disconnect();
    }
  }, [isAuthenticated, token, handleTaskCreated, handleTaskUpdated, handleTaskDeleted, handleConnectionStatus]);

  /**
   * Fetch a specific task by ID
   */
  const fetchTaskById = useCallback(async (id: string): Promise<Task | null> => {
    setTaskState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const task = await getTaskById(id);
      setTaskState((prev) => ({ ...prev, loading: false }));
      return task;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch task';
      setTaskState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  /**
   * Create a new task
   */
  const createTask = useCallback(async (taskData: CreateTaskData): Promise<Task | null> => {
    setTaskState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const newTask = await createTaskAPI(taskData);
      const updatedTasks = [...taskState.tasks, newTask];
      saveTasksToCache(updatedTasks);
      setTaskState((prev) => ({
        ...prev,
        tasks: updatedTasks,
        loading: false,
        error: null,
      }));
      return newTask;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
      setTaskState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, [taskState.tasks, saveTasksToCache]);

  /**
   * Update an existing task
   */
  const updateTask = useCallback(async (id: string, taskData: UpdateTaskData): Promise<Task | null> => {
    setTaskState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const updatedTask = await updateTaskAPI(id, taskData);
      const updatedTasks = taskState.tasks.map((task) => (task.id === id ? updatedTask : task));
      saveTasksToCache(updatedTasks);
      setTaskState((prev) => ({
        ...prev,
        tasks: updatedTasks,
        loading: false,
        error: null,
      }));
      return updatedTask;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      setTaskState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, [taskState.tasks, saveTasksToCache]);

  /**
   * Delete a task
   */
  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    setTaskState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await deleteTaskAPI(id);
      const updatedTasks = taskState.tasks.filter((task) => task.id !== id);
      saveTasksToCache(updatedTasks);
      setTaskState((prev) => ({
        ...prev,
        tasks: updatedTasks,
        loading: false,
        error: null,
      }));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      setTaskState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [taskState.tasks, saveTasksToCache]);

  const value: TaskContextType = {
    ...taskState,
    fetchTasks,
    fetchTaskById,
    createTask,
    updateTask,
    deleteTask,
    clearError,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
