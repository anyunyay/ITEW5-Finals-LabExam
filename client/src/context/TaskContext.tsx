import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
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

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
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

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [taskState, setTaskState] = useState<TaskState>({
    tasks: [],
    loading: false,
    error: null,
  });

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setTaskState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Fetch all tasks for the authenticated user
   */
  const fetchTasks = useCallback(async () => {
    setTaskState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const tasks = await getTasks();
      setTaskState({
        tasks,
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
      setTaskState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, []);

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
      setTaskState((prev) => ({
        tasks: [...prev.tasks, newTask],
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
  }, []);

  /**
   * Update an existing task
   */
  const updateTask = useCallback(async (id: string, taskData: UpdateTaskData): Promise<Task | null> => {
    setTaskState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const updatedTask = await updateTaskAPI(id, taskData);
      setTaskState((prev) => ({
        tasks: prev.tasks.map((task) => (task.id === id ? updatedTask : task)),
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
  }, []);

  /**
   * Delete a task
   */
  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    setTaskState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await deleteTaskAPI(id);
      setTaskState((prev) => ({
        tasks: prev.tasks.filter((task) => task.id !== id),
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
  }, []);

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
