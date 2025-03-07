"""add srs fields

Revision ID: srs_fields_001
Revises: 
Create Date: 2024-03-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic
revision = 'srs_fields_001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add SRS fields
    op.add_column('words', sa.Column('srs_level', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('words', sa.Column('next_review', sa.DateTime(timezone=True), nullable=True))
    op.add_column('words', sa.Column('review_interval', sa.Integer(), nullable=False, server_default='0'))
    
    # Add index for querying due reviews
    op.create_index(op.f('ix_words_next_review'), 'words', ['next_review'], unique=False)


def downgrade() -> None:
    # Drop SRS fields
    op.drop_index(op.f('ix_words_next_review'), table_name='words')
    op.drop_column('words', 'review_interval')
    op.drop_column('words', 'next_review')
    op.drop_column('words', 'srs_level')