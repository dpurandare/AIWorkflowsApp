from typing import Any, Dict

import httpx
from fastapi import APIRouter, Depends, HTTPException, status

from dependencies import get_current_user
from models import User
from workflows import WORKFLOWS

router = APIRouter(prefix="/api/workflows", tags=["workflows"])


def _can_access(user: User, workflow_id: str) -> bool:
    if user.is_admin:
        return True
    if any(p.workflow_id == workflow_id for p in user.permissions):
        return True
    for membership in user.group_memberships:
        if any(gp.workflow_id == workflow_id for gp in membership.group.permissions):
            return True
    return False


@router.get("")
def list_workflows(current_user: User = Depends(get_current_user)):
    return [
        {
            "id": wf_id,
            "name": wf["name"],
            "description": wf["description"],
            "category": wf["category"],
            "has_download": wf["has_download"],
        }
        for wf_id, wf in WORKFLOWS.items()
        if _can_access(current_user, wf_id)
    ]


@router.post("/{workflow_id}/execute")
async def execute_workflow(
    workflow_id: str,
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_user),
):
    if workflow_id not in WORKFLOWS:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")

    if not _can_access(current_user, workflow_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this workflow",
        )

    wf = WORKFLOWS[workflow_id]
    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(wf["url"], json=payload)
            response.raise_for_status()
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="The workflow timed out. It may still be running on the server.",
        )
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Workflow returned an error: {e.response.text[:500]}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to reach workflow: {str(e)}",
        )

    try:
        return response.json()
    except Exception:
        return {"result": response.text}
