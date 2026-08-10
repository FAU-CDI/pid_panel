import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import NamespaceCard from "../components/NamespaceCard";
import Pagination from "../components/Pagination";
import Footer from "../components/Footer";

import { getCookie } from "../utils/csrf";

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

        setLoading(true);

        try {

            const [userResponse, namespaceResponse] = await Promise.all([

                fetch("http://localhost:8000/pid/me", {
                    credentials: "include",
                }),

                fetch(
                    `http://localhost:8000/pid/namespaces?offset=${currentOffset}`,
                    {
                        credentials: "include",
                    }
                )

            ]);

            if (!userResponse.ok || !namespaceResponse.ok) {
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

    async function logout() {

        await fetch(
            "http://localhost:8000/auth/logout/",
            {
                credentials: "include",
            }
        );

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

                <p>Namespace info here (to be added)</p>

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

            <Footer />

        </>

    );

}