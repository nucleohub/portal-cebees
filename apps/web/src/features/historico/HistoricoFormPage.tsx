import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { TextField, DateField, RatingField } from '../../shared/components/FormFields.js';
import { useCreateHistorico } from '../../shared/api/hooks/useHistorico.js';
import type { CreateHistoricoDto } from '@cebees/shared-types';

type FormValues = CreateHistoricoDto;

export function HistoricoFormPage() {
  const navigate = useNavigate();
  const createHistorico = useCreateHistorico();

  const { control, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      professorId: undefined,
      turmaId: undefined,
      dataInicio: '',
      dataFim: '',
      cargaHorariaCumprida: 0,
      avaliacaoCoordenacao: undefined,
      avaliacaoAlunos: undefined,
      observacoes: '',
    },
  });

  const avalCoord = watch('avaliacaoCoordenacao');
  const avalAlunos = watch('avaliacaoAlunos');
  const avg = (() => {
    const vals = [avalCoord, avalAlunos].filter((v) => v != null) as number[];
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  })();
  const baixoDesempenho = avg !== null && avg < 3.0;

  const onSubmit = async (values: FormValues) => {
    try {
      await createHistorico.mutateAsync(values);
      navigate('/historico');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Registrar Histórico de Atuação</Typography>

      {createHistorico.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(createHistorico.error as Error).message}
        </Alert>
      )}

      {baixoDesempenho && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          icon={<WarningAmberIcon />}
        >
          Atenção — desempenho abaixo do esperado (média: {avg?.toFixed(1)}/5.0)
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Dados da Atuação</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField name="professorId" control={control} label="ID Professor" type="number" required inputProps={{ min: 1 }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField name="turmaId" control={control} label="ID Turma" type="number" required inputProps={{ min: 1 }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <DateField name="dataInicio" control={control} label="Data de Início" required />
            </Grid>
            <Grid item xs={12} md={3}>
              <DateField name="dataFim" control={control} label="Data de Fim" required />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                name="cargaHorariaCumprida"
                control={control}
                label="Carga Horária (h)"
                type="number"
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Avaliações</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <RatingField name="avaliacaoCoordenacao" control={control} label="Avaliação da Coordenação" />
            </Grid>
            <Grid item xs={12} md={4}>
              <RatingField name="avaliacaoAlunos" control={control} label="Avaliação dos Alunos" />
            </Grid>
            {baixoDesempenho && (
              <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip icon={<WarningAmberIcon />} label="Baixo desempenho" color="warning" />
              </Grid>
            )}
          </Grid>
          <Box sx={{ mt: 2 }}>
            <TextField name="observacoes" control={control} label="Observações" multiline rows={3} />
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={createHistorico.isPending}
            startIcon={createHistorico.isPending ? <CircularProgress size={18} /> : <SaveIcon />}
          >
            Registrar
          </Button>
          <Button variant="outlined" onClick={() => navigate('/historico')}>Cancelar</Button>
        </Box>
      </form>
    </Box>
  );
}
