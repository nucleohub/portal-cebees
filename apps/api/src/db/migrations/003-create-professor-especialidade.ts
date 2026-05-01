import { DataTypes, type Sequelize } from 'sequelize';

export async function up({ context: sequelize }: { context: Sequelize }): Promise<void> {
  const qi = sequelize.getQueryInterface();

  await qi.createTable('professor_especialidade', {
    professor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: { model: 'professor', key: 'id' },
      onDelete: 'CASCADE',
    },
    especialidade_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: { model: 'especialidade', key: 'id' },
      onDelete: 'RESTRICT',
    },
    nivel_proficiencia: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    desde_ano: { type: DataTypes.INTEGER, allowNull: false },
    comprovacao: { type: DataTypes.STRING(500), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });

  await sequelize.query(
    `ALTER TABLE professor_especialidade ADD CONSTRAINT chk_proficiencia CHECK (nivel_proficiencia BETWEEN 1 AND 5);`,
  );

  await qi.addIndex('professor_especialidade', ['especialidade_id', 'nivel_proficiencia'], {
    name: 'idx_prof_esp_ranking',
  });
}

export async function down({ context: sequelize }: { context: Sequelize }): Promise<void> {
  await sequelize.getQueryInterface().dropTable('professor_especialidade');
}
