import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app_state import APP_DATA_DIR, load_app_environment
from auth import get_password_hash
from database import Base, SessionLocal, engine
from models import User
from routers import admin_router, auth_router, workflows_router


load_app_environment()


def _seed_default_admin():
    db = SessionLocal()
    try:
        if not db.query(User).first():
            admin = User(
                username="admin",
                email="admin@example.com",
                hashed_password=get_password_hash("admin123"),
                is_admin=True,
            )
            db.add(admin)
            db.commit()
            print("\n" + "=" * 60)
            print("Default admin account created:")
            print("  Username: admin")
            print("  Password: admin123")
            print("IMPORTANT: Change this password immediately!")
            print("=" * 60 + "\n")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(APP_DATA_DIR, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    _seed_default_admin()
    yield


app = FastAPI(title="AI Workflows App", version="1.0.0", lifespan=lifespan)

# Only include non-empty origins in the CORS list
_cors_origins = ["http://localhost:5173", "http://localhost:3000"]
_extra_origin = os.getenv("FRONTEND_ORIGIN", "").strip()
if _extra_origin:
    _cors_origins.append(_extra_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(workflows_router.router)
app.include_router(admin_router.router)


# Serve React frontend build in production
_frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(_frontend_dist):
    _assets_dir = os.path.join(_frontend_dist, "assets")
    if os.path.exists(_assets_dir):
        app.mount("/assets", StaticFiles(directory=_assets_dir), name="static-assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str):
        return FileResponse(os.path.join(_frontend_dist, "index.html"))

