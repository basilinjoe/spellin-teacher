from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.models import SpellingRule, Word
from app.schemas.schemas import SpellingRuleCreate, SpellingRuleUpdate

async def create_spelling_rule(db: AsyncSession, rule: SpellingRuleCreate) -> SpellingRule:
    db_rule = SpellingRule(**rule.model_dump())
    db.add(db_rule)
    await db.commit()
    await db.refresh(db_rule)
    return db_rule

async def get_spelling_rule(db: AsyncSession, rule_id: int) -> Optional[SpellingRule]:
    query = select(SpellingRule).options(selectinload(SpellingRule.related_words)).where(SpellingRule.id == rule_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_spelling_rules(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None
) -> List[SpellingRule]:
    query = select(SpellingRule).options(selectinload(SpellingRule.related_words))
    if category:
        query = query.where(SpellingRule.category == category)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())

async def update_spelling_rule(
    db: AsyncSession,
    rule_id: int,
    rule: SpellingRuleUpdate
) -> Optional[SpellingRule]:
    db_rule = await get_spelling_rule(db, rule_id)
    if not db_rule:
        return None
    
    update_data = rule.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_rule, key, value)
    
    await db.commit()
    await db.refresh(db_rule)
    return db_rule

async def delete_spelling_rule(db: AsyncSession, rule_id: int) -> bool:
    db_rule = await get_spelling_rule(db, rule_id)
    if not db_rule:
        return False
    
    await db.delete(db_rule)
    await db.commit()
    return True

async def add_word_to_rule(
    db: AsyncSession,
    rule_id: int,
    word_id: int
) -> Optional[SpellingRule]:
    db_rule = await get_spelling_rule(db, rule_id)
    if not db_rule:
        return None
    
    word = await db.get(Word, word_id)
    if not word:
        return None
    
    db_rule.related_words.append(word)
    await db.commit()
    await db.refresh(db_rule)
    return db_rule

async def remove_word_from_rule(
    db: AsyncSession,
    rule_id: int,
    word_id: int
) -> Optional[SpellingRule]:
    db_rule = await get_spelling_rule(db, rule_id)
    if not db_rule:
        return None
    
    word = await db.get(Word, word_id)
    if not word:
        return None
    
    db_rule.related_words.remove(word)
    await db.commit()
    await db.refresh(db_rule)
    return db_rule

async def initialize_common_rules(db: AsyncSession) -> List[SpellingRule]:
    """Initialize common English spelling rules if they don't exist."""
    
    common_rules = [
        {
            "title": "I before E except after C",
            "description": "Use 'i' before 'e' except when the sound is 'ay' after 'c'. However, there are some exceptions to this rule.",
            "examples": ["receive", "deceive", "believe", "achieve"],
            "category": "vowel_patterns"
        },
        {
            "title": "Silent E Rule",
            "description": "When a word ends in silent 'e', the vowel before it is usually long (says its name).",
            "examples": ["make", "time", "hope", "cute"],
            "category": "silent_letters"
        },
        {
            "title": "Double Consonant Rule",
            "description": "In a word with 2 syllables, double the consonant when adding -ing, -ed if: 1) the last syllable is stressed AND 2) ends in consonant-vowel-consonant.",
            "examples": ["running", "stopped", "beginning", "forgotten"],
            "category": "consonants"
        },
        {
            "title": "Y to I Rule",
            "description": "Change 'y' to 'i' when adding suffixes, unless the 'y' follows a vowel or the suffix begins with 'i'.",
            "examples": ["flies", "tried", "studying", "playing"],
            "category": "suffixes"
        },
        {
            "title": "CK Rule",
            "description": "Use 'ck' for the /k/ sound after a short vowel in a one-syllable word.",
            "examples": ["back", "stick", "duck", "black"],
            "category": "consonants"
        },
        {
            "title": "Drop Silent E Rule",
            "description": "Drop the silent 'e' at the end of a word when adding a suffix that begins with a vowel.",
            "examples": ["hoping", "taking", "liked", "user"],
            "category": "suffixes"
        },
        {
            "title": "Plural Formation Rules",
            "description": "For most words, add 's'. For words ending in s, x, z, ch, sh add 'es'. For words ending in 'y' after a consonant, change 'y' to 'i' and add 'es'.",
            "examples": ["cats", "boxes", "wishes", "babies"],
            "category": "plurals"
        },
        {
            "title": "Q is Always Followed by U",
            "description": "In English words, the letter 'q' is almost always followed by the letter 'u'.",
            "examples": ["queen", "quiet", "quick", "unique"],
            "category": "consonants"
        }
    ]
    
    existing_rules = await db.execute(select(SpellingRule))
    if not list(existing_rules.scalars().all()):
        for rule_data in common_rules:
            rule = SpellingRule(**rule_data)
            db.add(rule)
        
        await db.commit()
        
        # Refresh to get the created rules
        result = await db.execute(select(SpellingRule).options(selectinload(SpellingRule.related_words)))
        return list(result.scalars().all())
    
    return []