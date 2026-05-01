export const ProfessorStatus = {
  ATIVO: 'ATIVO',
  INATIVO: 'INATIVO',
  SUSPENSO: 'SUSPENSO',
} as const;
export type ProfessorStatus = (typeof ProfessorStatus)[keyof typeof ProfessorStatus];

export const AlocacaoStatus = {
  SUGERIDA: 'SUGERIDA',
  CONFIRMADA: 'CONFIRMADA',
  ATIVA: 'ATIVA',
  CONCLUIDA: 'CONCLUIDA',
  CANCELADA: 'CANCELADA',
} as const;
export type AlocacaoStatus = (typeof AlocacaoStatus)[keyof typeof AlocacaoStatus];

export const ContratoStatus = {
  RASCUNHO: 'RASCUNHO',
  ENVIADO: 'ENVIADO',
  ASSINADO: 'ASSINADO',
  ATIVO: 'ATIVO',
  ENCERRADO: 'ENCERRADO',
} as const;
export type ContratoStatus = (typeof ContratoStatus)[keyof typeof ContratoStatus];

export const TurmaStatus = {
  PLANEJADA: 'PLANEJADA',
  ATIVA: 'ATIVA',
  CONCLUIDA: 'CONCLUIDA',
  CANCELADA: 'CANCELADA',
} as const;
export type TurmaStatus = (typeof TurmaStatus)[keyof typeof TurmaStatus];

export const DisponibilidadePeriodo = {
  MANHA: 'MANHA',
  TARDE: 'TARDE',
  NOITE: 'NOITE',
} as const;
export type DisponibilidadePeriodo =
  (typeof DisponibilidadePeriodo)[keyof typeof DisponibilidadePeriodo];

export const DiaSemana = {
  SEGUNDA: 1,
  TERCA: 2,
  QUARTA: 3,
  QUINTA: 4,
  SEXTA: 5,
  SABADO: 6,
  DOMINGO: 7,
} as const;
export type DiaSemana = (typeof DiaSemana)[keyof typeof DiaSemana];

export const TipoCurso = {
  CURSO_LIVRE: 'CURSO_LIVRE',
  CBMF: 'CBMF',
  FORMACAO_PROFISSIONAL: 'FORMACAO_PROFISSIONAL',
  TECNOLOGO: 'TECNOLOGO',
  POS_GRADUACAO: 'POS_GRADUACAO',
} as const;
export type TipoCurso = (typeof TipoCurso)[keyof typeof TipoCurso];

export const NivelProficiencia = {
  INICIANTE: 1,
  INTERMEDIARIO: 2,
  AVANCADO: 3,
  ESPECIALISTA: 4,
  REFERENCIA: 5,
} as const;
export type NivelProficiencia = (typeof NivelProficiencia)[keyof typeof NivelProficiencia];

export const Papel = {
  ADMIN: 'ADMIN',
  COORDENADOR: 'COORDENADOR',
  SECRETARIA: 'SECRETARIA',
  PROFESSOR: 'PROFESSOR',
  ALUNO: 'ALUNO',
} as const;
export type Papel = (typeof Papel)[keyof typeof Papel];

export const NivelFormacao = {
  MEDIO: 'MEDIO',
  TECNICO: 'TECNICO',
  GRADUACAO: 'GRADUACAO',
  ESPECIALIZACAO: 'ESPECIALIZACAO',
  MESTRADO: 'MESTRADO',
  DOUTORADO: 'DOUTORADO',
} as const;
export type NivelFormacao = (typeof NivelFormacao)[keyof typeof NivelFormacao];

export const ClassificacaoDado = {
  PUBLICO: 'PUBLICO',
  INTERNO: 'INTERNO',
  SENSIVEL: 'SENSIVEL',
  CRITICO: 'CRITICO',
} as const;
export type ClassificacaoDado = (typeof ClassificacaoDado)[keyof typeof ClassificacaoDado];
