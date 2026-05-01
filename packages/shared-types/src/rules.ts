export type RuleCode = `RN-${string}`;

export interface RuleViolation {
  code: RuleCode;
  message: string;
  field?: string;
  context?: Record<string, unknown>;
}

export class BusinessRuleError extends Error {
  public readonly code: RuleCode;
  public readonly field?: string;
  public readonly context?: Record<string, unknown>;

  constructor(violation: RuleViolation) {
    super(violation.message);
    this.name = 'BusinessRuleError';
    this.code = violation.code;
    this.field = violation.field;
    this.context = violation.context;
  }
}

export const RULE_CATALOG = {
  'RN-001': 'Professor deve ter CPF único e válido',
  'RN-002': 'Professor deve ter ao menos uma formação registrada',
  'RN-003': 'Documentos obrigatórios: RG, CPF, Diploma, Certidão Negativa',
  'RN-004': 'Email profissional deve ser único no sistema',
  'RN-005': 'Professor deve ter ao menos uma especialidade cadastrada',
  'RN-006': 'Nível de proficiência deve ser entre 1 (Iniciante) e 5 (Referência)',
  'RN-007': 'Documentos próximos da expiração (≤30 dias) geram alerta automático',
  'RN-008': 'Especialidade só pode ser removida se não houver alocações ativas',
  'RN-009': 'Disponibilidade registrada por dia da semana e período (manhã/tarde/noite)',
  'RN-010': 'Alterações de disponibilidade exigem antecedência mínima de 48h',
  'RN-011': 'Conflitos de horário entre alocações ativas são bloqueados',
  'RN-012': 'Limite máximo de 40h semanais de alocação por professor',
  'RN-013': 'Limite máximo de 5 disciplinas simultâneas por professor',
  'RN-014': 'Sistema sugere automaticamente os top 5 professores por score',
  'RN-015': 'Filtros de exclusão eliminam candidatos antes do ranqueamento',
  'RN-016': 'Score mínimo de 60 exigido para confirmação automática',
  'RN-017': 'Alocação com score ≥60 pode ser auto-confirmada sem justificativa',
  'RN-018': 'Alocação manual com score <60 requer justificativa registrada',
  'RN-019': 'Transição de estado deve seguir SUGERIDA→CONFIRMADA→ATIVA→CONCLUIDA',
  'RN-020': 'Cancelamento exige motivo e gera notificação ao professor',
  'RN-021': 'Alocação confirmada gera contrato automaticamente',
  'RN-022': 'Contrato segue formato CONT-YYYY-NNNNN único sequencial',
  'RN-023': 'Contrato em RASCUNHO pode ser editado; ENVIADO não',
  'RN-024': 'Assinatura eletrônica obrigatória antes de transição para ATIVO',
  'RN-025': 'Encerramento antecipado exige aprovação de Coordenador',
  'RN-026': 'Remuneração calculada por hora/aula definida no contrato',
  'RN-027': 'Contrato expirado não permite novas alocações vinculadas',
  'RN-028': 'Cursos Livres: nível mínimo 1, sem formação obrigatória',
  'RN-029': 'Cursos Livres: sem exigência de experiência prévia',
  'RN-030': 'CBMF: nível mínimo 2, experiência mínima 2 anos',
  'RN-031': 'CBMF: conformidade com diretrizes do Corpo de Bombeiros',
  'RN-032': 'Formação Profissional: nível mínimo 2, experiência 2 anos',
  'RN-033': 'Formação Profissional: conformidade com catálogo MEC',
  'RN-034': 'Tecnólogo: nível mínimo 3, graduação, experiência 3 anos',
  'RN-035': 'Tecnólogo: professor deve ter registro MEC',
  'RN-036': 'Pós-graduação: nível mínimo 4, mestrado, experiência 5 anos',
  'RN-037': 'Pós-graduação: preferência para doutores em critério de desempate',
  'RN-038': 'Tipo de curso compõe 5% do score final',
  'RN-039': 'Cursos especiais podem definir regras adicionais por configuração',
  'RN-040': 'Histórico de atuação é registrado ao concluir alocação',
  'RN-041': 'Avaliação do aluno (NPS) alimenta critério de feedback',
  'RN-042': 'Score de desempenho pondera por recência da atuação',
  'RN-043': 'Histórico negativo (<3.0) sinaliza para revisão pela coordenação',
  'RN-044': 'Autenticação via JWT com refresh token rotativo',
  'RN-045': 'Senhas armazenadas com bcrypt (cost ≥12)',
  'RN-046': 'Dados sensíveis (CPF, RG) criptografados AES-256 em repouso',
  'RN-047': 'Toda escrita gera registro em audit_log retido por 5 anos',
  'RN-048': 'LGPD: consentimento explícito, direito à exportação e esquecimento',
} as const satisfies Record<RuleCode, string>;

export type KnownRuleCode = keyof typeof RULE_CATALOG;

export function ruleMessage(code: KnownRuleCode): string {
  return RULE_CATALOG[code];
}
