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


class WorkflowPermission(Base):
    __tablename__ = "workflow_permissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    workflow_id = Column(String, nullable=False)

    user = relationship("User", back_populates="permissions")

    __table_args__ = (UniqueConstraint("user_id", "workflow_id", name="uq_user_workflow"),)
