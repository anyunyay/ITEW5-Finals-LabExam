import { useEffect, useState } from 'react';
import { useTask } from '../context/TaskContext';
import { Task, CreateTaskData } from '../services/taskService';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import './DashboardPage.css';

type FilterStatus = 'all' | 'todo' | 'in-progress' | 'completed';

function DashboardPage() {
  const { tasks, loading, error, socketConnected, fetchTasks, createTask, updateTask, deleteTask, clearError } = useTask();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (taskData: CreateTaskData) => {
    await createTask(taskData);
  };

  const handleStatusChange = async (id: string, status: Task['status']) => {
    await updateTask(id, { status });
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
  };

  // Ensure tasks is always an array
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
            <h2>📊 Game Plan Dashboard</h2>
            <p className="page-description">
              Manage your tasks and track your progress
              {socketConnected && (
                <span className="realtime-badge" title="Real-time updates active">
                  🔴 Live
                </span>
              )}
            </p>
          </div>
          <button
            className="btn-create-task"
            onClick={() => setIsModalOpen(true)}
            disabled={loading}
          >
            ➕ Create Task
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={clearError} className="btn-close-error">✕</button>
          </div>
        )}

        <div className="dashboard-stats">
          <div className="stat-card stat-total">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
          </div>
          <div className="stat-card stat-todo">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <div className="stat-value">{stats.todo}</div>
              <div className="stat-label">To Do</div>
            </div>
          </div>
          <div className="stat-card stat-progress">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <div className="stat-value">{stats.inProgress}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
          <div className="stat-card stat-completed">
            <div className="stat-icon">🏆</div>
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
            All Tasks
          </button>
          <button
            className={`filter-btn ${filterStatus === 'todo' ? 'active' : ''}`}
            onClick={() => setFilterStatus('todo')}
          >
            📋 To Do
          </button>
          <button
            className={`filter-btn ${filterStatus === 'in-progress' ? 'active' : ''}`}
            onClick={() => setFilterStatus('in-progress')}
          >
            ⚡ In Progress
          </button>
          <button
            className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            🏆 Completed
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
                {filterStatus === 'all' ? '🎯' : '📭'}
              </div>
              <h3>
                {filterStatus === 'all'
                  ? 'No tasks yet!'
                  : `No ${filterStatus.replace('-', ' ')} tasks`}
              </h3>
              <p>
                {filterStatus === 'all'
                  ? 'Create your first task to get started on your game plan.'
                  : 'Try selecting a different filter to see other tasks.'}
              </p>
              {filterStatus === 'all' && (
                <button
                  className="btn-create-task-empty"
                  onClick={() => setIsModalOpen(true)}
                >
                  ➕ Create Your First Task
                </button>
              )}
            </div>
          ) : (
            <div className="tasks-list">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
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
