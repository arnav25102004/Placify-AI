from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth_utils import create_access_token, verify_password, get_password_hash
from app.database import get_db
from app.logging_config import get_logger
from app.models.user import User
from app.dependencies.auth import get_current_user
from app.schemas.auth import LoginRequest, RegisterRequest, LoginResponse, UserProfile, UpdateProfileRequest

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


def _build_user_profile(user: User, program: str | None = None) -> UserProfile:
    resolved_role, prog = resolve_email_profile(user.email, user.role)
    return UserProfile(
        id=user.id,
        email=user.email,
        role=resolved_role,
        campus_id=user.campus_id,
        program=program or prog,
        full_name=user.full_name,
        phone=user.phone,
        department=user.department,
        designation=user.designation,
        bio=user.bio,
        avatar_url=user.avatar_url,
        linkedin_url=user.linkedin_url,
        github_url=user.github_url,
    )


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
        user=_build_user_profile(new_user, program),
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
        user=_build_user_profile(user, program),
    )


@router.get("/me", response_model=UserProfile)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the authenticated user profile information based on the Bearer JWT token.
    """
    return _build_user_profile(current_user)


@router.put("/profile", response_model=UserProfile)
@router.patch("/profile", response_model=UserProfile)
def update_profile(
    updates: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Updates the authenticated user's profile information.
    """
    if updates.full_name is not None:
        current_user.full_name = updates.full_name.strip()
    if updates.phone is not None:
        current_user.phone = updates.phone.strip()
    if updates.department is not None:
        current_user.department = updates.department.strip()
    if updates.designation is not None:
        current_user.designation = updates.designation.strip()
    if updates.bio is not None:
        current_user.bio = updates.bio.strip()
    if updates.avatar_url is not None:
        current_user.avatar_url = updates.avatar_url.strip()
    if updates.linkedin_url is not None:
        current_user.linkedin_url = updates.linkedin_url.strip()
    if updates.github_url is not None:
        current_user.github_url = updates.github_url.strip()

    db.commit()
    db.refresh(current_user)
    logger.info(f"Updated profile for user_id={current_user.id} ({current_user.email})")

    return _build_user_profile(current_user)

