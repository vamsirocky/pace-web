import { useState, useRef, useEffect } from 'react';
import { FaBell, FaTrophy, FaCheckCircle } from 'react-icons/fa';
import './styles/NotificationBell.css';

const notifications = [
  { icon: <FaCheckCircle />, message: "You completed 'Protect Wildlife'." },
  { icon: <FaTrophy />, message: "You earned the 'Action Hero' badge!" },
  { icon: <FaBell />, message: "2 actions pending this week." },
];

export default function NotificationBell({ unreadCount, onShowMore }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="notification-wrapper" ref={ref}>
      <div className="bell-icon" onClick={() => setOpen(!open)}>
        <FaBell />
        {unreadCount > 0 && <span className="notification-dot"></span>}
      </div>

      {open && (
        <div className="notification-dropdown">
          {notifications.map((n, index) => (
            <div key={index} className="notification-item">
              <span className="icon">{n.icon}</span>
              <span>{n.message}</span>
            </div>
          ))}
          <span className="show-more" onClick={() => { setOpen(false); onShowMore(); }}>
            Show more →
          </span>
        </div>
      )}
    </div>
  );
}
