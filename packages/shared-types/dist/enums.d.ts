export declare const ProfessorStatus: {
    readonly ATIVO: "ATIVO";
    readonly INATIVO: "INATIVO";
    readonly SUSPENSO: "SUSPENSO";
};
export type ProfessorStatus = (typeof ProfessorStatus)[keyof typeof ProfessorStatus];
export declare const AlocacaoStatus: {
    readonly SUGERIDA: "SUGERIDA";
    readonly CONFIRMADA: "CONFIRMADA";
    readonly ATIVA: "ATIVA";
    readonly CONCLUIDA: "CONCLUIDA";
    readonly CANCELADA: "CANCELADA";
};
export type AlocacaoStatus = (typeof AlocacaoStatus)[keyof typeof AlocacaoStatus];
export declare const ContratoStatus: {
    readonly RASCUNHO: "RASCUNHO";
    readonly ENVIADO: "ENVIADO";
    readonly ASSINADO: "ASSINADO";
    readonly ATIVO: "ATIVO";
    readonly ENCERRADO: "ENCERRADO";
};
export type ContratoStatus = (typeof ContratoStatus)[keyof typeof ContratoStatus];
export declare const TurmaStatus: {
    readonly PLANEJADA: "PLANEJADA";
    readonly ATIVA: "ATIVA";
    readonly CONCLUIDA: "CONCLUIDA";
    readonly CANCELADA: "CANCELADA";
};
export type TurmaStatus = (typeof TurmaStatus)[keyof typeof TurmaStatus];
export declare const DisponibilidadePeriodo: {
    readonly MANHA: "MANHA";
    readonly TARDE: "TARDE";
    readonly NOITE: "NOITE";
};
export type DisponibilidadePeriodo = (typeof DisponibilidadePeriodo)[keyof typeof DisponibilidadePeriodo];
export declare const DiaSemana: {
    readonly SEGUNDA: 1;
    readonly TERCA: 2;
    readonly QUARTA: 3;
    readonly QUINTA: 4;
    readonly SEXTA: 5;
    readonly SABADO: 6;
    readonly DOMINGO: 7;
};
export type DiaSemana = (typeof DiaSemana)[keyof typeof DiaSemana];
export declare const TipoCurso: {
    readonly CURSO_LIVRE: "CURSO_LIVRE";
    readonly CBMF: "CBMF";
    readonly FORMACAO_PROFISSIONAL: "FORMACAO_PROFISSIONAL";
    readonly TECNOLOGO: "TECNOLOGO";
    readonly POS_GRADUACAO: "POS_GRADUACAO";
};
export type TipoCurso = (typeof TipoCurso)[keyof typeof TipoCurso];
export declare const NivelProficiencia: {
    readonly INICIANTE: 1;
    readonly INTERMEDIARIO: 2;
    readonly AVANCADO: 3;
    readonly ESPECIALISTA: 4;
    readonly REFERENCIA: 5;
};
export type NivelProficiencia = (typeof NivelProficiencia)[keyof typeof NivelProficiencia];
export declare const Papel: {
    readonly ADMIN: "ADMIN";
    readonly COORDENADOR: "COORDENADOR";
    readonly SECRETARIA: "SECRETARIA";
    readonly PROFESSOR: "PROFESSOR";
    readonly ALUNO: "ALUNO";
};
export type Papel = (typeof Papel)[keyof typeof Papel];
export declare const NivelFormacao: {
    readonly MEDIO: "MEDIO";
    readonly TECNICO: "TECNICO";
    readonly GRADUACAO: "GRADUACAO";
    readonly ESPECIALIZACAO: "ESPECIALIZACAO";
    readonly MESTRADO: "MESTRADO";
    readonly DOUTORADO: "DOUTORADO";
};
export type NivelFormacao = (typeof NivelFormacao)[keyof typeof NivelFormacao];
export declare const ClassificacaoDado: {
    readonly PUBLICO: "PUBLICO";
    readonly INTERNO: "INTERNO";
    readonly SENSIVEL: "SENSIVEL";
    readonly CRITICO: "CRITICO";
};
export type ClassificacaoDado = (typeof ClassificacaoDado)[keyof typeof ClassificacaoDado];
export declare const ProjetoTipo: {
    /** Projeto gerido diretamente pela CEBEES */
    readonly INTERNO: "INTERNO";
    /** Ambiente com branding próprio (ex.: CBMF) gerido dentro da mesma plataforma */
    readonly SUB_AMBIENTE: "SUB_AMBIENTE";
};
export type ProjetoTipo = (typeof ProjetoTipo)[keyof typeof ProjetoTipo];
export declare const ProjetoStatus: {
    readonly ATIVO: "ATIVO";
    readonly INATIVO: "INATIVO";
};
export type ProjetoStatus = (typeof ProjetoStatus)[keyof typeof ProjetoStatus];
//# sourceMappingURL=enums.d.ts.map