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
import { syncQueueService, QueuedOperation } from '../services/syncQueueService';
import { useAuth } from './AuthContext';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  socketConnected: boolean;
  isOnline: boolean;
  isUsingCachedData: boolean;
  queuedOperationsCount: number;
  isSyncing: boolean;
  syncError: string | null;
}

interface TaskContextType extends TaskState {
  fetchTasks: () => Promise<void>;
  fetchTaskById: (id: string) => Promise<Task | null>;
  createTask: (taskData: CreateTaskData) => Promise<Task | null>;
  updateTask: (id: string, taskData: UpdateTaskData) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  clearError: () => void;
  syncQueuedOperations: () => Promise<void>;
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
    queuedOperationsCount: 0,
    isSyncing: false,
    syncError: null,
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
    setTaskState((prev) => ({ ...prev, error: null, syncError: null }));
  }, []);

  /**
   * Update queued operations count
   */
  const updateQueueCount = useCallback(async () => {
    try {
      const count = await syncQueueService.getQueueCount();
      setTaskState((prev) => ({ ...prev, queuedOperationsCount: count }));
    } catch (error) {
      console.error('Failed to get queue count:', error);
    }
  }, []);

  /**
   * Process a single queued operation
   */
  const processQueuedOperation = async (operation: QueuedOperation): Promise<boolean> => {
    try {
      console.log('Processing queued operation:', operation);

      switch (operation.type) {
        case 'create':
          await createTaskAPI(operation.taskData);
          break;
        case 'update':
          if (!operation.taskId) throw new Error('Task ID required for update');
          await updateTaskAPI(operation.taskId, operation.taskData);
          break;
        case 'delete':
          if (!operation.taskId) throw new Error('Task ID required for delete');
          await deleteTaskAPI(operation.taskId);
          break;
        default:
          throw new Error(`Unknown operation type: ${operation.type}`);
      }

      // Remove from queue on success
      await syncQueueService.removeOperation(operation.id);
      console.log('Successfully processed operation:', operation.id);
      return true;
    } catch (error) {
      console.error('Failed to process operation:', operation.id, error);
      
      // Update retry count
      const retryCount = operation.retryCount + 1;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Remove from queue if max retries reached (3 attempts)
      if (retryCount >= 3) {
        console.warn('Max retries reached, removing operation:', operation.id);
        await syncQueueService.removeOperation(operation.id);
      } else {
        await syncQueueService.updateOperation(operation.id, {
          retryCount,
          error: errorMessage,
        });
      }
      
      return false;
    }
  };

  /**
   * Sync all queued operations with the backend
   */
  const syncQueuedOperations = useCallback(async () => {
    // Only sync if online
    if (!navigator.onLine) {
      console.log('Cannot sync: offline');
      return;
    }

    try {
      setTaskState((prev) => ({ ...prev, isSyncing: true, syncError: null }));

      const operations = await syncQueueService.getAllOperations();
      
      if (operations.length === 0) {
        console.log('No operations to sync');
        setTaskState((prev) => ({ ...prev, isSyncing: false }));
        return;
      }

      console.log(`Syncing ${operations.length} queued operations...`);

      let successCount = 0;
      let failCount = 0;

      // Process operations sequentially to maintain order
      for (const operation of operations) {
        const success = await processQueuedOperation(operation);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
      }

      console.log(`Sync complete: ${successCount} succeeded, ${failCount} failed`);

      // Update queue count
      await updateQueueCount();

      // Refetch tasks to get the latest state
      await fetchTasks();

      setTaskState((prev) => ({
        ...prev,
        isSyncing: false,
        syncError: failCount > 0 ? `${failCount} operation(s) failed to sync` : null,
      }));
    } catch (error) {
      console.error('Sync failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      setTaskState((prev) => ({
        ...prev,
        isSyncing: false,
        syncError: errorMessage,
      }));
    }
  }, [updateQueueCount]);

  /**
   * Handle real-time task created event
   */
  const handleTaskCreated = useCallback((data: { task: Task }) => {
    console.log('Real-time: Task created', data.task);
    setTaskState((prev) => {
      // Ensure tasks is an array
      const taskList = Array.isArray(prev.tasks) ? prev.tasks : [];
      // Check if task already exists to avoid duplicates
      const exists = taskList.some((t) => t.id === data.task.id);
      if (exists) return prev;
      
      return {
        ...prev,
        tasks: [...taskList, data.task],
      };
    });
  }, []);

  /**
   * Handle real-time task updated event
   */
  const handleTaskUpdated = useCallback((data: { task: Task }) => {
    console.log('Real-time: Task updated', data.task);
    setTaskState((prev) => {
      const taskList = Array.isArray(prev.tasks) ? prev.tasks : [];
      return {
        ...prev,
        tasks: taskList.map((t) => (t.id === data.task.id ? data.task : t)),
      };
    });
  }, []);

  /**
   * Handle real-time task deleted event
   */
  const handleTaskDeleted = useCallback((data: { taskId: string }) => {
    console.log('Real-time: Task deleted', data.taskId);
    setTaskState((prev) => {
      const taskList = Array.isArray(prev.tasks) ? prev.tasks : [];
      return {
        ...prev,
        tasks: taskList.filter((t) => t.id !== data.taskId),
      };
    });
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
    const handleOnline = async () => {
      console.log('Network connection restored');
      setTaskState((prev) => ({ ...prev, isOnline: true, isUsingCachedData: false }));
      
      if (isAuthenticated) {
        // Check if there are queued operations to sync
        const hasQueued = await syncQueueService.hasQueuedOperations();
        if (hasQueued) {
          console.log('Syncing queued operations after reconnection...');
          await syncQueuedOperations();
        } else {
          // Just refetch tasks if no queued operations
          await fetchTasks();
        }
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
  }, [isAuthenticated, fetchTasks, syncQueuedOperations]);

  /**
   * Load queue count on mount and when authenticated
   */
  useEffect(() => {
    if (isAuthenticated) {
      updateQueueCount();
    }
  }, [isAuthenticated, updateQueueCount]);

  /**
   * Set up socket connection (only once when authenticated)
   */
  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('🔌 TaskContext: Initializing socket connection with token');
      // Small delay to ensure auth state is fully settled
      const timer = setTimeout(() => {
        socketService.connect(token);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      console.log('🔌 TaskContext: Disconnecting socket (not authenticated)');
      // Disconnect socket if not authenticated
      socketService.disconnect();
    }
  }, [isAuthenticated, token]);

  /**
   * Set up socket event listeners
   */
  useEffect(() => {
    if (isAuthenticated && token) {
      // Subscribe to task events
      socketService.onTaskCreated(handleTaskCreated);
      socketService.onTaskUpdated(handleTaskUpdated);
      socketService.onTaskDeleted(handleTaskDeleted);

      // Subscribe to connection status
      socketService.onConnectionStatusChange(handleConnectionStatus);

      // Cleanup: only unsubscribe from events, don't disconnect socket
      return () => {
        socketService.offTaskCreated(handleTaskCreated);
        socketService.offTaskUpdated(handleTaskUpdated);
        socketService.offTaskDeleted(handleTaskDeleted);
        socketService.offConnectionStatusChange(handleConnectionStatus);
      };
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
    
    // If offline, queue the operation
    if (!navigator.onLine) {
      try {
        await syncQueueService.addOperation({
          type: 'create',
          taskData,
        });
        
        // Create optimistic task for UI
        const optimisticTask: Task = {
          id: `temp_${Date.now()}`,
          userId: 'current_user',
          title: taskData.title,
          description: taskData.description,
          status: taskData.status || 'todo',
          priority: taskData.priority || 'medium',
          dueDate: taskData.dueDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        const taskList = Array.isArray(taskState.tasks) ? taskState.tasks : [];
        const updatedTasks = [...taskList, optimisticTask];
        saveTasksToCache(updatedTasks);
        await updateQueueCount();
        
        setTaskState((prev) => ({
          ...prev,
          tasks: updatedTasks,
          loading: false,
          error: null,
        }));
        
        return optimisticTask;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to queue task';
        setTaskState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        return null;
      }
    }
    
    // Online: create immediately
    try {
      const newTask = await createTaskAPI(taskData);
      const taskList = Array.isArray(taskState.tasks) ? taskState.tasks : [];
      const updatedTasks = [...taskList, newTask];
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
  }, [taskState.tasks, saveTasksToCache, updateQueueCount]);

  /**
   * Update an existing task
   */
  const updateTask = useCallback(async (id: string, taskData: UpdateTaskData): Promise<Task | null> => {
    setTaskState((prev) => ({ ...prev, loading: true, error: null }));
    
    // If offline, queue the operation
    if (!navigator.onLine) {
      try {
        await syncQueueService.addOperation({
          type: 'update',
          taskId: id,
          taskData,
        });
        
        // Update task optimistically in UI
        const taskList = Array.isArray(taskState.tasks) ? taskState.tasks : [];
        const updatedTasks = taskList.map((task) => {
          if (task.id === id) {
            return {
              ...task,
              ...taskData,
              updatedAt: new Date().toISOString(),
            };
          }
          return task;
        });
        
        saveTasksToCache(updatedTasks);
        await updateQueueCount();
        
        setTaskState((prev) => ({
          ...prev,
          tasks: updatedTasks,
          loading: false,
          error: null,
        }));
        
        return updatedTasks.find((t) => t.id === id) || null;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to queue update';
        setTaskState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        return null;
      }
    }
    
    // Online: update immediately
    try {
      const updatedTask = await updateTaskAPI(id, taskData);
      const taskList = Array.isArray(taskState.tasks) ? taskState.tasks : [];
      const updatedTasks = taskList.map((task) => (task.id === id ? updatedTask : task));
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
  }, [taskState.tasks, saveTasksToCache, updateQueueCount]);

  /**
   * Delete a task
   */
  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    setTaskState((prev) => ({ ...prev, loading: true, error: null }));
    
    // If offline, queue the operation
    if (!navigator.onLine) {
      try {
        await syncQueueService.addOperation({
          type: 'delete',
          taskId: id,
        });
        
        // Remove task optimistically from UI
        const taskList = Array.isArray(taskState.tasks) ? taskState.tasks : [];
        const updatedTasks = taskList.filter((task) => task.id !== id);
        saveTasksToCache(updatedTasks);
        await updateQueueCount();
        
        setTaskState((prev) => ({
          ...prev,
          tasks: updatedTasks,
          loading: false,
          error: null,
        }));
        
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to queue delete';
        setTaskState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        return false;
      }
    }
    
    // Online: delete immediately
    try {
      await deleteTaskAPI(id);
      const taskList = Array.isArray(taskState.tasks) ? taskState.tasks : [];
      const updatedTasks = taskList.filter((task) => task.id !== id);
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
  }, [taskState.tasks, saveTasksToCache, updateQueueCount]);

  const value: TaskContextType = {
    ...taskState,
    fetchTasks,
    fetchTaskById,
    createTask,
    updateTask,
    deleteTask,
    clearError,
    syncQueuedOperations,
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
