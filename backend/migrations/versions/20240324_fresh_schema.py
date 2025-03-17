"""fresh schema with all columns

Revision ID: 20240324_fresh_schema
Create Date: 2024-03-24 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20240324_fresh_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # Create word_lists table
    op.create_table(
        'word_lists',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create words table with all fields including phonetic
    op.create_table(
        'words',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('word', sa.String(), nullable=False),
        sa.Column('meaning', sa.Text(), nullable=True),
        sa.Column('example', sa.Text(), nullable=True),
        sa.Column('phonetic', sa.String(), nullable=True),
        sa.Column('word_list_id', sa.Integer(), nullable=False),
        sa.Column('familiar', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('practice_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('correct_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('incorrect_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('last_practiced', sa.DateTime(timezone=True), nullable=True),
        sa.Column('srs_level', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('next_review', sa.DateTime(timezone=True), nullable=True),
        sa.Column('review_interval', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['word_list_id'], ['word_lists.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create mistake_patterns table
    op.create_table(
        'mistake_patterns',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('word_id', sa.Integer(), nullable=False),
        sa.Column('pattern_type', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('frequency', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('examples', sa.JSON(), nullable=False, server_default='[]'),
        sa.ForeignKeyConstraint(['word_id'], ['words.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

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


def downgrade() -> None:
    op.drop_table('rule_words')
    op.drop_table('spelling_rules')
    op.drop_table('mistake_patterns')
    op.drop_table('words')
    op.drop_table('word_lists')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')