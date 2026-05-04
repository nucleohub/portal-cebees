import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';

import { sequelize } from '../sequelize.js';
import { decryptPII, encryptPII, hashPII } from '../crypto.js';

import type { FormacaoDto } from '@cebees/shared-types';
import { ProfessorStatus } from '@cebees/shared-types';

export class Professor extends Model<
  InferAttributes<Professor, { omit: 'cpf' | 'rg' }>,
  InferCreationAttributes<Professor, { omit: 'cpf' | 'rg' }>
> {
  declare id: CreationOptional<number>;
  declare nomeCompleto: string;
  declare cpfEncrypted: string;
  declare cpfHash: string;
  declare rgEncrypted: string;
  declare email: string;
  declare telefone: string | null;
  declare dataNascimento: string;
  declare status: CreationOptional<ProfessorStatus>;
  declare formacoes: CreationOptional<FormacaoDto[]>;
  declare experienciaAnos: CreationOptional<number>;
  declare valorHora: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  get cpf(): string {
    return decryptPII(this.cpfEncrypted);
  }

  set cpf(value: string) {
    this.cpfEncrypted = encryptPII(value);
    this.cpfHash = hashPII(value);
  }

  get rg(): string {
    return decryptPII(this.rgEncrypted);
  }

  set rg(value: string) {
    this.rgEncrypted = encryptPII(value);
  }
}

Professor.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nomeCompleto: { type: DataTypes.STRING(200), allowNull: false, field: 'nome_completo' },
    cpfEncrypted: { type: DataTypes.TEXT, allowNull: false, field: 'cpf_encrypted' },
    cpfHash: { type: DataTypes.STRING(64), allowNull: false, field: 'cpf_hash' },
    rgEncrypted: { type: DataTypes.TEXT, allowNull: false, field: 'rg_encrypted' },
    email: { type: DataTypes.STRING(180), allowNull: false },
    telefone: { type: DataTypes.STRING(30), allowNull: true },
    dataNascimento: { type: DataTypes.DATEONLY, allowNull: false, field: 'data_nascimento' },
    status: {
      type: DataTypes.ENUM(...Object.values(ProfessorStatus)),
      allowNull: false,
      defaultValue: ProfessorStatus.ATIVO,
    },
    formacoes: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    experienciaAnos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'experiencia_anos',
    },
    valorHora: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'valor_hora',
    },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
  {
    sequelize,
    tableName: 'professor',
    modelName: 'Professor',
  },
);
