import { DataTypes, type Sequelize } from 'sequelize';

/**
 * Migration 013 — Create `projeto` table.
 *
 * Inserts 4 bootstrap rows that represent the real environments managed by CEBEES:
 *   - Tecnólogo      (INTERNO)
 *   - Pós-Graduação  (INTERNO)
 *   - Cursos Livres  (INTERNO)
 *   - CBMF Cursos    (SUB_AMBIENTE — branding próprio, sem pai hierárquico)
 *
 * These rows are created here (not in seed.ts) so that migration 015 can use
 * them when backfilling projeto_id on existing rows.
 */
export async function up({ context: sequelize }: { context: Sequelize }): Promise<void> {
  const qi = sequelize.getQueryInterface();

  await sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE projeto_tipo AS ENUM ('INTERNO','SUB_AMBIENTE');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE projeto_status AS ENUM ('ATIVO','INATIVO');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await qi.createTable('projeto', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome: { type: DataTypes.STRING(255), allowNull: false },
    codigo: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    tipo: { type: 'projeto_tipo', allowNull: false, defaultValue: 'INTERNO' },
    ambiente_pai_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'projeto', key: 'id' },
      onDelete: 'RESTRICT',
    },
    cor_tema: { type: DataTypes.STRING(7), allowNull: false, defaultValue: '#1A365D' },
    logo_url: { type: DataTypes.STRING(500), allowNull: true },
    regras_especificas: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    status: { type: 'projeto_status', allowNull: false, defaultValue: 'ATIVO' },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });

  await qi.addIndex('projeto', ['codigo'], { name: 'idx_projeto_codigo', unique: true });
  await qi.addIndex('projeto', ['status'], { name: 'idx_projeto_status' });

  // Bootstrap rows — required before migration 015 can backfill existing data.
  // Use INSERT ... ON CONFLICT DO NOTHING so re-running is safe.
  await sequelize.query(`
    INSERT INTO projeto (nome, codigo, tipo, ambiente_pai_id, cor_tema, regras_especificas, status)
    VALUES
      ('Tecnólogo',      'TECNOLOGO',    'INTERNO',      NULL, '#1A365D', '{}', 'ATIVO'),
      ('Pós-Graduação',  'POS',          'INTERNO',      NULL, '#2D3748', '{}', 'ATIVO'),
      ('Cursos Livres',  'CURSOS_LIVRES','INTERNO',      NULL, '#276749', '{}', 'ATIVO'),
      ('CBMF Cursos',    'CBMF',         'SUB_AMBIENTE', NULL, '#C53030', '{}', 'ATIVO')
    ON CONFLICT (codigo) DO NOTHING;
  `);
}

export async function down({ context: sequelize }: { context: Sequelize }): Promise<void> {
  await sequelize.getQueryInterface().dropTable('projeto');
  await sequelize.query('DROP TYPE IF EXISTS projeto_tipo;');
  await sequelize.query('DROP TYPE IF EXISTS projeto_status;');
}
