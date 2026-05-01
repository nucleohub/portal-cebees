import { DataTypes, type Sequelize } from 'sequelize';

export async function up({ context: sequelize }: { context: Sequelize }): Promise<void> {
  const qi = sequelize.getQueryInterface();

  await qi.createTable('disciplina', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    codigo: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    nome: { type: DataTypes.STRING(200), allowNull: false },
    ementa: { type: DataTypes.TEXT, allowNull: true },
    carga_horaria: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });
}

export async function down({ context: sequelize }: { context: Sequelize }): Promise<void> {
  await sequelize.getQueryInterface().dropTable('disciplina');
}
