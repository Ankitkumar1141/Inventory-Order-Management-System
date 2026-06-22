from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@db:5432/inventory_db"
    app_name: str = "Inventory & Order Management System"
    secret_key: str = "change-this-secret-key-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    class Config:
        env_file = ".env"


settings = Settings()
