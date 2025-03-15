"""Combined initial migration

Revision ID: combined_initial_001
Revises: 
Create Date: 2024-03-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic
revision = 'combined_initial_001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add SRS fields
    op.add_column('words', sa.Column('srs_level', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('words', sa.Column('next_review', sa.DateTime(timezone=True), nullable=True))
    op.add_column('words', sa.Column('review_interval', sa.Integer(), nullable=False, server_default='0'))
    
    # Add practice statistics columns
    op.add_column('words', sa.Column('practice_count', sa.Integer(), server_default='0', nullable=False))
    op.add_column('words', sa.Column('correct_count', sa.Integer(), server_default='0', nullable=False))
    op.add_column('words', sa.Column('incorrect_count', sa.Integer(), server_default='0', nullable=False))
    op.add_column('words', sa.Column('last_practiced', sa.DateTime(timezone=True), nullable=True))
    op.add_column('words', sa.Column('familiar', sa.Boolean(), server_default='false', nullable=False))
    
    # Create indexes for common queries
    op.create_index(op.f('ix_words_next_review'), 'words', ['next_review'], unique=False)
    op.create_index(op.f('ix_words_familiar'), 'words', ['familiar'], unique=False)
    op.create_index(op.f('ix_words_practice_count'), 'words', ['practice_count'], unique=False)
    op.create_index(op.f('ix_words_last_practiced'), 'words', ['last_practiced'], unique=False)


def downgrade() -> None:
    # Drop indexes first
    op.drop_index(op.f('ix_words_last_practiced'), table_name='words')
    op.drop_index(op.f('ix_words_practice_count'), table_name='words')
    op.drop_index(op.f('ix_words_familiar'), table_name='words')
    op.drop_index(op.f('ix_words_next_review'), table_name='words')
    
    # Drop practice stats columns
    op.drop_column('words', 'familiar')
    op.drop_column('words', 'last_practiced')
    op.drop_column('words', 'incorrect_count')
    op.drop_column('words', 'correct_count')
    op.drop_column('words', 'practice_count')
    
    # Drop SRS columns
    op.drop_column('words', 'review_interval')
    op.drop_column('words', 'next_review')
    op.drop_column('words', 'srs_level')