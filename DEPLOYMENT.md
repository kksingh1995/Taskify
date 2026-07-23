# Deploying Taskify for free

This sets up a 100% free hosting stack for Taskify, no card required anywhere, with auto-deploy on every `git push` so future feature updates go live automatically.

| Piece | Service | Why |
|---|---|---|
| Frontend (PWA) | **Vercel** | Free forever, auto HTTPS, free `*.vercel.app` subdomain, great for Vite/React |
| Backend API | **Render** | Free web service (sleeps after 15 min idle, wakes on next request in ~30-50s) |
| Database | **Neon** (serverless PostgreSQL) | Free forever, no card required, autosuspends when idle and wakes automatically on the next query (no data loss) |

---

## 1. Push the code to GitHub

1. Create a new **private** repository on github.com (e.g. `taskify`).
2. Push the local repo:
   ```bash
   cd Taskify
   git remote add origin https://github.com/<your-username>/taskify.git
   git branch -M main
   git push -u origin main
   ```

## 2. Create the free Neon Postgres database

1. Sign up at neon.tech (free, no card).
2. Create a project, e.g. "Taskify".
3. Copy the **connection string** from the dashboard — looks like:
   ```
   postgresql://user:password@ep-xxxx.neon.tech/dbname?sslmode=require
   ```
4. Apply the schema — either paste [backend/sql/schema.sql](backend/sql/schema.sql) into Neon's built-in SQL Editor in the dashboard, or from your machine:
   ```bash
   cd backend
   # with DATABASE_URL set in backend/.env
   npm run db:schema
   ```

## 3. Deploy the backend to Render

1. Sign up at render.com (free, no card needed for free web services).
2. **New → Web Service** → connect your GitHub repo.
3. Root directory: `backend`. Render will detect `render.yaml` — or set manually:
   - Build command: `npm install`
   - Start command: `npm start`
   - Plan: **Free**
4. Add environment variables (Render dashboard → Environment):
   ```
   DATABASE_URL=<your Neon connection string>
   JWT_SECRET=<generate a new long random string>
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=<your Vercel URL — add this after step 4>
   ```
5. Deploy. Note the Render URL, e.g. `https://taskify-api.onrender.com`.
6. Run the seed script once to create your Super Admin — Render dashboard → Shell → `npm run seed` (set `SUPER_ADMIN_*` env vars first).

## 4. Deploy the frontend to Vercel

1. Sign up at vercel.com (free) with your GitHub account.
2. **Add New → Project** → import the same repo.
3. Root directory: `frontend`. Vercel auto-detects Vite (build: `npm run build`, output: `dist`).
4. Add environment variable:
   ```
   VITE_API_URL=https://taskify-api.onrender.com/api
   ```
5. Deploy. You'll get a URL like `https://taskify.vercel.app`.
6. Go back to Render → update `CORS_ORIGIN` to this exact Vercel URL → redeploy backend.

## 5. Test it live

- Open the Vercel URL on your phone → browser menu → **Add to Home Screen / Install app**.
- Log in with your Super Admin credentials → create an organization → test the full flow.

## 6. Ongoing workflow (adding features over time)

Both Vercel and Render auto-deploy on every push to `main`:

```bash
# make your change locally, test with npm run dev in both folders, then:
git add -A
git commit -m "describe the change"
git push
```

Vercel redeploys the frontend in ~1 minute; Render redeploys the backend in ~2-3 minutes. No manual redeploy steps needed.

**Tip:** for anything riskier, create a git branch, push it, and use each platform's "Preview Deployment" (Vercel does this automatically per-branch/PR; Render supports it on paid plans) to test before merging to `main`.
