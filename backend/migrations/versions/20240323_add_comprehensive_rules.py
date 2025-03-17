"""add comprehensive spelling rules

Revision ID: 20240323_add_comprehensive_rules
Create Date: 2024-03-23 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import json

# revision identifiers, used by Alembic.
revision: str = '20240323_add_comprehensive_rules'
down_revision: Union[str, None] = '20240322_add_initial_rules'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Additional spelling rules not covered in previous migration
    common_rules = [
        {
            "title": "Adverbs with -ly",
            "description": "If adjective ends in 'y': Change to 'i' + -ly. If ends in '-le': Drop 'e' + -y. If ends in '-ic': Add -ally.",
            "examples": ["happily", "gently", "basically", "dramatically"],
            "category": "suffixes"
        },
        {
            "title": "Comparatives and Superlatives",
            "description": "One-syllable words: Add -er/-est. CVC ending: Double consonant. Ends in 'e': Add -r/-st.",
            "examples": ["faster", "bigger", "nicer", "greatest"],
            "category": "suffixes"
        },
        {
            "title": "Prefixes",
            "description": "Generally retain root spelling. Exception: misspell (double 's').",
            "examples": ["unhappy", "misspell", "disappear", "prehistoric"],
            "category": "prefixes"
        },
        {
            "title": "-able vs -ible",
            "description": "Use '-able' for recognizable roots, '-ible' often for Latin roots. Many exceptions exist.",
            "examples": ["comfortable", "visible", "edible", "reliable"],
            "category": "suffixes"
        },
        {
            "title": "EI vs IE Beyond C",
            "description": "Use 'ei' for 'A' sound (vein, weigh). Notable exceptions: leisure, either.",
            "examples": ["vein", "weigh", "leisure", "either"],
            "category": "vowel_patterns"
        },
        {
            "title": "Compound Words",
            "description": "Hyphenate when preceding a noun (well-known author). Combine otherwise (everyday).",
            "examples": ["well-known", "everyday", "full-time", "nevertheless"],
            "category": "compounds"
        },
        {
            "title": "Possessive Apostrophes",
            "description": "Singular: add 's. Plural: add ' after s, add 's if plural doesn't end in s.",
            "examples": ["dog's", "James's", "dogs'", "children's"],
            "category": "apostrophes"
        },
        {
            "title": "Loanword Exceptions",
            "description": "Retain original spellings from source languages.",
            "examples": ["café", "tsunami", "façade", "violin"],
            "category": "loanwords"
        },
        {
            "title": "Gerunds and -ing",
            "description": "Drop silent 'e' before -ing. Double consonants in CVC pattern.",
            "examples": ["writing", "swimming", "hoping", "running"],
            "category": "suffixes"
        },
        {
            "title": "-tion vs -sion",
            "description": "Use '-tion' as default. Use '-sion' after 's' or 'l'.",
            "examples": ["action", "mission", "compulsion", "education"],
            "category": "suffixes"
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
    conn = op.get_bind()
    # Remove only the rules added in this migration
    for rule_title in [
        "Adverbs with -ly",
        "Comparatives and Superlatives",
        "Prefixes",
        "-able vs -ible",
        "EI vs IE Beyond C",
        "Compound Words",
        "Possessive Apostrophes",
        "Loanword Exceptions",
        "Gerunds and -ing",
        "-tion vs -sion"
    ]:
        conn.execute(
            sa.text("DELETE FROM spelling_rules WHERE title = :title"),
            {"title": rule_title}
        )