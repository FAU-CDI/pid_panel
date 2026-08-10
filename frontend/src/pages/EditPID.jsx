import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/EditPID.css";
import { getCookie } from "../utils/csrf";

export default function EditPID() {

    const { id, pid } = useParams();

    const navigate = useNavigate();

    const [resource, setResource] = useState(null);

    const [metadata, setMetadata] = useState("");

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [user, setUser] = useState(null);

    useEffect(() => {
    
            loadUser();
    
        }, []);
    
    
    async function loadUser() {

        try {

            const response = await fetch(
                "http://localhost:8000/pid/me",
                {
                    credentials: "include",
                }
            );

            if (!response.ok) {
                navigate("/");
                return;
            }

            const data = await response.json();

            setUser(data);

        } catch {

            navigate("/");

        }

    }

    useEffect(() => {
        loadPID();
    }, []);

    async function loadPID() {

        try {

            const response = await fetch(
                `http://localhost:8000/pid/namespaces/${id}/resources/${pid}`,
                {
                    credentials: "include",
                }
            );

            if (!response.ok) {

                navigate(`/namespaces/${id}`);

                return;

            }

            const data = await response.json();

            setResource(data);

            setMetadata(data.metadata || "");

        }
        catch {

            navigate(`/namespaces/${id}`);

        }
        finally {

            setLoading(false);

        }

    }

    async function save(e) {

        e.preventDefault();

        setError("");

        try {

            const response = await fetch(
                `http://localhost:8000/pid/namespaces/${id}/resources/${pid}`,
                {
                    method: "PATCH",

                    credentials: "include",

                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": getCookie("csrftoken"),
                    },

                    body: JSON.stringify({
                        metadata,
                    }),
                }
            );

            if (!response.ok) {

                throw new Error();

            }

            navigate(`/namespaces/${id}`);

        }
        catch {

            setError("Unable to update PID.");

        }

    }

    if (loading) {

        return <h2>Loading...</h2>;

    }

    if (!resource) {

        return <h2>PID not found.</h2>;

    }

    return (

        <>

            <Navbar user={user} />

            <div className="edit-container">

                <h1>Edit PID</h1>

                <p>
                    <strong>PID:</strong> {resource.pid}
                </p>

                <p>
                    <strong>Tags:</strong>{" "}
                    {resource.tags?.join(", ") || ""}
                </p>

                <p>
                    <strong>URL:</strong>{" "}
                    {resource.url}
                </p>

                <form onSubmit={save}>

                    <label>Metadata</label>

                    <textarea
                        rows="8"
                        value={metadata}
                        onChange={(e) => setMetadata(e.target.value)}
                    />

                    <button type="submit">
                        Save Changes
                    </button>

                </form>

                {error && (
                    <p className="error">
                        {error}
                    </p>
                )}

            </div>

            <Footer />

        </>

    );

}
