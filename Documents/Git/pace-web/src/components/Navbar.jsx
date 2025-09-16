import NotificationBell from './NotificationBell';
import './styles/Navbar.css';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';

export default function Navbar({ setShowOverlay }) {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="nav-left">
        <NotificationBell unreadCount={3} onShowMore={() => setShowOverlay(true)} />
        <FaUserCircle
          className="profile-icon"
          size={24}
          onClick={() => navigate('/profile')}
          title="Profile"
        />
      </div>
    </nav>
  );
}
