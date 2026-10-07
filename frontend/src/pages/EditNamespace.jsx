import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/EditNamespace.css";

import InfoTooltip from "../components/InfoTooltip";
import { getCookie } from "../utils/csrf";

export default function EditNamespace() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [tags, setTags] = useState([""]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadNamespace();
    }, []);

    async function loadNamespace() {

        try {

            const response = await fetch(
                `/pid/namespaces/${id}`,
                {
                    credentials: "include",
                }
            );

            if (!response.ok) {
                navigate("/dashboard");
                return;
            }

            const data = await response.json();

            setTags(
                data.tags && data.tags.length > 0
                    ? data.tags
                    : [""]
            );

        } catch {

            setError("Unable to load namespace.");

        } finally {

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

        const cleanedTags = tags
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        if (cleanedTags.length === 0) {

            setError("Please enter at least one tag.");
            return;

        }

        try {

            const response = await fetch(
                `/pid/namespaces/${id}`,
                {
                    method: "PATCH",

                    credentials: "include",

                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": getCookie("csrftoken"),
                    },

                    body: JSON.stringify({
                        tags: cleanedTags
                    })
                }
            );

            if (!response.ok) {
                throw new Error();
            }

            navigate(`/namespaces/${id}`);

        } catch {

            setError("Unable to update namespace.");

        }
    }

    if (loading) {
        return <h2>Loading...</h2>;
    }

    return (
        <>
            <Navbar />

            <div className="edit-namespace-container">

                <h1>Edit Namespace Tags</h1>

                <form onSubmit={save}>

                    <label>
                        Tags
                        <InfoTooltip text="Tags associated with this namespace." />
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
                                    >
                                        +
                                    </button>

                                ) : (

                                    <button
                                        type="button"
                                        onClick={() => removeTag(index)}
                                    >
                                        −
                                    </button>

                                )}

                            </div>

                        ))}

                    </div>

                    <button type="submit">
                        Save Changes
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate(`/namespaces/${id}`)}
                    >
                        Cancel
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