import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

load_dotenv()

from auth import get_password_hash
from database import Base, SessionLocal, engine
from models import User
from routers import admin_router, auth_router, workflows_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Workflows App", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        os.getenv("FRONTEND_ORIGIN", ""),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(workflows_router.router)
app.include_router(admin_router.router)


@app.on_event("startup")
def seed_default_admin():
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


# Serve React frontend build in production
_frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(_frontend_dist):
    _assets_dir = os.path.join(_frontend_dist, "assets")
    if os.path.exists(_assets_dir):
        app.mount("/assets", StaticFiles(directory=_assets_dir), name="static-assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str):
        return FileResponse(os.path.join(_frontend_dist, "index.html"))
