import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';

import { sequelize } from '../sequelize.js';

export class AuditLog extends Model<InferAttributes<AuditLog>, InferCreationAttributes<AuditLog>> {
  declare id: CreationOptional<number>;
  declare usuarioId: number | null;
  declare usuarioEmail: string | null;
  declare acao: string;
  declare recurso: string;
  declare recursoId: string | null;
  declare ip: string | null;
  declare userAgent: string | null;
  declare requestId: string | null;
  declare diff: Record<string, unknown> | null;
  declare sucesso: CreationOptional<boolean>;
  declare mensagemErro: string | null;
  declare createdAt: CreationOptional<Date>;
}

AuditLog.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    usuarioId: { type: DataTypes.INTEGER, allowNull: true, field: 'usuario_id' },
    usuarioEmail: { type: DataTypes.STRING(180), allowNull: true, field: 'usuario_email' },
    acao: { type: DataTypes.STRING(80), allowNull: false },
    recurso: { type: DataTypes.STRING(80), allowNull: false },
    recursoId: { type: DataTypes.STRING(64), allowNull: true, field: 'recurso_id' },
    ip: { type: DataTypes.STRING(64), allowNull: true },
    userAgent: { type: DataTypes.STRING(500), allowNull: true, field: 'user_agent' },
    requestId: { type: DataTypes.STRING(64), allowNull: true, field: 'request_id' },
    diff: { type: DataTypes.JSONB, allowNull: true },
    sucesso: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    mensagemErro: { type: DataTypes.TEXT, allowNull: true, field: 'mensagem_erro' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
  },
  {
    sequelize,
    tableName: 'audit_log',
    modelName: 'AuditLog',
    timestamps: true,
    updatedAt: false,
  },
);
