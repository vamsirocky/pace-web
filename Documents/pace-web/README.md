<!-- ****************************************************************************************************** -->
P.A.C.E. – Personal Accounting Climate Economics Platform

P.A.C.E. is a full-stack sustainability platform designed to raise awareness, encourage eco-friendly actions, and enable donations toward environmental initiatives. The system includes a React frontend, Node.js/Express backend, FastAPI microservice, and a Supabase cloud database.
<!-- ****************************************************************************************************** -->
Features
1.User Authentication (Supabase + custom backend)

2.Actions Module: Donate & Buy, Volunteer & Lead, Advocate & Empower, Reuse-Reduce-Recycle, Strengthen Body & Mind, Protect Wildlife

3.Leaderboards: Track sustainability points across users and organizations

4.AI Recommendations: Q-learning model suggests next best activity based on history

5.Organization Reports: SDG/ESG-aligned reports generated via FastAPI service

6.Donations: Integrated via Stripe (test mode)

7.Responsive UI built with Vite + React
<!-- ****************************************************************************************************** -->
Tech Stack

1.Frontend: React (Vite, Tailwind CSS)

2.Backend #1: Node.js + Express

3.Backend #2: Python + FastAPI (with Uvicorn)

4.Database & Auth: Supabase (Postgres)

5.Hosting: Vercel (frontend), Render (backends), Supabase (DB)

6.Other: Stripe (donations), Gmail SMTP (notifications), Q-Learning (AI recommendations)
<!-- ****************************************************************************************************** -->
Setup (Local Development)
Prerequisites

Node.js (v18+)

Python (3.11+)

npm or yarn

pip or pipenv/venv

Supabase account (free tier)
<!-- ****************************************************************************************************** -->
1. Clone the repository
git clone https://github.com/yourusername/pace-web.git
cd pace-web

2. Frontend (React)
cd frontend
npm install
npm run dev

<!-- Runs on http://localhost:5173 -->
3. Backend (Node.js + Express)
cd server
npm install
npm start

<!-- Runs on http://localhost:5001 -->
4. Backend (FastAPI)
cd server
pip install -r requirements.txt
uvicorn server.main:app --reload --port 8000
<!-- Runs on http://localhost:8000 -->
<!-- ****************************************************************************************************** -->
Environment Variables
Frontend (.env)
VITE_NODE_API_URL=http://localhost:5001
VITE_API_URL=http://localhost:8000/ai

Node Backend (.env inside /server)
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE=your-supabase-service-key
GMAIL_USER=your-gmail@example.com
GMAIL_PASS=your-gmail-app-password
CORS_ORIGINS=http://localhost:5173,https://*.vercel.app

FastAPI (.env inside /server)
DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/postgres?sslmode=require
LLM_PROVIDER=openai
OPENAI_API_KEY=your-key
CORS_ORIGINS=http://localhost:5173,https://*.vercel.app
<!-- ****************************************************************************************************** -->
Deployment (Permanent Free Hosting)
1. Backend #1 (Node/Express) → Render
Connect repo → Root directory: server
Build: npm install
Start: npm start
Add env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE, GMAIL_USER, GMAIL_PASS

2. Backend #2 (FastAPI) → Render
Root directory: server
Build: pip install -r requirements.txt
Start:
uvicorn server.main:app --host 0.0.0.0 --port $PORT
Add env vars: DATABASE_URL, LLM_PROVIDER, OPENAI_API_KEY, CORS_ORIGINS

3. Frontend (React) → Vercel
Connect repo → framework auto-detected (Vite)
Build: vite build
Output: dist
Add env vars:
VITE_NODE_API_URL=https://your-node.onrender.com
VITE_API_URL=https://your-ai.onrender.com/ai
After deployment:
Frontend (public): https://your-frontend.vercel.app
Backend Node: https://your-node.onrender.com
Backend FastAPI: https://your-ai.onrender.com
Supabase: already live
<!-- ****************************************************************************************************** -->
License

This project is open-source under the MIT License.