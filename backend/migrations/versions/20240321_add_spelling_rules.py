"""add spelling rules tables

Revision ID: 20240321_add_spelling_rules
Create Date: 2024-03-21 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision: str = '20240321_add_spelling_rules'
down_revision: Union[str, None] = '20240320_update_mistake_patterns'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Create spelling_rules table
    op.create_table(
        'spelling_rules',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('examples', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Create rule_words association table
    op.create_table(
        'rule_words',
        sa.Column('rule_id', sa.Integer(), nullable=False),
        sa.Column('word_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['rule_id'], ['spelling_rules.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['word_id'], ['words.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('rule_id', 'word_id')
    )

    # Create indexes
    op.create_index('ix_spelling_rules_category', 'spelling_rules', ['category'])

def downgrade() -> None:
    op.drop_table('rule_words')
    op.drop_table('spelling_rules')