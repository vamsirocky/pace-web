import { useState } from 'react';
import '../styles/DonatePage.css';

export default function DonatePage({ isPopup = false }) {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [donationType, setDonationType] = useState('tree');
  const [otherCause, setOtherCause] = useState(''); //  added
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const user_id = localStorage.getItem('user_id'); //  logged in user

  const handleRecommendedClick = (value) => {
    setAmount(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !user_id) {
      setMessage(' Please enter an amount and make sure you are logged in.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:5001/api/actions/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id,
          donation_amount: parseFloat(amount),
          item_details: getItemLabel(donationType)
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage('🎉 Thank you! Your donation has been recorded.');
        setAmount('');
        setOtherCause('');
      } else {
        setMessage(` Error: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      setMessage(' Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const getItemLabel = (value) => {
    switch (value) {
      case 'tree': return 'Plant Trees';
      case 'cleanup': return 'Community Cleanup';
      case 'wildlife': return 'Wildlife Support';
      case 'other': return `Other: ${otherCause || "Custom Cause"}`;
      default: return '';
    }
  };

  return (
    <div className={isPopup ? "donate-popup" : "donate-container"}>
      {/* Only show heading in full-page mode */}
      {!isPopup && <h1 className="donate-title">🤲 Make a Difference with Your Donation</h1>}

      <div className="recommended-section">
        <h3>Enter Your Donation</h3>
        <div className="amount-options">
          {[50, 100, 200, 300].map((value) => (
            <div
              key={value}
              className={`amount-card ${Number(amount) === value ? 'selected' : ''}`}
              onClick={() => handleRecommendedClick(value)}
            >
              €{value}
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <form onSubmit={handleSubmit}>
          {/* Custom Amount */}
          <label className="form-label" htmlFor="custom-amount">Or Custom Amount (€)</label>
          <input
            id="custom-amount"
            name="custom-amount"
            type="number"
            placeholder="Custom Amount (€)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          {/* Donation Type */}
          <label className="form-label" htmlFor="donation-type">Donation Type</label>
          <select
            id="donation-type"
            name="donation-type"
            value={donationType}
            onChange={(e) => setDonationType(e.target.value)}
          >
            <option value="tree">Plant Trees</option>
            <option value="cleanup">Community Cleanup</option>
            <option value="wildlife">Wildlife Support</option>
            <option value="other">Other Cause</option>
          </select>

          {/* Show text input if "Other Cause" is chosen */}
          {donationType === 'other' && (
            <input
              id="other-cause"
              name="other-cause"
              type="text"
              placeholder="Enter your cause"
              value={otherCause}
              onChange={(e) => setOtherCause(e.target.value)}
            />
          )}

          {/* Payment Method */}
          <label className="form-label">Payment Method</label>
          <div className="radio-wrapper">
            <label className="radio-label" htmlFor="card">
              <input
                type="radio"
                id="card"
                name="payment"
                checked={selectedMethod === 'card'}
                onChange={() => setSelectedMethod('card')}
              />
              <span>Credit/Debit Card</span>
            </label>
          </div>

          {/* Card details */}
          {selectedMethod === 'card' && (
            <div className="card-inputs">
              <input type="text" placeholder="Card Number" />
              <div className="card-details">
                <input type="text" placeholder="MM/YY" />
                <input type="text" placeholder="CVC" />
              </div>
            </div>
          )}

          {/* Centered Donate Button */}
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : `Donate ${amount ? `€${amount}` : ''}`}
            </button>
          </div>
        </form>

        {message && <p className="donation-message">{message}</p>}
      </div>
    </div>
  );
}
