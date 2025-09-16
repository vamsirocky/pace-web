import './styles/NotificationOverlay.css';
import { FaTimes, FaBell, FaTrophy, FaCheckCircle } from 'react-icons/fa';

const notifications = [
  { icon: <FaCheckCircle />, message: "You completed 'Protect Wildlife'." },
  { icon: <FaTrophy />, message: "You earned the 'Action Hero' badge!" },
  { icon: <FaBell />, message: "2 actions pending this week." },
  { icon: <FaBell />, message: "Reminder: Volunteer activity tomorrow." },
];

export default function NotificationOverlay({ onClose }) {
  return (
    <div className="overlay-backdrop">
      <div className="overlay-box">
        <div className="overlay-header">
          <h3>All Notifications</h3>
          <FaTimes onClick={onClose} className="close-btn" />
        </div>
        <div className="overlay-content">
          {notifications.map((n, index) => (
            <div key={index} className="notification-item">
              <span className="icon">{n.icon}</span>
              <span>{n.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
