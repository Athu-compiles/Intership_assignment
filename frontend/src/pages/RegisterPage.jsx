import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient, { getApiErrorMessage } from '../api/client.js';

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await apiClient.post('/auth/register', form);
      setMessage('Registration successful. Redirecting to login…');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Registration failed. Please try again.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <h1 className="auth-hero-title">Create your workspace in seconds.</h1>
        <p className="auth-hero-subtitle">
          Sign up as a regular user or an admin, then manage your tasks from a clean
          dashboard UI.
        </p>
        <div className="auth-badges">
          <span className="pill pill--accent">Fast onboarding</span>
          <span className="pill">Admin &amp; user roles</span>
          <span className="pill">API-first design</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-heading">
          <h1>Register</h1>
          <span>Get started</span>
        </div>
        <p className="auth-subtext">
          A minimal set of fields so you can start exploring the API and UI quickly.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Name
            <input
              type="text"
              name="name"
              placeholder="Alex Dev"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              placeholder="alex@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Password
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </label>
          <label>
            Role
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </div>
  );
}

export default RegisterPage;

