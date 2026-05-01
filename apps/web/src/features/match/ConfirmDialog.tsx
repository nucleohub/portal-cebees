import { useState } from 'react';

import { ScoreBadge } from '../../shared/components/ScoreBadge.js';
import { ScoreBreakdownCard } from '../../shared/components/ScoreBreakdownCard.js';
import { useConfirmAlocacao } from '../../shared/api/hooks/useMatch.js';
import type { MatchSuggestion } from '../../shared/api/hooks/useMatch.js';

const GREEN = '#0E5107';
const GREEN_LIGHT = '#e8f5e3';
const GRAY = '#606060';
const MIN_SCORE = 60;
const MIN_JUSTIFICATIVA = 20;

interface ConfirmDialogProps {
  suggestion: MatchSuggestion;
  open: boolean;
  onClose: () => void;
  onConfirmed: () => void;
}

export function ConfirmDialog({ suggestion, open, onClose, onConfirmed }: ConfirmDialogProps) {
  const [justificativa, setJustificativa] = useState('');
  const [valorHora, setValorHora] = useState('');
  const [apiError, setApiError] = useState('');

  const confirm = useConfirmAlocacao();
  const needsJustificativa = suggestion.scoreTotal < MIN_SCORE;
  const canConfirm = !needsJustificativa || justificativa.trim().length >= MIN_JUSTIFICATIVA;

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setApiError('');
    try {
      await confirm.mutateAsync({
        id: suggestion.alocacaoId,
        justificativa: justificativa.trim() || undefined,
        valorHora: valorHora ? Number(valorHora) : undefined,
      });
      onConfirmed();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      setApiError(err?.response?.data?.error?.message ?? 'Erro ao confirmar alocação.');
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, backdropFilter: 'blur(2px)' }}
      />

      {/* Dialog */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%', maxWidth: 540,
        background: 'white',
        borderRadius: 16,
        border: '1px solid #e5e7eb',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        zIndex: 1110,
        fontFamily: '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>Confirmar Alocação</div>
            <div style={{ fontSize: 12, color: GRAY, marginTop: 2 }}>Revise e confirme antes de gerar o contrato</div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #e5e7eb', background: 'none', cursor: 'pointer', fontSize: 16, color: GRAY, fontFamily: 'inherit' }}
          >×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>
          {/* Professor summary */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16,
            padding: '14px 16px', background: '#f9fafb', borderRadius: 10,
            border: '1px solid #e5e7eb',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: GREEN, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, flexShrink: 0,
            }}>
              {suggestion.professorNome.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('')}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{suggestion.professorNome}</div>
              <div style={{ fontSize: 12, color: GRAY }}>Professor selecionado</div>
            </div>
            <ScoreBadge score={suggestion.scoreTotal} size={60} />
          </div>

          {/* Breakdown */}
          <div style={{ marginBottom: 16 }}>
            <ScoreBreakdownCard breakdown={suggestion.scoreBreakdown} />
          </div>

          {/* RN-018: Justificativa when score < 60 */}
          {needsJustificativa && (
            <div style={{
              marginBottom: 16, padding: '12px 14px',
              background: '#fef2f2', border: '1px solid #fecaca',
              borderLeft: '4px solid #dc2626', borderRadius: 8,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#7f1d1d', marginBottom: 4 }}>
                ⚠️ RN-018 — Justificativa obrigatória (score &lt; 60)
              </div>
              <div style={{ fontSize: 12, color: '#991b1b', marginBottom: 10, lineHeight: 1.5 }}>
                O PDR exige justificativa explícita para alocação abaixo do score mínimo.
                Mínimo {MIN_JUSTIFICATIVA} caracteres — registrado no log de auditoria.
              </div>
              <textarea
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Ex: Professor é especialista reconhecido e a disciplina iniciou sem alternativa viável..."
                rows={3}
                style={{
                  width: '100%', padding: '8px 10px',
                  border: '1px solid #fecaca', borderRadius: 8,
                  fontFamily: 'inherit', fontSize: 13, resize: 'vertical',
                  outline: 'none', background: 'white', boxSizing: 'border-box',
                }}
              />
              <div style={{ fontSize: 11, color: justificativa.length < MIN_JUSTIFICATIVA ? '#dc2626' : '#16a34a', marginTop: 4, fontWeight: 600 }}>
                {justificativa.length}/{MIN_JUSTIFICATIVA} caracteres mínimos
              </div>
            </div>
          )}

          {/* Optional: score >= 60 — optional justificativa */}
          {!needsJustificativa && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                Observação (opcional)
              </label>
              <textarea
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Justificativa ou observações adicionais..."
                rows={2}
                style={{
                  width: '100%', padding: '8px 10px',
                  border: '1px solid #e5e7eb', borderRadius: 8,
                  fontFamily: 'inherit', fontSize: 13, resize: 'vertical',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {/* Valor/hora */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
              Valor/hora (R$) — opcional
            </label>
            <input
              type="number"
              value={valorHora}
              onChange={(e) => setValorHora(e.target.value)}
              min={0}
              step={0.01}
              placeholder="Ex: 120.00"
              style={{
                width: '100%', padding: '8px 12px',
                border: '1px solid #e5e7eb', borderRadius: 8,
                fontFamily: 'inherit', fontSize: 13, outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* API error */}
          {apiError && (
            <div style={{ marginBottom: 14, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
              ⚠ {apiError}
            </div>
          )}

          {/* Score OK badge */}
          {!needsJustificativa && (
            <div style={{
              padding: '8px 12px', background: GREEN_LIGHT,
              border: `1px solid ${GREEN}44`, borderRadius: 8,
              fontSize: 12, color: GREEN, fontWeight: 600, marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span>✓</span> Score ≥ 60 — alocação automática disponível (RN-017)
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex', gap: 10, justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            disabled={confirm.isPending}
            style={{
              padding: '9px 20px', borderRadius: 8,
              border: '1.5px solid #e5e7eb', background: 'white',
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
              color: '#374151', fontFamily: 'inherit',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirm.isPending || !canConfirm}
            style={{
              padding: '9px 20px', borderRadius: 8,
              border: 'none', background: !canConfirm || confirm.isPending ? '#9ca3af' : GREEN,
              cursor: !canConfirm || confirm.isPending ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 700,
              color: 'white', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {confirm.isPending ? (
              <>
                <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                Confirmando...
              </>
            ) : '✓ Confirmar Alocação'}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
