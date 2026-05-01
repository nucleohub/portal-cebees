import { DataTypes, type Sequelize } from 'sequelize';

export async function up({ context: sequelize }: { context: Sequelize }): Promise<void> {
  const qi = sequelize.getQueryInterface();

  await sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE papel_usuario AS ENUM ('ADMIN','COORDENADOR','SECRETARIA','PROFESSOR','ALUNO');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await qi.createTable('usuario', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING(180), allowNull: false, unique: true },
    nome: { type: DataTypes.STRING(200), allowNull: false },
    senha_hash: { type: DataTypes.STRING(120), allowNull: false },
    papel: { type: 'papel_usuario', allowNull: false },
    professor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'professor', key: 'id' },
      onDelete: 'SET NULL',
    },
    ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    ultimo_login: { type: DataTypes.DATE, allowNull: true },
    refresh_token_hash: { type: DataTypes.STRING(120), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });

  await qi.addIndex('usuario', ['papel'], { name: 'idx_usuario_papel' });
  await qi.addIndex('usuario', ['professor_id'], { name: 'idx_usuario_professor' });
}

export async function down({ context: sequelize }: { context: Sequelize }): Promise<void> {
  await sequelize.getQueryInterface().dropTable('usuario');
  await sequelize.query('DROP TYPE IF EXISTS papel_usuario;');
}
