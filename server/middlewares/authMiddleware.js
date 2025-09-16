// middlewares/authMiddleware.js

import { supabase } from '../supabaseClient.js';

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided.' });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    console.error('Auth failed:', error);
    return res.status(401).json({ error: 'Invalid token.' });
  }

  req.user = data.user;
  next();
};
