// routes/actionRoutes.js
import express from 'express';
import { supabase } from '../supabaseClient.js';
import { updateUserPoints } from '../utils/points.js';

const router = express.Router();

/** Donate & Buy **/
router.post('/donate', async (req, res) => {
  const { user_id, donation_amount, item_details } = req.body;

 const { data, error } = await supabase
  .from('donate_buy')
  .insert([{ user_id, donation_amount, item_details }])
  .select();   //  ensures inserted row(s) come back


  if (error) return res.status(400).json({ error: error.message });

  await updateUserPoints(user_id, 10); // +10 pts
  res.status(200).json({ message: 'Donation logged & points added!' });
});

/** Volunteer **/
router.post('/volunteer', async (req, res) => {
  const { user_id, user_name, user_age, user_gender, event_name, event_date } = req.body;

  const { error } = await supabase
    .from('volunteer_lead')
    .insert([{ user_id, user_name, user_age, user_gender, event_name, event_date }]);

  if (error) return res.status(400).json({ error: error.message });

  await updateUserPoints(user_id, 15); // +15 pts
  res.status(200).json({ message: 'Volunteer logged & points added!' });
});

/** Advocate **/
router.post('/advocate', async (req, res) => {
  const { user_id, advocacy_question, user_response } = req.body;

  const { error } = await supabase
    .from('advocate_empower')
    .insert([{ user_id, advocacy_question, user_response }]);

  if (error) return res.status(400).json({ error: error.message });

  await updateUserPoints(user_id, 5); // +5 pts
  res.status(200).json({ message: 'Advocacy logged & points added!' });
});

/** Strengthen (Wellness) **/
router.post('/strengthen', async (req, res) => {
  const { user_id, user_mood, user_mood_text, clicked_suggestions } = req.body;

  const { error } = await supabase
    .from('strengthen_body_mind_spirit')
    .insert([{ user_id, user_mood, user_mood_text, clicked_suggestions }]);

  if (error) return res.status(400).json({ error: error.message });

  await updateUserPoints(user_id, 5); // +5 pts
  res.status(200).json({ message: 'Wellness logged & points added!' });
});

/** Recycle **/
router.post('/recycle', async (req, res) => {
  const { user_id, app_downloaded, recycling_frequency, item_types } = req.body;

  const { error } = await supabase
    .from('reuse_reduce_recycle')
    .insert([{ user_id, app_downloaded, recycling_frequency, item_types }]);

  if (error) return res.status(400).json({ error: error.message });

  await updateUserPoints(user_id, 8); // +8 pts
  res.status(200).json({ message: 'Recycling logged & points added!' });
});

/** Wildlife **/
router.post('/wildlife', async (req, res) => {
  const { user_id, engagement_field } = req.body;

  const { error } = await supabase
    .from('protect_land_sea_wildlife')
    .insert([{ user_id, engagement_field }]);

  if (error) return res.status(400).json({ error: error.message });

  await updateUserPoints(user_id, 12); // +12 pts
  res.status(200).json({ message: 'Wildlife logged & points added!' });
});

export default router;
