"""add initial spelling rules

Revision ID: 20240322_add_initial_rules
Create Date: 2024-03-22 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import json

# revision identifiers, used by Alembic.
revision: str = '20240322_add_initial_rules'
down_revision: Union[str, None] = '20240321_add_spelling_rules'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Initial common spelling rules
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
    
    conn = op.get_bind()
    
    # Insert the rules
    for rule in common_rules:
        conn.execute(
            sa.text(
                """
                INSERT INTO spelling_rules 
                (title, description, examples, category, created_at)
                VALUES (:title, :description, :examples, :category, CURRENT_TIMESTAMP)
                """
            ),
            {
                "title": rule["title"],
                "description": rule["description"],
                "examples": json.dumps(rule["examples"]),
                "category": rule["category"]
            }
        )

def downgrade() -> None:
    # Remove the initial rules
    conn = op.get_bind()
    conn.execute(sa.text("DELETE FROM spelling_rules"))