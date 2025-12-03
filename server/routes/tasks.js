import express from 'express';
import Task from '../models/Task.js';
import { authMiddleware } from '../middleware/auth.js';
import { emitTaskEvent } from '../config/socket.js';

const router = express.Router();

// Apply authentication middleware to all task routes
router.use(authMiddleware);

/**
 * GET /api/tasks
 * Fetch all tasks for the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id })
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json({
      tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch tasks',
        code: 'FETCH_TASKS_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * POST /api/tasks
 * Create a new task for the authenticated user
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    // Validate required fields
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        error: {
          message: 'Task title is required',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Create new task with user association
    const task = new Task({
      userId: req.user.id,
      title: title.trim(),
      description: description?.trim() || '',
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null
    });

    await task.save();

    // Emit real-time event to connected clients
    const io = req.app.locals.io;
    if (io) {
      emitTaskEvent(io, req.user.id, 'task:created', { task });
    }

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Error creating task:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: Object.values(error.errors).map(err => err.message)
        }
      });
    }

    res.status(500).json({
      error: {
        message: 'Failed to create task',
        code: 'CREATE_TASK_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * GET /api/tasks/:id
 * Fetch a specific task with ownership verification
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: {
          message: 'Invalid task ID format',
          code: 'INVALID_ID'
        }
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        error: {
          message: 'Task not found',
          code: 'TASK_NOT_FOUND'
        }
      });
    }

    // Verify ownership
    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({
        error: {
          message: 'Access denied. You do not own this task.',
          code: 'FORBIDDEN'
        }
      });
    }

    res.json({ task });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch task',
        code: 'FETCH_TASK_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * PUT /api/tasks/:id
 * Update a task with ownership verification
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate } = req.body;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: {
          message: 'Invalid task ID format',
          code: 'INVALID_ID'
        }
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        error: {
          message: 'Task not found',
          code: 'TASK_NOT_FOUND'
        }
      });
    }

    // Verify ownership
    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({
        error: {
          message: 'Access denied. You do not own this task.',
          code: 'FORBIDDEN'
        }
      });
    }

    // Update fields if provided
    if (title !== undefined) {
      if (!title || title.trim().length === 0) {
        return res.status(400).json({
          error: {
            message: 'Task title cannot be empty',
            code: 'VALIDATION_ERROR'
          }
        });
      }
      task.title = title.trim();
    }
    if (description !== undefined) task.description = description.trim();
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    // Emit real-time event to connected clients
    const io = req.app.locals.io;
    if (io) {
      emitTaskEvent(io, req.user.id, 'task:updated', { task });
    }

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Error updating task:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: Object.values(error.errors).map(err => err.message)
        }
      });
    }

    res.status(500).json({
      error: {
        message: 'Failed to update task',
        code: 'UPDATE_TASK_ERROR',
        details: error.message
      }
    });
  }
});

/**
 * DELETE /api/tasks/:id
 * Delete a task with ownership verification
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: {
          message: 'Invalid task ID format',
          code: 'INVALID_ID'
        }
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        error: {
          message: 'Task not found',
          code: 'TASK_NOT_FOUND'
        }
      });
    }

    // Verify ownership
    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({
        error: {
          message: 'Access denied. You do not own this task.',
          code: 'FORBIDDEN'
        }
      });
    }

    await task.deleteOne();

    // Emit real-time event to connected clients
    const io = req.app.locals.io;
    if (io) {
      emitTaskEvent(io, req.user.id, 'task:deleted', { taskId: id });
    }

    res.json({
      message: 'Task deleted successfully',
      taskId: id
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      error: {
        message: 'Failed to delete task',
        code: 'DELETE_TASK_ERROR',
        details: error.message
      }
    });
  }
});

export default router;
