from dotenv import load_dotenv
import os

load_dotenv()


class Settings:
    # Database — build URL from individual env vars
    HOST: str = os.getenv("HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "4000")
    DB_USER: str = os.getenv("DB_USER", "root")
    PASSWORD: str = os.getenv("PASSWORD", "password")
    DATABASE: str = os.getenv("DATABASE", "scorewin")

    # TiDB requires SSL — construct the connection URL
    DATABASE_URL: str = (
        f"mysql+pymysql://{os.getenv('DB_USER', 'root')}:{os.getenv('PASSWORD', 'password')}"
        f"@{os.getenv('HOST', 'localhost')}:{os.getenv('DB_PORT', '4000')}"
        f"/{os.getenv('DATABASE', 'scorewin')}"
    )

    # JWT Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "scorewin-fallback-secret-key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # Subscription pricing
    MONTHLY_PLAN_PRICE: float = float(os.getenv("MONTHLY_PLAN_PRICE", "9.99"))
    QUARTERLY_PLAN_PRICE: float = float(os.getenv("QUARTERLY_PLAN_PRICE", "26.99"))
    BIANNUAL_PLAN_PRICE: float = float(os.getenv("BIANNUAL_PLAN_PRICE", "49.99"))
    YEARLY_PLAN_PRICE: float = float(os.getenv("YEARLY_PLAN_PRICE", "99.99"))

    # Charity
    MIN_CHARITY_PERCENTAGE: int = int(os.getenv("MIN_CHARITY_PERCENTAGE", "10"))

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")


settings = Settings()
