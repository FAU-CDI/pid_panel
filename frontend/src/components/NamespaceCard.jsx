import { useNavigate } from "react-router-dom";

import "../styles/NamespaceCard.css";

export default function NamespaceCard({ namespace }) {

    const navigate = useNavigate();

    return (

        <div

            className="namespace-card"

            onClick={() =>
                navigate(`/namespaces/${namespace.id}`)
            }

        >

            <h2>

                {namespace.tag}

            </h2>

            <p>

                <strong>ID</strong>

                <br/>

                {namespace.id}

            </p>

            <p>

                <strong>Role</strong>

                <br/>

                {namespace.role}

            </p>

        </div>

    );

}