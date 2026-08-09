# Bulk Mail Sender (MERN Stack)

A full-stack app for sending bulk emails, built with **React**, **Node.js/Express**, **MongoDB**, and **Nodemailer**.

## Features
- Admin login (JWT-based, credentials from `.env`)
- Send the same subject/body to multiple recipients at once
- Input validation (empty fields, invalid email formats)
- Success / partial failure / failure status per send
- Email history page showing all past sends, pulled from MongoDB

## Project Structure
```
BulkMailSender/
├── backend/      Express API + MongoDB models + Nodemailer
└── frontend/     React app (login, send mail, history)
```

## 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:
- `MONGO_URI` — your MongoDB connection string (local or Atlas)
- `EMAIL_USER` / `EMAIL_PASS` — a Gmail address + an **App Password**
  (Google Account → Security → 2-Step Verification → App Passwords)
- `JWT_SECRET` — any long random string
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — credentials you'll use to log in

Start the server:
```bash
npm run dev
```
Runs on `http://localhost:5000`.

## 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```
Runs on `http://localhost:3000` and talks to the backend via `REACT_APP_API_URL` in `frontend/.env`.

## 3. Using the App
1. Go to `http://localhost:3000`, you'll be redirected to `/login`.
2. Log in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your backend `.env`.
3. On the **Send Mail** page, fill in Subject, Body, and Recipients (comma, space, or newline separated).
4. Check the **History** page to see all past sends and their status.

## Production Deployment

### Option A — Docker Compose (recommended, one command)
```bash
cd backend
cp .env.example .env   # fill in real MONGO_URI (or leave as-is to use the bundled mongo service), EMAIL_*, JWT_SECRET, ADMIN_*
cd ..
docker compose up --build -d
```
This builds and runs three containers: `mongo`, `backend` (port 5000), and `frontend` served by nginx (port 80).
Set `FRONTEND_ORIGIN` in `backend/.env` to your real frontend URL, and `REACT_APP_API_URL` build arg in `docker-compose.yml` to your real backend URL before deploying to a real domain.

### Option B — Manual deploy
Backend:
```bash
cd backend
npm ci --omit=dev
NODE_ENV=production npm start
```
Frontend:
```bash
cd frontend
npm ci
npm run build      # outputs static files to frontend/build — uses .env.production for REACT_APP_API_URL
```
Serve `frontend/build` with any static host (nginx, Netlify, Vercel, S3+CloudFront). Put the backend behind a reverse proxy that terminates HTTPS.

### Production checklist
- [ ] `backend/.env` has a real `JWT_SECRET` (32+ random characters), not the example value
- [ ] `NODE_ENV=production` is set — this locks CORS down to `FRONTEND_ORIGIN` and enforces the `JWT_SECRET` length check
- [ ] `FRONTEND_ORIGIN` matches your deployed frontend's exact origin
- [ ] MongoDB is a real persistent instance (Atlas or a volume-backed container), not the default local dev database
- [ ] Traffic reaches the backend over HTTPS (via reverse proxy / load balancer — the app itself doesn't terminate TLS)
- [ ] `ADMIN_EMAIL` / `ADMIN_PASSWORD` are changed from the example defaults
- [ ] Gmail App Password (or a transactional email provider like SES/SendGrid for higher volume) is configured in `EMAIL_USER` / `EMAIL_PASS`

### What's already hardened for production
- `helmet` — sets standard security headers (CSP, etc.)
- `express-rate-limit` — throttles `/api/auth/login` (10/15min) and `/api/mail/send` (5/min) to blunt brute-force and mail-abuse attempts
- `compression` — gzips API responses
- CORS is locked to `FRONTEND_ORIGIN` when `NODE_ENV=production` (wide open only in dev for convenience)
- `backend/config/validateEnv.js` — fails fast at boot if required env vars are missing, or if `JWT_SECRET` is too short in production
- Server-side email validation and a per-request recipient cap (500) in `mailRoutes.js` — the frontend chip input isn't trusted alone
- Pooled, rate-limited Nodemailer transporter so large recipient lists don't get throttled/blocked by Gmail
- `/healthz` endpoint for uptime monitors and container orchestrators
- Graceful shutdown on `SIGTERM`/`SIGINT` so the HTTP server drains before exiting

## How It Works (for learning)
- `backend/routes/authRoutes.js` — checks email/password against `.env`, issues a JWT.
- `backend/middleware/auth.js` — verifies the JWT on protected routes.
- `backend/routes/mailRoutes.js` — loops over recipients, sends each email via Nodemailer, saves a record to MongoDB (`backend/models/Email.js`) with the final status.
- `frontend/src/api/axios.js` — a shared axios instance that automatically attaches the saved JWT to every request.
- `frontend/src/pages/SendMail.js` — validates input client-side before calling the API.
- `frontend/src/pages/History.js` — fetches and displays the `Email` collection from MongoDB.
