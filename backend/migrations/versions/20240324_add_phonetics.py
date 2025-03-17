"""add phonetics field to words table

Revision ID: 20240324_add_phonetics
Create Date: 2024-03-24 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision: str = '20240324_add_phonetics'
down_revision: Union[str, None] = '20240323_add_comprehensive_rules'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def has_column(table_name, column_name):
    # Get inspector
    conn = op.get_bind()
    insp = inspect(conn)
    # Get columns for table
    columns = [col['name'] for col in insp.get_columns(table_name)]
    return column_name in columns

def upgrade() -> None:
    # Check if phonetic column already exists
    if not has_column('words', 'phonetic'):
        # Add phonetic column to words table
        op.add_column('words', sa.Column('phonetic', sa.String(), nullable=True))

def downgrade() -> None:
    # Remove phonetic column from words table if it exists
    if has_column('words', 'phonetic'):
        op.drop_column('words', 'phonetic')