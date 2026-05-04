import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';

import { TipoCurso, TurmaStatus, type HorarioTurmaDto } from '@cebees/shared-types';

import { sequelize } from '../sequelize.js';

export class Turma extends Model<InferAttributes<Turma>, InferCreationAttributes<Turma>> {
  declare id: CreationOptional<number>;
  declare projetoId: number;
  declare codigo: string;
  declare nome: string;
  declare disciplinaId: number;
  declare tipoCurso: TipoCurso;
  declare cargaHorariaTotal: number;
  declare dataInicio: string;
  declare dataFim: string;
  declare horarios: CreationOptional<HorarioTurmaDto[]>;
  declare vagas: CreationOptional<number>;
  declare vagasOcupadas: CreationOptional<number>;
  declare status: CreationOptional<TurmaStatus>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Turma.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    projetoId: { type: DataTypes.INTEGER, allowNull: false, field: 'projeto_id' },
    codigo: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    nome: { type: DataTypes.STRING(200), allowNull: false },
    disciplinaId: { type: DataTypes.INTEGER, allowNull: false, field: 'disciplina_id' },
    tipoCurso: {
      type: DataTypes.ENUM(...Object.values(TipoCurso)),
      allowNull: false,
      field: 'tipo_curso',
    },
    cargaHorariaTotal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'carga_horaria_total',
    },
    dataInicio: { type: DataTypes.DATEONLY, allowNull: false, field: 'data_inicio' },
    dataFim: { type: DataTypes.DATEONLY, allowNull: false, field: 'data_fim' },
    horarios: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    vagas: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    vagasOcupadas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'vagas_ocupadas',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TurmaStatus)),
      allowNull: false,
      defaultValue: TurmaStatus.PLANEJADA,
    },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
  {
    sequelize,
    tableName: 'turma',
    modelName: 'Turma',
  },
);
