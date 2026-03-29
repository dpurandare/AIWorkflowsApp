from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_password_hash
from database import get_db
from dependencies import get_admin_user
from models import Group, GroupPermission, User, UserGroup, WorkflowPermission
from schemas import (
    GroupCreate,
    GroupMembersUpdate,
    GroupResponse,
    GroupUpdate,
    PermissionsUpdate,
    UserCreate,
    UserResponse,
    UserUpdate,
)
from utils import user_to_response
from workflows import WORKFLOWS

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return [user_to_response(u) for u in db.query(User).order_by(User.id).all()]


@router.post("/users", response_model=UserResponse, status_code=201)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    if user_data.email and db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        is_admin=user_data.is_admin,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user_to_response(user)


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_data.email is not None:
        user.email = user_data.email
    if user_data.password is not None:
        user.hashed_password = get_password_hash(user_data.password)
    if user_data.is_admin is not None:
        user.is_admin = user_data.is_admin
    if user_data.is_active is not None:
        user.is_active = user_data.is_active

    db.commit()
    db.refresh(user)
    return user_to_response(user)


@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user),
):
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()


@router.get("/users/{user_id}/permissions")
def get_permissions(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"workflow_ids": [p.workflow_id for p in user.permissions]}


@router.put("/users/{user_id}/permissions")
def update_permissions(
    user_id: int,
    data: PermissionsUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    invalid = [wid for wid in data.workflow_ids if wid not in WORKFLOWS]
    if invalid:
        raise HTTPException(status_code=400, detail=f"Invalid workflow IDs: {invalid}")

    db.query(WorkflowPermission).filter(WorkflowPermission.user_id == user_id).delete()
    for wf_id in data.workflow_ids:
        db.add(WorkflowPermission(user_id=user_id, workflow_id=wf_id))
    db.commit()
    return {"workflow_ids": data.workflow_ids}


@router.get("/workflows")
def list_all_workflows(_: User = Depends(get_admin_user)):
    return [
        {"id": wf_id, "name": wf["name"], "category": wf["category"]}
        for wf_id, wf in WORKFLOWS.items()
    ]


# ── Groups ───────────────────────────────────────────────────────────────────

def _group_to_response(group: Group) -> GroupResponse:
    return GroupResponse(
        id=group.id,
        name=group.name,
        description=group.description,
        workflow_ids=[gp.workflow_id for gp in group.permissions],
        member_ids=[ug.user_id for ug in group.members],
    )


@router.get("/groups", response_model=List[GroupResponse])
def list_groups(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return [_group_to_response(g) for g in db.query(Group).order_by(Group.name).all()]


@router.post("/groups", response_model=GroupResponse, status_code=201)
def create_group(
    data: GroupCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    if db.query(Group).filter(Group.name == data.name).first():
        raise HTTPException(status_code=400, detail="Group name already exists")
    group = Group(name=data.name, description=data.description)
    db.add(group)
    db.commit()
    db.refresh(group)
    return _group_to_response(group)


@router.put("/groups/{group_id}", response_model=GroupResponse)
def update_group(
    group_id: int,
    data: GroupUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if data.name is not None:
        existing = db.query(Group).filter(Group.name == data.name, Group.id != group_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Group name already exists")
        group.name = data.name
    if data.description is not None:
        group.description = data.description
    db.commit()
    db.refresh(group)
    return _group_to_response(group)


@router.delete("/groups/{group_id}", status_code=204)
def delete_group(
    group_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    db.delete(group)
    db.commit()


@router.get("/groups/{group_id}/permissions")
def get_group_permissions(
    group_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return {"workflow_ids": [gp.workflow_id for gp in group.permissions]}


@router.put("/groups/{group_id}/permissions")
def update_group_permissions(
    group_id: int,
    data: PermissionsUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    invalid = [wid for wid in data.workflow_ids if wid not in WORKFLOWS]
    if invalid:
        raise HTTPException(status_code=400, detail=f"Invalid workflow IDs: {invalid}")
    db.query(GroupPermission).filter(GroupPermission.group_id == group_id).delete()
    for wf_id in data.workflow_ids:
        db.add(GroupPermission(group_id=group_id, workflow_id=wf_id))
    db.commit()
    return {"workflow_ids": data.workflow_ids}


@router.get("/groups/{group_id}/members")
def get_group_members(
    group_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return {"user_ids": [ug.user_id for ug in group.members]}


@router.put("/groups/{group_id}/members")
def update_group_members(
    group_id: int,
    data: GroupMembersUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    invalid = [uid for uid in data.user_ids if not db.query(User).filter(User.id == uid).first()]
    if invalid:
        raise HTTPException(status_code=400, detail=f"Invalid user IDs: {invalid}")
    db.query(UserGroup).filter(UserGroup.group_id == group_id).delete()
    for uid in data.user_ids:
        db.add(UserGroup(user_id=uid, group_id=group_id))
    db.commit()
    return {"user_ids": data.user_ids}
