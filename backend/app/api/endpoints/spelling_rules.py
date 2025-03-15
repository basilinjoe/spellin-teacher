from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services import spelling_rule_service
from app.schemas.schemas import (
    SpellingRuleCreate,
    SpellingRuleUpdate,
    SpellingRuleResponse
)

router = APIRouter(prefix="/spelling-rules", tags=["spelling-rules"])

@router.post("/", response_model=SpellingRuleResponse)
async def create_rule(
    rule: SpellingRuleCreate,
    db: AsyncSession = Depends(get_db)
):
    return await spelling_rule_service.create_spelling_rule(db, rule)

@router.get("/{rule_id}", response_model=SpellingRuleResponse)
async def get_rule(
    rule_id: int,
    db: AsyncSession = Depends(get_db)
):
    rule = await spelling_rule_service.get_spelling_rule(db, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Spelling rule not found")
    return rule

@router.get("/", response_model=List[SpellingRuleResponse])
async def list_rules(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = Query(None, description="Filter rules by category"),
    db: AsyncSession = Depends(get_db)
):
    return await spelling_rule_service.get_spelling_rules(db, skip, limit, category)

@router.patch("/{rule_id}", response_model=SpellingRuleResponse)
async def update_rule(
    rule_id: int,
    rule: SpellingRuleUpdate,
    db: AsyncSession = Depends(get_db)
):
    updated_rule = await spelling_rule_service.update_spelling_rule(db, rule_id, rule)
    if not updated_rule:
        raise HTTPException(status_code=404, detail="Spelling rule not found")
    return updated_rule

@router.delete("/{rule_id}")
async def delete_rule(
    rule_id: int,
    db: AsyncSession = Depends(get_db)
):
    success = await spelling_rule_service.delete_spelling_rule(db, rule_id)
    if not success:
        raise HTTPException(status_code=404, detail="Spelling rule not found")
    return {"message": "Rule deleted successfully"}

@router.post("/{rule_id}/words/{word_id}")
async def add_word_to_rule(
    rule_id: int,
    word_id: int,
    db: AsyncSession = Depends(get_db)
):
    rule = await spelling_rule_service.add_word_to_rule(db, rule_id, word_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule or word not found")
    return {"message": "Word added to rule successfully"}

@router.delete("/{rule_id}/words/{word_id}")
async def remove_word_from_rule(
    rule_id: int,
    word_id: int,
    db: AsyncSession = Depends(get_db)
):
    rule = await spelling_rule_service.remove_word_from_rule(db, rule_id, word_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule or word not found")
    return {"message": "Word removed from rule successfully"}