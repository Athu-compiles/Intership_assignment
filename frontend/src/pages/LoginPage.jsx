import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

    try {
      const response = await apiClient.post('/auth/login', form);
      const { token, user } = response.data.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <h1 className="auth-hero-title">Welcome back to your task HQ.</h1>
        <p className="auth-hero-subtitle">
          Track everything from quick todos to long-running work. Log in to pick up
          exactly where you left off.
        </p>
        <div className="auth-badges">
          <span className="pill pill--accent">JWT secured</span>
          <span className="pill">Role-based access</span>
          <span className="pill">PostgreSQL-backed</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-heading">
          <h1>Login</h1>
          <span>Step in</span>
        </div>
        <p className="auth-subtext">
          Use the email and password you registered with to access your dashboard.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        <p className="auth-footer-text">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </div>
  );
}

export default LoginPage;

