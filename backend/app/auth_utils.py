import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

import bcrypt
import jwt

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "placify_ai_secure_jwt_secret_key_2026_dev_environment")
JWT_ALGORITHM = "HS256"
# 3 days persistent session
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 3


def verify_password(plain_password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def hash_password(password: str) -> str:
    return get_password_hash(password)


def create_access_token(user_id: int, role: str, campus_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "role": role,
        "campus_id": campus_id,
        "exp": expire,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

