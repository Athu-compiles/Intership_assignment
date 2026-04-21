import { useEffect, useState } from 'react';
import apiClient from '../api/client.js';

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
  });
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: 'pending',
  });

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 1800);
  };

  const fetchTasks = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/tasks', {
        params: { page, limit: 10 },
      });
      setTasks(response.data.data.tasks);
      setPagination(response.data.data.pagination);
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to load tasks. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(1);
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/tasks', form);
      setForm({ title: '', description: '' });
      await fetchTasks(1);
      showSuccess('Task added');
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to create task. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'pending' ? 'completed' : 'pending';
    try {
      await apiClient.put(`/tasks/${task.id}`, { status: nextStatus });
      await fetchTasks(pagination?.page || 1);
      showSuccess('Task updated');
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to update task. Please try again.';
      setError(msg);
    }
  };

  const handlePageChange = (nextPage) => {
    if (!pagination) return;
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    fetchTasks(nextPage);
  };

  const startEdit = (task) => {
    setEditingTaskId(task.id);
    setEditForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
    });
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditForm({ title: '', description: '', status: 'pending' });
  };

  const handleEditFormChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdateTask = async (taskId) => {
    if (!editForm.title.trim()) return;
    try {
      await apiClient.put(`/tasks/${taskId}`, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        status: editForm.status,
      });
      cancelEdit();
      await fetchTasks(pagination?.page || 1);
      showSuccess('Task updated');
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to update task. Please try again.';
      setError(msg);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await apiClient.delete(`/tasks/${taskId}`);
      await fetchTasks(pagination?.page || 1);
      showSuccess('Task deleted');
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to delete task. Please try again.';
      setError(msg);
    }
  };

  const hasTasks = tasks.length > 0;

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Tasks</h1>
          <p className="subtle">
            Capture, track, and complete tasks. Toggle status to keep your day in flow.
          </p>
        </div>
      </header>

      <section className="task-create">
        <h2>Create Task</h2>
        <form onSubmit={handleCreate} className="task-form">
          <input
            type="text"
            name="title"
            placeholder="Draft product brief, fix login bug…"
            value={form.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Add a few details so future you says thanks."
            value={form.description}
            onChange={handleChange}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Add Task'}
          </button>
        </form>

        <div className="chip-row">
          <span className="chip chip--success">Completed tasks stay visible</span>
          <span className="chip chip--danger">Admins can also delete via API</span>
        </div>
      </section>

      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <section className="task-list">
        <h2>Your Tasks</h2>
        {loading && !hasTasks ? (
          <p>Loading tasks...</p>
        ) : !hasTasks ? (
          <p className="subtle">
            No tasks yet. Create your first one above to see it appear here.
          </p>
        ) : (
          <ul className="task-items">
            {tasks.map((task) => (
              <li key={task.id} className={`task-item status-${task.status}`}>
                <div className="task-content">
                  {editingTaskId === task.id ? (
                    <div className="task-edit-form">
                      <input
                        type="text"
                        name="title"
                        value={editForm.title}
                        onChange={handleEditFormChange}
                        required
                      />
                      <textarea
                        name="description"
                        value={editForm.description}
                        onChange={handleEditFormChange}
                        placeholder="Description"
                      />
                      <select
                        name="status"
                        value={editForm.status}
                        onChange={handleEditFormChange}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  ) : (
                    <>
                      <strong>{task.title}</strong>
                      {task.description && <p>{task.description}</p>}
                      <span className="task-status">Status: {task.status}</span>
                    </>
                  )}
                </div>
                <div className="task-actions">
                  {editingTaskId === task.id ? (
                    <>
                      <button onClick={() => handleUpdateTask(task.id)}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleToggleStatus(task)}>
                        Mark {task.status === 'pending' ? 'Completed' : 'Pending'}
                      </button>
                      <button
                        className="icon-button"
                        onClick={() => startEdit(task)}
                        aria-label="Edit task"
                        title="Edit task"
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-button icon-button--danger"
                        onClick={() => handleDeleteTask(task.id)}
                        aria-label="Delete task"
                        title="Delete task"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default TasksPage;

