# FinalTouch Studio — Docker Dev Stack

> **React · Node.js · MySQL** — Full live-reload Docker environment

## 🚀 Quick Start

```bash
docker compose up --build
```

That's it. All three services start together.

| Service  | URL                          | Description               |
|----------|------------------------------|---------------------------|
| Frontend | http://localhost:3000        | React app (Vite HMR)      |
| Backend  | http://localhost:5000/api    | Express REST API          |
| Database | localhost:3306               | MySQL 8                   |

---

## 🔄 Live Reload — How It Works

| Service  | Mechanism                         | What triggers a reload             |
|----------|-----------------------------------|------------------------------------|
| Frontend | **Vite HMR** (Hot Module Replace) | Any edit to `frontend/src/**`      |
| Backend  | **nodemon**                       | Any edit to `backend/src/**`       |
| Database | Persistent volume                 | Data survives container restarts   |

> **Windows/Mac users**: Vite uses `usePolling: true` so file changes inside the container are always detected regardless of the OS filesystem event limitations.

---

## 📁 Project Structure

```
finaltouchstudio/
├── docker-compose.yml          # Orchestrates all services
├── db/
│   └── init.sql                # Runs once on first DB start
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js            # Express server + routes
│       └── db.js               # MySQL2 connection pool
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js          # HMR + proxy config
    └── src/
        ├── main.jsx
        ├── App.jsx             # Full CRUD React app
        ├── App.module.css
        └── index.css
```

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

| Method | Endpoint         | Description      |
|--------|------------------|------------------|
| GET    | /api/health      | Health check     |
| GET    | /api/items       | List all items   |
| GET    | /api/items/:id   | Get single item  |
| POST   | /api/items       | Create item      |
| PUT    | /api/items/:id   | Update item      |
| DELETE | /api/items/:id   | Delete item      |

---

## 🗄 Database Credentials

| Setting  | Value              |
|----------|--------------------|
| Host     | localhost (or `db` inside Docker) |
| Port     | 3306               |
| Database | finaltouchstudio   |
| User     | appuser            |
| Password | apppassword        |
| Root PW  | rootpassword       |

---

## ⚡ Making Live Changes

- **Frontend**: Edit any file in `frontend/src/` → browser updates instantly (no refresh needed)
- **Backend**: Edit any file in `backend/src/` → nodemon restarts the server in ~1 second
- **Database schema**: Edit `db/init.sql` → only takes effect on a fresh volume (`docker compose down -v && docker compose up --build`)
