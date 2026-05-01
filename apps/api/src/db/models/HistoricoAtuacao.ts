import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';

import { sequelize } from '../sequelize.js';

export class HistoricoAtuacao extends Model<
  InferAttributes<HistoricoAtuacao>,
  InferCreationAttributes<HistoricoAtuacao>
> {
  declare id: CreationOptional<number>;
  declare professorId: number;
  declare turmaId: number;
  declare alocacaoId: number | null;
  declare dataInicio: string;
  declare dataFim: string;
  declare cargaHorariaCumprida: number;
  declare avaliacaoCoordenacao: number | null;
  declare avaliacaoAlunos: number | null;
  declare observacoes: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

HistoricoAtuacao.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    professorId: { type: DataTypes.INTEGER, allowNull: false, field: 'professor_id' },
    turmaId: { type: DataTypes.INTEGER, allowNull: false, field: 'turma_id' },
    alocacaoId: { type: DataTypes.INTEGER, allowNull: true, field: 'alocacao_id' },
    dataInicio: { type: DataTypes.DATEONLY, allowNull: false, field: 'data_inicio' },
    dataFim: { type: DataTypes.DATEONLY, allowNull: false, field: 'data_fim' },
    cargaHorariaCumprida: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'carga_horaria_cumprida',
    },
    avaliacaoCoordenacao: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      field: 'avaliacao_coordenacao',
      validate: { min: 0, max: 5 },
    },
    avaliacaoAlunos: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      field: 'avaliacao_alunos',
      validate: { min: 0, max: 5 },
    },
    observacoes: { type: DataTypes.TEXT, allowNull: true },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
  {
    sequelize,
    tableName: 'historico_atuacao',
    modelName: 'HistoricoAtuacao',
  },
);
