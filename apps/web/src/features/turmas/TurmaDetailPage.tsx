import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { StatusChip } from '../../shared/components/StatusChip.js';
import { ScoreBadge } from '../../shared/components/ScoreBadge.js';
import { useTurma } from '../../shared/api/hooks/useTurmas.js';
import { useAlocacoesTurma } from '../../shared/api/hooks/useAlocacoes.js';
import { TurmaStatus } from '@cebees/shared-types';
import type { AlocacaoDto } from '@cebees/shared-types';
import { MatchModal } from '../match/MatchModal.js';

const GREEN = '#0E5107';
const GREEN_LIGHT = '#e8f5e3';
const GRAY = '#606060';

const TIPO_LABEL: Record<string, string> = {
  CURSO_LIVRE: 'Curso Livre',
  CBMF: 'CBMF',
  FORMACAO_PROFISSIONAL: 'Formação Profissional',
  TECNOLOGO: 'Tecnólogo',
  POS_GRADUACAO: 'Pós-Graduação',
};

const DIA_LABEL: Record<number, string> = {
  1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb', 7: 'Dom',
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
      <span style={{ color: GRAY, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, paddingTop: 1 }}>{label}</span>
      <span style={{ color: '#374151', fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export function TurmaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'dados' | 'alocacoes'>('dados');
  const [matchOpen, setMatchOpen] = useState(false);

  const { data: turma, isLoading } = useTurma(id ? Number(id) : undefined);
  const { data: alocacoes = [], isLoading: loadingAloc } = useAlocacoesTurma(id ? Number(id) : undefined);

  if (isLoading) {
    return (
      <div style={{ padding: 28, display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 13, color: GRAY }}>Carregando...</div>
      </div>
    );
  }

  if (!turma) {
    return (
      <div style={{ padding: 28 }}>
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
          Turma não encontrada.
        </div>
      </div>
    );
  }

  const canSuggest = turma.status === TurmaStatus.PLANEJADA || turma.status === TurmaStatus.ATIVA;

  return (
    <div style={{ padding: 28, fontFamily: '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif' }}>
      {/* Back + header */}
      <button
        onClick={() => navigate('/turmas')}
        style={{ background: 'none', border: 'none', color: GRAY, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}
      >
        ← Voltar às turmas
      </button>

      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0 }}>{turma.nome}</h2>
            <StatusChip status={turma.status} />
          </div>
          <div style={{ fontSize: 13, color: GRAY, fontFamily: 'monospace' }}>{turma.codigo}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigate(`/turmas/${id}/editar`)}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e5e7eb',
              background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              color: '#374151', fontFamily: 'inherit',
            }}
          >
            ✏ Editar
          </button>
          <button
            onClick={() => canSuggest && setMatchOpen(true)}
            disabled={!canSuggest}
            title={!canSuggest ? 'Turma precisa estar PLANEJADA ou ATIVA' : ''}
            style={{
              padding: '8px 16px', borderRadius: 8, border: 'none',
              background: canSuggest ? GREEN : '#9ca3af',
              cursor: canSuggest ? 'pointer' : 'not-allowed',
              fontSize: 13, fontWeight: 700, color: 'white', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            🎯 Sugerir Professores
          </button>
        </div>
      </div>

      {/* Match CTA when no allocation */}
      {canSuggest && alocacoes.length === 0 && (
        <div style={{
          marginBottom: 20, padding: '14px 18px',
          background: GREEN_LIGHT, border: `1px solid ${GREEN}44`,
          borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ fontSize: 13, color: '#166534', fontWeight: 500 }}>
            <strong>Esta turma ainda não tem professor alocado.</strong> Use o motor de IA para encontrar o melhor match.
          </div>
          <button
            onClick={() => setMatchOpen(true)}
            style={{
              padding: '7px 16px', background: GREEN, color: 'white',
              border: 'none', borderRadius: 8, cursor: 'pointer',
              fontSize: 12, fontWeight: 700, fontFamily: 'inherit', flexShrink: 0,
            }}
          >
            🎯 Abrir Motor de Match
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, background: 'white', padding: 4, borderRadius: 10, border: '1px solid #e5e7eb', width: 'fit-content' }}>
        {(['dados', 'alocacoes'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: tab === t ? GREEN : 'transparent',
              color: tab === t ? 'white' : GRAY,
              fontFamily: 'inherit', fontWeight: 600, fontSize: 13, transition: 'all 0.15s',
            }}
          >
            {t === 'dados' ? 'Dados' : `Alocações (${alocacoes.length})`}
          </button>
        ))}
      </div>

      {/* Tab: Dados */}
      {tab === 'dados' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: GRAY, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Dados Principais</div>
            <InfoRow label="Disciplina" value={turma.disciplinaNome ?? '—'} />
            <InfoRow label="Tipo de Curso" value={TIPO_LABEL[turma.tipoCurso] ?? turma.tipoCurso} />
            <InfoRow label="Período" value={`${turma.dataInicio?.split('T')[0]} → ${turma.dataFim?.split('T')[0]}`} />
            <InfoRow label="Carga Horária" value={`${turma.cargaHorariaTotal}h`} />
            <InfoRow label="Vagas" value={`${turma.vagasOcupadas ?? 0} / ${turma.vagas}`} />
          </div>
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: GRAY, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Horários</div>
            {turma.horarios?.length ? turma.horarios.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: '#f9fafb', borderRadius: 8, marginBottom: 8, fontSize: 13 }}>
                <span style={{ fontWeight: 700, color: '#111827', minWidth: 28 }}>{DIA_LABEL[h.diaSemana] ?? h.diaSemana}</span>
                <span style={{ color: GRAY }}>{h.periodo}</span>
                <span style={{ marginLeft: 'auto', color: '#374151', fontFamily: 'monospace' }}>{h.horaInicio} – {h.horaFim}</span>
              </div>
            )) : (
              <div style={{ fontSize: 13, color: '#9ca3af' }}>Sem horários cadastrados.</div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Alocações */}
      {tab === 'alocacoes' && (
        <div>
          {loadingAloc ? (
            <div style={{ fontSize: 13, color: GRAY }}>Carregando...</div>
          ) : alocacoes.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
              Nenhuma alocação. Clique em "Sugerir Professores" para rodar o motor de IA.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {alocacoes.map((al: AlocacaoDto) => (
                <div key={al.id} style={{
                  background: 'white', borderRadius: 10, border: '1px solid #e5e7eb',
                  padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: 12,
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 4 }}>{al.professorNome}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StatusChip status={al.status} />
                      {al.dataConfirmacao && (
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>
                          Confirmado em {al.dataConfirmacao.split('T')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  {al.score && <ScoreBadge score={al.score.total} compact />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Match modal */}
      <MatchModal
        turmaId={Number(id)}
        turmaNome={turma.nome}
        open={matchOpen}
        onClose={() => setMatchOpen(false)}
      />
    </div>
  );
}
