// server/controllers/authController.js
import { supabase } from '../supabaseClient.js';

// SIGNUP
export const signup = async (req, res) => {
  const { email, password, name, role } = req.body;

  try {
    // Step 1: Sign up in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } }
    });

    if (error) {
      console.error('❌ Auth signup error:', error.message);
      return res.status(400).json({ error: error.message });
    }

    const user = data.user;

    // Step 2: Insert into users table with default points
    const { error: insertError } = await supabase
      .from('users')
      .insert([{
        user_id: user.id,      // Supabase Auth user_id (UUID)
        name,
        email,
        points_total: 50,     
        points_redeemable: 50, 
      }]);

    if (insertError) {
      console.error('❌ Failed to insert user record:', insertError.message);
      return res.status(400).json({ error: insertError.message });
    }

    res.status(200).json({
      message: 'Signup successful!',
      user: { id: user.id, email: user.email, name }
    });

  } catch (err) {
    console.error('❌ Unexpected signup error:', err.message);
    res.status(500).json({ error: 'Server error during signup' });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('❌ Login error:', error.message);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Login successful!', user: data.user });
  } catch (err) {
    console.error('❌ Unexpected login error:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
};
