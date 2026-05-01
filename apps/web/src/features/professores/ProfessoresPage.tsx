import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { StatusChip } from '../../shared/components/StatusChip.js';
import { useProfessores } from '../../shared/api/hooks/useProfessores.js';
import type { ProfessorDto } from '@cebees/shared-types';

const GREEN = '#0E5107';
const GRAY = '#606060';

function maskCpf(cpf: string): string {
  if (!cpf) return '—';
  const d = cpf.replace(/\D/g, '');
  if (d.length === 11) return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`;
  return cpf;
}

function getInitials(nome: string): string {
  return nome.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

export function ProfessoresPage() {
  const navigate = useNavigate();
  const [filterNome, setFilterNome] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { data, isLoading, error } = useProfessores({
    nome: filterNome || undefined,
    status: filterStatus || undefined,
  });

  const selectStyle: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb',
    fontSize: 13, fontFamily: 'inherit', outline: 'none',
    background: 'white', color: '#374151', cursor: 'pointer',
  };

  return (
    <div style={{ padding: 28, fontFamily: '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Professores</h2>
          <p style={{ fontSize: 13, color: GRAY, margin: '3px 0 0' }}>
            {(data ?? []).length} professor{(data?.length ?? 0) !== 1 ? 'es' : ''} cadastrado{(data?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => navigate('/professores/novo')}
          style={{
            padding: '9px 18px', background: GREEN, color: 'white',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
          }}
        >
          + Novo Professor
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={filterNome}
          onChange={(e) => setFilterNome(e.target.value)}
          placeholder="Buscar por nome..."
          style={{
            padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb',
            fontSize: 13, fontFamily: 'inherit', outline: 'none', width: 240,
          }}
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = GREEN; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'; }}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
          <option value="">Todos os status</option>
          <option value="ATIVO">Ativo</option>
          <option value="INATIVO">Inativo</option>
          <option value="SUSPENSO">Suspenso</option>
        </select>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af' }}>
          {(data ?? []).length} registros
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
              {['Professor', 'CPF', 'Email', 'Experiência', 'Status', ''].map((h) => (
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
                <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Carregando...</td>
              </tr>
            ) : (data ?? []).length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Nenhum professor encontrado.</td>
              </tr>
            ) : (data ?? []).map((p: ProfessorDto) => (
              <tr
                key={p.id}
                onClick={() => navigate(`/professores/${p.id}`)}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#f9fafb'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'white'; }}
              >
                {/* Avatar + nome */}
                <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: GREEN, color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, flexShrink: 0,
                    }}>
                      {getInitials(p.nomeCompleto)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#111827', fontSize: 13 }}>{p.nomeCompleto}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '11px 12px', fontSize: 12, color: GRAY, borderBottom: '1px solid #f9fafb', fontFamily: 'monospace' }}>
                  {maskCpf(p.cpf ?? '')}
                </td>
                <td style={{ padding: '11px 12px', fontSize: 13, color: GRAY, borderBottom: '1px solid #f9fafb' }}>
                  {p.email}
                </td>
                <td style={{ padding: '11px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f9fafb' }}>
                  {p.experienciaAnos} anos
                </td>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb' }}>
                  <StatusChip status={p.status} />
                </td>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/professores/${p.id}`); }}
                    style={{
                      padding: '4px 10px', borderRadius: 6, border: '1px solid #e5e7eb',
                      background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      color: GRAY, fontFamily: 'inherit',
                    }}
                  >
                    Ver Perfil
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
