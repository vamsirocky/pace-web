import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5001',
});

export const signupUser = async (name, email, password) => {
  const response = await API.post('/auth/signup', { name, email, password });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await API.post('/auth/login', { email, password });
  return response.data;
};
// Authenticated GET

export const getProfile = async (user_id, token) => {
  const res = await API.get(`/auth/profile/${user_id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data; // or return res.data.data if you're wrapping your response
};
