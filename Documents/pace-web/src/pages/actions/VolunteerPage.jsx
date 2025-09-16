import { useState } from 'react';
import '../styles/VolunteerPage.css';
import volunteerImage from '/src/assets/volunteer.jpg';

export default function VolunteerPage() {
  const [message, setMessage] = useState('');
  const [loadingId, setLoadingId] = useState(null);

  const user_id = localStorage.getItem('user_id');

  
  const dummyUser = {
    name: 'Vamsi',
    age: 22,
    gender: 'male',
  };

  const events = [
    {
      id: 1,
      title: 'Tree Plantation Drive',
      date: '2025-08-01',
      description: 'Join us to plant trees in your local community.',
    },
    {
      id: 3,
      title: 'Wildlife Conservation Program',
      date: '2025-08-05',
      description: 'Participate in protecting local wildlife habitats.',
    },
    {
      id: 4,
      title: 'Eco-Friendly Awareness Campaign',
      date: '2025-08-12',
      description: 'Spread awareness about sustainable living.',
    },
  ];

  const handleJoin = async (event) => {
    if (!user_id) {
      setMessage(' Please log in to join events.');
      return;
    }

    setLoadingId(event.id);
    setMessage('');

    try {
      const res = await fetch('http://localhost:5001/api/actions/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id,
          user_name: dummyUser.name,
          user_age: dummyUser.age,
          user_gender: dummyUser.gender,
          event_name: event.title,
          event_date: event.date,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage(` Successfully joined: ${event.title}`);
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      setMessage(' Could not connect to the server.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="volunteer-container">
      <h1 className="volunteer-title">🤝 Volunteer & Lead</h1>

      <div className="volunteer-image-container">
        <img src={volunteerImage} alt="Volunteer Event" className="volunteer-image" />
      </div>

      <p className="volunteer-description">
        Join upcoming sustainability events and make a difference in your community!
      </p>

      <div className="events-grid">
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p className="event-date"> {event.date}</p>
            <button onClick={() => handleJoin(event)} disabled={loadingId === event.id}>
              {loadingId === event.id ? 'Joining...' : 'Join'}
            </button>
          </div>
        ))}
      </div>

      {message && <p className="volunteer-message">{message}</p>}
    </div>
  );
}
