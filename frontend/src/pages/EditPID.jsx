import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import InfoTooltip from "../components/InfoTooltip";

import "../styles/EditPID.css";
import { getCookie } from "../utils/csrf";

export default function EditPID() {

    const { id, pid } = useParams();

    const navigate = useNavigate();

    const [resource, setResource] = useState(null);

    const [tags, setTags] = useState([""]);

    const [url, setUrl] = useState("");

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

            setTags(
                data.tags && data.tags.length > 0
                    ? data.tags
                    : [""]
            );

            setUrl(data.url || "");

            setMetadata(data.metadata || "");

        }
        catch {

            navigate(`/namespaces/${id}`);

        }
        finally {

            setLoading(false);

        }

    }


    function updateTag(index, value) {

        setTags(previousTags => {

            const updatedTags = [...previousTags];

            updatedTags[index] = value;

            return updatedTags;

        });

    }


    function addTag() {

        setTags(previousTags => [
            ...previousTags,
            ""
        ]);

    }


    function removeTag(index) {

        setTags(previousTags => {

            if (previousTags.length === 1) {
                return [""];
            }

            return previousTags.filter(
                (_, tagIndex) => tagIndex !== index
            );

        });

    }


    async function save(e) {

        e.preventDefault();

        setError("");

        // Remove empty tags before sending them.
        const cleanedTags = tags
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        if (cleanedTags.length === 0) {

            setError("Please enter at least one tag.");

            return;

        }

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
                        url,
                        metadata,
                        tags: cleanedTags,
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
                    <strong>Namespace:</strong>{" "}
                    {id}
                </p>

                <p>
                    <strong>PID:</strong> {resource.pid}
                </p>


                <form onSubmit={save}>

                    <label>
                        Tags
                        <InfoTooltip text="Tags associated with this PID." />
                    </label>

                    <div className="tags-container">

                        {tags.map((tag, index) => (

                            <div
                                className="tag-input-row"
                                key={index}
                            >

                                <input
                                    value={tag}
                                    onChange={(e) =>
                                        updateTag(
                                            index,
                                            e.target.value
                                        )
                                    }
                                    required={index === 0}
                                    placeholder="Enter tag"
                                />

                                {index === tags.length - 1 ? (

                                    <button
                                        type="button"
                                        onClick={addTag}
                                        className="tag-button"
                                    >
                                        +
                                    </button>

                                ) : (

                                    <button
                                        type="button"
                                        onClick={() => removeTag(index)}
                                        className="tag-button"
                                    >
                                        −
                                    </button>

                                )}

                            </div>

                        ))}

                    </div>


                    <label>
                        URL
                        <InfoTooltip text="This is the URL that the PID will resolve to." />
                    </label>

                    <input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />


                    <label>
                        Metadata
                        <InfoTooltip text="Additional information about the PID." />
                    </label>

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
