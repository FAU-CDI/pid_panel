import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";

import "../styles/CreateNamespace.css";

import { getCookie } from "../utils/csrf";

import InfoTooltip from "../components/InfoTooltip";

export default function CreateNamespace() {

    const navigate = useNavigate();

    const [tag, setTag] = useState("");

    const [pattern, setPattern] = useState("");

    const [characters, setCharacters] = useState("full");

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    async function createNamespace(e) {

        e.preventDefault();

        setLoading(true);

        setError("");

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
                        tag,
                        pattern,
                        characters,
                    }),
                }
            );

            if (!response.ok) {

                throw new Error();

            }

            navigate("/dashboard");

        }

        catch {

            setError("Failed to create namespace.");

        }

        finally {

            setLoading(false);

        }

    }

    return (

        <>

            <Navbar />

            <div className="create-container">

                <h1>Create Namespace</h1>

                <form onSubmit={createNamespace}>

                    <label>
                        Namespace Tag
                        <InfoTooltip text="This is the unique identifier for your namespace." />
                    </label>

                    <input

                        value={tag}

                        onChange={(e) =>
                            setTag(e.target.value)
                        }

                        required

                    />

                    <label>
                        PID Pattern
                        <InfoTooltip text="Defines the format of generated PIDs (e.g. ***-***)." />
                    </label>

                    <input

                        value={pattern}

                        onChange={(e) =>
                            setPattern(e.target.value)
                        }

                        placeholder="***-***"

                        required

                    />

                    <label>
                        Characters
                        <InfoTooltip text="Choose which types of characters can appear in generated PIDs." />
                    </label>

                    <select

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

                    <button
                        disabled={loading}
                    >

                        {

                            loading

                            ?

                            "Creating..."

                            :

                            "Create Namespace"

                        }

                    </button>

                </form>

                {

                    error &&

                    <p className="error">

                        {error}

                    </p>

                }

            </div>

        </>

    );

}