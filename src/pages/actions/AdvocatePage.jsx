import { useState } from 'react';
import '../styles/AdvocatePage.css';
import advocateImage from '/src/assets/advocate.jpg';

export default function AdvocatePage() {
  const [selectedScore, setSelectedScore] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const user_id = localStorage.getItem('user_id');
  const question = "How likely are you to support this initiative to help the cause?";

  const handleSelect = (score) => {
    setSelectedScore(score);
    setMessage(''); // clear previous message
  };

  const getCategory = (score) => {
    if (score >= 9) return 'Promoter 💚';
    if (score >= 7) return 'Passive 🙂';
    return 'Detractor 😕';
  };

  const handleSubmit = async () => {
    if (selectedScore === null || !user_id) {
      setMessage(' Please select a score and make sure you are logged in.');
      console.log(" Missing score or user_id");
      return;
    }

    setSubmitting(true);
    console.log(" Submitting to API...");

    try {
      const res = await fetch('http://localhost:5001/api/actions/advocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id,
          advocacy_question: question,
          user_response: selectedScore,
        }),
      });

      const result = await res.json();
      console.log(" API responded:", result);

      if (res.ok) {
        const category = getCategory(selectedScore);
        const msg = ` Response submitted successfully!\nYou are categorized as: ${category}`;
        setMessage(msg);
        console.log(" Final message set:", msg);
      } else {
        setMessage(` Error: ${result.error}`);
      }
    } catch (error) {
      console.error(" Network error:", error);
      setMessage(' Failed to connect to the server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="advocate-container">
      <h1 className="advocate-title">📢 Advocate & Empower</h1>

      <div className="advocate-image-container">
        <img src={advocateImage} alt="Advocacy" className="advocate-image" />
      </div>

      <p className="advocate-question">
        On a scale of 0–10, how likely are you to support this initiative to help the cause?
      </p>

      <div className="scale-buttons">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            className={`scale-button ${selectedScore === i ? 'selected' : ''}`}
            onClick={() => handleSelect(i)}
          >
            {i}
          </button>
        ))}
      </div>

      <button className="submit-button" onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit'}
      </button>

      {message && (
  <div className="popup-overlay">
    <div className="popup-box">
      {message.split('\n').map((line, i) => (
        <p key={i}>{line}</p>
      ))}
      <p>🙏 Thank you for taking the time to share your support!</p>
      <button className="close-popup" onClick={() => setMessage('')}>Close</button>
    </div>
  </div>
)}

    </div>
  );
}
