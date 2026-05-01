import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { TextField, CpfField, SelectField, DateField } from '../../shared/components/FormFields.js';
import { useProfessor, useProfessorMutations } from '../../shared/api/hooks/useProfessores.js';
import { NivelFormacao, ProfessorStatus } from '@cebees/shared-types';
import type { CreateProfessorDto, ProfessorStatus as ProfessorStatusType } from '@cebees/shared-types';

const STATUS_OPTIONS = Object.values(ProfessorStatus).map((v) => ({ value: v, label: v }));

const FORMACAO_OPTIONS = [
  { value: NivelFormacao.MEDIO, label: 'Ensino Médio' },
  { value: NivelFormacao.TECNICO, label: 'Técnico' },
  { value: NivelFormacao.GRADUACAO, label: 'Graduação' },
  { value: NivelFormacao.ESPECIALIZACAO, label: 'Especialização' },
  { value: NivelFormacao.MESTRADO, label: 'Mestrado' },
  { value: NivelFormacao.DOUTORADO, label: 'Doutorado' },
];

type FormValues = CreateProfessorDto & { status?: ProfessorStatusType };

export function ProfessorFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: professor, isLoading: loadingProfessor } = useProfessor(id ? Number(id) : undefined);
  const { create, update } = useProfessorMutations();

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      nomeCompleto: '',
      cpf: '',
      rg: '',
      email: '',
      telefone: '',
      dataNascimento: '',
      formacoes: [{ nivel: NivelFormacao.GRADUACAO, curso: '', instituicao: '', anoConclusao: new Date().getFullYear() }],
      experienciaAnos: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'formacoes' });

  useEffect(() => {
    if (professor) {
      reset({
        nomeCompleto: professor.nomeCompleto,
        cpf: professor.cpf ?? '',
        rg: professor.rg ?? '',
        email: professor.email,
        telefone: professor.telefone ?? '',
        dataNascimento: professor.dataNascimento?.split('T')[0] ?? '',
        formacoes: professor.formacoes ?? [],
        experienciaAnos: professor.experienciaAnos,
        status: professor.status,
      });
    }
  }, [professor, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit) {
        await update.mutateAsync({ id: Number(id), ...values });
      } else {
        await create.mutateAsync(values);
      }
      navigate('/professores');
    } catch (e: unknown) {
      console.error(e);
    }
  };

  if (isEdit && loadingProfessor) return <CircularProgress />;

  const mutError = isEdit ? update.error : create.error;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Editar Professor' : 'Novo Professor'}
      </Typography>

      {mutError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(mutError as Error).message}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Dados Pessoais</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField name="nomeCompleto" control={control} label="Nome Completo" required />
            </Grid>
            <Grid item xs={12} md={3}>
              <CpfField name="cpf" control={control} label="CPF" required />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField name="rg" control={control} label="RG" required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField name="email" control={control} label="Email" required type="email" />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField name="telefone" control={control} label="Telefone" />
            </Grid>
            <Grid item xs={12} md={3}>
              <DateField name="dataNascimento" control={control} label="Data de Nascimento" required />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                name="experienciaAnos"
                control={control}
                label="Anos de Experiência"
                type="number"
                inputProps={{ min: 0 }}
              />
            </Grid>
            {isEdit && (
              <Grid item xs={12} md={3}>
                <SelectField name="status" control={control} label="Status" options={STATUS_OPTIONS} />
              </Grid>
            )}
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Formações Acadêmicas</Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => append({ nivel: NivelFormacao.GRADUACAO, curso: '', instituicao: '', anoConclusao: new Date().getFullYear() })}
            >
              Adicionar
            </Button>
          </Box>

          {fields.map((field, idx) => (
            <Box key={field.id} sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="flex-start">
                <Grid item xs={12} md={2}>
                  <SelectField
                    name={`formacoes.${idx}.nivel`}
                    control={control}
                    label="Nível"
                    options={FORMACAO_OPTIONS}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField name={`formacoes.${idx}.curso`} control={control} label="Curso" required />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField name={`formacoes.${idx}.instituicao`} control={control} label="Instituição" required />
                </Grid>
                <Grid item xs={8} md={1}>
                  <TextField
                    name={`formacoes.${idx}.anoConclusao`}
                    control={control}
                    label="Ano"
                    type="number"
                    inputProps={{ min: 1970, max: new Date().getFullYear() + 5 }}
                    required
                  />
                </Grid>
                <Grid item xs={4} md={1} sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    onClick={() => remove(idx)}
                    disabled={fields.length === 1}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
              {idx < fields.length - 1 && <Divider sx={{ mt: 1 }} />}
            </Box>
          ))}
        </Paper>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={create.isPending || update.isPending}
            startIcon={(create.isPending || update.isPending) ? <CircularProgress size={18} /> : undefined}
          >
            {isEdit ? 'Salvar Alterações' : 'Cadastrar Professor'}
          </Button>
          <Button variant="outlined" onClick={() => navigate('/professores')}>
            Cancelar
          </Button>
        </Box>
      </form>
    </Box>
  );
}
