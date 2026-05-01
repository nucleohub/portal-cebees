import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';

import { DisponibilidadePeriodo } from '@cebees/shared-types';

import { sequelize } from '../sequelize.js';

export class Disponibilidade extends Model<
  InferAttributes<Disponibilidade>,
  InferCreationAttributes<Disponibilidade>
> {
  declare id: CreationOptional<number>;
  declare professorId: number;
  declare diaSemana: number;
  declare periodo: DisponibilidadePeriodo;
  declare horaInicio: string;
  declare horaFim: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Disponibilidade.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    professorId: { type: DataTypes.INTEGER, allowNull: false, field: 'professor_id' },
    diaSemana: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      field: 'dia_semana',
      validate: { min: 1, max: 7 },
    },
    periodo: {
      type: DataTypes.ENUM(...Object.values(DisponibilidadePeriodo)),
      allowNull: false,
    },
    horaInicio: { type: DataTypes.TIME, allowNull: false, field: 'hora_inicio' },
    horaFim: { type: DataTypes.TIME, allowNull: false, field: 'hora_fim' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
  {
    sequelize,
    tableName: 'disponibilidade',
    modelName: 'Disponibilidade',
  },
);
