import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/DeletePID.css";
import { getCookie } from "../utils/csrf";

export default function DeletePID() {

    const { id, pid } = useParams();

    const navigate = useNavigate();

    const [resource, setResource] = useState(null);

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

        }
        catch {

            navigate(`/namespaces/${id}`);

        }

    }

    async function deletePID() {

        setError("");

        try {

            const response = await fetch(
                `http://localhost:8000/pid/namespaces/${id}/resources/${pid}`,
                {
                    method: "DELETE",
                    credentials: "include",
                    headers: { "X-CSRFToken": getCookie("csrftoken"), },
                }
            );

            if (!response.ok) {

                throw new Error();

            }

            navigate(`/namespaces/${id}`);

        }
        catch {

            setError("Unable to delete PID.");

        }

    }

    if (!resource) {

        return <h2>Loading...</h2>;

    }

    return (

        <>

            <Navbar user={user} />

            <div className="delete-container">

                <h1>Delete PID</h1>

                <p>
                    Are you sure you want to delete
                    <strong> {resource.pid}</strong>?
                </p>

                <p> 
                    (
                    <strong>Namespace:</strong>{" "}
                    {id}
                    )
                </p>

                <p>
                    <strong>Tags:</strong>{" "}
                    {resource.tags?.join(", ") || ""}
                </p>

                <div className="buttons">

                    <button
                        className="delete"
                        onClick={deletePID}
                    >
                        Delete
                    </button>

                    <button
                        className="cancel"
                        onClick={() =>
                            navigate(`/namespaces/${id}`)
                        }
                    >
                        Cancel
                    </button>

                </div>

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