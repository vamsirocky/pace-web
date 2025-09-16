// routes/leaderboardRoutes.js
import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Query directly from users table
    const { data, error } = await supabase
      .from('users')
      .select('user_id, name, email, points_total, points_redeemable')
      .order('points_total', { ascending: false });

    if (error) {
      console.error(" Supabase error:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data); // Send leaderboard array
  } catch (err) {
    console.error(' Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
