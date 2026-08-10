import "./Navbar.css";

export default function Navbar({ user }) {

    const onLogout = () => {
        window.location.href = "http://localhost:8000/auth/logout/";
    };

    return (
        <nav className="navbar">

            <h2>PID</h2>

            <div className="navbar-right">

                <span>
                    {user?.display_username}
                </span>

                {user?.is_superuser && (
                    <span className="badge">
                        Superuser
                    </span>
                )}

                <button onClick={onLogout}>
                    Logout
                </button>

            </div>

        </nav>
    );
}