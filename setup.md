# Smart Help Foundation Live - Local Setup

This repository is a single FastAPI application that serves both the public
`smart-live` static website and the `/admin` dashboard. Its API is mounted at
`/api` (and, for compatibility, `/api/v1`), so run the frontend through the
FastAPI server rather than opening the HTML files directly.

## Prerequisites

- Python 3.10 or newer (the checked-in virtual environment currently uses
  Python 3.14.2).
- A Razorpay test or live account only if the donation payment flow will be
  used.
- MySQL only when choosing the optional MySQL database configuration; SQLite
  is the default.

## Install dependencies

From the repository root, create and activate a virtual environment.

### Windows PowerShell

```powershell
py -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r backend\requirements.txt
python -m pip install razorpay
```

### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
python -m pip install razorpay
```

`razorpay` is imported by `backend/routers/donations.py`, but is not presently
listed in `backend/requirements.txt`; install it explicitly until the
requirements file is updated.

## Configure environment variables

Create or update `backend/.env`. That file is ignored by Git and is loaded by
the backend. Do not commit credentials or production secrets.

```dotenv
# development | production
ENVIRONMENT=development

# sqlite (default) or mysql
DB_TYPE=sqlite

# Required only when DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=shf_db
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password

# Replace with a long, unique value outside local development
JWT_SECRET=replace-with-a-long-random-secret

# Required for Razorpay donation payment endpoints
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

For SQLite, the database is stored at `backend/aidus.db`; the `DB_*` values
other than `DB_TYPE` are ignored. On application startup, the backend creates
missing tables, applies its lightweight schema updates, and seeds demo causes,
events, products, donations, volunteers, and contacts only when the database
has no causes.

## Run locally

Run this from the repository root with the virtual environment activated:

```powershell
python -m uvicorn main:app --reload
```

Open these URLs after startup:

- Public site: `http://127.0.0.1:8000/`
- Admin dashboard: `http://127.0.0.1:8000/admin/`
- OpenAPI/Swagger docs: `http://127.0.0.1:8000/docs`
- Alternative API prefix: `http://127.0.0.1:8000/api/v1/...`

The public site scripts use same-origin `/api` calls, so a separate frontend
development server is not required for normal local use.

## Create an initial admin user

After the server has initialized the database, create an admin from the
repository root. Choose a strong password; do not place it in shell history
for shared machines.

```powershell
python -m backend.add_admin <username> <password> super_admin
```

Roles are `super_admin`, `editor`, and `viewer`. The command is intended for
development and only runs when `ENVIRONMENT=development` (the default).

## Useful checks

```powershell
python -m pip check
python -c "import razorpay; print('Razorpay import OK')"
```

## Project layout

| Path | Purpose |
| --- | --- |
| `main.py` | FastAPI entry point, API router registration, static-file mounts, and HTML routes. |
| `backend/` | SQLAlchemy models, database/configuration code, API routers, auth, seeding, uploads, and `.env`. |
| `backend/routers/` | Causes, events, donations, volunteers, shop, contact, chat, analytics, and admin API endpoints. |
| `smart-live/` | Static public site, reusable assets, and the static `/admin` dashboard. |
| `backend/aidus.db` | Local SQLite database created/used in the default configuration. |
| `backend/uploads/` | User-uploaded donation photos, exposed at `/uploads/`. |

## Operational notes

- `main.py` enables permissive CORS (`*`) for development. Review and restrict
  it before production deployment.
- The app exposes API documentation at `/docs`; protect or disable it if it is
  inappropriate for the deployment environment.
- Keep `backend/.env`, SQLite databases, and uploaded files out of source
  control. The current `.gitignore` already excludes them.
