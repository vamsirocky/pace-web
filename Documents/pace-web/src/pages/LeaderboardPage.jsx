import { useEffect, useState } from 'react';
import LeaderboardInfo from '../components/LeaderboardInfo';
import './styles/LeaderboardPage.css';

export default function LeaderboardPage() {
  /* -------------------- State -------------------- */
  const [leaderboard, setLeaderboard] = useState([]);   // all users leaderboard data
  const [showInfo, setShowInfo] = useState(false);      // badge info modal
  const [loggedInUserId, setLoggedInUserId] = useState(null); // current logged-in user
  const [showAll, setShowAll] = useState(false);        // toggle pagination (top 10 vs all)

  /* -------------------- On Mount -------------------- */
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    setLoggedInUserId(userId);
    fetchLeaderboard();
  }, []);

  /* -------------------- Fetch Leaderboard -------------------- */
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/leaderboard');
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      console.error(' Failed to fetch leaderboard:', err);
    }
  };

  /* -------------------- Badge assignment -------------------- */
  const getBadge = (points) => {
    if (points >= 800) return '🌟 Champion';
    if (points >= 600) return '💪 Warrior';
    if (points >= 400) return '🌿 Eco Hero';
    if (points >= 200) return '🌱 Contributor';
    return '🌼 Participant';
  };

  /* -------------------- Pagination -------------------- */
  const visibleLeaderboard = showAll ? leaderboard : leaderboard.slice(0, 10);

  /* -------------------- Render -------------------- */
  return (
    <div className="leaderboard-container">
      <h1 className="leaderboard-title">🏆 Leaderboard</h1>
      <button className="info-btn" onClick={() => setShowInfo(true)}>ℹ️ Badge Info</button>

      {/* Leaderboard Table */}
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Badge</th>
            <th>Name</th>
            <th>Email</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {visibleLeaderboard.map((user, index) => (
            <tr
              key={index}
              className={`tooltip-container ${user.user_id === loggedInUserId ? 'highlight-row' : ''}`}
            >
              {/* Rank */}
              <td>#{index + 1}</td>

              {/* Badge */}
              <td>{getBadge(user.points_total)}</td>

              {/* Name + tooltip for logged in user */}
              <td>
                {user.name}
                {user.user_id === loggedInUserId && (
                  <span className="tooltip">🎉 This is you!</span>
                )}
              </td>

              {/* Email */}
              <td>{user.email}</td>

              {/* Points ( fixed from total_points → points_total) */}
              <td>{user.points_total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Button */}
      {leaderboard.length > 10 && (
        <button className="view-btn" onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show Less' : 'View More'}
        </button>
      )}

      {/* Badge Info Modal */}
      {showInfo && <LeaderboardInfo onClose={() => setShowInfo(false)} />}
    </div>
  );
}
