from sqlmodel import SQLModel, Session, create_engine
from app.config import settings

connect_args = {}
if settings.uses_ssl:
    connect_args = {"ssl": {"ca": settings.DB_SSL_CA}}

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