import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";

import "../styles/CreatePID.css";

import InfoTooltip from "../components/InfoTooltip";

import { getCookie } from "../utils/csrf";

export default function CreatePID() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [tag, setTag] = useState("");

    const [url, setUrl] = useState("");

    const [metadata, setMetadata] = useState("");

    const [error, setError] = useState("");

    async function createPID(e) {

        e.preventDefault();

        try {

            const response = await fetch(

                `http://localhost:8000/pid/namespaces/${id}/resources`,

                {

                    method: "POST",

                    credentials: "include",

                    headers: {
                    
                        "Content-Type": "application/json",
                    
                        "X-CSRFToken": getCookie("csrftoken"),
                    
                    },

                    body: JSON.stringify({

                        tag,

                        url,

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

            setError("Unable to create PID.");

        }

    }

    return (

        <>

            <Navbar />

            <div className="create-pid-container">

                <h1>Create PID</h1>

                <form onSubmit={createPID}>

                    <label>
                        Tag
                        <InfoTooltip text="This is the unique identifier for your PID." />
                    </label>

                    <input

                        value={tag}

                        onChange={(e)=>setTag(e.target.value)}

                        required

                    />

                    <label>
                        URL
                        <InfoTooltip text="This is the URL that the PID will resolve to." />
                    </label>

                    <input

                        value={url}

                        onChange={(e)=>setUrl(e.target.value)}

                        required

                    />

                    <label>
                        Metadata
                        <InfoTooltip text="Additional information about the PID." />
                    </label>

                    <textarea

                        rows="6"

                        value={metadata}

                        onChange={(e)=>setMetadata(e.target.value)}

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

        </>

    );

}