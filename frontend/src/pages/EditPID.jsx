import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";

import "../styles/EditPID.css";

import { getCookie } from "../utils/csrf";

export default function EditPID() {

    const { id, pid } = useParams();

    const navigate = useNavigate();

    const [resource, setResource] = useState(null);

    const [metadata, setMetadata] = useState("");

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    useEffect(() => {

        loadPID();

    }, []);

    async function loadPID() {

        const token = localStorage.getItem("access");

        try {

            const response = await fetch(

                `http://localhost:8000/pid/namespaces/${id}/resources/${pid}`,

                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }

            );

            if (!response.ok) {

                navigate(`/namespaces/${id}`);

                return;

            }

            const data = await response.json();

            setResource(data);

            setMetadata(data.metadata);

        }

        finally {

            setLoading(false);

        }

    }

    async function save(e) {

        e.preventDefault();

        const token = localStorage.getItem("access");

        try {

            const response = await fetch(

                `http://localhost:8000/pid/namespaces/${id}/resources/${pid}`,

                {

                    method: "PATCH",

                    headers: {

                        "Content-Type": "application/json",

                        Authorization: `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        metadata

                    })

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

    return (

        <>

            <Navbar />

            <div className="edit-container">

                <h1>Edit PID</h1>

                <p><strong>PID:</strong> {resource.pid}</p>

                <p><strong>Tag:</strong> {resource.tag}</p>

                <p><strong>URL:</strong> {resource.url}</p>

                <form onSubmit={save}>

                    <label>Metadata</label>

                    <textarea

                        rows="8"

                        value={metadata}

                        onChange={(e)=>setMetadata(e.target.value)}

                    />

                    <button>

                        Save Changes

                    </button>

                </form>

                {error && <p className="error">{error}</p>}

            </div>

        </>

    );

}