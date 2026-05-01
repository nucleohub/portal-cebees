import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../features/auth/useAuth.js';
import type { Papel } from '@cebees/shared-types';

interface RequirePapelProps {
  papeis?: Papel[];
}

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RequirePapel({ papeis }: RequirePapelProps) {
  const { usuario, isLoading } = useAuth();
  if (isLoading) return null;
  if (!usuario) return <Navigate to="/login" replace />;
  if (papeis && !papeis.includes(usuario.papel)) return <Navigate to="/403" replace />;
  return <Outlet />;
}
