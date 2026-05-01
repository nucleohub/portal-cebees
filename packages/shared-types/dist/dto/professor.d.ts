import type { NivelFormacao, ProfessorStatus } from '../enums.js';
export interface FormacaoDto {
    nivel: NivelFormacao;
    curso: string;
    instituicao: string;
    anoConclusao: number;
}
export interface DocumentoDto {
    id: number;
    tipo: 'RG' | 'CPF' | 'DIPLOMA' | 'CERTIDAO_NEGATIVA' | 'COMPROVANTE_RESIDENCIA' | 'OUTRO';
    url: string;
    nome: string;
    dataValidade?: string;
    hash: string;
    uploadedAt: string;
}
export interface ProfessorDto {
    id: number;
    nomeCompleto: string;
    cpf: string;
    rg: string;
    email: string;
    telefone?: string;
    dataNascimento: string;
    status: ProfessorStatus;
    formacoes: FormacaoDto[];
    experienciaAnos: number;
    createdAt: string;
    updatedAt: string;
}
export interface CreateProfessorDto {
    nomeCompleto: string;
    cpf: string;
    rg: string;
    email: string;
    telefone?: string;
    dataNascimento: string;
    formacoes: FormacaoDto[];
    experienciaAnos: number;
}
export type UpdateProfessorDto = Partial<CreateProfessorDto> & {
    status?: ProfessorStatus;
};
//# sourceMappingURL=professor.d.ts.map