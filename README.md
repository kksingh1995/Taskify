# Taskify — Organize. Assign. Deliver.

Multi-organization, role-based task management platform.

**Roles**
- **Super Admin** (you) — onboards organizations (schools, colleges, businesses) and their first Org Admin.
- **Org Admin** — manages employees and tasks within their own organization only.
- **Employee** — sees tasks assigned to them and updates status.

## Project structure

```
Taskify/
  backend/    Node.js + Express + SQL Server API
  frontend/   React (Vite) + Tailwind + PWA
```

## 1. Database setup (SQL Server)

1. Create a database (e.g. `Taskify`) on your SQL Server instance.
2. Run [backend/sql/schema.sql](backend/sql/schema.sql) against it — creates `Organizations`, `Users`, `Tasks` tables.

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env      # then edit DB_SERVER, DB_USER, DB_PASSWORD, JWT_SECRET, etc.
npm run seed               # creates the first Super Admin account (from SUPER_ADMIN_* in .env)
npm run dev                 # starts API on http://localhost:5000
```

## 3. Frontend setup

```bash
cd frontend
npm install
npm run dev                 # starts app on http://localhost:5173
```

`frontend/.env` already points `VITE_API_URL` to `http://localhost:5000/api` — update it if your backend runs elsewhere.

## 4. First login

Log in with the Super Admin credentials from `backend/.env` (`SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`), then:

1. Super Admin → **+ Add Organization** → creates the org + its Org Admin.
2. Log in as that Org Admin → **+ Add Employee**, then **+ Create Task** and assign it.
3. Log in as the Employee → see the task on their dashboard, update status, or share it on WhatsApp.

## WhatsApp sharing

Uses the free `wa.me` click-to-chat link — no API key or Meta approval needed. Clicking **Share on WhatsApp** on a task opens WhatsApp (Web/App) with the task details pre-filled, addressed to the employee's saved phone number.

## PWA — installing on a phone

`npm run build && npm run preview` (or deploy `frontend/dist`) serves a fully installable PWA:
- Android/Chrome: visit the site → menu → **Install app** / **Add to Home screen**.
- iOS/Safari: visit the site → Share → **Add to Home Screen**.

The app icon, name, and theme color come from `frontend/vite.config.js` (`VitePWA` manifest) and the logo files in `frontend/public/`.

## Branding assets

- `frontend/public/logo.svg` — full lockup (icon + "Taskify" wordmark), used in the navbar/login screen.
- `frontend/public/icon-mark.svg` / `icon-maskable.svg` — source icon marks.
- `frontend/gen-icons.mjs` — regenerates the PNG app icons from the SVGs if the logo changes (run `npm install -D sharp && node gen-icons.mjs` inside `frontend/`).

## Security notes for production

- Change `JWT_SECRET` and all default passwords before deploying.
- Set `DB_ENCRYPT=true` if connecting to Azure SQL or any TLS-enabled SQL Server.
- Serve the frontend over HTTPS — PWA install and service workers require a secure context (except `localhost`).
