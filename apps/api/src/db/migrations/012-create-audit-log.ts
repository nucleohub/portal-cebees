import { DataTypes, type Sequelize } from 'sequelize';

export async function up({ context: sequelize }: { context: Sequelize }): Promise<void> {
  const qi = sequelize.getQueryInterface();

  await qi.createTable('audit_log', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: true },
    usuario_email: { type: DataTypes.STRING(180), allowNull: true },
    acao: { type: DataTypes.STRING(80), allowNull: false },
    recurso: { type: DataTypes.STRING(80), allowNull: false },
    recurso_id: { type: DataTypes.STRING(64), allowNull: true },
    ip: { type: DataTypes.STRING(64), allowNull: true },
    user_agent: { type: DataTypes.STRING(500), allowNull: true },
    request_id: { type: DataTypes.STRING(64), allowNull: true },
    diff: { type: DataTypes.JSONB, allowNull: true },
    sucesso: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    mensagem_erro: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });

  await qi.addIndex('audit_log', ['created_at'], { name: 'idx_audit_created' });
  await qi.addIndex('audit_log', ['usuario_id'], { name: 'idx_audit_usuario' });
  await qi.addIndex('audit_log', ['recurso', 'recurso_id'], { name: 'idx_audit_recurso' });
}

export async function down({ context: sequelize }: { context: Sequelize }): Promise<void> {
  await sequelize.getQueryInterface().dropTable('audit_log');
}
