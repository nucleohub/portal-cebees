import { useNavigate } from 'react-router-dom';

import { useProfessores } from '../../shared/api/hooks/useProfessores.js';
import { useTurmas } from '../../shared/api/hooks/useTurmas.js';
import { useContratos } from '../../shared/api/hooks/useContratos.js';

const GREEN = '#0E5107';
const GRAY = '#606060';

interface KpiCardProps {
  label: string;
  value: number | string;
  sub?: string;
  color?: string;
  emoji: string;
  onClick?: () => void;
}

function KpiCard({ label, value, sub, color = GREEN, emoji, onClick }: KpiCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        padding: 20,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s, transform 0.15s',
        flex: 1,
        minWidth: 160,
      }}
      onMouseEnter={(e) => { if (onClick) { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'; } }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.07)'; (e.currentTarget as HTMLDivElement).style.transform = ''; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: GRAY, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>{label}</div>
          <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: GRAY, marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{ fontSize: 26, opacity: 0.2 }}>{emoji}</div>
      </div>
    </div>
  );
}

function QuickAction({ label, emoji, onClick }: { label: string; emoji: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '9px 16px', background: 'white',
        border: '1.5px solid #e5e7eb', borderRadius: 8,
        cursor: 'pointer', fontSize: 13, fontWeight: 600,
        color: '#374151', fontFamily: 'inherit',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = GREEN; (e.currentTarget as HTMLButtonElement).style.color = GREEN; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLButtonElement).style.color = '#374151'; }}
    >
      <span>{emoji}</span> {label}
    </button>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();

  const { data: professores, isLoading: loadP } = useProfessores({ status: 'ATIVO' });
  const { data: turmasAtivas } = useTurmas({ status: 'ATIVA' });
  const { data: turmasPlanejadas } = useTurmas({ status: 'PLANEJADA' });
  const { data: contratos } = useContratos({ status: 'RASCUNHO' });

  const isLoading = loadP;

  return (
    <div style={{ padding: 28, fontFamily: '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif' }}>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Dashboard</h2>
          <p style={{ fontSize: 13, color: GRAY, margin: '3px 0 0' }}>
            Visão geral da Secretaria Educacional — {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigate('/turmas')}
            style={{
              padding: '8px 16px', background: GREEN, color: 'white',
              border: 'none', borderRadius: 8, cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            🎯 Motor de Match
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <KpiCard
          label="Professores Ativos"
          value={isLoading ? '…' : (professores?.length ?? 0)}
          sub="no sistema"
          color={GREEN}
          emoji="👨‍🏫"
          onClick={() => navigate('/professores')}
        />
        <KpiCard
          label="Turmas em Andamento"
          value={turmasAtivas?.length ?? 0}
          sub="período vigente"
          color="#3b82f6"
          emoji="🏫"
          onClick={() => navigate('/turmas')}
        />
        <KpiCard
          label="Turmas Planejadas"
          value={turmasPlanejadas?.length ?? 0}
          sub="aguardando alocação"
          color="#d97706"
          emoji="📅"
          onClick={() => navigate('/turmas')}
        />
        <KpiCard
          label="Contratos Pendentes"
          value={contratos?.length ?? 0}
          sub="aguardando assinatura"
          color="#7c3aed"
          emoji="📄"
          onClick={() => navigate('/contratos')}
        />
      </div>

      {/* Main content row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, marginBottom: 16 }}>
        {/* Quick actions */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 16 }}>⚡ Ações Rápidas</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <QuickAction label="Novo Professor" emoji="👤" onClick={() => navigate('/professores/novo')} />
            <QuickAction label="Nova Turma" emoji="🏫" onClick={() => navigate('/turmas/nova')} />
            <QuickAction label="Motor de Match" emoji="🎯" onClick={() => navigate('/turmas')} />
            <QuickAction label="Ver Contratos" emoji="📝" onClick={() => navigate('/contratos')} />
            <QuickAction label="Histórico" emoji="📈" onClick={() => navigate('/historico')} />
            <QuickAction label="LGPD / Dados" emoji="🔒" onClick={() => navigate('/lgpd')} />
          </div>
        </div>

        {/* Status card */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 14 }}>🟢 Status do Sistema</div>
          {[
            { label: 'API Backend', ok: true },
            { label: 'Motor de Match (IA)', ok: true },
            { label: 'Banco de Dados', ok: true },
            { label: 'Worker de Contratos', ok: true },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.ok ? '#16a34a' : '#dc2626', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#374151', flex: 1 }}>{s.label}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: s.ok ? '#16a34a' : '#dc2626' }}>{s.ok ? 'Operacional' : 'Offline'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Match CTA */}
      <div style={{
        background: `linear-gradient(135deg, ${GREEN} 0%, #1a7a0f 100%)`,
        borderRadius: 12,
        padding: '22px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: 'white',
        gap: 16,
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>
            🎯 Motor de Match de Professores — IA
          </div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>
            Sugestões automáticas com score ponderado por especialidade, disponibilidade, desempenho e feedback. Acesse uma turma para iniciar.
          </div>
        </div>
        <button
          onClick={() => navigate('/turmas')}
          style={{
            padding: '10px 22px',
            background: 'white',
            color: GREEN,
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: 'inherit',
            flexShrink: 0,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
        >
          Ver Turmas →
        </button>
      </div>
    </div>
  );
}
