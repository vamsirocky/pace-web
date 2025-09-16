import { useState } from 'react';
import '../styles/StrengthenPage.css';
import strengthenImage from '/src/assets/strengthen.jpg';

export default function StrengthenPage({ isPopup = false }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const user_id = localStorage.getItem('user_id');

  const moodOptions = [
    {
      number: 5,
      face: "😡",
      description: "Feeling extremely overwhelmed, sad, or out of control.",
      action: "Seek immediate support, talk to someone, or practice deep breathing.",
    },
    {
      number: 4,
      face: "😠",
      description: "Feeling very angry, anxious, or upset with difficulty controlling emotions.",
      action: "Take a break, find a quiet space, or engage in physical movement.",
    },
    {
      number: 3,
      face: "😐",
      description: "Feeling upset, anxious, or stressed, with noticeable emotional intensity.",
      action: "Use grounding techniques like focused breathing, counting, or walking.",
    },
    {
      number: 2,
      face: "🙂",
      description: "Feeling slightly irritated, frustrated, or upset, but still in control.",
      action: "Take deep breaths, listen to music, or use positive self-talk.",
    },
    {
      number: 1,
      face: "😊",
      description: "Feeling calm, happy, relaxed, or peaceful.",
      action: "Stay engaged in pleasant activities like reading or talking with friends.",
    }
  ];

  const handleSubmit = async () => {
    if (!selectedMood || !user_id) {
      setMessage(' Please select your mood and make sure you are logged in.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5001/api/actions/strengthen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id,
          user_mood: selectedMood.number,
          user_mood_text: selectedMood.description,
          clicked_suggestions: selectedMood.action
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("🧘 Mood logged successfully!\n Keep taking care of yourself.");
      } else {
        setMessage(` Error: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      setMessage(" Failed to connect to the server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={isPopup ? "strengthen-popup" : "strengthen-container"}>
      {/* Only show title + image in full-page mode */}
      {!isPopup && (
        <>
          <h1 className="strengthen-title">🧘 Strengthen Body, Mind & Spirit</h1>
          <div className="strengthen-image-container">
            <img src={strengthenImage} alt="Strengthen Wellness" className="strengthen-image" />
          </div>
        </>
      )}

      <p className="strengthen-question">
        Select your current mood to get motivation and support:
      </p>

      {/* Mood buttons */}
      <div className="mood-buttons">
        {moodOptions.map((mood) => (
          <button
            key={mood.number}
            className={`mood-button ${selectedMood?.number === mood.number ? 'selected' : ''}`}
            onClick={() => {
              setSelectedMood(mood);
              setMessage('');
            }}
          >
            {mood.face} {mood.number}
          </button>
        ))}
      </div>

      {/* Mood result box */}
      {selectedMood && (
        <div className="result-box">
          <h3><strong>Your Mood:</strong> {selectedMood.face} - {selectedMood.description}</h3>
          <p><strong>Recommended Action:</strong> {selectedMood.action}</p>
          <button className="support-button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Get Support'}
          </button>
        </div>
      )}

      {/* Success/Error popup */}
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
    </div>
  );
}
