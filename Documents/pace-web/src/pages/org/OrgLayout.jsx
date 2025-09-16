// src/pages/org/OrgLayout.jsx
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./org.css";

export default function OrgLayout() {
  const nav = useNavigate();
  const logoutOrg = () => {
    localStorage.removeItem("orgMode");
    nav("/choose", { replace: true });
  };

  return (
    <div className="org-shell">
      <header className="org-topbar">
        <div className="org-brand">PACE • Organization Console</div>
        <nav className="org-nav">
          <Link to="/org/dashboard">Dashboard</Link>
          <Link to="/org/reports">Reports</Link>
          <Link to="/org/members">Members</Link>
          <button className="org-logout" onClick={logoutOrg}>Exit Org</button>
        </nav>
      </header>
      <main className="org-main">
        <Outlet />
      </main>
    </div>
  );
}
