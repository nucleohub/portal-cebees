import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';

import { sequelize } from '../sequelize.js';

export class Disciplina extends Model<
  InferAttributes<Disciplina>,
  InferCreationAttributes<Disciplina>
> {
  declare id: CreationOptional<number>;
  declare codigo: string;
  declare nome: string;
  declare ementa: string | null;
  declare cargaHoraria: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Disciplina.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    codigo: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    nome: { type: DataTypes.STRING(200), allowNull: false },
    ementa: { type: DataTypes.TEXT, allowNull: true },
    cargaHoraria: { type: DataTypes.INTEGER, allowNull: false, field: 'carga_horaria' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
  {
    sequelize,
    tableName: 'disciplina',
    modelName: 'Disciplina',
  },
);

export class DisciplinaEspecialidade extends Model<
  InferAttributes<DisciplinaEspecialidade>,
  InferCreationAttributes<DisciplinaEspecialidade>
> {
  declare disciplinaId: number;
  declare especialidadeId: number;
  declare peso: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

DisciplinaEspecialidade.init(
  {
    disciplinaId: { type: DataTypes.INTEGER, primaryKey: true, field: 'disciplina_id' },
    especialidadeId: { type: DataTypes.INTEGER, primaryKey: true, field: 'especialidade_id' },
    peso: { type: DataTypes.DECIMAL(3, 2), allowNull: false, defaultValue: 1.0 },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
  {
    sequelize,
    tableName: 'disciplina_especialidade',
    modelName: 'DisciplinaEspecialidade',
  },
);
