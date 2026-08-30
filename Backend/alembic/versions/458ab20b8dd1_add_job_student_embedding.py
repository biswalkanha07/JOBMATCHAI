"""add_job_student_embedding

Revision ID: 458ab20b8dd1
Revises: b6367fff1e63
Create Date: 2026-08-29 02:12:09.512208

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import pgvector
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '458ab20b8dd1'
down_revision: Union[str, Sequence[str], None] = 'b6367fff1e63'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add embedding column to jobs
    op.add_column('jobs', sa.Column('embedding', pgvector.sqlalchemy.vector.VECTOR(dim=384), nullable=True))
    
    # Add embedding column to student_profiles
    op.add_column('student_profiles', sa.Column('embedding', pgvector.sqlalchemy.vector.VECTOR(dim=384), nullable=True))


def downgrade() -> None:
    op.drop_column('student_profiles', 'embedding')
    op.drop_column('jobs', 'embedding')
