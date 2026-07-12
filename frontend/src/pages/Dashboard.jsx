import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";

export default function Dashboard() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [namespaces, setNamespaces] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {

        const token = localStorage.getItem("access");

        if (!token) {
            navigate("/");
            return;
        }

        try {

            // Current user
            const userResponse = await fetch(
                "http://127.0.0.1:8000/pid/me",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!userResponse.ok) {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                navigate("/");
                return;
            }

            const userData = await userResponse.json();
            setUser(userData);

            // Namespaces
            const namespaceResponse = await fetch(
                "http://127.0.0.1:8000/pid/namespaces",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!namespaceResponse.ok) {
                throw new Error("Failed to load namespaces");
            }

            const namespaceData = await namespaceResponse.json();

            setNamespaces(namespaceData.results);

        }
        catch (err) {

            console.error(err);

        }
        finally {

            setLoading(false);

        }
    }

    function logout() {

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        navigate("/");

    }

    if (loading) {
        return <h2>Loading...</h2>;
    }

    return (
        <>
            <Navbar
                user={user}
                onLogout={logout}
            />

            <div style={{ padding: "30px" }}>

                <h2>Your Namespaces</h2>

                {namespaces.length === 0 ? (

                    <p>No namespaces assigned.</p>

                ) : (

                    <table border="1" cellPadding="8">

                        <thead>
                            <tr>
                                <th>Tag</th>
                                <th>Role</th>
                            </tr>
                        </thead>

                        <tbody>

                            {namespaces.map((ns) => (

                                <tr key={ns.id}>
                                    <td>{ns.tag}</td>
                                    <td>{ns.role}</td>
                                </tr>

                            ))}

                        </tbody>

                    </table>

                )}

            </div>

        </>
    );
}