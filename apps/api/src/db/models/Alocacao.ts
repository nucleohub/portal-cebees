import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';

import { AlocacaoStatus, type ScoreBreakdown } from '@cebees/shared-types';

import { sequelize } from '../sequelize.js';

export class Alocacao extends Model<InferAttributes<Alocacao>, InferCreationAttributes<Alocacao>> {
  declare id: CreationOptional<number>;
  declare turmaId: number;
  declare professorId: number;
  declare status: CreationOptional<AlocacaoStatus>;
  declare scoreTotal: number | null;
  declare scoreBreakdown: ScoreBreakdown | null;
  declare explicacao: string[] | null;
  declare dataSugestao: CreationOptional<Date>;
  declare dataConfirmacao: Date | null;
  declare dataInicio: Date | null;
  declare dataFim: Date | null;
  declare justificativa: string | null;
  declare motivoCancelamento: string | null;
  declare confirmadoPor: number | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Alocacao.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    turmaId: { type: DataTypes.INTEGER, allowNull: false, field: 'turma_id' },
    professorId: { type: DataTypes.INTEGER, allowNull: false, field: 'professor_id' },
    status: {
      type: DataTypes.ENUM(...Object.values(AlocacaoStatus)),
      allowNull: false,
      defaultValue: AlocacaoStatus.SUGERIDA,
    },
    scoreTotal: { type: DataTypes.DECIMAL(6, 2), allowNull: true, field: 'score_total' },
    scoreBreakdown: { type: DataTypes.JSONB, allowNull: true, field: 'score_breakdown' },
    explicacao: { type: DataTypes.JSONB, allowNull: true },
    dataSugestao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'data_sugestao',
    },
    dataConfirmacao: { type: DataTypes.DATE, allowNull: true, field: 'data_confirmacao' },
    dataInicio: { type: DataTypes.DATE, allowNull: true, field: 'data_inicio' },
    dataFim: { type: DataTypes.DATE, allowNull: true, field: 'data_fim' },
    justificativa: { type: DataTypes.TEXT, allowNull: true },
    motivoCancelamento: { type: DataTypes.TEXT, allowNull: true, field: 'motivo_cancelamento' },
    confirmadoPor: { type: DataTypes.INTEGER, allowNull: true, field: 'confirmado_por' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
  {
    sequelize,
    tableName: 'alocacao',
    modelName: 'Alocacao',
  },
);
