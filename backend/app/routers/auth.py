from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth_utils import create_access_token, verify_password, get_password_hash
from app.database import get_db
from app.logging_config import get_logger
from app.models.user import User
from app.dependencies.auth import get_current_user
from app.schemas.auth import LoginRequest, RegisterRequest, LoginResponse, UserProfile

logger = get_logger("placify.auth")
router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def resolve_email_profile(email: str, current_role: str | None = None) -> tuple[str, str | None]:
    """
    Pattern resolution:
    - name@christuniversity.in -> faculty (teacher)
    - name@<prog>.christuniversity.in (e.g. name@mca.christuniversity.in) -> student with program (e.g. MCA)
    - Otherwise keep user's configured database role
    """
    domain = email.split("@")[-1].lower() if "@" in email else ""
    if domain == "christuniversity.in":
        return "teacher", None
    elif domain.endswith(".christuniversity.in"):
        subparts = domain.replace(".christuniversity.in", "").split(".")
        program = subparts[-1].upper() if subparts else None
        return "student", program
    return (current_role or "student"), None


@router.post("/register", response_model=LoginResponse, status_code=201)
def register(credentials: RegisterRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == credentials.email).first()
    if existing:
        logger.warning(f"Registration rejected: account already exists for '{credentials.email}'")
        raise HTTPException(status_code=400, detail="An account with this email address already exists.")

    if len(credentials.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    resolved_role, program = resolve_email_profile(credentials.email)

    new_user = User(
        email=credentials.email,
        password_hash=get_password_hash(credentials.password),
        role=resolved_role,
        campus_id=credentials.campus_id,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    logger.info(f"Registered new account: user_id={new_user.id}, email='{new_user.email}', role='{new_user.role}'")

    token = create_access_token(user_id=new_user.id, role=new_user.role, campus_id=new_user.campus_id)
    return LoginResponse(
        access_token=token,
        user=UserProfile(
            id=new_user.id,
            email=new_user.email,
            role=new_user.role,
            campus_id=new_user.campus_id,
            program=program,
        ),
    )


@router.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()

    if user is None or not verify_password(credentials.password, user.password_hash):
        logger.warning(f"Failed login attempt for email='{credentials.email}' (user_exists={user is not None})")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Resolve role and program by institutional email pattern
    resolved_role, program = resolve_email_profile(user.email, user.role)
    if resolved_role != user.role:
        user.role = resolved_role
        db.commit()
        db.refresh(user)

    logger.info(f"User authenticated successfully: user_id={user.id}, email='{user.email}', role='{user.role}'")

    token = create_access_token(user_id=user.id, role=user.role, campus_id=user.campus_id)
    return LoginResponse(
        access_token=token,
        user=UserProfile(
            id=user.id,
            email=user.email,
            role=user.role,
            campus_id=user.campus_id,
            program=program,
        ),
    )


@router.get("/me", response_model=UserProfile)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the authenticated user profile information based on the Bearer JWT token.
    """
    resolved_role, program = resolve_email_profile(current_user.email, current_user.role)
    return UserProfile(
        id=current_user.id,
        email=current_user.email,
        role=resolved_role,
        campus_id=current_user.campus_id,
        program=program,
    )
