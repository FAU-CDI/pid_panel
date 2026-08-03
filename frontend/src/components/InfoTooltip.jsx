import "./InfoTooltip.css";

export default function InfoTooltip({ text }) {
    return (
        <span className="info-tooltip">
            <span className="info-icon">i</span>
            <span className="tooltip-text">{text}</span>
        </span>
    );
}