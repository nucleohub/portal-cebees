import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

import { AvailabilityGrid } from '../../shared/components/AvailabilityGrid.js';
import { useAuth } from '../auth/useAuth.js';
import { useDisponibilidade, useDisponibilidadeMutation } from '../../shared/api/hooks/useDisponibilidade.js';
import type { DisponibilidadeDto } from '@cebees/shared-types';

export function DisponibilidadePage() {
  const { usuario } = useAuth();
  const professorId = usuario?.professorId;

  const { data: disponibilidades = [], isLoading } = useDisponibilidade(professorId);
  const mutation = useDisponibilidadeMutation(professorId ?? 0);

  const [local, setLocal] = useState<DisponibilidadeDto[] | null>(null);
  const [saved, setSaved] = useState(false);

  const current = local ?? disponibilidades;

  const handleSave = async () => {
    if (!professorId) return;
    await mutation.mutateAsync(current);
    setLocal(null);
    setSaved(true);
  };

  if (!professorId) {
    return <Alert severity="warning">Seu usuário não está vinculado a um professor.</Alert>;
  }

  if (isLoading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4">Minha Disponibilidade</Typography>
          <Typography variant="body2" color="text.secondary">
            Selecione os turnos em que você está disponível para lecionar.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={mutation.isPending ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={mutation.isPending || local === null}
        >
          Salvar
        </Button>
      </Box>

      {mutation.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(mutation.error as Error).message}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <AvailabilityGrid
          disponibilidades={current}
          onChange={setLocal}
          professorId={professorId}
        />
      </Paper>

      <Snackbar
        open={saved}
        autoHideDuration={4000}
        onClose={() => setSaved(false)}
        message="Disponibilidade salva com sucesso!"
      />
    </Box>
  );
}
