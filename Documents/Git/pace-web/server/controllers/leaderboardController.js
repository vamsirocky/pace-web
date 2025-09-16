// server/controllers/leaderboardController.js
import { supabase } from '../supabaseClient.js';

export const getLeaderboard = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, name, points_total')
      .order('points_total', { ascending: false })
      .limit(10);

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    console.error('❌ Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};
