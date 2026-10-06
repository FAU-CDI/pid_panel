import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Profile() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [apiKeys, setApiKeys] = useState([]);

    const [loading, setLoading] = useState(true);
    const [keysLoading, setKeysLoading] = useState(true);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [comment, setComment] = useState("");
    const [expiresAt, setExpiresAt] = useState("");

    const [newKey, setNewKey] = useState(null);

    useEffect(() => {
        loadProfile();
        loadApiKeys();
    }, []);

    async function loadProfile() {
        try {
            const response = await fetch(
                "http://localhost:8000/pid/me",
                {
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to load profile");
            }

            const data = await response.json();
            setUser(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function loadApiKeys() {
        try {
            const response = await fetch(
                "http://localhost:8000/pid/profile/keys",
                {
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to load API keys");
            }

            const data = await response.json();
            setApiKeys(data.items || []);
        } catch (error) {
            console.error(error);
        } finally {
            setKeysLoading(false);
        }
    }

    async function createApiKey(event) {
        event.preventDefault();

        try {
            const csrfToken = await getCsrfToken();

            const payload = {
                comment: comment,
                expiresAt: new Date(expiresAt).toISOString(),
                userScopes: [],
                namespaceScopes: [],
            };

            const response = await fetch(
                "http://localhost:8000/pid/profile/keys",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);

                console.error(
                    "Failed to create API key:",
                    errorData
                );

                throw new Error("Failed to create API key");
            }

            const data = await response.json();

            // The raw key is returned only once.
            setNewKey(data);

            setComment("");
            setExpiresAt("");
            setShowCreateForm(false);

            await loadApiKeys();
        } catch (error) {
            console.error(error);
            alert("Failed to create API key.");
        }
    }

    async function getCsrfToken() {
        const response = await fetch(
            "http://localhost:8000/pid/csrf",
            {
                credentials: "include",
            }
        );

        if (!response.ok) {
            throw new Error("Failed to get CSRF token");
        }

        const data = await response.json();

        return data.csrfToken;
    }



    async function revokeApiKey(keyId) {
        const confirmed = window.confirm(
            "Are you sure you want to revoke this API key?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const csrfToken = await getCsrfToken();

            const response = await fetch(
                "http://localhost:8000/pid/profile/keys/revoke",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken,
                    },
                    body: JSON.stringify({
                        id: keyId,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);

                console.error(
                    "Failed to revoke API key:",
                    errorData
                );

                throw new Error("Failed to revoke API key");
            }

            setApiKeys((currentKeys) =>
                currentKeys.filter((key) => key.id !== keyId)
            );
        } catch (error) {
            console.error(error);
            alert("Failed to revoke API key.");
        }
    }

    if (loading) {
        return <h2>Loading...</h2>;
    }

    if (!user) {
        return <h2>Unable to load profile.</h2>;
    }

    return (
        <>
            <Navbar user={user} />

            <div className="profile-page">
                <h1>Profile</h1>

                <div className="profile-card">
                    <div className="profile-icon-large">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="60"
                            height="60"
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
                    </div>

                    <p>
                        <strong>Username:</strong>{" "}
                        {user.display_username}
                    </p>

                    <p>
                        <strong>Superuser:</strong>{" "}
                        {user.is_superuser ? "Yes" : "No"}
                    </p>
                </div>

                <div className="profile-card api-keys-section">
                    <div className="api-keys-header">
                        <h2>API Keys</h2>

                        <button
                            onClick={() =>
                                setShowCreateForm(!showCreateForm)
                            }
                        >
                            {showCreateForm
                                ? "Cancel"
                                : "Create API Key"}
                        </button>
                    </div>

                    {showCreateForm && (
                        <form onSubmit={createApiKey}>
                            <div>
                                <label>
                                    Comment
                                    <input
                                        type="text"
                                        value={comment}
                                        onChange={(event) =>
                                            setComment(event.target.value)
                                        }
                                        placeholder="CI deploy key"
                                        required
                                    />
                                </label>
                            </div>

                            <div>
                                <label>
                                    Expires at
                                    <input
                                        type="datetime-local"
                                        value={expiresAt}
                                        onChange={(event) =>
                                            setExpiresAt(event.target.value)
                                        }
                                        required
                                    />
                                </label>
                            </div>

                            <button type="submit">
                                Create Key
                            </button>
                        </form>
                    )}

                    {newKey && (
                        <div className="new-api-key">
                            <h3>API Key Created</h3>

                            <p>
                                Copy this key now. It will not be
                                shown again.
                            </p>

                            <code>{newKey.key}</code>

                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        newKey.key
                                    );
                                }}
                            >
                                Copy Key
                            </button>

                            <button
                                onClick={() => setNewKey(null)}
                            >
                                I have copied the key
                            </button>
                        </div>
                    )}

                    {keysLoading ? (
                        <p>Loading API keys...</p>
                    ) : apiKeys.length === 0 ? (
                        <p>No API keys.</p>
                    ) : (
                        <div className="api-key-list">
                            {apiKeys.map((key) => (
                                <div
                                    className="api-key-item"
                                    key={key.id}
                                >
                                    <div>
                                        <strong>
                                            {key.comment || "Unnamed key"}
                                        </strong>

                                        <p>
                                            Created:{" "}
                                            {key.createdAt
                                                ? new Date(
                                                      key.createdAt
                                                  ).toLocaleString()
                                                : "Unknown"}
                                        </p>

                                        <p>
                                            Expires:{" "}
                                            {key.expiresAt
                                                ? new Date(
                                                      key.expiresAt
                                                  ).toLocaleString()
                                                : "Never"}
                                        </p>

                                        <p>
                                            ID: {key.id}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() =>
                                            revokeApiKey(key.id)
                                        }
                                    >
                                        Revoke
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                </button>
            </div>

            <Footer />
        </>
    );
}
