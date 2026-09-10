import jwt
from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.auth_utils import JWT_SECRET, JWT_ALGORITHM
from app.database import get_db
from app.models.user import User


def get_current_user(
    authorization: str = Header(...),
    db: Session = Depends(get_db),
) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.removeprefix("Bearer ")

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User no longer exists")

    return user


def get_current_teacher(
    user: User = Depends(get_current_user),
) -> User:
    if user.role not in ("teacher", "admin"):
        raise HTTPException(status_code=403, detail="Forbidden: Teacher access required")
    return user


def get_current_student(
    user: User = Depends(get_current_user),
) -> User:
    if user.role != "student":
        raise HTTPException(status_code=403, detail="Forbidden: Student access required")
    return user
