// server/controllers/actionController.js
import { supabase } from '../supabaseClient.js';

// GET all activities (catalog)
export const getActivities = async (req, res) => {
  try {
    const { data, error } = await supabase.from('activities').select('*');
    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    console.error('❌ Error fetching activities:', err);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

// COMPLETE an activity
export const completeActivity = async (req, res) => {
  const { user_id, activity_id, reward, state, next_state } = req.body;

  try {
    // 1️⃣ Log into activity_log
    const { error: logError } = await supabase.from('activity_log').insert([
      { user_id, action: activity_id, state, next_state, reward }
    ]);
    if (logError) throw logError;

    // 2️⃣ Mark session as completed
    await supabase.from('activity_sessions')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('user_id', user_id)
      .eq('activity_id', activity_id)
      .eq('status', 'in_progress');

    // 3️⃣ Add reward points to user
    const { data: act } = await supabase.from('activities')
      .select('points')
      .eq('id', activity_id)
      .single();

    if (act?.points) {
      await supabase.from('users')
        .update({
          points_total: supabase.rpc('increment', { x: act.points }),
          points_redeemable: supabase.rpc('increment', { x: act.points })
        })
        .eq('user_id', user_id);
    }

    res.status(200).json({ message: 'Activity completed successfully!' });
  } catch (err) {
    console.error('❌ Error completing activity:', err);
    res.status(500).json({ error: 'Failed to complete activity' });
  }
};

// SUGGEST next activity based on lowest Q
export const suggestActivity = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('q_values')
      .select('*')
      .order('q_value', { ascending: true })
      .limit(1);

    if (error) throw error;
    res.status(200).json(data[0]);
  } catch (err) {
    console.error('❌ Error suggesting activity:', err);
    res.status(500).json({ error: 'Failed to suggest activity' });
  }
};
