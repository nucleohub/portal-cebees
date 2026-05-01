export interface HistoricoAtuacaoDto {
  id: number;
  professorId: number;
  professorNome: string;
  turmaId: number;
  turmaCodigo: string;
  disciplinaNome: string;
  dataInicio: string;
  dataFim: string;
  cargaHorariaCumprida: number;
  avaliacaoCoordenacao?: number;
  avaliacaoAlunos?: number;
  observacoes?: string;
  createdAt: string;
}

export interface CreateHistoricoDto {
  professorId: number;
  turmaId: number;
  dataInicio: string;
  dataFim: string;
  cargaHorariaCumprida: number;
  avaliacaoCoordenacao?: number;
  avaliacaoAlunos?: number;
  observacoes?: string;
}
