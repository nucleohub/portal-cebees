import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';

import { Papel } from '@cebees/shared-types';

import { sequelize } from '../sequelize.js';

export class Usuario extends Model<InferAttributes<Usuario>, InferCreationAttributes<Usuario>> {
  declare id: CreationOptional<number>;
  declare email: string;
  declare nome: string;
  declare senhaHash: string;
  declare papel: Papel;
  declare professorId: number | null;
  declare ativo: CreationOptional<boolean>;
  declare ultimoLogin: Date | null;
  declare refreshTokenHash: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Usuario.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING(180), allowNull: false, unique: true },
    nome: { type: DataTypes.STRING(200), allowNull: false },
    senhaHash: { type: DataTypes.STRING(120), allowNull: false, field: 'senha_hash' },
    papel: { type: DataTypes.ENUM(...Object.values(Papel)), allowNull: false },
    professorId: { type: DataTypes.INTEGER, allowNull: true, field: 'professor_id' },
    ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    ultimoLogin: { type: DataTypes.DATE, allowNull: true, field: 'ultimo_login' },
    refreshTokenHash: {
      type: DataTypes.STRING(120),
      allowNull: true,
      field: 'refresh_token_hash',
    },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
  {
    sequelize,
    tableName: 'usuario',
    modelName: 'Usuario',
  },
);
