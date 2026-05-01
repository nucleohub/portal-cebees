import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { TextField, SelectField, DateField } from '../../shared/components/FormFields.js';
import { useTurma, useTurmaMutations } from '../../shared/api/hooks/useTurmas.js';
import { TipoCurso, DisponibilidadePeriodo } from '@cebees/shared-types';
import type { CreateTurmaDto } from '@cebees/shared-types';

const TIPO_OPTIONS = [
  { value: TipoCurso.CURSO_LIVRE, label: 'Curso Livre' },
  { value: TipoCurso.CBMF, label: 'CBMF' },
  { value: TipoCurso.FORMACAO_PROFISSIONAL, label: 'Formação Profissional' },
  { value: TipoCurso.TECNOLOGO, label: 'Tecnólogo' },
  { value: TipoCurso.POS_GRADUACAO, label: 'Pós-Graduação' },
];

const DIA_OPTIONS = [
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
];

const PERIODO_OPTIONS = [
  { value: DisponibilidadePeriodo.MANHA, label: 'Manhã' },
  { value: DisponibilidadePeriodo.TARDE, label: 'Tarde' },
  { value: DisponibilidadePeriodo.NOITE, label: 'Noite' },
];

export function TurmaFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: turma, isLoading: loadingTurma } = useTurma(id ? Number(id) : undefined);
  const { create, update } = useTurmaMutations();

  const { control, handleSubmit, reset } = useForm<CreateTurmaDto>({
    defaultValues: {
      codigo: '',
      nome: '',
      disciplinaId: undefined,
      tipoCurso: TipoCurso.CURSO_LIVRE,
      cargaHorariaTotal: 40,
      dataInicio: '',
      dataFim: '',
      horarios: [{ diaSemana: 2, periodo: DisponibilidadePeriodo.NOITE, horaInicio: '19:00', horaFim: '22:30' }],
      vagas: 30,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'horarios' });

  useEffect(() => {
    if (turma) {
      reset({
        codigo: turma.codigo,
        nome: turma.nome,
        disciplinaId: turma.disciplinaId,
        tipoCurso: turma.tipoCurso,
        cargaHorariaTotal: turma.cargaHorariaTotal,
        dataInicio: turma.dataInicio?.split('T')[0] ?? '',
        dataFim: turma.dataFim?.split('T')[0] ?? '',
        horarios: turma.horarios,
        vagas: turma.vagas,
      });
    }
  }, [turma, reset]);

  const onSubmit = async (values: CreateTurmaDto) => {
    try {
      if (isEdit) {
        await update.mutateAsync({ id: Number(id), ...values });
      } else {
        await create.mutateAsync(values);
      }
      navigate('/turmas');
    } catch (e) {
      console.error(e);
    }
  };

  if (isEdit && loadingTurma) return <CircularProgress />;

  const mutError = isEdit ? update.error : create.error;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Editar Turma' : 'Nova Turma'}
      </Typography>

      {mutError && (
        <Alert severity="error" sx={{ mb: 2 }}>{(mutError as Error).message}</Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Dados da Turma</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField name="codigo" control={control} label="Código" required placeholder="T2025-001" />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField name="nome" control={control} label="Nome" required />
            </Grid>
            <Grid item xs={12} md={4}>
              <SelectField name="tipoCurso" control={control} label="Tipo de Curso" options={TIPO_OPTIONS} required />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField name="disciplinaId" control={control} label="ID Disciplina" type="number" required inputProps={{ min: 1 }} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField name="cargaHorariaTotal" control={control} label="Carga Horária (h)" type="number" required inputProps={{ min: 1 }} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField name="vagas" control={control} label="Vagas" type="number" required inputProps={{ min: 1 }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <DateField name="dataInicio" control={control} label="Data de Início" required />
            </Grid>
            <Grid item xs={12} md={3}>
              <DateField name="dataFim" control={control} label="Data de Fim" required />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Horários Semanais</Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => append({ diaSemana: 2, periodo: DisponibilidadePeriodo.NOITE, horaInicio: '19:00', horaFim: '22:30' })}
            >
              Adicionar
            </Button>
          </Box>

          {fields.map((field, idx) => (
            <Grid container spacing={2} key={field.id} sx={{ mb: 1 }} alignItems="center">
              <Grid item xs={12} md={3}>
                <SelectField name={`horarios.${idx}.diaSemana`} control={control} label="Dia" options={DIA_OPTIONS} required />
              </Grid>
              <Grid item xs={12} md={2}>
                <SelectField name={`horarios.${idx}.periodo`} control={control} label="Período" options={PERIODO_OPTIONS} required />
              </Grid>
              <Grid item xs={5} md={2}>
                <TextField name={`horarios.${idx}.horaInicio`} control={control} label="Início" placeholder="19:00" />
              </Grid>
              <Grid item xs={5} md={2}>
                <TextField name={`horarios.${idx}.horaFim`} control={control} label="Fim" placeholder="22:30" />
              </Grid>
              <Grid item xs={2} md={1}>
                <IconButton onClick={() => remove(idx)} disabled={fields.length === 1} color="error" size="small">
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </Paper>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={create.isPending || update.isPending}
            startIcon={(create.isPending || update.isPending) ? <CircularProgress size={18} /> : undefined}
          >
            {isEdit ? 'Salvar' : 'Criar Turma'}
          </Button>
          <Button variant="outlined" onClick={() => navigate('/turmas')}>Cancelar</Button>
        </Box>
      </form>
    </Box>
  );
}
