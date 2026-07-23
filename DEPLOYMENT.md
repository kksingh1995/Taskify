# Deploying Taskify for free

This sets up a 100% free hosting stack for Taskify, with auto-deploy on every `git push` so future feature updates go live automatically.

| Piece | Service | Why |
|---|---|---|
| Frontend (PWA) | **Vercel** | Free forever, auto HTTPS, free `*.vercel.app` subdomain, great for Vite/React |
| Backend API | **Render** | Free web service (sleeps after 15 min idle, wakes on next request in ~30-50s) |
| Database | **Azure SQL Database — Free Offer** | One database per Azure account free forever (32GB storage, 100K vCore-seconds/month) — no code changes needed, same SQL Server engine we already built for |

> Note: Azure signup usually asks for a card for identity verification, but you will not be charged as long as you stay on the free-tier database (don't attach it to a paid tier). If you'd rather avoid entering a card anywhere, tell me and I can migrate the backend from SQL Server to a card-free free database (e.g. Supabase/Neon Postgres) — it's a backend-only change, nothing else is affected.

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

## 2. Create the free Azure SQL Database

1. Sign up / log in at portal.azure.com.
2. **Create a resource → SQL Database**.
3. During creation, choose **"Free offer"** when prompted for compute tier (or select General Purpose Serverless and enable the free offer toggle) — this gives one free database per account.
4. Set a server admin username/password (save these).
5. Under the SQL Server resource → **Networking**, add a firewall rule **"Allow Azure services and resources to access this server"** = ON (so Render can reach it).
6. Copy the **server name** (looks like `yourserver.database.windows.net`).
7. Connect to it (e.g. via Azure's built-in Query Editor in the portal, or `sqlcmd -S yourserver.database.windows.net -U <admin> -P <password> -d <dbname>`) and run:
   - [backend/sql/schema.sql](backend/sql/schema.sql)
   - [backend/sql/create-app-login.sql](backend/sql/create-app-login.sql) (edit the placeholder password first — this creates a low-privilege app login instead of using the admin account in production)

## 3. Deploy the backend to Render

1. Sign up at render.com (free, no card needed for free web services).
2. **New → Web Service** → connect your GitHub repo.
3. Root directory: `backend`. Render will detect `render.yaml` — or set manually:
   - Build command: `npm install`
   - Start command: `npm start`
   - Plan: **Free**
4. Add environment variables (Render dashboard → Environment):
   ```
   DB_SERVER=yourserver.database.windows.net
   DB_PORT=1433
   DB_NAME=Taskify
   DB_USER=taskify_app
   DB_PASSWORD=<the password you set>
   DB_ENCRYPT=true
   DB_TRUST_SERVER_CERT=false
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
