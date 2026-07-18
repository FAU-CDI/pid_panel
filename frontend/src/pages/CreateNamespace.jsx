import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";

import "../styles/CreateNamespace.css";

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

            const token = localStorage.getItem("access");

            const response = await fetch(

                "http://127.0.0.1:8000/pid/namespaces",

                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json",

                        Authorization: `Bearer ${token}`,

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