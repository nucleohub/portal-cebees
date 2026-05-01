import { DataTypes, type Sequelize } from 'sequelize';

export async function up({ context: sequelize }: { context: Sequelize }): Promise<void> {
  const qi = sequelize.getQueryInterface();

  await sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE disponibilidade_periodo AS ENUM ('MANHA','TARDE','NOITE');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await qi.createTable('disponibilidade', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    professor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'professor', key: 'id' },
      onDelete: 'CASCADE',
    },
    dia_semana: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: { min: 1, max: 7 },
    },
    periodo: { type: 'disponibilidade_periodo', allowNull: false },
    hora_inicio: { type: DataTypes.TIME, allowNull: false },
    hora_fim: { type: DataTypes.TIME, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });

  await sequelize.query(
    `ALTER TABLE disponibilidade ADD CONSTRAINT chk_dia_semana CHECK (dia_semana BETWEEN 1 AND 7);`,
  );
  await sequelize.query(
    `ALTER TABLE disponibilidade ADD CONSTRAINT chk_horario CHECK (hora_inicio < hora_fim);`,
  );

  await qi.addIndex('disponibilidade', ['professor_id', 'dia_semana'], {
    name: 'idx_disponibilidade_prof_dia',
  });
}

export async function down({ context: sequelize }: { context: Sequelize }): Promise<void> {
  await sequelize.getQueryInterface().dropTable('disponibilidade');
  await sequelize.query('DROP TYPE IF EXISTS disponibilidade_periodo;');
}
