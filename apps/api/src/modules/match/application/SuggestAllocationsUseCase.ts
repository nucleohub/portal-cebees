import {
  AlocacaoStatus,
  TOP_N_SUGGESTIONS,
  type HorarioTurmaDto,
  type MatchSuggestion,
  type NivelProficiencia,
} from '@cebees/shared-types';

import { NotFoundError } from '../../../config/errors.js';
import { matchSuggestionsHistogram, matchSuggestionsTotal } from '../../../config/metrics.js';
import { Alocacao } from '../../../db/models/index.js';
import { filtrarProfessor, type ProfessorParaFiltro } from '../domain/scoring/ExclusionFilters.js';
import {
  computeScore,
  type EspecialidadeAderencia,
  type FeedbackPonto,
  type HistoricoPonto,
} from '../domain/scoring/ScoreCalculator.js';

import {
  carregarCandidatos,
  carregarTurmaComDisciplina,
  type CandidatoRaw,
} from './MatchRepository.js';

export interface SuggestOptions {
  topN?: number;
  includeFiltered?: boolean;
  now?: Date;
}

export interface SuggestResult {
  turmaId: number;
  sugestoes: MatchSuggestion[];
  filtrados: Array<{ professorId: number; nome: string; motivos: string[] }>;
}

export async function suggestAllocations(
  turmaId: number,
  opts: SuggestOptions = {},
  projetoId?: number,
): Promise<SuggestResult> {
  const ctx = await carregarTurmaComDisciplina(turmaId);
  if (!ctx) throw new NotFoundError('Turma', turmaId);

  const { turma, disciplina, especialidadesDisciplina } = ctx;
  const especialidadeIds = especialidadesDisciplina.map((e) => e.especialidadeId);
  const candidatos = await carregarCandidatos(especialidadeIds);

  const topN = opts.topN ?? TOP_N_SUGGESTIONS;
  const now = opts.now ?? new Date();

  const cargaHorariaSemanal = estimarCargaSemanal(turma.horarios, turma.cargaHorariaTotal);

  const sugestoes: MatchSuggestion[] = [];
  const filtrados: SuggestResult['filtrados'] = [];

  for (const cand of candidatos) {
    const filtro = montarFiltroInput(cand, turma.horarios, cargaHorariaSemanal);
    const resultado = filtrarProfessor(
      filtro,
      {
        tipoCurso: turma.tipoCurso,
        cargaHorariaSemanal,
        horarios: turma.horarios,
      },
      now,
    );

    if (!resultado.aprovado) {
      filtrados.push({
        professorId: cand.professor.id,
        nome: cand.professor.nomeCompleto,
        motivos: resultado.motivos,
      });
      continue;
    }

    const score = calcularScoreCandidato(cand, turma.horarios, especialidadesDisciplina, now, {
      tipoCurso: turma.tipoCurso,
      nivelMaxProficiencia: filtro.nivelMaxProficiencia as NivelProficiencia,
      experienciaAnos: cand.professor.experienciaAnos,
      formacaoMaisAlta: filtro.formacaoMaisAlta,
    });

    sugestoes.push({
      professorId: cand.professor.id,
      nome: cand.professor.nomeCompleto,
      score,
      explicacao: construirExplicacao(cand, score),
    });
  }

  sugestoes.sort((a, b) => b.score.total - a.score.total);
  const topo = sugestoes.slice(0, topN);

  for (const s of topo) {
    matchSuggestionsHistogram.observe(s.score.total);
    matchSuggestionsTotal.inc({ tipo_curso: turma.tipoCurso });
  }

  const idMap = await persistirSugestoes(turma.id, topo, projetoId);

  return {
    turmaId: turma.id,
    sugestoes: topo.map((s) => ({ ...s, alocacaoId: idMap.get(s.professorId) })),
    filtrados: opts.includeFiltered ? filtrados : [],
  };
  // suppress unused warning on disciplina when exported downstream
  void disciplina;
}

function montarFiltroInput(
  cand: CandidatoRaw,
  horariosTurma: HorarioTurmaDto[],
  cargaHorariaSemanal: number,
): ProfessorParaFiltro {
  void horariosTurma;
  void cargaHorariaSemanal;
  const formacaoMaisAlta = extrairFormacaoMaisAlta(cand.professor.formacoes);
  const horasJaAlocadasSemana = cand.alocacoesAtivas.reduce((sum, a) => {
    const turmaDoAloc = (a as Alocacao & { turma?: { horarios?: HorarioTurmaDto[] } }).turma;
    if (!turmaDoAloc?.horarios) return sum;
    return sum + estimarCargaSemanalHorarios(turmaDoAloc.horarios);
  }, 0);

  const disciplinasAtivas = cand.alocacoesAtivas.length;

  const horariosOcupados: HorarioTurmaDto[] = cand.alocacoesAtivas.flatMap((a) => {
    const t = (a as Alocacao & { turma?: { horarios?: HorarioTurmaDto[] } }).turma;
    return t?.horarios ?? [];
  });

  const nivelMax = Math.max(
    1,
    ...cand.especialidades.map((e) => e.nivelProficiencia),
  );

  return {
    id: cand.professor.id,
    status: cand.professor.status,
    documentos: [
      { tipo: 'RG' },
      { tipo: 'CPF' },
      { tipo: 'DIPLOMA' },
      { tipo: 'CERTIDAO_NEGATIVA' },
    ],
    especialidadesRequeridasAtendidas: cand.especialidades.length > 0,
    experienciaAnos: cand.professor.experienciaAnos,
    nivelMaxProficiencia: nivelMax,
    formacaoMaisAlta,
    horasJaAlocadasSemana,
    disciplinasAtivas,
    horariosOcupados,
    horariosDisponiveis: cand.disponibilidades.map((d) => ({
      diaSemana: d.diaSemana as 1 | 2 | 3 | 4 | 5 | 6 | 7,
      periodo: d.periodo,
      horaInicio: d.horaInicio.slice(0, 5),
      horaFim: d.horaFim.slice(0, 5),
    })),
  };
}

function calcularScoreCandidato(
  cand: CandidatoRaw,
  horariosTurma: HorarioTurmaDto[],
  especialidadesDisciplina: Array<{ especialidadeId: number; peso: number }>,
  now: Date,
  ctx: {
    tipoCurso: ReturnType<typeof String> extends never ? never : import('@cebees/shared-types').TipoCurso;
    nivelMaxProficiencia: NivelProficiencia;
    experienciaAnos: number;
    formacaoMaisAlta?: string;
  },
) {
  const especialidadesDaDisciplina: EspecialidadeAderencia[] = especialidadesDisciplina.map((ed) => {
    const match = cand.especialidades.find((pe) => pe.especialidadeId === ed.especialidadeId);
    return {
      peso: Number(ed.peso),
      nivelProfessor: match ? (match.nivelProficiencia as NivelProficiencia) : null,
    };
  });

  const nivelPrincipal =
    cand.especialidades.length > 0
      ? (Math.max(...cand.especialidades.map((e) => e.nivelProficiencia)) as NivelProficiencia)
      : (1 as NivelProficiencia);

  const historicos: HistoricoPonto[] = cand.historicos.map((h) => ({
    dataFim: new Date(h.dataFim),
    avaliacaoCoordenacao: h.avaliacaoCoordenacao !== null ? Number(h.avaliacaoCoordenacao) : null,
  }));
  const feedbacks: FeedbackPonto[] = cand.historicos.map((h) => ({
    dataFim: new Date(h.dataFim),
    avaliacaoAlunos: h.avaliacaoAlunos !== null ? Number(h.avaliacaoAlunos) : null,
  }));

  return computeScore(
    {
      especialidadesDaDisciplina,
      nivelProficienciaPrincipal: nivelPrincipal,
      coberturaHoraria: {
        disponivel: cand.disponibilidades.map((d) => ({
          diaSemana: d.diaSemana,
          horaInicio: d.horaInicio.slice(0, 5),
          horaFim: d.horaFim.slice(0, 5),
        })),
        requerido: horariosTurma,
      },
      historicos,
      feedbacks,
      tipoCurso: ctx.tipoCurso,
      experienciaAnos: ctx.experienciaAnos,
      nivelMaxProficiencia: ctx.nivelMaxProficiencia,
      formacaoMaisAlta: ctx.formacaoMaisAlta,
    },
    now,
  );
}

function extrairFormacaoMaisAlta(formacoes: Array<{ nivel: string }>): string | undefined {
  const ordem = ['MEDIO', 'TECNICO', 'GRADUACAO', 'ESPECIALIZACAO', 'MESTRADO', 'DOUTORADO'];
  let max = -1;
  let nivelMax: string | undefined;
  for (const f of formacoes) {
    const idx = ordem.indexOf(f.nivel);
    if (idx > max) {
      max = idx;
      nivelMax = f.nivel;
    }
  }
  return nivelMax;
}

function estimarCargaSemanal(horarios: HorarioTurmaDto[], total: number): number {
  const semanal = estimarCargaSemanalHorarios(horarios);
  return semanal > 0 ? semanal : total;
}

function estimarCargaSemanalHorarios(horarios: HorarioTurmaDto[]): number {
  return horarios.reduce((sum, h) => {
    const [hi, mi] = h.horaInicio.split(':').map(Number);
    const [hf, mf] = h.horaFim.split(':').map(Number);
    const inicio = (hi ?? 0) * 60 + (mi ?? 0);
    const fim = (hf ?? 0) * 60 + (mf ?? 0);
    return sum + Math.max(0, (fim - inicio) / 60);
  }, 0);
}

function construirExplicacao(
  cand: CandidatoRaw,
  score: MatchSuggestion['score'],
): string[] {
  const exp: string[] = [];
  exp.push(`Score total ${score.total.toFixed(1)} (breakdown ponderado)`);
  if (cand.especialidades.length > 0) {
    const nivelMax = Math.max(...cand.especialidades.map((e) => e.nivelProficiencia));
    exp.push(`Nível de proficiência máximo ${nivelMax}`);
  }
  if (cand.historicos.length > 0) {
    exp.push(`${cand.historicos.length} atuação(ões) registradas`);
  } else {
    exp.push('Sem histórico — desempenho/feedback neutros (50 pontos cada)');
  }
  return exp;
}

async function persistirSugestoes(
  turmaId: number,
  sugestoes: MatchSuggestion[],
  projetoId?: number,
): Promise<Map<number, number>> {
  await Alocacao.destroy({
    where: { turmaId, status: AlocacaoStatus.SUGERIDA },
  });
  const idMap = new Map<number, number>(); // professorId → alocacaoId
  for (const s of sugestoes) {
    const al = await Alocacao.create({
      turmaId,
      professorId: s.professorId,
      projetoId: projetoId ?? null,
      status: AlocacaoStatus.SUGERIDA,
      scoreTotal: s.score.total,
      scoreBreakdown: s.score,
      explicacao: s.explicacao,
      dataSugestao: new Date(),
      dataConfirmacao: null,
      dataInicio: null,
      dataFim: null,
      justificativa: null,
      motivoCancelamento: null,
      confirmadoPor: null,
    });
    idMap.set(s.professorId, al.id);
  }
  return idMap;
}
