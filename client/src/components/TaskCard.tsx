import { Link } from 'react-router-dom';
import { Task } from '../services/taskService';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Task['status']) => void;
}

function TaskCard({ task, onDelete, onStatusChange }: TaskCardProps) {
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return '📋';
      case 'in-progress':
        return '⚡';
      case 'completed':
        return '🏆';
      default:
        return '📋';
    }
  };

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return '🔥';
      case 'medium':
        return '⚠️';
      case 'low':
        return '📌';
      default:
        return '📌';
    }
  };

  const getStatusClass = (status: Task['status']) => {
    return `status-badge status-${status}`;
  };

  const getPriorityClass = (priority: Task['priority']) => {
    return `priority-badge priority-${priority}`;
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const statusOrder: Task['status'][] = ['todo', 'in-progress', 'completed'];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    
    if (onStatusChange) {
      onStatusChange(task.id, nextStatus);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onDelete && window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
    }
  };

  return (
    <div className={`task-card ${getStatusClass(task.status)}`}>
      <Link to={`/tasks/${task.id}`} className="task-card-link">
        <div className="task-card-header">
          <div className="task-card-title">
            <span className="status-icon">{getStatusIcon(task.status)}</span>
            <h3>{task.title}</h3>
          </div>
          <div className="task-card-badges">
            <span className={getPriorityClass(task.priority)}>
              {getPriorityIcon(task.priority)} {task.priority}
            </span>
          </div>
        </div>

        {task.description && (
          <p className="task-card-description">{task.description}</p>
        )}

        <div className="task-card-footer">
          <div className="task-card-meta">
            <span className={getStatusClass(task.status)}>
              {task.status.replace('-', ' ')}
            </span>
            {task.dueDate && (
              <span className="task-due-date">
                ⏱️ {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
          
          <div className="task-card-actions" onClick={(e) => e.preventDefault()}>
            <button
              className="btn-action btn-status"
              onClick={handleStatusClick}
              title="Change status"
            >
              ↻
            </button>
            <button
              className="btn-action btn-delete"
              onClick={handleDelete}
              title="Delete task"
            >
              🗑️
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default TaskCard;
