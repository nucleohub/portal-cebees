import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Snackbar,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useState } from 'react';

import { useAuth } from '../auth/useAuth.js';
import { client } from '../../shared/api/client.js';

export function LgpdPage() {
  const { usuario } = useAuth();
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snack, setSnack] = useState('');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleExport = async () => {
    setExportLoading(true);
    setError('');
    try {
      const { data } = await client.get<{ exportUrl?: string }>('/lgpd/export', {
        responseType: 'json',
      });
      if (data?.exportUrl) {
        window.open(data.exportUrl, '_blank');
      } else {
        setSnack('Solicitação de exportação enviada. Você receberá um e-mail com os dados.');
      }
    } catch (e) {
      setError('Erro ao solicitar exportação de dados.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleteLoading(true);
    setError('');
    try {
      await client.delete('/lgpd/me');
      setSnack('Solicitação de exclusão enviada. Seus dados serão removidos em até 30 dias.');
      setConfirmDelete(false);
    } catch (e) {
      setError('Erro ao solicitar exclusão de dados.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Privacidade e LGPD</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem o
        direito de acessar, exportar e solicitar a exclusão dos seus dados pessoais.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Seus Dados</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1.5 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Nome</Typography>
            <Typography variant="body2">{usuario?.nome ?? '—'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">E-mail</Typography>
            <Typography variant="body2">{usuario?.email ?? '—'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Perfil</Typography>
            <Typography variant="body2">{usuario?.papel ?? '—'}</Typography>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Exportar Meus Dados</Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Receba uma cópia completa de todos os dados pessoais que armazenamos sobre você,
          incluindo informações de perfil, histórico de atuações e disponibilidade.
        </Typography>
        <Button
          variant="outlined"
          startIcon={exportLoading ? <CircularProgress size={16} /> : <DownloadIcon />}
          onClick={handleExport}
          disabled={exportLoading}
        >
          Exportar Meus Dados
        </Button>
      </Paper>

      <Paper sx={{ p: 3, border: '1px solid', borderColor: 'error.main' }}>
        <Typography variant="h6" gutterBottom color="error">Solicitar Exclusão dos Dados</Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Solicite a exclusão permanente dos seus dados pessoais. Esta operação é irreversível
          e pode impedir o uso continuado do sistema. Os dados serão removidos em até 30 dias,
          exceto quando obrigatória a retenção por lei (retenção mínima de 5 anos para registros
          de auditoria conforme LGPD Art. 16).
        </Typography>
        {confirmDelete && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Tem certeza? Clique novamente em "Solicitar Exclusão" para confirmar. Esta ação não
            pode ser desfeita.
          </Alert>
        )}
        <Button
          variant="outlined"
          color="error"
          startIcon={deleteLoading ? <CircularProgress size={16} color="error" /> : <DeleteForeverIcon />}
          onClick={handleDelete}
          disabled={deleteLoading}
        >
          {confirmDelete ? 'Confirmar Exclusão' : 'Solicitar Exclusão'}
        </Button>
        {confirmDelete && (
          <Button
            sx={{ ml: 1 }}
            onClick={() => setConfirmDelete(false)}
            disabled={deleteLoading}
          >
            Cancelar
          </Button>
        )}
      </Paper>

      <Box sx={{ mt: 4, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          CEBEES — Central de Educação e Ensino Básico e Superior · LGPD · Lei nº 13.709/2018 ·
          Para dúvidas sobre privacidade, entre em contato com nosso DPO: {' '}
          <strong>dpo@cebees.com.br</strong>
        </Typography>
      </Box>

      <Snackbar
        open={!!snack}
        autoHideDuration={6000}
        onClose={() => setSnack('')}
        message={snack}
      />
    </Box>
  );
}
