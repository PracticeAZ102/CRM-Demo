from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
import os

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.v1.models import router as models_router
from app.api.v1.quotations import router as quotations_router
from app.api.v1.enquiries import router as enquiries_router
from app.api.v1.ofm import router as ofm_router
from app.api.v1.activities import router as activities_router

# Import all models so Base has them registered before create_all
import app.models.equipment_model
import app.models.quotation
import app.models.ofm
import app.models.activity
from app.models.equipment_model import EquipmentModel

# Auto-create database tables on start
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auto-seed database if fresh container
@app.on_event("startup")
def startup_auto_seed():
    try:
        db = SessionLocal()
        model_count = db.query(EquipmentModel).count()
        db.close()
        if model_count == 0:
            print("Fresh database detected. Auto-seeding initial models and activities...")
            from app.db.seed import seed_all
            seed_all()
    except Exception as e:
        print(f"Startup notice: {e}")

# API Routers
app.include_router(models_router, prefix=settings.API_V1_STR)
app.include_router(quotations_router, prefix=settings.API_V1_STR)
app.include_router(enquiries_router, prefix=settings.API_V1_STR)
app.include_router(ofm_router, prefix=settings.API_V1_STR)
app.include_router(activities_router, prefix=settings.API_V1_STR)

@app.api_route("/health", methods=["GET", "HEAD"], tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

# Unified Container: Serve compiled React static assets
# Check multiple candidate directories for local dev and Docker container layouts
candidate_dist_dirs = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")),  # Local dev (backend/app -> root -> frontend/dist)
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")),        # Docker (/app/app -> /app/frontend/dist)
    os.path.abspath(os.path.join(os.getcwd(), "frontend", "dist")),                            # Current working dir
    "/app/frontend/dist",                                                                      # Explicit Docker path
]

frontend_dist = next((p for p in candidate_dist_dirs if os.path.exists(p) and os.path.isdir(p)), None)

if frontend_dist:
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"], include_in_schema=False)
    async def serve_spa(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return HTMLResponse("<h1>ATCORP CRM</h1><p>Initializing...</p>")
else:
    @app.api_route("/", methods=["GET", "HEAD"], include_in_schema=False)
    async def root_fallback():
        return HTMLResponse("<h1>ATCORP – India Platform Online</h1><p>Frontend bundle building. Visit <a href='/api/v1/docs'>API Docs</a></p>")


