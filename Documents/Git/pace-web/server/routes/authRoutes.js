// routes/authRoutes.js

import bcrypt from 'bcrypt';
import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

/**  Signup Route **/
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const { data: user, error: signupError } = await supabase.auth.signUp({ email, password });

    if (signupError) {
      console.error(signupError);
      return res.status(400).json({ error: signupError.message });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: inserted, error } = await supabase
      .from('users')
      .insert([
        {
          user_id: user.user.id,
          name,
          email,
          password_hash: hashedPassword,
          role: 'User'
        }
      ])
      .select(); // optional: confirm insert

    if (error) {
      console.error("Insert failed during signup:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log(" User inserted on signup:", inserted);
    res.status(200).json({ message: 'Signup successful!', user: user.user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

/** Login Route with fallback insert **/
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

    if (loginError || !loginData.session) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    const supaUser = loginData.user;

    //  Check if user exists in your 'users' table
    const { data: existingUser } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', supaUser.id)
      .maybeSingle();

    if (!existingUser) {
      console.log(" User not found in users table. Attempting to insert...");

      const { data: inserted, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            user_id: supaUser.id,
            name: supaUser.user_metadata?.name || supaUser.email.split('@')[0],
            email: supaUser.email,
            password_hash: 'via-auth',
            role: 'User'
          }
        ])
        .select();

      if (insertError) {
        console.error(" Failed to insert user during login:", insertError);
      } else {
        console.log("Inserted user during login:", inserted);
      }
    } else {
      console.log("User already exists in users table.");
    }

    res.status(200).json({
      message: 'Login successful!',
      user: supaUser,
      token: loginData.session.access_token
    });

    console.log("🔐 Login response token:", loginData.session.access_token);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

/**  Get User Profile Route **/
router.get('/profile/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    console.log("🔍 Fetching profile for user_id:", user_id);

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    console.log("Returned data:", data);
    console.log("Supabase error:", error);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

export default router;
