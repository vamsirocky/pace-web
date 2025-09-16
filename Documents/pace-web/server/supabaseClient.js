import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config(); // ✅ This loads .env

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(" Supabase URL or Key missing in backend. Check your .env file in server/");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
