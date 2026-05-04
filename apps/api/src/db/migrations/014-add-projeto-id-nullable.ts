import { DataTypes, type Sequelize } from 'sequelize';

/**
 * Migration 014 — Add nullable `projeto_id` FK to existing tables.
 *
 * Columns are added as NULLABLE here so that:
 *   1. The migration succeeds on databases that already have rows.
 *   2. Migration 015 can safely backfill the column before enforcing NOT NULL
 *      on `turma` (the only table that requires a non-null projeto).
 *
 * Tables affected:
 *   - turma              → will become NOT NULL in migration 015
 *   - disciplina         → remains nullable (disciplinas can be shared across projetos)
 *   - alocacao           → nullable (derived from turma at creation time)
 *   - contrato_professor → nullable (derived from alocacao at creation time)
 */
export async function up({ context: sequelize }: { context: Sequelize }): Promise<void> {
  const qi = sequelize.getQueryInterface();

  const fk = () => ({
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'projeto', key: 'id' },
    onDelete: 'RESTRICT' as const,
    comment: 'FK → projeto.id (added by migration 014)',
  });

  // turma
  await qi.addColumn('turma', 'projeto_id', fk());
  await qi.addIndex('turma', ['projeto_id'], { name: 'idx_turma_projeto' });

  // disciplina
  await qi.addColumn('disciplina', 'projeto_id', fk());
  await qi.addIndex('disciplina', ['projeto_id'], { name: 'idx_disciplina_projeto' });

  // alocacao
  await qi.addColumn('alocacao', 'projeto_id', fk());
  await qi.addIndex('alocacao', ['projeto_id'], { name: 'idx_alocacao_projeto' });

  // contrato_professor
  await qi.addColumn('contrato_professor', 'projeto_id', fk());
  await qi.addIndex('contrato_professor', ['projeto_id'], { name: 'idx_contrato_projeto' });
}

export async function down({ context: sequelize }: { context: Sequelize }): Promise<void> {
  const qi = sequelize.getQueryInterface();

  await qi.removeIndex('contrato_professor', 'idx_contrato_projeto');
  await qi.removeColumn('contrato_professor', 'projeto_id');

  await qi.removeIndex('alocacao', 'idx_alocacao_projeto');
  await qi.removeColumn('alocacao', 'projeto_id');

  await qi.removeIndex('disciplina', 'idx_disciplina_projeto');
  await qi.removeColumn('disciplina', 'projeto_id');

  await qi.removeIndex('turma', 'idx_turma_projeto');
  await qi.removeColumn('turma', 'projeto_id');
}
