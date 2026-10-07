import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";

import "../styles/CreatePID.css";

import InfoTooltip from "../components/InfoTooltip";
import Footer from "../components/Footer";

import { getCookie } from "../utils/csrf";

export default function CreatePID() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [tags, setTags] = useState([""]);

    const [url, setUrl] = useState("");

    const [metadata, setMetadata] = useState("");

    const [error, setError] = useState("");

    const [user, setUser] = useState(null);
    
    useEffect(() => {
    
            loadUser();
    
        }, []);
    
    
    async function loadUser() {

        try {

            const response = await fetch(
                "/pid/me",
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

    

    async function createPID(e) {

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
                `/pid/namespaces/${id}/resources`,
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": getCookie("csrftoken"),
                    },

                    body: JSON.stringify({
                        url: url.trim() === "" ? null : url.trim(),
                        metadata,
                        tags: cleanedTags,
                    })
                }
            );

            if (!response.ok) {
                throw new Error();
            }

            navigate(`/namespaces/${id}`);

        }
        catch {
            setError("Unable to create PID.");
        }
    }

    return (
        <>
            <Navbar user={user} />

            <div className="create-pid-container">

                <h1>Create PID</h1>

                <form onSubmit={createPID}>

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
                        rows="6"
                        value={metadata}
                        onChange={(e) => setMetadata(e.target.value)}
                    />

                    <button type="submit">
                        Create PID
                    </button>

                </form>

                {error &&
                    <p className="error">
                        {error}
                    </p>
                }

            </div>
            <Footer />
        </>
    );
}