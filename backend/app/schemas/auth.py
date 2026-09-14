from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    campus_id: int = 1


class UserProfile(BaseModel):
    id: int
    email: EmailStr
    role: str
    campus_id: int
    program: str | None = None

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile
