from pydantic import BaseModel
from typing import Optional, List


class Token(BaseModel):
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    username: str
    password: str


class UserBase(BaseModel):
    username: str
    email: Optional[str] = None


class UserCreate(UserBase):
    password: str
    is_admin: bool = False


class UserUpdate(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    is_admin: Optional[bool] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    is_admin: bool
    is_active: bool
    permissions: List[str] = []

    model_config = {"from_attributes": True}


class PermissionsUpdate(BaseModel):
    workflow_ids: List[str]


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
