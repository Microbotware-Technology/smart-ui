import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, RedirectResponse, Response
from backend.database import engine, Base, ensure_sqlite_schema
from backend.seed import seed_database
from backend.routers import causes, events, donations, volunteers, contact, shop, admin, admin_auth, analytics


# Ensure database tables exist and seed demo data
Base.metadata.create_all(bind=engine)
ensure_sqlite_schema()
seed_database()

app = FastAPI(
    title="Smart Help Foundation Live - Charity & NGO Platform API",
    description="Full-featured REST API backend powering Smart Help Foundation Live UI (Causes, Donations, Events, Volunteers, Shop, Admin Dashboard)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_development_cache_headers(request: Request, call_next):
    response = await call_next(request)
    if request.url.path.endswith(".html") or request.url.path.startswith("/assets/js/"):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response

# Register API Routers under /api and /api/v1
for r in [causes.router, events.router, donations.router, volunteers.router, contact.router, shop.router, admin.router, admin_auth.router, analytics.router]:
    app.include_router(r, prefix="/api")
    app.include_router(r, prefix="/api/v1")


# Mount static frontend directory (smart-live)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AIDUS_UI_DIR = os.path.join(BASE_DIR, "smart-live")

if os.path.exists(AIDUS_UI_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(AIDUS_UI_DIR, "assets")), name="assets")

# Admin panel
ADMIN_DIR = os.path.join(AIDUS_UI_DIR, "admin")

@app.get("/admin", include_in_schema=False)
async def admin_root():
    return FileResponse(os.path.join(ADMIN_DIR, "index.html"))

@app.get("/admin/login", include_in_schema=False)
async def admin_login():
    return FileResponse(os.path.join(ADMIN_DIR, "index.html"))

if os.path.exists(ADMIN_DIR):
    app.mount("/admin", StaticFiles(directory=ADMIN_DIR, html=True), name="admin")
    
# Uploads (donation photos) — served at /uploads/<file>
UPLOAD_DIR = os.path.join(BASE_DIR, "backend", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/", response_class=HTMLResponse)
async def serve_index():
    index_file = os.path.join(AIDUS_UI_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return HTMLResponse("<h1>Smart Help Foundation Live API Backend is Running</h1><p>Visit <a href='/docs'>/docs</a> for API specifications.</p>")

@app.get("/null")
async def ignore_null_asset_request():
    return Response(status_code=204)

@app.get("/{page_name}.html", response_class=HTMLResponse)
async def serve_html_pages(page_name: str):
    if page_name in {"index-2", "index-3", "index-4", "index-5", "index-6"}:
        return RedirectResponse(url="/index.html", status_code=302)

    target_file = os.path.join(AIDUS_UI_DIR, f"{page_name}.html")
    if os.path.exists(target_file):
        return FileResponse(target_file)
    return FileResponse(os.path.join(AIDUS_UI_DIR, "404.html"))

@app.get("/{page_name}", response_class=HTMLResponse)
async def serve_html_page_aliases(page_name: str):
    reserved_paths = {"api", "assets", "docs", "redoc", "openapi.json"}
    if page_name in reserved_paths:
        return RedirectResponse(url="/", status_code=302)

    if page_name in {"index-2", "index-3", "index-4", "index-5", "index-6"}:
        return RedirectResponse(url="/", status_code=302)

    target_file = os.path.join(AIDUS_UI_DIR, f"{page_name}.html")
    if os.path.exists(target_file):
        return FileResponse(target_file)
    return FileResponse(os.path.join(AIDUS_UI_DIR, "404.html"))
