import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from './useAuth.js';
import { CebeesLogo } from '../../shared/components/CebeesLogo.js';

const GREEN = '#0E5107';
const GREEN_LIGHT = '#e8f5e3';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusSenha, setFocusSenha] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, senha);
      navigate('/');
    } catch {
      setError('Email ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: `1.5px solid ${focused ? GREEN : '#d1d5db'}`,
    fontSize: 14,
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif',
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
    color: '#111827',
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f4f5f7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif',
    }}>
      {/* Left panel — branding */}
      <div style={{
        display: 'none', // hidden on small screens (inline style only)
      }} />

      {/* Card */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 24px rgba(0,0,0,0.09)',
        padding: '40px 36px',
        width: '100%',
        maxWidth: 400,
      }}>
        {/* Logo + title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <CebeesLogo size={48} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 22, color: '#111827', letterSpacing: 0.3 }}>
            CEBEES
          </div>
          <div style={{ fontSize: 12, color: '#606060', fontWeight: 500, letterSpacing: 0.5, marginTop: 2 }}>
            PORTAL DA SECRETARIA EDUCACIONAL
          </div>
          <div style={{
            marginTop: 16, padding: '6px 14px',
            background: GREEN_LIGHT, borderRadius: 99,
            display: 'inline-block',
            fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 0.3,
          }}>
            Centro Brasileiro de Estudos Esportivos e Saúde
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 16, padding: '10px 14px',
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 8, fontSize: 13, color: '#dc2626', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusEmail(true)}
              onBlur={() => setFocusEmail(false)}
              required
              autoComplete="email"
              placeholder="seu@email.com"
              style={inputStyle(focusEmail)}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onFocus={() => setFocusSenha(true)}
              onBlur={() => setFocusSenha(false)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              style={inputStyle(focusSenha)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px 0',
              background: loading ? '#9ca3af' : GREEN,
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              fontFamily: '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white', borderRadius: '50%',
                  display: 'inline-block', animation: 'spin 0.7s linear infinite',
                }} />
                Entrando...
              </>
            ) : 'Entrar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#9ca3af' }}>
          Acesso restrito a usuários autorizados · LGPD compliant
        </div>
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
