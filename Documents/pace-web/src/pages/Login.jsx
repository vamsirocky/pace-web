import { useState } from 'react';
import './styles/Login.css';
import { useNavigate } from 'react-router-dom';
import { FaLeaf } from 'react-icons/fa';
import { loginUser, signupUser } from '../api/paceApi'; //  Backend API functions

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const toggleForm = () => {
    setIsRegister(prev => !prev);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || (isRegister && password !== confirmPassword)) {
      alert("Please fill all fields correctly.");
      return;
    }

    try {
      if (isRegister) {
        const name = email.split('@')[0]; // Temporary name from email prefix
        const res = await signupUser(name, email, password);
        console.log("Signup response:", res); // ← now res is used
        alert('Signup successful! Please log in.');

        setIsRegister(false);
      } else {
       const res = await loginUser(email, password);
      console.log("Login result:", res); 


        localStorage.setItem('token', res.token);
        console.log("Saved token:", res.token);

        localStorage.setItem('user_id', res.user.id);
        navigate('/home');
      }
    } catch (err) {
      console.error('Auth failed:', err.response?.data?.error || err.message);
      alert("Authentication failed. Check your credentials.");
    }
  };

  return (
    <div className="login-container fade-in">
      <div className="icon-title">
        <FaLeaf className="eco-icon" />
        <h2>{isRegister ? 'Register for P.A.C.E' : 'Login to P.A.C.E'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="login-form">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        {isRegister && (
          <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        )}
        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
      </form>

      <p className="toggle-text">
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <span onClick={toggleForm}>{isRegister ? 'Login here' : 'Register here'}</span>
      </p>
    </div>
  );
}
