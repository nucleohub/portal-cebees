import { DataTypes, type Sequelize } from 'sequelize';

export async function up({ context: sequelize }: { context: Sequelize }): Promise<void> {
  const qi = sequelize.getQueryInterface();

  await sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE contrato_status AS ENUM ('RASCUNHO','ENVIADO','ASSINADO','ATIVO','ENCERRADO');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await qi.createTable('contrato_professor', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    numero: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    alocacao_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: 'alocacao', key: 'id' },
      onDelete: 'RESTRICT',
    },
    professor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'professor', key: 'id' },
      onDelete: 'RESTRICT',
    },
    valor_hora: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    carga_horaria: { type: DataTypes.INTEGER, allowNull: false },
    valor_total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    status: { type: 'contrato_status', allowNull: false, defaultValue: 'RASCUNHO' },
    pdf_url: { type: DataTypes.STRING(500), allowNull: true },
    envelope_assinatura_id: { type: DataTypes.STRING(200), allowNull: true },
    provider_assinatura: { type: DataTypes.STRING(50), allowNull: true },
    data_envio: { type: DataTypes.DATE, allowNull: true },
    data_assinatura: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });

  await qi.addIndex('contrato_professor', ['status'], { name: 'idx_contrato_status' });
  await qi.addIndex('contrato_professor', ['professor_id'], { name: 'idx_contrato_professor' });

  await sequelize.query(`
    CREATE SEQUENCE IF NOT EXISTS contrato_numero_seq START 1;
  `);
}

export async function down({ context: sequelize }: { context: Sequelize }): Promise<void> {
  await sequelize.getQueryInterface().dropTable('contrato_professor');
  await sequelize.query('DROP TYPE IF EXISTS contrato_status;');
  await sequelize.query('DROP SEQUENCE IF EXISTS contrato_numero_seq;');
}
