import type { DiaSemana, DisponibilidadePeriodo } from '../enums.js';
export interface DisponibilidadeDto {
    id: number;
    professorId: number;
    diaSemana: DiaSemana;
    periodo: DisponibilidadePeriodo;
    horaInicio: string;
    horaFim: string;
    createdAt: string;
    updatedAt: string;
}
export interface UpsertDisponibilidadeDto {
    diaSemana: DiaSemana;
    periodo: DisponibilidadePeriodo;
    horaInicio: string;
    horaFim: string;
}
//# sourceMappingURL=disponibilidade.d.ts.map