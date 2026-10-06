import { useNavigate } from "react-router-dom";

import "./Navbar.css";

export default function Navbar({ user }) {

    const navigate = useNavigate();

    const onLogout = () => {
        window.location.href = "http://localhost:8000/auth/logout/";
    };

    return (
        <nav className="navbar">

            <h2>PID</h2>

            <div className="navbar-right">

                <button
                    className="profile-button"
                    onClick={() => navigate("/profile")}
                    title="View profile"
                >

                    <span className="profile-icon">

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <circle
                                cx="12"
                                cy="8"
                                r="4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            />

                            <path
                                d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>

                    </span>

                    <span className="profile-username">
                        {user?.display_username}
                    </span>

                </button>

                {user?.is_superuser && (
                    <span className="badge">
                        Superuser
                    </span>
                )}

                <button className="logout" onClick={onLogout}>
                    Logout
                </button>

            </div>

        </nav>
    );
}
