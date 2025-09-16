// src/org/OrgLogin.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ORG_SAMPLE_ID = "PACE-ORG-2025"; // temporary gate

export default function OrgLogin() {
  const nav = useNavigate();
  const [orgId, setOrgId] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    if (orgId.trim() !== ORG_SAMPLE_ID) {
      setErr("Invalid Organization ID.");
      return;
    }
    // hook up your real auth later; this is just the gate + redirect
    nav("/org/dashboard");
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <h2 style={{ margin: 0, textAlign: "center" }}>Organization Sign-in</h2>
        <p style={{ marginTop: 8, color: "#64748b", textAlign: "center" }}>
          Enter your Organization ID to continue
        </p>

        <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
          <label style={label}>Organization ID</label>
          <input value={orgId} onChange={(e) => setOrgId(e.target.value)} placeholder="e.g. PACE-ORG-2025" style={input} />

          <label style={label}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="org-admin@example.com" style={input} />

          <label style={label}>Password</label>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" style={input} />

          {err && <div style={errBox}>{err}</div>}

          <button type="submit" style={btn}>Sign in</button>
        </form>

        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Link to="/">← Back</Link>
        </div>
      </div>
    </div>
  );
}

const wrap = { minHeight: "100vh", display: "grid", placeItems: "center", background: "#f8fafc", padding: 24 };
const card = { width: 420, maxWidth: "100%", background: "#fff", padding: 28, borderRadius: 18, boxShadow: "0 20px 60px rgba(0,0,0,.10)" };
const label = { display: "block", fontSize: 14, margin: "14px 0 6px" };
const input = { width: "100%", height: 44, borderRadius: 10, border: "1px solid #e5e7eb", padding: "0 12px", outline: "none" };
const btn = { width: "100%", height: 46, marginTop: 18, border: 0, borderRadius: 10, background: "#16a34a", color: "#fff", fontWeight: 700, cursor: "pointer" };
const errBox = { marginTop: 10, background: "#fee2e2", color: "#991b1b", padding: "8px 10px", borderRadius: 8, fontSize: 14 };
