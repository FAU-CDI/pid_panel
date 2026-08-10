import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Pagination from "../components/Pagination";

import "../styles/NamespaceDetail.css";

import InfoTooltip from "../components/InfoTooltip";
import Footer from "../components/Footer";

export default function NamespaceDetail() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [namespace, setNamespace] = useState(null);
    const [pids, setPids] = useState([]);

    const [nextOffset, setNextOffset] = useState(null);
    const [previousOffset, setPreviousOffset] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNamespace(0);
    }, []);

    async function loadNamespace(offset) {

        setLoading(true);
        
        try {
        
            const [userResponse, resourceResponse] = await Promise.all([
            
                fetch(
                    "http://localhost:8000/pid/me",
                    {
                        credentials: "include",
                    }
                ),
            
                fetch(
                    `http://localhost:8000/pid/namespaces/${id}/resources?offset=${offset}`,
                    {
                        credentials: "include",
                    }
                )
            
            ]);
        
            if (!resourceResponse.ok) {
                navigate("/dashboard");
                return;
            }
        
            setUser(await userResponse.json());
        
            const data = await resourceResponse.json();
        
            console.log(data);
        
            setNamespace(data.namespace);
            setPids(data.results);
            setNextOffset(data.next_offset);
            setPreviousOffset(data.previous_offset);
        
        }
        finally {
            setLoading(false);
        }
    }

    function canCreate() {
        return [
            "contributor",
            "editor",
            "manager"
        ].includes(namespace.role);
    }

    function canEdit() {
        return [
            "editor",
            "manager"
        ].includes(namespace.role);
    }

    if (loading || !namespace) {
        return <h2>Loading...</h2>;
    }

    return (
        <>
            <Navbar user={user} />

            <div className="namespace-page">

                <div className="namespace-header">

                    <h1>{namespace.tag}</h1>

                    <p>ID: {namespace.id}</p>

                    <p>Your role: {namespace.role}</p>

                </div>

                <table className="pid-table">

                    <thead>

                        <tr>

                            <th>
                                PID
                                <InfoTooltip text="This is PID id" />
                            </th>

                            <th>
                                Tags
                                <InfoTooltip text="Tags associated with this PID." />
                            </th>

                            <th>
                                URL
                                <InfoTooltip text="This is the URL that the PID will resolve to." />
                            </th>

                            <th>
                                Metadata
                                <InfoTooltip text="Additional information about the PID." />
                            </th>

                            {canEdit() &&
                                <th>
                                    Actions
                                    <InfoTooltip text="Actions you can take on the PID." />
                                </th>
                            }

                        </tr>

                    </thead>

                    <tbody>

                        {pids.map(pid => (

                            <tr key={pid.pid}>

                                <td>{pid.pid}</td>

                                <td>
                                    {pid.tags?.join(", ") || ""}
                                </td>

                                <td>
                                    <a
                                        href={pid.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {pid.url}
                                    </a>
                                </td>

                                <td>{pid.metadata}</td>

                                {canEdit() &&
                                    <td>

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/namespaces/${id}/resources/${pid.pid}/edit`
                                                )
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/namespaces/${id}/resources/${pid.pid}/delete`
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </td>
                                }

                            </tr>

                        ))}

                    </tbody>

                </table>

                <Pagination
                    previousOffset={previousOffset}
                    nextOffset={nextOffset}
                    onPageChange={loadNamespace}
                />

                {canCreate() &&
                    <button
                        className="create-pid"
                        onClick={() =>
                            navigate(
                                `/namespaces/${id}/resources/create`
                            )
                        }
                    >
                        Create PID
                    </button>
                }

            </div>
            <Footer />
        </>
    );
}
