import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { client } from '../../shared/api/client.js';
import type { UsuarioDto } from '@cebees/shared-types';

interface AuthContextValue {
  usuario: UsuarioDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    client
      .get<UsuarioDto>('/auth/me')
      .then((r) => setUsuario(r.data))
      .catch(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const { data } = await client.post('/auth/login', { email, senha });
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    setUsuario(data.usuario);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ usuario, isAuthenticated: !!usuario, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be inside AuthProvider');
  return ctx;
}
