import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Dashboard</h1>
        <div className="dashboard-user-meta">
          <span className="user-badge">{user?.name || 'User'}</span>
          <span className={`role-badge role-badge--${user?.role || 'user'}`}>
            {(user?.role || 'user').toUpperCase()}
          </span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <main>
        <p>Welcome to your dashboard.</p>
        <ul>
          <li>
            <Link to="/tasks">View Tasks</Link>
          </li>
        </ul>
      </main>
    </div>
  );
}

export default DashboardPage;

