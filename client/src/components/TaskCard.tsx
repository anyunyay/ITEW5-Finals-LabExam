import { Link } from 'react-router-dom';
import { Task } from '../services/taskService';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Task['status']) => void;
}

// SVG Icon Components
const HighPriorityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2L10 6H14L10.5 9L12 13L8 10L4 13L5.5 9L2 6H6L8 2Z" fill="currentColor" />
  </svg>
);

const MediumPriorityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="6" width="10" height="4" rx="1" fill="currentColor" />
  </svg>
);

const LowPriorityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="2" fill="currentColor" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.2" />
    <path d="M2 5H12" stroke="currentColor" strokeWidth="1.2" />
    <path d="M5 2V4M9 2V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 8C13 10.7614 10.7614 13 8 13C5.23858 13 3 10.7614 3 8C3 5.23858 5.23858 3 8 3C9.5 3 10.8 3.7 11.6 4.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M11 3V5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4L5 13C5 13.5523 5.44772 14 6 14H10C10.5523 14 11 13.5523 11 13L12 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

function TaskCard({ task, onDelete, onStatusChange }: TaskCardProps) {
  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return <HighPriorityIcon />;
      case 'medium':
        return <MediumPriorityIcon />;
      case 'low':
        return <LowPriorityIcon />;
      default:
        return <MediumPriorityIcon />;
    }
  };

  const getStatusClass = (status: Task['status']) => {
    return `status-${status}`;
  };

  const getPriorityClass = (priority: Task['priority']) => {
    return `priority-${priority}`;
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!task.status) return;
    
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
    
    if (onDelete && window.confirm('Delete this task?')) {
      onDelete(task.id);
    }
  };

  return (
    <div className={`task-card ${getStatusClass(task.status || 'todo')}`}>
      <Link to={`/tasks/${task.id}`} className="task-card-link">
        <div className="task-card-header">
          <div className="task-card-title">
            <h3>{task.title || 'Untitled Task'}</h3>
          </div>
          <div className="task-card-badges">
            <span className={`priority-badge ${getPriorityClass(task.priority || 'medium')}`}>
              {getPriorityIcon(task.priority || 'medium')}
              <span>{task.priority || 'medium'}</span>
            </span>
          </div>
        </div>

        {task.description && (
          <p className="task-card-description">{task.description}</p>
        )}

        <div className="task-card-footer">
          <div className="task-card-meta">
            <span className={`status-badge ${getStatusClass(task.status || 'todo')}`}>
              {(task.status || 'todo').replace('-', ' ')}
            </span>
            {task.dueDate && (
              <span className="task-due-date">
                <CalendarIcon />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </span>
            )}
          </div>
          
          <div className="task-card-actions" onClick={(e) => e.preventDefault()}>
            <button
              className="btn-action btn-status"
              onClick={handleStatusClick}
              title="Change status"
            >
              <RefreshIcon />
            </button>
            <button
              className="btn-action btn-delete"
              onClick={handleDelete}
              title="Delete task"
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default TaskCard;
