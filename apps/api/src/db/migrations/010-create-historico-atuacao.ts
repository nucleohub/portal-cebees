import { DataTypes, type Sequelize } from 'sequelize';

export async function up({ context: sequelize }: { context: Sequelize }): Promise<void> {
  const qi = sequelize.getQueryInterface();

  await qi.createTable('historico_atuacao', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    professor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'professor', key: 'id' },
      onDelete: 'CASCADE',
    },
    turma_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'turma', key: 'id' },
      onDelete: 'RESTRICT',
    },
    alocacao_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'alocacao', key: 'id' },
      onDelete: 'SET NULL',
    },
    data_inicio: { type: DataTypes.DATEONLY, allowNull: false },
    data_fim: { type: DataTypes.DATEONLY, allowNull: false },
    carga_horaria_cumprida: { type: DataTypes.INTEGER, allowNull: false },
    avaliacao_coordenacao: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: { min: 0, max: 5 },
    },
    avaliacao_alunos: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: { min: 0, max: 5 },
    },
    observacoes: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });

  await sequelize.query(
    `ALTER TABLE historico_atuacao ADD CONSTRAINT chk_historico_periodo CHECK (data_inicio <= data_fim);`,
  );

  await qi.addIndex('historico_atuacao', ['professor_id', 'data_fim'], {
    name: 'idx_historico_prof_fim',
  });
}

export async function down({ context: sequelize }: { context: Sequelize }): Promise<void> {
  await sequelize.getQueryInterface().dropTable('historico_atuacao');
}
