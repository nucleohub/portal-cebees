import {
  Box,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';

export interface ColDef<T = object> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
  width?: string | number;
}

interface DataTableProps<T extends object> {
  columns: ColDef<T>[];
  rows: T[];
  loading?: boolean;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends object>({
  columns,
  rows,
  loading = false,
  total = 0,
  page = 0,
  pageSize = 25,
  onPageChange,
  onRowClick,
  emptyMessage = 'Nenhum registro encontrado.',
}: DataTableProps<T>) {
  return (
    <Paper elevation={1}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              {columns.map((col, i) => (
                <TableCell
                  key={i}
                  sx={{ color: '#fff', fontWeight: 600, width: col.width }}
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, ri) => (
                  <TableRow key={ri}>
                    {columns.map((_, ci) => (
                      <TableCell key={ci}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : rows.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">{emptyMessage}</Typography>
                    </TableCell>
                  </TableRow>
                )
                : rows.map((row, ri) => (
                  <TableRow
                    key={ri}
                    hover={!!onRowClick}
                    onClick={() => onRowClick?.(row)}
                    sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {columns.map((col, ci) => (
                      <TableCell key={ci}>
                        {col.render
                          ? col.render(row)
                          : col.accessor
                            ? String((row as Record<PropertyKey, unknown>)[col.accessor as PropertyKey] ?? '')
                            : ''}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>
      {onPageChange && (
        <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
          <TablePagination
            component="div"
            count={total}
            page={page}
            rowsPerPage={pageSize}
            rowsPerPageOptions={[10, 25, 50]}
            onPageChange={(_, p) => onPageChange(p)}
            onRowsPerPageChange={() => {}}
            labelRowsPerPage="Linhas por página"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          />
        </Box>
      )}
    </Paper>
  );
}
