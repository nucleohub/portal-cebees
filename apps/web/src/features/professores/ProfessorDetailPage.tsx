import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { StatusChip } from '../../shared/components/StatusChip.js';
import { AvailabilityGrid } from '../../shared/components/AvailabilityGrid.js';
import { useProfessor } from '../../shared/api/hooks/useProfessores.js';
import { useDisponibilidade } from '../../shared/api/hooks/useDisponibilidade.js';
import { useHistoricoProfessor } from '../../shared/api/hooks/useHistorico.js';
import { NivelFormacao } from '@cebees/shared-types';

const NIVEL_LABEL: Record<string, string> = {
  [NivelFormacao.MEDIO]: 'Ensino Médio',
  [NivelFormacao.TECNICO]: 'Técnico',
  [NivelFormacao.GRADUACAO]: 'Graduação',
  [NivelFormacao.ESPECIALIZACAO]: 'Especialização',
  [NivelFormacao.MESTRADO]: 'Mestrado',
  [NivelFormacao.DOUTORADO]: 'Doutorado',
};


export function ProfessorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  const { data: professor, isLoading } = useProfessor(id ? Number(id) : undefined);
  const { data: disponibilidades = [] } = useDisponibilidade(id ? Number(id) : undefined);
  const { data: historico = [] } = useHistoricoProfessor(id ? Number(id) : undefined);

  if (isLoading) return <CircularProgress />;
  if (!professor) return <Alert severity="error">Professor não encontrado.</Alert>;

  const avgAvaliacao =
    historico.length > 0
      ? historico.reduce((acc, h) => acc + ((h.avaliacaoAlunos ?? 0) + (h.avaliacaoCoordenacao ?? 0)) / 2, 0) /
        historico.length
      : null;
  const baixoDesempenho = avgAvaliacao !== null && avgAvaliacao < 3.0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4">{professor.nomeCompleto}</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            <StatusChip status={professor.status} />
            {baixoDesempenho && (
              <Chip
                icon={<WarningAmberIcon />}
                label="Atenção — desempenho abaixo do esperado"
                color="warning"
                size="small"
              />
            )}
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/professores/${id}/editar`)}
        >
          Editar
        </Button>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Dados Pessoais" />
        <Tab label="Especialidades" />
        <Tab label="Disponibilidade" />
        <Tab label="Histórico" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography>{professor.email}</Typography>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1.5 }}>Telefone</Typography>
                <Typography>{professor.telefone || '—'}</Typography>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1.5 }}>Nascimento</Typography>
                <Typography>{professor.dataNascimento?.split('T')[0] ?? '—'}</Typography>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1.5 }}>Experiência</Typography>
                <Typography>{professor.experienciaAnos} anos</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Formações</Typography>
                {professor.formacoes?.map((f, i) => (
                  <Box key={i} sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {NIVEL_LABEL[f.nivel] ?? f.nivel} — {f.curso}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {f.instituicao} · {f.anoConclusao}
                    </Typography>
                  </Box>
                ))}
                {!professor.formacoes?.length && <Typography color="text.secondary">Sem formações cadastradas.</Typography>}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Card elevation={1}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Especialidades</Typography>
            <Typography color="text.secondary" variant="body2">
              Especialidades são gerenciadas via API. Consulte o endpoint <code>/professores/{id}/especialidades</code>.
            </Typography>
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Card elevation={1}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Disponibilidade Semanal</Typography>
            <AvailabilityGrid disponibilidades={disponibilidades} readOnly />
          </CardContent>
        </Card>
      )}

      {tab === 3 && (
        <Box>
          {historico.length === 0 ? (
            <Alert severity="info">Nenhum histórico registrado.</Alert>
          ) : (
            historico.map((h) => (
              <Card key={h.id} elevation={1} sx={{ mb: 1.5 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Box>
                      <Typography variant="subtitle2">{h.turmaCodigo} — {h.disciplinaNome}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {h.dataInicio?.split('T')[0]} → {h.dataFim?.split('T')[0]} · {h.cargaHorariaCumprida}h
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      {h.avaliacaoCoordenacao != null && (
                        <Typography variant="caption">Coord: {h.avaliacaoCoordenacao.toFixed(1)}</Typography>
                      )}
                      {h.avaliacaoAlunos != null && (
                        <Typography variant="caption" sx={{ ml: 1 }}>Alunos: {h.avaliacaoAlunos.toFixed(1)}</Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}
    </Box>
  );
}
