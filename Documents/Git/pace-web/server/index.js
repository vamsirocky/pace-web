
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import profileRoutes from './routes/profileRoutes.js';
import authRoutes from './routes/authRoutes.js';
import actionRoutes from './routes/actionRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import assistRoutes from './routes/assistRoutes.js'; 

dotenv.config();

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== Routes =====
app.use('/auth', authRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/profile', profileRoutes);
app.use('/api', assistRoutes); // ✅ Nodemailer route mounted at /api/send-assistance

// ===== Health Check =====
app.get('/', (req, res) => {
  res.send('Backend running');
});

app.get('/api/env', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_ANON_KEY,
  });
});

// ===== Start server =====
const PORT = process.env.PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(` Backend server running on port ${PORT}`);
  console.log(" Connected to Supabase DB successfully");
});

