import { useEffect, useState } from 'react';
import apiClient from '../api/client.js';

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
  });

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

      <section className="task-list">
        <h2>Your Tasks</h2>
        {loading && !hasTasks ? (
          <p>Loading tasks...</p>
        ) : !hasTasks ? (
          <p className="subtle">
            No tasks yet. Create your first one above to see it appear here.
          </p>
        ) : (
          <ul>
            {tasks.map((task) => (
              <li key={task.id} className={`task-item status-${task.status}`}>
                <div>
                  <strong>{task.title}</strong>
                  {task.description && <p>{task.description}</p>}
                  <span className="task-status">Status: {task.status}</span>
                </div>
                <button onClick={() => handleToggleStatus(task)}>
                  Mark {task.status === 'pending' ? 'Completed' : 'Pending'}
                </button>
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

