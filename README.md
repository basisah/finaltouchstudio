# FinalTouch Studio — Docker Dev Stack

> **React · Node.js · MySQL** — Full live-reload Docker environment

## 🚀 Quick Start

```bash
docker compose up --build
```

That's it. All three services start together.

| Service  | URL                     | Description          |
| -------- | ----------------------- | -------------------- |
| Frontend | http://localhost:3000   | React app (Vite HMR) |
| Backend  | http://localhost:5000/API | Express REST API     |
| Database | localhost:3306          | MySQL 8              |

---

## 🔄 Live Reload — How It Works

| Service  | Mechanism                         | What triggers a reload             |
| -------- | --------------------------------- | ---------------------------------- |
| Frontend | **Vite HMR** (Hot Module Replace) | Any edit to `frontend/src/**`      |
| Backend  | **nodemon**                       | Any edit to `backend/src/**`       |
| Database | Persistent volume                 | Data survives container restarts   |

> **Windows/Mac users**: Vite uses `usePolling: true` so file changes inside the
> container are always detected regardless of the OS filesystem event limitations.

---

## 📁 Project Structure

```
finaltouchstudio/
├── docker-compose.yml            # Orchestrates db, backend and frontend
├── db/init.sql                   # Runs once on first DB start
├── api/index.js                  # Vercel serverless entry (wraps the backend)
├── backend/
│   ├── scripts/resetDb.js        # npm run db:reset
│   └── src/
│       ├── index.js              # Express app: middleware, static files, routes
│       ├── db.js                 # Shared MySQL connection pool
│       ├── constants/            # Order statuses
│       ├── database/             # Schema definition, indexes, start-up bootstrap
│       ├── seed/                 # Demo catalogue (data + seed/remove script)
│       ├── middleware/           # auth, optionalAuth, isAdmin
│       ├── routes/               # Public + customer API (routes/admin = admin API)
│       ├── emailservices/        # Email templates
│       └── utils/                # Mailer, uploads, rental availability
└── frontend/
    ├── vite.config.js            # Dev server, API proxy, chunking
    └── src/
        ├── App.jsx               # Lazy-loaded routes
        ├── index.css             # Design tokens + base styles
        ├── api/                  # API client and endpoint modules
        ├── components/
        │   ├── ui/               # Button, Field, Card, Modal, PageHeader, ...
        │   ├── layout/           # Navbar, Footer, PageLayout, AuthShell
        │   └── catalog/          # ItemImage, ProductCard, SearchBar
        ├── constants/            # Site details, landing content, pricing
        ├── context/              # Cart state
        ├── hooks/                # useCatalog, useToast, useClickOutside
        ├── pages/                # One folder per route
        └── utils/                # Formatting, images, session, cart totals
```

---

## 🎨 Design System

All colours, type sizes, spacing, radii, shadows and motion are CSS custom
properties in `frontend/src/index.css`. Build pages from the primitives in
`frontend/src/components/ui` and reference tokens (`var(--accent)`,
`var(--space-4)`, ...) instead of hard-coding values.

---

## 🌱 Demo Catalogue

Placeholder products (41 items, 7 packages) for use until the real inventory
is entered. Every demo row is flagged `is_demo = 1`.

```bash
cd backend
npm run seed:demo           # insert / refresh the demo catalogue (safe to re-run)
npm run seed:demo:remove    # delete all demo rows again
```

Inside Docker: `docker compose exec backend npm run seed:demo`.
Setting `SEED_DEMO_DATA=true` on the backend seeds automatically on start-up
while the items table is empty. Real products are never modified by either
command. Edit the catalogue in `backend/src/seed/demoCatalog.js`.

---

## ✅ Tests

```bash
cd backend && npm test      # needs a MySQL database (DB_HOST, DB_PORT, ...)
cd frontend && npm run build
```

> The backend tests write to whatever database the environment points at —
> run them against a local or CI database, never production.

---

## 🛠 Useful Commands

```bash
# Start everything (build images first time)
docker compose up --build

# Start in background
docker compose up -d --build

# View logs for a specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Restart a single service (e.g. after dependency change)
docker compose restart backend

# Stop everything
docker compose down

# Stop and delete database data (fresh start)
docker compose down -v
```

---

## 🔌 API Endpoints

| Method | Endpoint          | Description      |
| ------ | ----------------- | ---------------- |
| GET    | /API/health       | Health check     |
| GET    | /API/items        | List all items   |
| GET    | /API/items/:ID    | Get single item  |
| POST   | /API/items        | Create item      |
| PUT    | /API/items/:ID    | Update item      |
| DELETE | /API/items/:ID    | Delete item      |

---

## 🗄 Database Credentials

| Setting  | Value                           |
| -------- | ------------------------------- |
| Host     | localhost (or `db` inside Docker) |
| Port     | 3306                            |
| Database | finaltouchstudio                |
| User     | appuser                         |
| Password | apppassword                     |
| Root PW  | rootpassword                    |

---

## ⚡ Making Live Changes

- **Frontend**: Edit any file in `frontend/src/` → browser updates instantly (no refresh
  needed)
- **Backend**: Edit any file in `backend/src/` → nodemon restarts the server in ~1
  second
- **Database schema**: Edit `db/init.sql` → only takes effect on a fresh volume
  (`docker compose down -v && docker compose up --build`)
