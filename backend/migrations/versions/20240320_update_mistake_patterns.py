"""update mistake patterns table

Revision ID: 20240320_update_mistake_patterns
Create Date: 2024-03-20 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision: str = '20240320_update_mistake_patterns'
down_revision: Union[str, None] = '20240319_combined_initial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Add updated_at column
    with op.batch_alter_table('mistake_patterns') as batch_op:
        batch_op.add_column(sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))
        
    # Add non-negative check constraint for frequency
    op.create_check_constraint(
        'check_frequency_non_negative',
        'mistake_patterns',
        'frequency >= 0'
    )
    
    # Update all existing rows to have current timestamp for updated_at
    op.execute("""
        UPDATE mistake_patterns 
        SET updated_at = CURRENT_TIMESTAMP
        WHERE updated_at IS NULL
    """)


def downgrade() -> None:
    with op.batch_alter_table('mistake_patterns') as batch_op:
        batch_op.drop_column('updated_at')
    
    op.drop_constraint(
        'check_frequency_non_negative',
        'mistake_patterns'
    )