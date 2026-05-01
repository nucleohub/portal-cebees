import { DataTypes, type Sequelize } from 'sequelize';

export async function up({ context: sequelize }: { context: Sequelize }): Promise<void> {
  const qi = sequelize.getQueryInterface();

  await sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE professor_status AS ENUM ('ATIVO','INATIVO','SUSPENSO');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await qi.createTable('professor', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome_completo: { type: DataTypes.STRING(200), allowNull: false },
    cpf_encrypted: { type: DataTypes.TEXT, allowNull: false },
    cpf_hash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    rg_encrypted: { type: DataTypes.TEXT, allowNull: false },
    email: { type: DataTypes.STRING(180), allowNull: false, unique: true },
    telefone: { type: DataTypes.STRING(30), allowNull: true },
    data_nascimento: { type: DataTypes.DATEONLY, allowNull: false },
    status: {
      type: 'professor_status',
      allowNull: false,
      defaultValue: 'ATIVO',
    },
    formacoes: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    experiencia_anos: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });

  await qi.addIndex('professor', ['status'], { name: 'idx_professor_status' });
  await qi.addIndex('professor', ['cpf_hash'], { name: 'idx_professor_cpf_hash', unique: true });
}

export async function down({ context: sequelize }: { context: Sequelize }): Promise<void> {
  const qi = sequelize.getQueryInterface();
  await qi.dropTable('professor');
  await sequelize.query('DROP TYPE IF EXISTS professor_status;');
}
