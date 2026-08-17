from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "shop"
    DB_SSL_CA: str = ""

    
    JWT_SECRET_KEY: str = "change_this_to_a_long_random_string"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    
    FRONTEND_ORIGIN: str = "http://localhost:4200"

    
    UPLOAD_DIR: str = "static/products"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    @property
    def uses_ssl(self) -> bool:
        return bool(self.DB_SSL_CA)


settings = Settings()