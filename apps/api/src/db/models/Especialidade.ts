import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from 'sequelize';

import { sequelize } from '../sequelize.js';

export class Especialidade extends Model<
  InferAttributes<Especialidade>,
  InferCreationAttributes<Especialidade>
> {
  declare id: CreationOptional<number>;
  declare nome: string;
  declare area: string;
  declare descricao: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Especialidade.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    area: { type: DataTypes.STRING(100), allowNull: false },
    descricao: { type: DataTypes.TEXT, allowNull: true },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
  {
    sequelize,
    tableName: 'especialidade',
    modelName: 'Especialidade',
  },
);

export class ProfessorEspecialidade extends Model<
  InferAttributes<ProfessorEspecialidade>,
  InferCreationAttributes<ProfessorEspecialidade>
> {
  declare professorId: number;
  declare especialidadeId: number;
  declare nivelProficiencia: number;
  declare desdeAno: number;
  declare comprovacao: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ProfessorEspecialidade.init(
  {
    professorId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'professor_id',
    },
    especialidadeId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'especialidade_id',
    },
    nivelProficiencia: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      field: 'nivel_proficiencia',
      validate: { min: 1, max: 5 },
    },
    desdeAno: { type: DataTypes.INTEGER, allowNull: false, field: 'desde_ano' },
    comprovacao: { type: DataTypes.STRING(500), allowNull: true },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
  {
    sequelize,
    tableName: 'professor_especialidade',
    modelName: 'ProfessorEspecialidade',
  },
);
