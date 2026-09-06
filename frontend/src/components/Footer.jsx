import "../styles/Footer.css";

export default function Footer() {  
  const documentationUrl = import.meta.env.VITE_DOCUMENTATION_URL;
  const imprintUrl = import.meta.env.VITE_IMPRINT_URL;
  const privacyPolicyUrl = import.meta.env.VITE_PRIVACY_POLICY_URL;
  const accessibilityUrl = import.meta.env.VITE_ACCESSIBILITY_URL;
  return (
    <footer className="footer">
      <div className="footer-links">
        <a
          href={documentationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          Documentation
        </a>

        <a
          href={imprintUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          Imprint
        </a>

        <a
          href={privacyPolicyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          Privacy Policy
        </a>

        <a
          href={accessibilityUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          Accessibility
        </a>
      </div>
    </footer>
  );
}