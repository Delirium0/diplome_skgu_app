"""add rooms

Revision ID: eb8790205cba
Revises: d5a229e43807
Create Date: 2025-04-20 14:07:30.766333

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'eb8790205cba'
down_revision = 'd5a229e43807'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('rooms',
    sa.Column('id', sa.Integer(), sa.Identity(always=False), nullable=False),
    sa.Column('room_number', sa.String(), nullable=False, comment='Номер кабинета'),
    sa.Column('room_name', sa.String(), nullable=True, comment='Название кабинета'),
    sa.Column('target_index', sa.Integer(), nullable=False, comment='Индекс цели в AR (0, 1, 2...)'),
    sa.Column('description', sa.String(), nullable=True, comment='Описание кабинета'),
    sa.Column('floor_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['floor_id'], ['floors.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('rooms')
    # ### end Alembic commands ###
