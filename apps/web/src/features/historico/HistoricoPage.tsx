import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { useHistorico } from '../../shared/api/hooks/useHistorico.js';

export function HistoricoPage() {
  const navigate = useNavigate();
  const [filterProfessor, setFilterProfessor] = useState('');
  const { data: historico = [], isLoading, error } = useHistorico(
    filterProfessor ? { professorId: Number(filterProfessor) } : {},
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">Histórico de Atuações</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/historico/novo')}>
          Registrar Histórico
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          label="Filtrar por ID do Professor"
          value={filterProfessor}
          onChange={(e) => setFilterProfessor(e.target.value)}
          size="small"
          type="number"
          sx={{ width: 240 }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{String(error)}</Alert>}

      {isLoading ? (
        <CircularProgress />
      ) : historico.length === 0 ? (
        <Alert severity="info">Nenhum histórico encontrado.</Alert>
      ) : (
        historico.map((h) => {
          const avg = ((h.avaliacaoCoordenacao ?? 0) + (h.avaliacaoAlunos ?? 0)) /
            (h.avaliacaoCoordenacao != null && h.avaliacaoAlunos != null ? 2 :
              h.avaliacaoCoordenacao != null || h.avaliacaoAlunos != null ? 1 : 0) || null;
          const baixo = avg !== null && avg < 3.0;

          return (
            <Card key={h.id} elevation={1} sx={{ mb: 1.5 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>{h.professorNome}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {h.turmaCodigo} · {h.disciplinaNome}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {h.dataInicio?.split('T')[0]} → {h.dataFim?.split('T')[0]} · {h.cargaHorariaCumprida}h
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                    {h.avaliacaoCoordenacao != null && (
                      <Chip
                        icon={<StarIcon />}
                        label={`Coord: ${h.avaliacaoCoordenacao.toFixed(1)}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {h.avaliacaoAlunos != null && (
                      <Chip
                        icon={<StarIcon />}
                        label={`Alunos: ${h.avaliacaoAlunos.toFixed(1)}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {baixo && (
                      <Chip
                        icon={<WarningAmberIcon />}
                        label="Atenção — desempenho abaixo do esperado"
                        color="warning"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
                {h.observacoes && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {h.observacoes}
                  </Typography>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </Box>
  );
}
