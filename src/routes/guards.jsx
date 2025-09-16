// src/routes/guards.jsx
import { Navigate, Outlet } from "react-router-dom";

export function OrgRouteGuard() {
  const isOrg = localStorage.getItem("orgMode") === "1";
  return isOrg ? <Outlet /> : <Navigate to="/org-login" replace />;
}

export function UserRouteGuard() {
  const isOrg = localStorage.getItem("orgMode") === "1";
  // If someone in org-mode hits user routes, push them to org dashboard
  return isOrg ? <Navigate to="/org/dashboard" replace /> : <Outlet />;
}
