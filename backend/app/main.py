from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from app.core.config import settings
from app.core.database import engine, Base
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

# API Routers
app.include_router(models_router, prefix=settings.API_V1_STR)
app.include_router(quotations_router, prefix=settings.API_V1_STR)
app.include_router(enquiries_router, prefix=settings.API_V1_STR)
app.include_router(ofm_router, prefix=settings.API_V1_STR)
app.include_router(activities_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

# Unified Container: Serve compiled React static assets if present
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

