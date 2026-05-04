import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';

import { ProjetoStatus, ProjetoTipo } from '@cebees/shared-types';

import { sequelize } from '../sequelize.js';

export class Projeto extends Model<InferAttributes<Projeto>, InferCreationAttributes<Projeto>> {
  declare id: CreationOptional<number>;
  declare nome: string;
  declare codigo: string;
  declare tipo: CreationOptional<ProjetoTipo>;
  declare ambientePaiId: CreationOptional<number | null>;
  declare corTema: CreationOptional<string>;
  declare logoUrl: CreationOptional<string | null>;
  declare regrasEspecificas: CreationOptional<Record<string, unknown>>;
  declare status: CreationOptional<ProjetoStatus>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Projeto.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome: { type: DataTypes.STRING(255), allowNull: false },
    codigo: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    tipo: {
      type: DataTypes.ENUM(...Object.values(ProjetoTipo)),
      allowNull: false,
      defaultValue: ProjetoTipo.INTERNO,
    },
    ambientePaiId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'ambiente_pai_id',
    },
    corTema: {
      type: DataTypes.STRING(7),
      allowNull: false,
      defaultValue: '#1A365D',
      field: 'cor_tema',
    },
    logoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'logo_url',
    },
    regrasEspecificas: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
      field: 'regras_especificas',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ProjetoStatus)),
      allowNull: false,
      defaultValue: ProjetoStatus.ATIVO,
    },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
  {
    sequelize,
    tableName: 'projeto',
    modelName: 'Projeto',
  },
);
