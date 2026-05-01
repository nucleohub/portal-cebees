interface StatusEntry {
  label: string;
  bg: string;
  color: string;
}

const STATUS_MAP: Record<string, StatusEntry> = {
  // Professor
  ATIVO:         { label: 'Ativo',        bg: '#dcfce7', color: '#166534' },
  INATIVO:       { label: 'Inativo',      bg: '#f3f4f6', color: '#374151' },
  SUSPENSO:      { label: 'Suspenso',     bg: '#fee2e2', color: '#991b1b' },
  // Turma
  PLANEJADA:     { label: 'Planejada',    bg: '#f3e8ff', color: '#7e22ce' },
  ATIVA:         { label: 'Ativa',        bg: '#dcfce7', color: '#166534' },
  EM_ANDAMENTO:  { label: 'Em Andamento', bg: '#dcfce7', color: '#166534' },
  CONCLUIDA:     { label: 'Concluída',    bg: '#e0f2fe', color: '#0369a1' },
  CANCELADA:     { label: 'Cancelada',    bg: '#fee2e2', color: '#991b1b' },
  SEM_PROFESSOR: { label: 'Sem Professor',bg: '#fee2e2', color: '#991b1b' },
  // Alocação
  SUGERIDA:      { label: 'Sugerida',     bg: '#eff6ff', color: '#1d4ed8' },
  CONFIRMADA:    { label: 'Confirmada',   bg: '#dcfce7', color: '#166534' },
  // Contrato
  RASCUNHO:      { label: 'Rascunho',     bg: '#fef3c7', color: '#92400e' },
  ENVIADO:       { label: 'Enviado',      bg: '#eff6ff', color: '#1d4ed8' },
  ASSINADO:      { label: 'Assinado',     bg: '#dcfce7', color: '#166534' },
  ENCERRADO:     { label: 'Encerrado',    bg: '#f3f4f6', color: '#374151' },
  // Generic
  PENDENTE:      { label: 'Pendente',     bg: '#fef3c7', color: '#92400e' },
  EM_ANALISE:    { label: 'Em Análise',   bg: '#e0f2fe', color: '#0369a1' },
  EMITIDA:       { label: 'Emitida',      bg: '#dcfce7', color: '#166534' },
  TRANCADA:      { label: 'Trancada',     bg: '#fef9c3', color: '#854d0e' },
};

interface StatusChipProps {
  status: string;
}

export function StatusChip({ status }: StatusChipProps) {
  const entry = STATUS_MAP[status] ?? { label: status, bg: '#f3f4f6', color: '#374151' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 9px',
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 700,
      background: entry.bg,
      color: entry.color,
      whiteSpace: 'nowrap',
      fontFamily: '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif',
    }}>
      {entry.label}
    </span>
  );
}
