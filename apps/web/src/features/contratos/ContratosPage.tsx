import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';

import { DataTable } from '../../shared/components/DataTable.js';
import { StatusChip } from '../../shared/components/StatusChip.js';
import { useContratos } from '../../shared/api/hooks/useContratos.js';

export function ContratosPage() {
  const navigate = useNavigate();
  const { data: contratos = [], isLoading, error } = useContratos();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">Contratos</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{String(error)}</Alert>}

      {isLoading ? (
        <CircularProgress />
      ) : (
        <DataTable
          columns={[
            {
              header: 'Número',
              accessor: 'numero' as const,
              render: (row) => (
                <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                  {row.numero}
                </Typography>
              ),
            },
            { header: 'Professor', accessor: 'professorNome' as const },
            { header: 'Turma', accessor: 'turmaCodigo' as const },
            {
              header: 'Valor Total',
              accessor: 'valorTotal' as const,
              render: (row) =>
                row.valorTotal != null
                  ? `R$ ${Number(row.valorTotal).toFixed(2)}`
                  : '—',
            },
            {
              header: 'Status',
              accessor: 'status' as const,
              render: (row) => <StatusChip status={row.status} />,
            },
          ]}
          rows={contratos}
          loading={false}
          total={contratos.length}
          page={0}
          pageSize={contratos.length || 10}
          onPageChange={() => {}}
          onRowClick={(row) => navigate(`/contratos/${row.id}`)}
        />
      )}
    </Box>
  );
}
