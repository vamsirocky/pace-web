import { FaTimes } from 'react-icons/fa';
import './styles/LeaderboardInfo.css';

const badgeTiers = [
  { emoji: '🌼', name: 'Participant', points: '0–199', desc: 'Just getting started' },
  { emoji: '🌱', name: 'Contributor', points: '200–399', desc: 'Actively participating' },
  { emoji: '🌿', name: 'Eco Hero', points: '400–599', desc: 'Making a visible impact' },
  { emoji: '💪', name: 'Warrior', points: '600–799', desc: 'Going beyond expectations' },
  { emoji: '🌟', name: 'Champion', points: '800+', desc: 'Top contributor' }
];

export default function LeaderboardInfo({ onClose }) {
  return (
    <div className="overlay-backdrop">
      <div className="overlay-box">
        <div className="overlay-header">
          <h3>Leaderboard & Badge Tiers</h3>
          <FaTimes onClick={onClose} className="close-btn" />
        </div>
        <p className="desc">Users are ranked based on total points earned from completed actions, volunteering, and donations. Here’s how badge tiers are assigned:</p>
        <table className="badge-table">
          <thead>
            <tr>
              <th>Badge</th>
              <th>Tier</th>
              <th>Points</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {badgeTiers.map((tier, index) => (
              <tr key={index}>
                <td>{tier.emoji}</td>
                <td>{tier.name}</td>
                <td>{tier.points}</td>
                <td>{tier.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
