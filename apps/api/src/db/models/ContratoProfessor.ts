import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';

import { ContratoStatus } from '@cebees/shared-types';

import { sequelize } from '../sequelize.js';

export class ContratoProfessor extends Model<
  InferAttributes<ContratoProfessor>,
  InferCreationAttributes<ContratoProfessor>
> {
  declare id: CreationOptional<number>;
  declare numero: string;
  declare alocacaoId: number;
  declare professorId: number;
  declare projetoId: number | null;
  declare valorHora: number;
  declare cargaHoraria: number;
  declare valorTotal: number;
  declare status: CreationOptional<ContratoStatus>;
  declare pdfUrl: string | null;
  declare envelopeAssinaturaId: string | null;
  declare providerAssinatura: string | null;
  declare dataEnvio: Date | null;
  declare dataAssinatura: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ContratoProfessor.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    numero: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    alocacaoId: { type: DataTypes.INTEGER, allowNull: false, unique: true, field: 'alocacao_id' },
    professorId: { type: DataTypes.INTEGER, allowNull: false, field: 'professor_id' },
    projetoId: { type: DataTypes.INTEGER, allowNull: true, field: 'projeto_id' },
    valorHora: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'valor_hora' },
    cargaHoraria: { type: DataTypes.INTEGER, allowNull: false, field: 'carga_horaria' },
    valorTotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: 'valor_total' },
    status: {
      type: DataTypes.ENUM(...Object.values(ContratoStatus)),
      allowNull: false,
      defaultValue: ContratoStatus.RASCUNHO,
    },
    pdfUrl: { type: DataTypes.STRING(500), allowNull: true, field: 'pdf_url' },
    envelopeAssinaturaId: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'envelope_assinatura_id',
    },
    providerAssinatura: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'provider_assinatura',
    },
    dataEnvio: { type: DataTypes.DATE, allowNull: true, field: 'data_envio' },
    dataAssinatura: { type: DataTypes.DATE, allowNull: true, field: 'data_assinatura' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
  {
    sequelize,
    tableName: 'contrato_professor',
    modelName: 'ContratoProfessor',
  },
);
