export type RuleCode = `RN-${string}`;
export interface RuleViolation {
    code: RuleCode;
    message: string;
    field?: string;
    context?: Record<string, unknown>;
}
export declare class BusinessRuleError extends Error {
    readonly code: RuleCode;
    readonly field?: string;
    readonly context?: Record<string, unknown>;
    constructor(violation: RuleViolation);
}
export declare const RULE_CATALOG: {
    readonly 'RN-001': "Professor deve ter CPF único e válido";
    readonly 'RN-002': "Professor deve ter ao menos uma formação registrada";
    readonly 'RN-003': "Documentos obrigatórios: RG, CPF, Diploma, Certidão Negativa";
    readonly 'RN-004': "Email profissional deve ser único no sistema";
    readonly 'RN-005': "Professor deve ter ao menos uma especialidade cadastrada";
    readonly 'RN-006': "Nível de proficiência deve ser entre 1 (Iniciante) e 5 (Referência)";
    readonly 'RN-007': "Documentos próximos da expiração (≤30 dias) geram alerta automático";
    readonly 'RN-008': "Especialidade só pode ser removida se não houver alocações ativas";
    readonly 'RN-009': "Disponibilidade registrada por dia da semana e período (manhã/tarde/noite)";
    readonly 'RN-010': "Alterações de disponibilidade exigem antecedência mínima de 48h";
    readonly 'RN-011': "Conflitos de horário entre alocações ativas são bloqueados";
    readonly 'RN-012': "Limite máximo de 40h semanais de alocação por professor";
    readonly 'RN-013': "Limite máximo de 5 disciplinas simultâneas por professor";
    readonly 'RN-014': "Sistema sugere automaticamente os top 5 professores por score";
    readonly 'RN-015': "Filtros de exclusão eliminam candidatos antes do ranqueamento";
    readonly 'RN-016': "Score mínimo de 60 exigido para confirmação automática";
    readonly 'RN-017': "Alocação com score ≥60 pode ser auto-confirmada sem justificativa";
    readonly 'RN-018': "Alocação manual com score <60 requer justificativa registrada";
    readonly 'RN-019': "Transição de estado deve seguir SUGERIDA→CONFIRMADA→ATIVA→CONCLUIDA";
    readonly 'RN-020': "Cancelamento exige motivo e gera notificação ao professor";
    readonly 'RN-021': "Alocação confirmada gera contrato automaticamente";
    readonly 'RN-022': "Contrato segue formato CONT-YYYY-NNNNN único sequencial";
    readonly 'RN-023': "Contrato em RASCUNHO pode ser editado; ENVIADO não";
    readonly 'RN-024': "Assinatura eletrônica obrigatória antes de transição para ATIVO";
    readonly 'RN-025': "Encerramento antecipado exige aprovação de Coordenador";
    readonly 'RN-026': "Remuneração calculada por hora/aula definida no contrato";
    readonly 'RN-027': "Contrato expirado não permite novas alocações vinculadas";
    readonly 'RN-028': "Cursos Livres: nível mínimo 1, sem formação obrigatória";
    readonly 'RN-029': "Cursos Livres: sem exigência de experiência prévia";
    readonly 'RN-030': "CBMF: nível mínimo 2, experiência mínima 2 anos";
    readonly 'RN-031': "CBMF: conformidade com diretrizes do Corpo de Bombeiros";
    readonly 'RN-032': "Formação Profissional: nível mínimo 2, experiência 2 anos";
    readonly 'RN-033': "Formação Profissional: conformidade com catálogo MEC";
    readonly 'RN-034': "Tecnólogo: nível mínimo 3, graduação, experiência 3 anos";
    readonly 'RN-035': "Tecnólogo: professor deve ter registro MEC";
    readonly 'RN-036': "Pós-graduação: nível mínimo 4, mestrado, experiência 5 anos";
    readonly 'RN-037': "Pós-graduação: preferência para doutores em critério de desempate";
    readonly 'RN-038': "Tipo de curso compõe 5% do score final";
    readonly 'RN-039': "Cursos especiais podem definir regras adicionais por configuração";
    readonly 'RN-040': "Histórico de atuação é registrado ao concluir alocação";
    readonly 'RN-041': "Avaliação do aluno (NPS) alimenta critério de feedback";
    readonly 'RN-042': "Score de desempenho pondera por recência da atuação";
    readonly 'RN-043': "Histórico negativo (<3.0) sinaliza para revisão pela coordenação";
    readonly 'RN-044': "Autenticação via JWT com refresh token rotativo";
    readonly 'RN-045': "Senhas armazenadas com bcrypt (cost ≥12)";
    readonly 'RN-046': "Dados sensíveis (CPF, RG) criptografados AES-256 em repouso";
    readonly 'RN-047': "Toda escrita gera registro em audit_log retido por 5 anos";
    readonly 'RN-048': "LGPD: consentimento explícito, direito à exportação e esquecimento";
};
export type KnownRuleCode = keyof typeof RULE_CATALOG;
export declare function ruleMessage(code: KnownRuleCode): string;
//# sourceMappingURL=rules.d.ts.map