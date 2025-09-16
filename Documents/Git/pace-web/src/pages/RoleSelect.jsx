// src/pages/RoleSelect.jsx
import { Link } from "react-router-dom";
import "./styles/RoleSelect.css";

export default function RoleSelect() {
  return (
    <div className="role-wrap">
      <div className="role-grid">
        <Card to="/login" title="Individuals" subtitle="Use the app as a regular user." emoji="👤" />
        <Card
          to="/org/login"
          title="Business Users"
          subtitle="Sign in with your Organization ID."
          emoji="🏢"
          highlight
        />
      </div>
    </div>
  );
}

function Card({ to, title, subtitle, emoji, highlight }) {
  return (
    <Link className={`role-card ${highlight ? "is-highlight" : ""}`} to={to}>
      <div className="role-emoji">{emoji}</div>
      <div className="role-title">{title}</div>
      <div className="role-sub">{subtitle}</div>
    </Link>
  );
}
