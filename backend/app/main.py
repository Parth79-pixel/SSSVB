from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import create_db_and_tables
from app.routers import auth, categories, customers, products, invoices, dashboard, reports
from app.routers import settings as settings_router

app = FastAPI(title="Shri Shyam Sundar - Vastra Bhandar API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount("/static", StaticFiles(directory="static"), name="static")

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


@app.get("/")
def health_check():
    return {"status": "ok"}