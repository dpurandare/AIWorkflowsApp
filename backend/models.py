from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    permissions = relationship(
        "WorkflowPermission", back_populates="user", cascade="all, delete-orphan"
    )
    group_memberships = relationship(
        "UserGroup", back_populates="user", cascade="all, delete-orphan"
    )


class WorkflowPermission(Base):
    __tablename__ = "workflow_permissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    workflow_id = Column(String, nullable=False)

    user = relationship("User", back_populates="permissions")

    __table_args__ = (UniqueConstraint("user_id", "workflow_id", name="uq_user_workflow"),)


class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)

    members = relationship("UserGroup", back_populates="group", cascade="all, delete-orphan")
    permissions = relationship(
        "GroupPermission", back_populates="group", cascade="all, delete-orphan"
    )


class UserGroup(Base):
    __tablename__ = "user_groups"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)

    user = relationship("User", back_populates="group_memberships")
    group = relationship("Group", back_populates="members")

    __table_args__ = (UniqueConstraint("user_id", "group_id", name="uq_user_group"),)


class GroupPermission(Base):
    __tablename__ = "group_permissions"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    workflow_id = Column(String, nullable=False)

    group = relationship("Group", back_populates="permissions")

    __table_args__ = (UniqueConstraint("group_id", "workflow_id", name="uq_group_workflow"),)
