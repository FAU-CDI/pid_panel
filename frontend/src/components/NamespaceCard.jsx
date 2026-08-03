import { useNavigate } from "react-router-dom";

import "../styles/NamespaceCard.css";

import InfoTooltip from "./InfoTooltip";

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
                <InfoTooltip text="This is the tag for your namespace." />

            </h2>

            <p>

                <strong>
                    ID
                    <InfoTooltip text="This is the unique ID for your namespace." />
                </strong>

                <br/>

                {namespace.id}

            </p>

            <p>

                <strong>
                    Role
                    <InfoTooltip text="This is your role in the namespace." />
                </strong>

                <br/>

                {namespace.role}

            </p>

        </div>

    );

}