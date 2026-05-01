import { Navigate, Route, Routes } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

import { AuthProvider } from '../features/auth/AuthContext.js';
import { AppShell } from '../shared/components/AppShell.js';
import { RequireAuth, RequirePapel } from './routes.js';

import { LoginPage } from '../features/auth/LoginPage.js';
import { DashboardPage } from '../features/dashboard/DashboardPage.js';
import { ProfessoresPage } from '../features/professores/ProfessoresPage.js';
import { ProfessorFormPage } from '../features/professores/ProfessorFormPage.js';
import { ProfessorDetailPage } from '../features/professores/ProfessorDetailPage.js';
import { TurmasPage } from '../features/turmas/TurmasPage.js';
import { TurmaFormPage } from '../features/turmas/TurmaFormPage.js';
import { TurmaDetailPage } from '../features/turmas/TurmaDetailPage.js';
import { DisponibilidadePage } from '../features/disponibilidade/DisponibilidadePage.js';
import { HistoricoPage } from '../features/historico/HistoricoPage.js';
import { HistoricoFormPage } from '../features/historico/HistoricoFormPage.js';
import { ContratosPage } from '../features/contratos/ContratosPage.js';
import { ContratoDetailPage } from '../features/contratos/ContratoDetailPage.js';
import { LgpdPage } from '../features/lgpd/LgpdPage.js';

function ForbiddenPage() {
  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h3" color="error">403</Typography>
      <Typography variant="h6" color="text.secondary">Acesso negado.</Typography>
    </Box>
  );
}

export function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/403" element={<ForbiddenPage />} />

        {/* Protected — all authenticated users */}
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>

            {/* Dashboard — staff only */}
            <Route
              element={
                <RequirePapel papeis={['ADMIN', 'COORDENADOR', 'SECRETARIA']} />
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="/contratos" element={<ContratosPage />} />
              <Route path="/contratos/:id" element={<ContratoDetailPage />} />
            </Route>

            {/* Professores */}
            <Route
              element={
                <RequirePapel papeis={['ADMIN', 'COORDENADOR', 'SECRETARIA']} />
              }
            >
              <Route path="/professores" element={<ProfessoresPage />} />
              <Route path="/professores/novo" element={<ProfessorFormPage />} />
              <Route path="/professores/:id" element={<ProfessorDetailPage />} />
              <Route path="/professores/:id/editar" element={<ProfessorFormPage />} />
            </Route>

            {/* Turmas */}
            <Route
              element={
                <RequirePapel papeis={['ADMIN', 'COORDENADOR', 'SECRETARIA']} />
              }
            >
              <Route path="/turmas" element={<TurmasPage />} />
              <Route path="/turmas/nova" element={<TurmaFormPage />} />
              <Route path="/turmas/:id" element={<TurmaDetailPage />} />
              <Route path="/turmas/:id/editar" element={<TurmaFormPage />} />
            </Route>

            {/* Histórico — staff */}
            <Route
              element={
                <RequirePapel papeis={['ADMIN', 'COORDENADOR', 'SECRETARIA']} />
              }
            >
              <Route path="/historico" element={<HistoricoPage />} />
              <Route path="/historico/novo" element={<HistoricoFormPage />} />
            </Route>

            {/* Disponibilidade — professor + admin */}
            <Route
              element={<RequirePapel papeis={['ADMIN', 'PROFESSOR']} />}
            >
              <Route path="/disponibilidade" element={<DisponibilidadePage />} />
            </Route>

            {/* LGPD — all authenticated */}
            <Route path="/lgpd" element={<LgpdPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
