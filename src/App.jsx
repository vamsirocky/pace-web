// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import RoleSelect from "./pages/RoleSelect";

import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import ActionList from "./pages/ActionList";
import Rewards from "./pages/Rewards";
import DonatePage from "./pages/actions/DonatePage";
import VolunteerPage from "./pages/actions/VolunteerPage";
import AdvocatePage from "./pages/actions/AdvocatePage";
import StrengthenPage from "./pages/actions/StrengthenPage";
import RecyclePage from "./pages/actions/RecyclePage";
import WildlifePage from "./pages/actions/WildlifePage";
import ProfilePage from "./pages/ProfilePage";
import LeaderboardPage from "./pages/LeaderboardPage";

import OrgLogin from "./pages/org/OrgLogin";
import OrgDashboard from "./pages/org/OrgDashboard";


export default function App() {
  return (
    <Router>
      <Routes>
        {/* Entry chooser */}
        <Route path="/" element={<RoleSelect />} />

        {/* Individual user app (existing) */}
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/actions" element={<ActionList />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/actions/donate" element={<DonatePage />} />
        <Route path="/actions/volunteer" element={<VolunteerPage />} />
        <Route path="/actions/advocate" element={<AdvocatePage />} />
        <Route path="/actions/strengthen" element={<StrengthenPage />} />
        <Route path="/actions/recycle" element={<RecyclePage />} />
        <Route path="/actions/wildlife" element={<WildlifePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />

        {/* Organization portal (separate area) */}
        <Route path="/org/login" element={<OrgLogin />} />
        <Route path="/org/dashboard" element={<OrgDashboard />} />
        
      </Routes>
    </Router>
  );
}
