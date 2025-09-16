import { supabase } from '.src/supabaseClient';

const handleSignup = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  if (error) {
    console.error(error.message);
  } else {
    console.log("Signup successful:", data);
  }
};

const handleLogin = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) {
    console.error(error.message);
  } else {
    console.log("Login successful:", data);
  }
};
