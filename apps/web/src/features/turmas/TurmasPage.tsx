import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { StatusChip } from '../../shared/components/StatusChip.js';
import { useTurmas } from '../../shared/api/hooks/useTurmas.js';
import type { TurmaDto } from '@cebees/shared-types';

const GREEN = '#0E5107';
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

function formatHorarios(horarios?: TurmaDto['horarios']): string {
  if (!horarios?.length) return '—';
  return horarios.map((h) => `${DIA_LABEL[h.diaSemana] ?? h.diaSemana} ${h.horaInicio}–${h.horaFim}`).join(', ');
}

function getUrgColor(status: string): string {
  if (status === 'PLANEJADA') return '#dc2626';
  if (status === 'ATIVA') return '#16a34a';
  return '#9ca3af';
}

export function TurmasPage() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [busca, setBusca] = useState('');

  const { data, isLoading, error } = useTurmas({
    status: filterStatus || undefined,
    tipoCurso: filterTipo || undefined,
  });

  const filtered = (data ?? []).filter((t) => {
    if (!busca) return true;
    const q = busca.toLowerCase();
    return (
      t.nome?.toLowerCase().includes(q) ||
      t.codigo?.toLowerCase().includes(q) ||
      t.disciplinaNome?.toLowerCase().includes(q)
    );
  });

  const selectStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    background: 'white',
    color: '#374151',
    cursor: 'pointer',
  };

  return (
    <div style={{ padding: 28, fontFamily: '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Turmas</h2>
          <p style={{ fontSize: 13, color: GRAY, margin: '3px 0 0' }}>
            {(data ?? []).length} turma{(data?.length ?? 0) !== 1 ? 's' : ''} cadastrada{(data?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => navigate('/turmas/nova')}
          style={{
            padding: '9px 18px', background: GREEN, color: 'white',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          + Nova Turma
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar turma, disciplina, código..."
          style={{
            padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb',
            fontSize: 13, fontFamily: 'inherit', outline: 'none', width: 260,
          }}
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = GREEN; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'; }}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
          <option value="">Todos os status</option>
          <option value="PLANEJADA">Planejada</option>
          <option value="ATIVA">Ativa</option>
          <option value="CONCLUIDA">Concluída</option>
          <option value="CANCELADA">Cancelada</option>
        </select>
        <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} style={selectStyle}>
          <option value="">Todos os tipos</option>
          {Object.entries(TIPO_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af' }}>
          {filtered.length} de {(data ?? []).length} registros
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
          ⚠ {String(error)}
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              {['Disciplina / Código', 'Tipo', 'Horários', 'Vagas', 'Período', 'Status', ''].map((h) => (
                <th key={h} style={{
                  textAlign: 'left', padding: '8px 12px',
                  fontSize: 11, fontWeight: 700, color: GRAY,
                  letterSpacing: 0.5, textTransform: 'uppercase',
                  borderBottom: '2px solid #f3f4f6',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                  Carregando...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                  Nenhuma turma encontrada.
                </td>
              </tr>
            ) : filtered.map((t) => (
              <tr
                key={t.id}
                onClick={() => navigate(`/turmas/${t.id}`)}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#f9fafb'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'white'; }}
              >
                <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 4, height: 36, borderRadius: 2, background: getUrgColor(t.status), flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, color: '#111827', fontSize: 13 }}>{t.disciplinaNome ?? t.nome}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>{t.codigo}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '11px 12px', fontSize: 13, color: GRAY, borderBottom: '1px solid #f9fafb' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                    background: '#f3f4f6', color: '#374151',
                  }}>
                    {TIPO_LABEL[t.tipoCurso] ?? t.tipoCurso}
                  </span>
                </td>
                <td style={{ padding: '11px 12px', fontSize: 12, color: GRAY, borderBottom: '1px solid #f9fafb', whiteSpace: 'nowrap' }}>
                  {formatHorarios(t.horarios)}
                </td>
                <td style={{ padding: '11px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f9fafb', fontWeight: 600 }}>
                  {t.vagasOcupadas ?? 0}/{t.vagas ?? '?'}
                </td>
                <td style={{ padding: '11px 12px', fontSize: 12, color: GRAY, borderBottom: '1px solid #f9fafb' }}>
                  {t.dataInicio?.split('T')[0]} → {t.dataFim?.split('T')[0]}
                </td>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb' }}>
                  <StatusChip status={t.status} />
                </td>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/turmas/${t.id}`); }}
                    style={{
                      padding: '4px 10px', borderRadius: 6, border: '1px solid #e5e7eb',
                      background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      color: GRAY, fontFamily: 'inherit',
                    }}
                  >
                    Abrir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
