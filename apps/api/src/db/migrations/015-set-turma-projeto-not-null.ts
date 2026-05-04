import { type Sequelize } from 'sequelize';

/**
 * Migration 015 — Backfill turma.projeto_id and enforce NOT NULL.
 *
 * Any `turma` row that was created before migration 014 will have projeto_id = NULL.
 * This migration assigns those rows to the 'CURSOS_LIVRES' project (the most generic
 * fallback), then promotes the column to NOT NULL.
 *
 * The bootstrap rows for `projeto` were created in migration 013, so the subquery
 * is safe to run on any environment — including a fresh database with no seed data.
 */
export async function up({ context: sequelize }: { context: Sequelize }): Promise<void> {
  // 1. Backfill existing rows that have no projeto_id assigned.
  //    Uses CURSOS_LIVRES as default; if somehow the row doesn't exist, the UPDATE
  //    is a no-op (NULL subquery → still NULL, caught by the NOT NULL below only
  //    if turma rows exist without projeto data — which shouldn't happen post-013).
  await sequelize.query(`
    UPDATE turma
    SET projeto_id = (
      SELECT id FROM projeto WHERE codigo = 'CURSOS_LIVRES' LIMIT 1
    )
    WHERE projeto_id IS NULL;
  `);

  // 2. Enforce NOT NULL now that all rows are populated.
  await sequelize.query(`
    ALTER TABLE turma ALTER COLUMN projeto_id SET NOT NULL;
  `);
}

export async function down({ context: sequelize }: { context: Sequelize }): Promise<void> {
  await sequelize.query(`
    ALTER TABLE turma ALTER COLUMN projeto_id DROP NOT NULL;
  `);
}
