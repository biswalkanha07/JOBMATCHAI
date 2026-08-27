from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
import sys

class Settings(BaseSettings):
    PROJECT_NAME: str = "JobMatch AI API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = Field(default=...)
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    DATABASE_URL: str = Field(default=...)

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

try:
    settings = Settings()
except ValueError as e:
    print(f"\nCRITICAL CONFIGURATION ERROR: Failed to load required environment variables.")
    print(f"Please ensure you have configured your Backend/.env file properly.")
    print(f"Error details: {e}\n")
    sys.exit(1)
