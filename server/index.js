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

const allowedOrigins = [
  "http://localhost:5173",
  "https://pace-web-sustainability.netlify.app",
  "https://unsuperior-nenita-neurasthenically.ngrok-free.app"
];

const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin like curl, Postman, mobile apps
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('Not allowed by CORS'), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

// Enable CORS on all routes
app.use(cors(corsOptions));

// Explicitly handle preflight OPTIONS requests for all routes with the same options
app.options('*', cors(corsOptions));

// Middleware to parse JSON bodies
app.use(express.json());

// Mount routes
app.use('/auth', authRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/profile', profileRoutes);
app.use('/api', assistRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Backend running');
});

// Expose environment variables safely if needed
app.get('/api/env', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_ANON_KEY,
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend server running on port ${PORT}`);
  console.log('🌐 Connected to Supabase DB successfully');
});
