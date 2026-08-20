import os
from pathlib import Path
import cloudinary
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import create_db_and_tables
from app.routers import (
    auth,
    categories,
    customers,
    dashboard,
    invoices,
    products,
    reports,
)
from app.routers import settings as settings_router

BASE_DIR = Path(__file__).resolve().parent

STATIC_DIR = BASE_DIR / "static"
STATIC_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Shri Shyam Sundar - Vastra Bhandar API")

raw_origins = getattr(settings, "FRONTEND_ORIGIN", "*")
if isinstance(raw_origins, str):
    allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
else:
    allowed_origins = raw_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(customers.router)
app.include_router(products.router)
app.include_router(invoices.router)
app.include_router(dashboard.router)
app.include_router(reports.router)
app.include_router(settings_router.router)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    # Configure Cloudinary globally when app starts
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
        secure=True,
    )


@app.get("/")
def health_check():
    return {"status": "ok"}

@app.head("/")
def health_check_head():
    return {"status": "ok"}