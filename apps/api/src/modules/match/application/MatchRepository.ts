import { Op } from 'sequelize';

import { AlocacaoStatus, ProfessorStatus } from '@cebees/shared-types';

import {
  Alocacao,
  Disciplina,
  DisciplinaEspecialidade,
  Disponibilidade,
  HistoricoAtuacao,
  Professor,
  ProfessorEspecialidade,
  Turma,
} from '../../../db/models/index.js';

export interface CandidatoRaw {
  professor: Professor;
  especialidades: ProfessorEspecialidade[];
  disponibilidades: Disponibilidade[];
  alocacoesAtivas: Alocacao[];
  historicos: HistoricoAtuacao[];
}

export async function carregarTurmaComDisciplina(turmaId: number): Promise<{
  turma: Turma;
  disciplina: Disciplina;
  especialidadesDisciplina: DisciplinaEspecialidade[];
} | null> {
  const turma = await Turma.findByPk(turmaId, {
    include: [{ model: Disciplina, as: 'disciplina' }],
  });
  if (!turma) return null;
  const disciplina = (turma as Turma & { disciplina?: Disciplina }).disciplina;
  if (!disciplina) return null;

  const especialidadesDisciplina = await DisciplinaEspecialidade.findAll({
    where: { disciplinaId: disciplina.id },
  });

  return { turma, disciplina, especialidadesDisciplina };
}

export async function carregarCandidatos(
  especialidadeIds: number[],
): Promise<CandidatoRaw[]> {
  if (especialidadeIds.length === 0) return [];

  const profsEsp = await ProfessorEspecialidade.findAll({
    where: { especialidadeId: { [Op.in]: especialidadeIds } },
  });
  const professorIds = [...new Set(profsEsp.map((pe) => pe.professorId))];
  if (professorIds.length === 0) return [];

  const [professores, todasEsp, disp, aloc, hist] = await Promise.all([
    Professor.findAll({
      where: { id: { [Op.in]: professorIds }, status: ProfessorStatus.ATIVO },
    }),
    ProfessorEspecialidade.findAll({ where: { professorId: { [Op.in]: professorIds } } }),
    Disponibilidade.findAll({ where: { professorId: { [Op.in]: professorIds } } }),
    Alocacao.findAll({
      where: {
        professorId: { [Op.in]: professorIds },
        status: { [Op.in]: [AlocacaoStatus.CONFIRMADA, AlocacaoStatus.ATIVA] },
      },
      include: [{ model: Turma, as: 'turma' }],
    }),
    HistoricoAtuacao.findAll({ where: { professorId: { [Op.in]: professorIds } } }),
  ]);

  return professores.map((professor) => ({
    professor,
    especialidades: todasEsp.filter((e) => e.professorId === professor.id),
    disponibilidades: disp.filter((d) => d.professorId === professor.id),
    alocacoesAtivas: aloc.filter((a) => a.professorId === professor.id),
    historicos: hist.filter((h) => h.professorId === professor.id),
  }));
}
