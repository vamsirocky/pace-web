// src/pages/AccountTypeGate.jsx
import { useNavigate } from "react-router-dom";
import "./styles/AccountTypeGate.css";
import { FaUserCircle, FaBuilding } from "react-icons/fa";

const INDIVIDUAL_AUTH_PATH = "/auth"; // ← change if your login route is different

export default function AccountTypeGate() {
  const nav = useNavigate();

  return (
    <div className="gate-wrap">
      <h1 className="gate-title">Who’s signing in?</h1>

      <div className="gate-grid">
        <button
          className="gate-card"
          onClick={() => {
            localStorage.removeItem("orgMode");
            nav(INDIVIDUAL_AUTH_PATH);
          }}
        >
          <div className="gate-icon ind"><FaUserCircle /></div>
          <div className="gate-h2">Individuals</div>
          <p className="gate-p">Users may sign up and access the application directly.</p>
        </button>

        <button
          className="gate-card gate-card--primary"
          onClick={() => nav("/org-login")}
        >
          <div className="gate-icon biz"><FaBuilding /></div>
          <div className="gate-h2">Business Users</div>
          <p className="gate-p">Users must be a member of an organization to access the application.</p>
        </button>
      </div>
    </div>
  );
}
