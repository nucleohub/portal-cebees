import { DataTypes, type Sequelize } from 'sequelize';

/**
 * Migration 016 — Add `valor_hora` to professor.
 *
 * Stores the professor's default hourly rate used when generating contracts.
 * Added as nullable with a default of 0 so that existing rows are unaffected.
 * Business logic in ConfirmAllocationUseCase falls back to this value when
 * the alocação does not override it.
 */
export async function up({ context: sequelize }: { context: Sequelize }): Promise<void> {
  const qi = sequelize.getQueryInterface();
  await qi.addColumn('professor', 'valor_hora', {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  });
}

export async function down({ context: sequelize }: { context: Sequelize }): Promise<void> {
  const qi = sequelize.getQueryInterface();
  await qi.removeColumn('professor', 'valor_hora');
}
