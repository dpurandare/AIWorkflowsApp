from models import User
from schemas import UserResponse


def user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        is_admin=user.is_admin,
        is_active=user.is_active,
        permissions=[p.workflow_id for p in user.permissions],
    )
