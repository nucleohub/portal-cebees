import { DataTypes, type Sequelize } from 'sequelize';

export async function up({ context: sequelize }: { context: Sequelize }): Promise<void> {
  const qi = sequelize.getQueryInterface();

  await qi.createTable('disciplina_especialidade', {
    disciplina_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: { model: 'disciplina', key: 'id' },
      onDelete: 'CASCADE',
    },
    especialidade_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: { model: 'especialidade', key: 'id' },
      onDelete: 'RESTRICT',
    },
    peso: { type: DataTypes.DECIMAL(3, 2), allowNull: false, defaultValue: 1.0 },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });
}

export async function down({ context: sequelize }: { context: Sequelize }): Promise<void> {
  await sequelize.getQueryInterface().dropTable('disciplina_especialidade');
}
