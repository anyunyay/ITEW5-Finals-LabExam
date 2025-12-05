import { useEffect, useState } from 'react';
import { useTask } from '../context/TaskContext';
import { Task, CreateTaskData } from '../services/taskService';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import './DashboardPage.css';

type FilterStatus = 'all' | 'todo' | 'in-progress' | 'completed';

// SVG Icon Components
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const LiveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="3" fill="currentColor">
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const AllTasksIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="10" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="2" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="10" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const TodoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const InProgressIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 5V9L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CompletedIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 9L8 11L12 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EmptyIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="2" opacity="0.2" />
    <path d="M25 40H55M40 25V55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
  </svg>
);

function DashboardPage() {
  const { tasks, loading, error, socketConnected, fetchTasks, createTask, updateTask, deleteTask, clearError } = useTask();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (taskData: CreateTaskData) => {
    const result = await createTask(taskData);
    if (!result) {
      console.error('Task creation failed');
    }
  };

  const handleStatusChange = async (id: string, status: Task['status']) => {
    await updateTask(id, { status });
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
  };

  const taskList = Array.isArray(tasks) ? tasks : [];

  const filteredTasks = taskList.filter((task) => {
    if (filterStatus === 'all') return true;
    return task.status === filterStatus;
  });

  const getTaskStats = () => {
    return {
      total: taskList.length,
      todo: taskList.filter((t) => t.status === 'todo').length,
      inProgress: taskList.filter((t) => t.status === 'in-progress').length,
      completed: taskList.filter((t) => t.status === 'completed').length,
    };
  };

  const stats = getTaskStats();

  return (
    <div className="page dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h2>My Tasks</h2>
            <p className="page-description">
              Organize and track your work
              {socketConnected && (
                <span className="realtime-badge" title="Real-time updates active">
                  <LiveIcon />
                  <span>Live</span>
                </span>
              )}
            </p>
          </div>
          <button
            className="btn-create-task"
            onClick={() => setIsModalOpen(true)}
            disabled={loading}
          >
            <PlusIcon />
            <span>New Task</span>
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={clearError} className="btn-close-error">
              <CloseIcon />
            </button>
          </div>
        )}

        <div className="dashboard-stats">
          <div className="stat-card stat-total">
            <div className="stat-icon">
              <AllTasksIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>
          <div className="stat-card stat-todo">
            <div className="stat-icon">
              <TodoIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.todo}</div>
              <div className="stat-label">To Do</div>
            </div>
          </div>
          <div className="stat-card stat-progress">
            <div className="stat-icon">
              <InProgressIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.inProgress}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
          <div className="stat-card stat-completed">
            <div className="stat-icon">
              <CompletedIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </div>

        <div className="task-filters">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            <AllTasksIcon />
            <span>All</span>
          </button>
          <button
            className={`filter-btn ${filterStatus === 'todo' ? 'active' : ''}`}
            onClick={() => setFilterStatus('todo')}
          >
            <TodoIcon />
            <span>To Do</span>
          </button>
          <button
            className={`filter-btn ${filterStatus === 'in-progress' ? 'active' : ''}`}
            onClick={() => setFilterStatus('in-progress')}
          >
            <InProgressIcon />
            <span>In Progress</span>
          </button>
          <button
            className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            <CompletedIcon />
            <span>Completed</span>
          </button>
        </div>

        <div className="tasks-section">
          {loading && taskList.length === 0 ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <EmptyIcon />
              </div>
              <h3>
                {filterStatus === 'all'
                  ? 'No tasks yet'
                  : `No ${filterStatus.replace('-', ' ')} tasks`}
              </h3>
              <p>
                {filterStatus === 'all'
                  ? 'Create your first task to get started'
                  : 'Try selecting a different filter'}
              </p>
              {filterStatus === 'all' && (
                <button
                  className="btn-create-task-empty"
                  onClick={() => setIsModalOpen(true)}
                >
                  <PlusIcon />
                  <span>Create Task</span>
                </button>
              )}
            </div>
          ) : (
            <div className="tasks-list">
              {filteredTasks.map((task, index) => (
                <TaskCard
                  key={task?.id || `task-${index}`}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateTask}
      />
    </div>
  );
}

export default DashboardPage;
