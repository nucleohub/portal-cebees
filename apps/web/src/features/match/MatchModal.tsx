import { useState } from 'react';

import { ScoreBadge } from '../../shared/components/ScoreBadge.js';
import { ScoreBreakdownCard } from '../../shared/components/ScoreBreakdownCard.js';
import { useSuggest } from '../../shared/api/hooks/useMatch.js';
import type { MatchSuggestion } from '../../shared/api/hooks/useMatch.js';
import { ConfirmDialog } from './ConfirmDialog.js';

const GREEN = '#0E5107';
const GRAY = '#606060';

const RANK_COLORS = ['#d97706', '#9ca3af', '#cd7f32'];

function getInitials(nome: string): string {
  return nome.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

interface MatchModalProps {
  turmaId: number;
  turmaNome?: string;
  open: boolean;
  onClose: () => void;
}

export function MatchModal({ turmaId, turmaNome, open, onClose }: MatchModalProps) {
  const suggest = useSuggest(turmaId);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [selected, setSelected] = useState<MatchSuggestion | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<MatchSuggestion | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  if (!open) return null;

  const handleSuggest = () => { suggest.mutate(); };
  const handleConfirmed = () => {
    setConfirmTarget(null);
    setSelected(null);
    setSuccessMsg('Alocação confirmada com sucesso! Contrato gerado.');
    suggest.reset();
  };

  const suggestions = suggest.data ?? [];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          zIndex: 1000, backdropFilter: 'blur(2px)',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0,
        width: '100%', maxWidth: 720,
        height: '100vh',
        background: 'white',
        zIndex: 1001,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
        fontFamily: '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexShrink: 0,
          background: 'white',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>🎯</span>
              <span style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>Motor de Match — IA</span>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '2px 6px',
                borderRadius: 99, background: GREEN, color: 'white', letterSpacing: 0.5,
              }}>IA</span>
            </div>
            {turmaNome && (
              <div style={{ fontSize: 12, color: GRAY }}>
                Turma: <strong style={{ color: '#111827' }}>{turmaNome}</strong>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={handleSuggest}
              disabled={suggest.isPending}
              style={{
                padding: '8px 16px', background: suggest.isPending ? '#9ca3af' : GREEN,
                color: 'white', border: 'none', borderRadius: 8,
                fontSize: 13, fontWeight: 700, cursor: suggest.isPending ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {suggest.isPending ? (
                <>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  Processando...
                </>
              ) : suggestions.length > 0 ? '↻ Reprocessar' : '🔍 Sugerir Professores'}
            </button>
            <button
              onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GRAY, fontFamily: 'inherit' }}
            >×</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, padding: '20px 24px' }}>
          {/* Error */}
          {suggest.error && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
              ⚠ {(suggest.error as Error).message}
            </div>
          )}

          {/* Success */}
          {successMsg && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 8 }}>
              ✅ {successMsg}
            </div>
          )}

          {/* Empty state */}
          {suggestions.length === 0 && !suggest.isPending && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: GRAY }}>
              <div style={{ fontSize: 56, marginBottom: 12, opacity: 0.3 }}>🎯</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Clique em "Sugerir Professores" para rodar o motor de IA.</div>
              <div style={{ fontSize: 12, marginTop: 6, color: '#9ca3af' }}>
                Análise ponderada por especialidade, proficiência, disponibilidade e histórico.
              </div>
            </div>
          )}

          {/* Loading */}
          {suggest.isPending && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: GRAY }}>
              <div style={{ fontSize: 13 }}>Analisando {suggestions.length > 0 ? 'novamente ' : ''}professores disponíveis...</div>
            </div>
          )}

          {/* Suggestion cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {suggestions.map((s, idx) => {
              const isExpanded = expanded === idx;
              const isSelected = selected?.alocacaoId === s.alocacaoId;
              const rank = idx + 1;
              const rankColor = rank <= 3 ? RANK_COLORS[rank - 1] : '#9ca3af';

              return (
                <div key={s.alocacaoId} style={{
                  background: 'white',
                  borderRadius: 12,
                  border: isSelected ? `2px solid ${GREEN}` : '1.5px solid #e5e7eb',
                  boxShadow: isSelected ? `0 0 0 3px ${GREEN}22` : '0 1px 3px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'stretch' }}>
                    {/* Rank column */}
                    <div style={{
                      width: 48, flexShrink: 0,
                      background: rank <= 3 ? rankColor + '22' : '#f9fafb',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      borderRight: '1px solid #e5e7eb', gap: 2, padding: '8px 0',
                    }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: rank <= 3 ? rankColor : '#9ca3af' }}>#{rank}</div>
                      {rank === 1 && <div style={{ fontSize: 14 }}>🏆</div>}
                    </div>

                    {/* Main content */}
                    <div style={{ flex: 1, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        {/* Prof info */}
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: '50%',
                            background: GREEN, color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 700, flexShrink: 0,
                          }}>
                            {getInitials(s.professorNome)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{s.professorNome}</div>
                            <div style={{ fontSize: 11, color: GRAY }}>Professor</div>
                          </div>
                        </div>

                        {/* Score */}
                        <ScoreBadge score={s.scoreTotal} size={62} />

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                          <button
                            onClick={() => setExpanded(isExpanded ? null : idx)}
                            style={{
                              padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb',
                              background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                              color: GRAY, fontFamily: 'inherit',
                            }}
                          >
                            {isExpanded ? '▲ Fechar' : '▼ Detalhes'}
                          </button>
                          <button
                            onClick={() => setConfirmTarget(s)}
                            style={{
                              padding: '5px 12px', borderRadius: 6, border: 'none',
                              background: GREEN, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                              color: 'white', fontFamily: 'inherit',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                            }}
                          >
                            ✓ Confirmar
                          </button>
                        </div>
                      </div>

                      {/* Breakdown (expanded) */}
                      {isExpanded && (
                        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f3f4f6' }}>
                          <ScoreBreakdownCard breakdown={s.scoreBreakdown} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirm dialog */}
      {confirmTarget && (
        <ConfirmDialog
          suggestion={confirmTarget}
          open={!!confirmTarget}
          onClose={() => setConfirmTarget(null)}
          onConfirmed={handleConfirmed}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
