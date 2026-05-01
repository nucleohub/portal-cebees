import type { ContratoStatus } from '../enums.js';
export interface ContratoDto {
    id: number;
    numero: string;
    alocacaoId: number;
    professorId: number;
    professorNome: string;
    turmaCodigo: string;
    valorHora: number;
    cargaHoraria: number;
    valorTotal: number;
    status: ContratoStatus;
    pdfUrl?: string;
    envelopeAssinaturaId?: string;
    dataEnvio?: string;
    dataAssinatura?: string;
    createdAt: string;
    updatedAt: string;
}
export interface CreateContratoDto {
    alocacaoId: number;
    valorHora: number;
    cargaHoraria: number;
}
export interface SendSignatureDto {
    emails: string[];
    provider?: 'docusign' | 'clicksign' | 'adobesign';
}
//# sourceMappingURL=contrato.d.ts.map