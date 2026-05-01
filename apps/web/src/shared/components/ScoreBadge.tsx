const GREEN = '#0E5107';

function getScoreColor(score: number): string {
  if (score >= 80) return GREEN;
  if (score >= 60) return '#d97706';
  return '#dc2626';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excelente';
  if (score >= 75) return 'Ótimo';
  if (score >= 60) return 'Adequado';
  if (score >= 40) return 'Abaixo do ideal';
  return 'Insuficiente';
}

interface ScoreBadgeProps {
  score: number;
  compact?: boolean;
  size?: number;
}

/**
 * Circular SVG score ring — matches the prototype's ScoreRingWithLabel design.
 */
export function ScoreBadge({ score, compact = false, size = 72 }: ScoreBadgeProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  if (compact) {
    // Small inline version: just the number + tier label
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1 }}>
          {Math.round(score)}
        </span>
        <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>
          {label}
        </span>
      </div>
    );
  }

  // Full circular ring
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const dash = (pct / 100) * circ;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={6} />
        {/* Progress */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 0.4s ease' }}
        />
        {/* Score text — counter-rotate to display upright */}
        <text
          x={cx} y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ transform: `rotate(90deg)`, transformOrigin: `${cx}px ${cy}px` }}
          fill={color}
          fontSize={size * 0.28}
          fontWeight={800}
          fontFamily='"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif'
        >
          {Math.round(score)}
        </text>
      </svg>
      <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>
        {label}
      </span>
    </div>
  );
}

// Named export for the compact ring used inline in MatchModal cards
export function ScoreRing({ score, size = 52 }: { score: number; size?: number }) {
  return <ScoreBadge score={score} size={size} />;
}
