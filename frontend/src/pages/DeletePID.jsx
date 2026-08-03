import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";

import "../styles/DeletePID.css";

import { getCookie } from "../utils/csrf";

export default function DeletePID() {

    const { id, pid } = useParams();

    const navigate = useNavigate();

    const [resource, setResource] = useState(null);

    useEffect(() => {

        loadPID();

    }, []);

    async function loadPID() {

        const token = localStorage.getItem("access");

        const response = await fetch(

            `http://localhost:8000/pid/namespaces/${id}/resources/${pid}`,

            {

                headers: {

                    Authorization:`Bearer ${token}`

                }

            }

        );

        if(!response.ok){

            navigate(`/namespaces/${id}`);

            return;

        }

        const data = await response.json();

        setResource(data);

    }

    async function deletePID() {

        const token = localStorage.getItem("access");

        const response = await fetch(

            `http://localhost:8000/pid/namespaces/${id}/resources/${pid}`,

            {

                method:"DELETE",

                headers:{

                    Authorization:`Bearer ${token}`

                }

            }

        );

        if(response.ok){

            navigate(`/namespaces/${id}`);

        }

    }

    if(!resource){

        return <h2>Loading...</h2>;

    }

    return(

        <>

        <Navbar/>

        <div className="delete-container">

            <h1>Delete PID</h1>

            <p>

                Are you sure you want to delete

                <strong> {resource.pid}</strong> ?

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

                    onClick={()=>

                        navigate(`/namespaces/${id}`)

                    }

                >

                    Cancel

                </button>

            </div>

        </div>

        </>

    );

}