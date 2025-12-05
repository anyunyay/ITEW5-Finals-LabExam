import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTask } from '../context/TaskContext';
import { UpdateTaskData } from '../services/taskService';
import './TaskDetailPage.css';

// SVG Icon Components
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SaveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 10L8 13L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 5H16M7 5V4C7 3.44772 7.44772 3 8 3H12C12.5523 3 13 3.44772 13 4V5M8 9V14M12 9V14M5 5L6 16C6 16.5523 6.44772 17 7 17H13C13.5523 17 14 16.5523 14 16L15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const WarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L3 12L12 21L21 12L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 8V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="16" r="0.5" fill="currentColor" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

interface TaskFormData {
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchTaskById, updateTask, deleteTask, loading, error, clearError } = useTask();

  const [task, setTask] = useState<TaskFormData | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadTask = async () => {
      if (!id) {
        navigate('/dashboard');
        return;
      }

      const taskData = await fetchTaskById(id);
      if (taskData) {
        const formattedTask: TaskFormData = {
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          dueDate: taskData.dueDate ? taskData.dueDate.split('T')[0] : '',
        };
        setTask(formattedTask);
        setFormData(formattedTask);
      } else {
        // Task not found or error occurred
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    };

    loadTask();
  }, [id, fetchTaskById, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setValidationError(null);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setValidationError('Title is required');
      return;
    }

    if (!id) return;

    setIsSubmitting(true);
    setValidationError(null);

    try {
      const updateData: UpdateTaskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
      };

      if (formData.dueDate) {
        updateData.dueDate = formData.dueDate;
      }

      const updatedTask = await updateTask(id, updateData);
      
      if (updatedTask) {
        // Update local state with the updated task
        const formattedTask: TaskFormData = {
          title: updatedTask.title,
          description: updatedTask.description,
          status: updatedTask.status,
          priority: updatedTask.priority,
          dueDate: updatedTask.dueDate ? updatedTask.dueDate.split('T')[0] : '',
        };
        setTask(formattedTask);
        
        // Navigate back to dashboard after successful update
        setTimeout(() => navigate('/dashboard'), 500);
      }
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    setIsDeleting(true);
    const success = await deleteTask(id);
    
    if (success) {
      navigate('/dashboard');
    } else {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const hasChanges = () => {
    if (!task) return false;
    return (
      formData.title !== task.title ||
      formData.description !== task.description ||
      formData.status !== task.status ||
      formData.priority !== task.priority ||
      formData.dueDate !== task.dueDate
    );
  };

  if (loading && !task) {
    return (
      <div className="page task-detail-page">
        <div className="page-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading task details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="page task-detail-page">
        <div className="page-container">
          <div className="error-state">
            <div className="error-icon">
              <WarningIcon />
            </div>
            <h3>Task Not Found</h3>
            <p>{error}</p>
            <p>Redirecting to dashboard...</p>
            <Link to="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page task-detail-page">
      <div className="task-detail-container">
        <div className="task-detail-header">
          <div>
            <h2>Task Details</h2>
            <p className="page-description">View and edit task information</p>
          </div>
          <Link to="/dashboard" className="btn-back">
            <BackIcon />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {(error || validationError) && (
          <div className="error-banner">
            <span>{validationError || error}</span>
            <button
              onClick={() => {
                setValidationError(null);
                clearError();
              }}
              className="btn-close-error"
            >
              <CloseIcon />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="task-detail-form">
          <div className="form-group">
            <label htmlFor="title">
              Task Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title..."
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description..."
              rows={6}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isSubmitting || isDeleting}
            >
              <DeleteIcon />
              <span>Delete Task</span>
            </button>
            <div className="form-actions-right">
              <Link
                to="/dashboard"
                className="btn btn-secondary"
                onClick={(e) => {
                  if (isSubmitting) e.preventDefault();
                }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !hasChanges()}
              >
                <SaveIcon />
                <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>

        {showDeleteConfirm && (
          <div className="modal-overlay" onClick={() => !isDeleting && setShowDeleteConfirm(false)}>
            <div className="modal-content delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-header-icon">
                  <WarningIcon />
                </div>
                <h3>Confirm Delete</h3>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this task?</p>
                <p className="task-title-preview">"{formData.title}"</p>
                <p className="warning-text">This action cannot be undone.</p>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <DeleteIcon />
                  <span>{isDeleting ? 'Deleting...' : 'Delete Task'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskDetailPage;
