import { DataTypes, type Sequelize } from 'sequelize';

export async function up({ context: sequelize }: { context: Sequelize }): Promise<void> {
  const qi = sequelize.getQueryInterface();

  await sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE turma_status AS ENUM ('PLANEJADA','ATIVA','CONCLUIDA','CANCELADA');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE tipo_curso AS ENUM ('CURSO_LIVRE','CBMF','FORMACAO_PROFISSIONAL','TECNOLOGO','POS_GRADUACAO');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await qi.createTable('turma', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    codigo: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    nome: { type: DataTypes.STRING(200), allowNull: false },
    disciplina_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'disciplina', key: 'id' },
      onDelete: 'RESTRICT',
    },
    tipo_curso: { type: 'tipo_curso', allowNull: false },
    carga_horaria_total: { type: DataTypes.INTEGER, allowNull: false },
    data_inicio: { type: DataTypes.DATEONLY, allowNull: false },
    data_fim: { type: DataTypes.DATEONLY, allowNull: false },
    horarios: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    vagas: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    vagas_ocupadas: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    status: { type: 'turma_status', allowNull: false, defaultValue: 'PLANEJADA' },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });

  await sequelize.query(
    `ALTER TABLE turma ADD CONSTRAINT chk_turma_periodo CHECK (data_inicio < data_fim);`,
  );

  await qi.addIndex('turma', ['status'], { name: 'idx_turma_status' });
  await qi.addIndex('turma', ['disciplina_id'], { name: 'idx_turma_disciplina' });
}

export async function down({ context: sequelize }: { context: Sequelize }): Promise<void> {
  await sequelize.getQueryInterface().dropTable('turma');
  await sequelize.query('DROP TYPE IF EXISTS turma_status;');
  await sequelize.query('DROP TYPE IF EXISTS tipo_curso;');
}
