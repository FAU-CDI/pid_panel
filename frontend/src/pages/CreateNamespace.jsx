import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import "../styles/CreateNamespace.css";

import { getCookie } from "../utils/csrf";

import InfoTooltip from "../components/InfoTooltip";
import Footer from "../components/Footer";

export default function CreateNamespace() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [tags, setTags] = useState([""]);

    const [pattern, setPattern] = useState("");

    const [characters, setCharacters] = useState("full");

    const [preset, setPreset] = useState("");

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    const [samplePid, setSamplePid] = useState("");


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

        setSamplePid(
            generateSamplePid(pattern, characters)
        );

    }, [pattern, characters]);

    function generateSamplePid(currentPattern, currentCharacters) {

        if (!currentPattern) {
            return "";
        }

        let characterSet = "";

        switch (currentCharacters) {

            case "numeric":
                characterSet = "0123456789";
                break;

            case "alphabetic":
                characterSet = "abcdefghijklmnopqrstuvwxyz";
                break;

            case "alphanumeric":
                characterSet =
                    "abcdefghijklmnopqrstuvwxyz0123456789";
                break;

            case "full":
            default:
                characterSet =
                    "abcdefghijklmnopqrstuvwxyz0123456789";
                break;
        }

        let result = "";

        for (const character of currentPattern) {

            if (character === "*") {

                const randomIndex = Math.floor(
                    Math.random() * characterSet.length
                );

                result += characterSet[randomIndex];

            } else {

                result += character;

            }

        }

        return result;
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


    function handlePresetChange(e) {

        const selectedPreset = e.target.value;

        setPreset(selectedPreset);

        if (selectedPreset === "fau-default") {

            setPattern("***-***");

            setCharacters("full");

        }

        if (selectedPreset === "full") {

            setPattern("*******");

            setCharacters("full");

        }

        // Reset preset back to blank after applying it.
        // This allows the user to customize the fields afterwards.
        setPreset("");

    }


    async function createNamespace(e) {

        e.preventDefault();

        setLoading(true);

        setError("");

        const cleanedTags = tags
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        if (cleanedTags.length === 0) {

            setError("Please enter at least one tag.");

            setLoading(false);

            return;

        }

        try {

            const response = await fetch(
                "http://localhost:8000/pid/namespaces",
                {
                    method: "POST",
                    credentials: "include",

                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": getCookie("csrftoken"),
                    },

                    body: JSON.stringify({
                        tags: cleanedTags,
                        pattern,
                        characters,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error();
            }

            navigate("/dashboard");

        } catch {

            setError("Failed to create namespace.");

        } finally {

            setLoading(false);

        }

    }


    if (!user) {

        return <h2>Loading...</h2>;

    }


    return (

        <>

            <Navbar user={user} />

            <div className="create-container">

                <h1>Create Namespace</h1>

                <form onSubmit={createNamespace}>

                    <label>
                        Namespace Tags
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


                    {/* FORMAT SECTION */}

                    <div className="format-section">

                        <h2>
                            Format
                            <InfoTooltip text="Define the format of generated PIDs." />
                        </h2>
                                        
                                        
                        <label htmlFor="preset">
                            Use preset
                        </label>
                                        
                        <select
                            id="preset"
                            value={preset}
                            onChange={handlePresetChange}
                        >
                        
                            <option value="">
                                Select a preset
                            </option>
                                        
                            <option value="fau-default">
                                FAU default
                            </option>
                                        
                            <option value="full">
                                Full
                            </option>
                                        
                        </select>
                                        
                                        
                        <label htmlFor="pattern">
                            PID Pattern
                            <InfoTooltip text="Defines the format of generated PIDs (e.g. ***-***)." />
                        </label>
                                        
                        <input
                            id="pattern"
                            value={pattern}
                            onChange={(e) =>
                                setPattern(e.target.value)
                            }
                            placeholder="***-***"
                            required
                        />
                    
                        
                        <label htmlFor="characters">
                            Characters
                            <InfoTooltip text="Choose which types of characters can appear in generated PIDs." />
                        </label>
                        
                        <select
                            id="characters"
                            value={characters}
                            onChange={(e) =>
                                setCharacters(e.target.value)
                            }
                        >
                        
                            <option value="full">
                                Full
                            </option>
                        
                            <option value="numeric">
                                Numeric
                            </option>
                        
                            <option value="alphabetic">
                                Alphabetic
                            </option>
                        
                            <option value="alphanumeric">
                                Alphanumeric
                            </option>
                        
                        </select>
                        
                        
                        <div className="sample-pid">
                        
                            <span className="sample-label">
                                Example
                            </span>
                        
                            <span className="sample-value">
                                {samplePid || "—"}
                            </span>
                        
                        </div>
                        
                    </div>


                    <button disabled={loading}>

                        {loading
                            ? "Creating..."
                            : "Create Namespace"
                        }

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