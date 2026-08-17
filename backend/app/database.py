import ssl
from pathlib import Path
from sqlmodel import Session, SQLModel, create_engine
from app.config import settings

connect_args = {}

if settings.uses_ssl:
    ca_path = Path(settings.DB_SSL_CA) if settings.DB_SSL_CA else None

    if ca_path and ca_path.is_file():
        connect_args = {"ssl": {"ca": str(ca_path)}}
    else:
        ssl_ctx = ssl.create_default_context()
        connect_args = {"ssl": ssl_ctx}

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    connect_args=connect_args,
)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session