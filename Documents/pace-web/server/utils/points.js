// utils/points.js
import { supabase } from '../supabaseClient.js';

export const updateUserPoints = async (user_id, pointsToAdd) => {
  try {
    // Get current user points
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('points_total')
      .eq('user_id', user_id)
      .single();

    if (fetchError) throw fetchError;

    const newPoints = (user?.points_total || 0) + pointsToAdd;

    // Update points in users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ points_total: newPoints })
      .eq('user_id', user_id);

    if (updateError) throw updateError;

    return newPoints;
  } catch (err) {
    console.error(' Error updating points:', err);
    return null;
  }
};
