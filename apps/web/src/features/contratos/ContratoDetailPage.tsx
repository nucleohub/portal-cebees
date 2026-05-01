import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';

import { StatusChip } from '../../shared/components/StatusChip.js';
import { useContrato, useContratoPdfUrl, useSendSignature } from '../../shared/api/hooks/useContratos.js';

export function ContratoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const contratoId = id ? Number(id) : undefined;

  const { data: contrato, isLoading, error } = useContrato(contratoId);
  const { data: pdfUrl, isLoading: pdfLoading } = useContratoPdfUrl(contratoId);
  const sendSignature = useSendSignature();

  const canSendSignature = contrato?.status === 'RASCUNHO' || contrato?.status === 'ENVIADO';

  const handleSendSignature = async () => {
    if (!contratoId) return;
    await sendSignature.mutateAsync(contratoId);
  };

  if (isLoading) return <CircularProgress />;
  if (error || !contrato) return <Alert severity="error">Contrato não encontrado.</Alert>;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/contratos')}
        sx={{ mb: 2 }}
      >
        Voltar
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" fontFamily="monospace">{contrato.numero}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <StatusChip status={contrato.status} />
          </Box>
        </Box>

        {canSendSignature && (
          <Button
            variant="contained"
            startIcon={sendSignature.isPending ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            onClick={handleSendSignature}
            disabled={sendSignature.isPending}
          >
            Enviar para Assinatura
          </Button>
        )}
      </Box>

      {sendSignature.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(sendSignature.error as Error).message}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Dados do Contrato</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Professor</Typography>
            <Typography variant="body2">{contrato.professorNome}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Turma</Typography>
            <Typography variant="body2">{contrato.turmaCodigo}</Typography>
          </Box>
          {contrato.valorHora != null && (
            <Box>
              <Typography variant="caption" color="text.secondary">Valor/hora</Typography>
              <Typography variant="body2">R$ {Number(contrato.valorHora).toFixed(2)}</Typography>
            </Box>
          )}
          {contrato.valorTotal != null && (
            <Box>
              <Typography variant="caption" color="text.secondary">Valor Total</Typography>
              <Typography variant="body2" fontWeight={600}>R$ {Number(contrato.valorTotal).toFixed(2)}</Typography>
            </Box>
          )}
          {contrato.dataEnvio && (
            <Box>
              <Typography variant="caption" color="text.secondary">Enviado em</Typography>
              <Typography variant="body2">{contrato.dataEnvio.split('T')[0]}</Typography>
            </Box>
          )}
          {contrato.dataAssinatura && (
            <Box>
              <Typography variant="caption" color="text.secondary">Assinado em</Typography>
              <Typography variant="body2">{contrato.dataAssinatura.split('T')[0]}</Typography>
            </Box>
          )}
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Documento PDF</Typography>
        <Divider sx={{ mb: 2 }} />
        {pdfLoading ? (
          <Skeleton variant="rectangular" height={600} />
        ) : pdfUrl ? (
          <Box
            component="iframe"
            src={pdfUrl}
            sx={{ width: '100%', height: 600, border: 'none', borderRadius: 1 }}
            title="Contrato PDF"
          />
        ) : (
          <Alert severity="info">PDF ainda não disponível para este contrato.</Alert>
        )}
      </Paper>
    </Box>
  );
}
