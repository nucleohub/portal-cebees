import {
  ProfessorStatus,
  type DiaSemana,
  type DisponibilidadePeriodo,
  type HorarioTurmaDto,
  type TipoCurso,
} from '@cebees/shared-types';

import { professorAtendeTipoCurso, type ProfessorCourseFit } from './CourseTypeRules.js';

export interface DocumentoStatus {
  tipo: 'RG' | 'CPF' | 'DIPLOMA' | 'CERTIDAO_NEGATIVA';
  dataValidade?: Date;
}

export interface ProfessorParaFiltro {
  id: number;
  status: ProfessorStatus;
  documentos: DocumentoStatus[];
  especialidadesRequeridasAtendidas: boolean;
  experienciaAnos: number;
  nivelMaxProficiencia: number;
  formacaoMaisAlta?: string;
  horasJaAlocadasSemana: number;
  disciplinasAtivas: number;
  horariosOcupados: HorarioTurmaDto[];
  horariosDisponiveis: Array<{
    diaSemana: DiaSemana;
    periodo: DisponibilidadePeriodo;
    horaInicio: string;
    horaFim: string;
  }>;
}

export interface ContextoTurma {
  tipoCurso: TipoCurso;
  cargaHorariaSemanal: number;
  horarios: HorarioTurmaDto[];
}

export interface ResultadoFiltro {
  aprovado: boolean;
  motivos: string[];
}

const DOCUMENTOS_OBRIGATORIOS: DocumentoStatus['tipo'][] = [
  'RG',
  'CPF',
  'DIPLOMA',
  'CERTIDAO_NEGATIVA',
];

const LIMITE_HORAS_SEMANA = 40;
const LIMITE_DISCIPLINAS_SIMULTANEAS = 5;

export function filtrarProfessor(
  professor: ProfessorParaFiltro,
  turma: ContextoTurma,
  now: Date = new Date(),
): ResultadoFiltro {
  const motivos: string[] = [];

  if (professor.status !== ProfessorStatus.ATIVO) {
    motivos.push(`Status ${professor.status} (requer ATIVO)`);
  }

  const tiposDoc = new Set(professor.documentos.map((d) => d.tipo));
  for (const obrig of DOCUMENTOS_OBRIGATORIOS) {
    if (!tiposDoc.has(obrig)) motivos.push(`Documento ${obrig} ausente`);
  }
  for (const doc of professor.documentos) {
    if (doc.dataValidade && doc.dataValidade.getTime() < now.getTime()) {
      motivos.push(`Documento ${doc.tipo} vencido`);
    }
  }

  if (temConflito(professor.horariosOcupados, turma.horarios)) {
    motivos.push('Conflito de horário com alocações ativas');
  }

  if (!cobreHorarios(professor.horariosDisponiveis, turma.horarios)) {
    motivos.push('Disponibilidade não cobre os horários da turma');
  }

  if (professor.horasJaAlocadasSemana + turma.cargaHorariaSemanal > LIMITE_HORAS_SEMANA) {
    motivos.push(
      `Limite semanal excedido (${professor.horasJaAlocadasSemana}+${turma.cargaHorariaSemanal} > ${LIMITE_HORAS_SEMANA})`,
    );
  }

  if (professor.disciplinasAtivas >= LIMITE_DISCIPLINAS_SIMULTANEAS) {
    motivos.push(`Já possui ${professor.disciplinasAtivas} disciplinas simultâneas (limite ${LIMITE_DISCIPLINAS_SIMULTANEAS})`);
  }

  if (!professor.especialidadesRequeridasAtendidas) {
    motivos.push('Especialidades mínimas da disciplina não atendidas');
  }

  const fit: ProfessorCourseFit = {
    nivelMaxProficiencia: Math.max(1, Math.min(5, professor.nivelMaxProficiencia)) as 1 | 2 | 3 | 4 | 5,
    experienciaAnos: professor.experienciaAnos,
    formacaoMaisAlta: professor.formacaoMaisAlta,
  };
  const cursoFit = professorAtendeTipoCurso(turma.tipoCurso, fit);
  if (!cursoFit.atende) motivos.push(...cursoFit.motivos);

  return { aprovado: motivos.length === 0, motivos };
}

function temConflito(
  ocupados: HorarioTurmaDto[],
  novos: HorarioTurmaDto[],
): boolean {
  for (const a of ocupados) {
    for (const b of novos) {
      if (a.diaSemana !== b.diaSemana) continue;
      if (a.horaInicio < b.horaFim && b.horaInicio < a.horaFim) return true;
    }
  }
  return false;
}

function cobreHorarios(
  disponiveis: ProfessorParaFiltro['horariosDisponiveis'],
  requeridos: HorarioTurmaDto[],
): boolean {
  for (const req of requeridos) {
    const match = disponiveis.some(
      (d) =>
        d.diaSemana === req.diaSemana &&
        d.horaInicio <= req.horaInicio &&
        d.horaFim >= req.horaFim,
    );
    if (!match) return false;
  }
  return true;
}
