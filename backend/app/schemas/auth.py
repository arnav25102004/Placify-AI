from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    campus_id: int = 1


class UpdateProfileRequest(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    department: str | None = None
    designation: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None


class UserProfile(BaseModel):
    id: int
    email: EmailStr
    role: str
    campus_id: int
    program: str | None = None
    full_name: str | None = None
    phone: str | None = None
    department: str | None = None
    designation: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile
