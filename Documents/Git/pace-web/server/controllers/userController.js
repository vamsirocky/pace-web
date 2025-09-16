// controllers/userController.js
import { supabase } from '../supabaseClient.js';
import bcrypt from 'bcrypt';

// GET Profile by user_id
export const getProfile = async (req, res) => {
  const { user_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error) {
      console.error(error);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
};

// PUT update profile
export const updateProfile = async (req, res) => {
  const { user_id } = req.params;
  const { name, email, password } = req.body;

  try {
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.password_hash = hashedPassword;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_id', user_id)
      .select();

    if (error) {
      console.error(error);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Profile updated successfully', data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during profile update' });
  }
};
