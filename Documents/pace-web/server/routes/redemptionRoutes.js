import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

/**
 * Redeem points
 */
router.post('/', async (req, res) => {
  const { user_id, redeemed_points, description } = req.body;

  try {
    // Insert into redemption log
    const { error: insertError } = await supabase
      .from('redemptions')
      .insert([{ user_id, redeemed_points, description }]);

    if (insertError) throw insertError;

    // Subtract from user total (redeemed but keep history)
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('points_total')
      .eq('user_id', user_id)
      .single();

    if (fetchError) throw fetchError;

    if (user.points_total < redeemed_points) {
      return res.status(400).json({ error: "Not enough points to redeem!" });
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ points_total: user.points_total - redeemed_points })
      .eq('user_id', user_id);

    if (updateError) throw updateError;

    res.json({ message: ' Redemption successful!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: ' Redemption failed' });
  }
});

export default router;
