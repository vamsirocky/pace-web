import React, { useEffect, useState } from 'react';
import "../pages/styles/ProfilePage.css";
import { getProfile } from '../api/paceApi'; // make sure this function exists

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      const user_id = localStorage.getItem('user_id');

      if (!token || !user_id) {
        alert("You're not logged in.");
        return;
      }

      try {
        const data = await getProfile(user_id, token);
        setUser(data); // replace placeholder with real user
      } catch (err) {
        console.error("Failed to fetch profile:", err);
       alert("Error fetching user profile: " + err.message);

      }
    };

    fetchUser();
  }, []);

  if (!user) return <div className="profile-container"><h3>Loading profile...</h3></div>;

  return (
    <div className="profile-container">
      <h1>👤 My Profile</h1>

      <div className="profile-card">
        <div className="profile-picture">
          <span>🧑‍💻</span>
        </div>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <p className="profile-tier">🏆 {user.role || 'User'}</p>

        <button className="edit-btn">Edit Profile</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>–</h3>
          <p>Total Points</p>
        </div>
        <div className="stat-card">
          <h3>–</h3>
          <p>Donations Made</p>
        </div>
        <div className="stat-card">
          <h3>–</h3>
          <p>Volunteering</p>
        </div>
        <div className="stat-card">
          <h3>–</h3>
          <p>Advocacy Responses</p>
        </div>
        <div className="stat-card">
          <h3>–</h3>
          <p>Recycling Actions</p>
        </div>
      </div>

      <button className="logout-btn" onClick={() => {
        localStorage.clear();
        window.location.href = '/';
      }}>
        Logout
      </button>
    </div>
  );
}
