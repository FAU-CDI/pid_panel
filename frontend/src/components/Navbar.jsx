import "./Navbar.css";

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <h2>QuickPID</h2>

      <div className="navbar-right">
        <span>{user?.username}</span>

        {user?.is_superuser && (
          <span className="badge">Superuser</span>
        )}

        <button onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}