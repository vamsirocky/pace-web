import { useState, useEffect } from 'react';
import '../styles/RecyclePage.css';
import recycleImage from '/src/assets/recycle.jpg';

export default function RecyclePage() {
  const user_id = localStorage.getItem('user_id');
  const [frequency, setFrequency] = useState('');
  const [itemTypes, setItemTypes] = useState([]);
  const [appDownloaded, setAppDownloaded] = useState(false);
  const [message, setMessage] = useState('');
  const [showAppReminder, setShowAppReminder] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const allItems = ['Plastic', 'Paper', 'Metal', 'Glass', 'Electronics', 'Textiles'];

  const toggleItem = (item) => {
    setItemTypes((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async () => {
    if (!user_id || !frequency || (frequency !== 'Never' && itemTypes.length === 0)) {
      setMessage(' Please complete all fields before submitting.');
      return;
    }

    setSubmitting(true);
    setMessage('');
    setShowAppReminder(false);

    try {
      const res = await fetch('http://localhost:5001/api/actions/recycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id,
          recycling_frequency: frequency,
          item_types: frequency === 'Never' ? 'None' : itemTypes.join(', '),
          app_downloaded: appDownloaded
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage('♻️ Your recycling habits have been recorded!\n🌱 Thanks for making a difference!');
        setFrequency('');
        setItemTypes([]);
        setAppDownloaded(false);

        if (!appDownloaded) {
          setTimeout(() => {
            setShowAppReminder(true);
          }, 5000);
        }
      } else {
        setMessage(` Error: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      setMessage(' Failed to connect to the server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="recycle-container">
      <h1 className="recycle-title">♻️ Reduce, Reuse, Recycle</h1>

      <div className="recycle-image-container">
        <img src={recycleImage} alt="Reduce Reuse Recycle" className="recycle-image" />
      </div>

      <div className="recycle-description">
        <p>Every small action towards reducing waste makes a big impact!</p>
        {/* <p>You can make a difference and contribute to a greener planet.</p> */}

        <div className="form-group">
          <label>🕒 How often do you recycle?</label>
          <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
            <option value="">Select frequency</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Rarely">Rarely</option>
            <option value="Never">Never</option>
          </select>
        </div>

        {frequency && frequency !== 'Never' && (
          <div className="form-group">
            <label>🧺 What items do you recycle?</label>
            <div className="checkbox-group">
              {allItems.map((item) => (
                <label key={item}>
                  <input
                    type="checkbox"
                    checked={itemTypes.includes(item)}
                    onChange={() => toggleItem(item)}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>
        )}

        {frequency && (
          <div className="form-group">
            <label>📱 Have you downloaded a recycling app?</label>
            <input
              type="checkbox"
              checked={appDownloaded}
              onChange={() => setAppDownloaded(!appDownloaded)}
            />
          </div>
        )}

        {frequency && (
          <button className="download-button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Response'}
          </button>
        )}
      </div>

      {/* Main success/error popup */}
      {message && (
        <div className="popup-overlay">
          <div className="popup-box">
            {message.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            <button className="close-popup" onClick={() => setMessage('')}>Close</button>
          </div>
        </div>
      )}

      {/* App reminder popup */}
      {showAppReminder && (
        <div className="popup-overlay">
          <div className="popup-box">
            <p>📱 Looks like you haven't downloaded the P.A.C.E. app!</p>
            <p>Get the app to track your actions and earn rewards.</p>
            <a href="https://pace-app-link.com" target="_blank" rel="noopener noreferrer">
              <button className="download-button">Download the App</button>
            </a>
            <button className="close-popup" onClick={() => setShowAppReminder(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
