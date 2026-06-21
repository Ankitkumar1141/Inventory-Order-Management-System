from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@db:5432/inventory_db"
    app_name: str = "Inventory & Order Management System"

    class Config:
        env_file = ".env"


settings = Settings()
