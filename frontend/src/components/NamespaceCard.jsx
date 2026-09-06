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
                {namespace.id}
                <strong>
                    <InfoTooltip text="This is the unique keyword for your namespace." />
                </strong>
                
            </h2>

            <p>
                <strong>
                    Tags 
                    <InfoTooltip text="These are the tags for your namespace." />
                </strong>
                <br/>
                {namespace.tags.join(", ")}
                <br/>

            </p>

            <p>

                <strong>
                    Role
                    <InfoTooltip text="This is your role in the namespace." />
                </strong>

                <br/>

                {namespace.role}

            </p>

            <p>

                <strong>
                    Mount info
                    <InfoTooltip text="This is the mount information for your namespace." />
                </strong>

                <br/>

                {namespace.mounts?.length > 0 ? (
                  <ul>
                    {namespace.mounts.map((mount, index) => (
                      <li key={index}>
                        <a
                            href={mount}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {mount}
                        </a>
                        
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No mounts available</p>
                )}

            </p>

        </div>

    );

}