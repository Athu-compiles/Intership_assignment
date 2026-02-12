import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Dashboard</h1>
        <div>
          <span className="user-badge">
            {user?.name} ({user?.role})
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

