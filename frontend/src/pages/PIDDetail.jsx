import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/PIDDetail.css";

export default function PIDDetail() {

    const { id, pid } = useParams();

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [resource, setResource] = useState(null);
    const [namespace, setNamespace] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPID();
    }, [id, pid]);

    async function loadPID() {

        setLoading(true);

        try {

            const [
                userResponse,
                pidResponse,
                namespaceResponse
            ] = await Promise.all([

                fetch(
                    "/pid/me",
                    {
                        credentials: "include",
                    }
                ),

                fetch(
                    `/pid/namespaces/${id}/resources/${pid}`,
                    {
                        credentials: "include",
                    }
                ),

                fetch(
                    `/pid/namespaces/${id}`,
                    {
                        credentials: "include",
                    }
                )

            ]);

            if (!pidResponse.ok || !namespaceResponse.ok) {
                navigate("/dashboard");
                return;
            }

            setUser(await userResponse.json());

            const pidData = await pidResponse.json();
            const namespaceData = await namespaceResponse.json();

            setResource(pidData);
            setNamespace(namespaceData);

        }
        finally {
            setLoading(false);
        }
    }

    function canEdit() {

        return [
            "editor",
            "manager"
        ].includes(namespace?.role);

    }

    if (loading || !resource || !namespace) {
        return <h2>Loading...</h2>;
    }

    return (
        <>
            <Navbar user={user} />

            <div className="pid-detail-page">

                <div className="pid-detail-header">

                    <button
                        onClick={() =>
                            navigate(`/namespaces/${id}`)
                        }
                    >
                        ← Back to Namespace
                    </button>

                    {canEdit() && (
                        <div className="pid-actions">

                            <button
                                onClick={() =>
                                    navigate(
                                        `/namespaces/${id}/resources/${pid}/edit`
                                    )
                                }
                            >
                                Edit
                            </button>

                            <button
                                onClick={() =>
                                    navigate(
                                        `/namespaces/${id}/resources/${pid}/delete`
                                    )
                                }
                            >
                                Delete
                            </button>

                        </div>
                    )}

                </div>

                <div className="pid-detail-card">

                    <h1>
                        PID: {resource.pid}
                    </h1>

                    <div className="pid-field">

                        <strong>Namespace</strong>

                        <p>
                            <button
                                className="namespace-link"
                                onClick={() =>
                                    navigate(`/namespaces/${id}`)
                                }
                            >
                                {namespace.id}
                            </button>
                        </p>

                    </div>

                    <div className="pid-field">

                        <strong>URL</strong>

                        <p>
                            <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {resource.url}
                            </a>
                        </p>

                    </div>

                    <div className="pid-field">

                        <strong>Metadata</strong>

                        <p>
                            {resource.metadata || "No metadata"}
                        </p>

                    </div>

                    <div className="pid-field">

                        <strong>Tags</strong>

                        <p>
                            {resource.tags?.length > 0
                                ? resource.tags.join(", ")
                                : "No tags"}
                        </p>

                    </div>

                    <div className="pid-field">

                        <strong>Date Created</strong>

                        <p>
                            {resource.dateCreated || "—"}
                        </p>

                    </div>

                    <div className="pid-field">

                        <strong>Last Updated</strong>

                        <p>
                            {resource.dateUpdated || "—"}
                        </p>

                    </div>

                </div>

            </div>

            <Footer />
        </>
    );
}