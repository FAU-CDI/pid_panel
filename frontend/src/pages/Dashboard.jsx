import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import NamespaceCard from "../components/NamespaceCard";
import Pagination from "../components/Pagination";

import "../styles/Dashboard.css";

export default function Dashboard() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [namespaces, setNamespaces] = useState([]);

    const [loading, setLoading] = useState(true);

    const [offset, setOffset] = useState(0);

    const [nextOffset, setNextOffset] = useState(null);

    const [previousOffset, setPreviousOffset] = useState(null);

    async function loadData(currentOffset = 0) {

        const token = localStorage.getItem("access");

        if (!token) {
            navigate("/");
            return;
        }

        setLoading(true);

        try {

            const [userResponse, namespaceResponse] = await Promise.all([

                fetch(
                    "http://127.0.0.1:8000/pid/me",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                ),

                fetch(
                    `http://127.0.0.1:8000/pid/namespaces?offset=${currentOffset}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

            ]);

            if (!userResponse.ok || !namespaceResponse.ok) {

                localStorage.removeItem("access");
                localStorage.removeItem("refresh");

                navigate("/");

                return;
            }

            const userData = await userResponse.json();

            const namespaceData = await namespaceResponse.json();

            setUser(userData);

            setNamespaces(namespaceData.results);

            setNextOffset(namespaceData.next_offset);

            setPreviousOffset(namespaceData.previous_offset);

            setOffset(namespaceData.offset);

        }

        catch (err) {

            console.error(err);

        }

        finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        loadData(offset);

    }, []);

    function logout() {

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        navigate("/");

    }

    if (loading) {

        return <h2 className="loading">Loading...</h2>;

    }

    return (

        <>

            <Navbar
                user={user}
                onLogout={logout}
            />

            <div className="dashboard">

                <h1>Your Namespaces</h1>

                <div className="namespace-grid">

                    {namespaces.length === 0 ? (

                        <p>No namespaces available.</p>

                    ) : (

                        namespaces.map((ns) => (

                            <NamespaceCard
                                key={ns.id}
                                namespace={ns}
                            />

                        ))

                    )}

                </div>

                <Pagination

                    previousOffset={previousOffset}

                    nextOffset={nextOffset}

                    onPageChange={loadData}

                />

                <button

                    className="create-button"

                    onClick={() => navigate("/namespaces/create")}

                >

                    + Create Namespace

                </button>

            </div>

        </>

    );

}