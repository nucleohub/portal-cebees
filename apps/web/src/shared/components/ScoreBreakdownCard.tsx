import type { ScoreBreakdown } from '@cebees/shared-types';

const GREEN = '#0E5107';
const GRAY = '#606060';

interface CriterioRow {
  key: keyof ScoreBreakdown;
  label: string;
  peso: number;
}

const CRITERIOS: CriterioRow[] = [
  { key: 'especialidade', label: 'Especialidade Exata', peso: 30 },
  { key: 'proficiencia', label: 'Nível de Proficiência', peso: 20 },
  { key: 'disponibilidade', label: 'Disponibilidade', peso: 20 },
  { key: 'desempenho', label: 'Histórico de Desempenho', peso: 15 },
  { key: 'feedback', label: 'Feedback de Alunos', peso: 10 },
  { key: 'tipoCurso', label: 'Tipo de Curso', peso: 5 },
];

function getBarColor(val: number): string {
  if (val >= 80) return GREEN;
  if (val >= 50) return '#d97706';
  return '#dc2626';
}

interface ScoreBreakdownCardProps {
  breakdown: ScoreBreakdown;
}

export function ScoreBreakdownCard({ breakdown }: ScoreBreakdownCardProps) {
  return (
    <div style={{ fontFamily: '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Breakdown de Critérios
      </div>
      {CRITERIOS.map(({ key, label, peso }) => {
        const val = breakdown[key] ?? 0;
        const color = getBarColor(val);
        const pct = Math.min(100, val);
        return (
          <div key={key} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: '#374151' }}>{label}</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color }}>{val.toFixed(0)}</span>
                <span style={{ fontSize: 10, color: GRAY }}>/{peso}pts</span>
              </div>
            </div>
            <div style={{ height: 5, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`, height: '100%',
                background: color, borderRadius: 99,
                transition: 'width 0.3s',
              }} />
            </div>
          </div>
        );
      })}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 10, marginTop: 2, borderTop: '1px solid #e5e7eb',
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Total
        </span>
        <span style={{
          fontSize: 18, fontWeight: 800,
          color: breakdown.total >= 80 ? GREEN : breakdown.total >= 60 ? '#d97706' : '#dc2626',
        }}>
          {breakdown.total.toFixed(0)}
          <span style={{ fontSize: 11, color: GRAY, fontWeight: 600 }}>/100</span>
        </span>
      </div>
    </div>
  );
}
