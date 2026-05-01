import { DataTypes, type Sequelize } from 'sequelize';

export async function up({ context: sequelize }: { context: Sequelize }): Promise<void> {
  const qi = sequelize.getQueryInterface();

  await sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE alocacao_status AS ENUM ('SUGERIDA','CONFIRMADA','ATIVA','CONCLUIDA','CANCELADA');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await qi.createTable('alocacao', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    turma_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'turma', key: 'id' },
      onDelete: 'RESTRICT',
    },
    professor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'professor', key: 'id' },
      onDelete: 'RESTRICT',
    },
    status: { type: 'alocacao_status', allowNull: false, defaultValue: 'SUGERIDA' },
    score_total: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    score_breakdown: { type: DataTypes.JSONB, allowNull: true },
    explicacao: { type: DataTypes.JSONB, allowNull: true },
    data_sugestao: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    data_confirmacao: { type: DataTypes.DATE, allowNull: true },
    data_inicio: { type: DataTypes.DATE, allowNull: true },
    data_fim: { type: DataTypes.DATE, allowNull: true },
    justificativa: { type: DataTypes.TEXT, allowNull: true },
    motivo_cancelamento: { type: DataTypes.TEXT, allowNull: true },
    confirmado_por: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });

  await qi.addIndex('alocacao', ['turma_id', 'status'], { name: 'idx_alocacao_turma_status' });
  await qi.addIndex('alocacao', ['professor_id', 'status'], { name: 'idx_alocacao_prof_status' });

  await sequelize.query(
    `CREATE UNIQUE INDEX idx_alocacao_unica_ativa
     ON alocacao (turma_id, professor_id)
     WHERE status IN ('CONFIRMADA','ATIVA');`,
  );
}

export async function down({ context: sequelize }: { context: Sequelize }): Promise<void> {
  await sequelize.getQueryInterface().dropTable('alocacao');
  await sequelize.query('DROP TYPE IF EXISTS alocacao_status;');
}
