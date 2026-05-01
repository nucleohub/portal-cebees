import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../features/auth/useAuth.js';
import { Papel } from '@cebees/shared-types';
import { CebeesLogo } from './CebeesLogo.js';

const GREEN = '#0E5107';
const GREEN_LIGHT = '#e8f5e3';
const GRAY = '#606060';
const SIDEBAR_WIDTH = 248;

interface NavItem {
  id: string;
  label: string;
  path: string;
  emoji: string;
  papeis: string[];
  tag?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    emoji: '📊',
    papeis: [Papel.ADMIN, Papel.COORDENADOR, Papel.SECRETARIA],
  },
  {
    id: 'match',
    label: 'Match de Professores',
    path: '/turmas',
    emoji: '🎯',
    tag: 'IA',
    papeis: [Papel.ADMIN, Papel.COORDENADOR],
  },
  {
    id: 'professores',
    label: 'Professores',
    path: '/professores',
    emoji: '👨‍🏫',
    papeis: [Papel.ADMIN, Papel.COORDENADOR, Papel.SECRETARIA],
  },
  {
    id: 'turmas',
    label: 'Turmas',
    path: '/turmas',
    emoji: '🏫',
    papeis: [Papel.ADMIN, Papel.COORDENADOR, Papel.SECRETARIA],
  },
  {
    id: 'historico',
    label: 'Histórico',
    path: '/historico',
    emoji: '📈',
    papeis: [Papel.ADMIN, Papel.COORDENADOR, Papel.SECRETARIA],
  },
  {
    id: 'contratos',
    label: 'Contratos',
    path: '/contratos',
    emoji: '📝',
    papeis: [Papel.ADMIN, Papel.COORDENADOR, Papel.SECRETARIA],
  },
  {
    id: 'disponibilidade',
    label: 'Minha Disponibilidade',
    path: '/disponibilidade',
    emoji: '📆',
    papeis: [Papel.PROFESSOR],
  },
  {
    id: 'meu-historico',
    label: 'Meu Histórico',
    path: '/historico',
    emoji: '📈',
    papeis: [Papel.PROFESSOR],
  },
  {
    id: 'lgpd',
    label: 'LGPD / Meus Dados',
    path: '/lgpd',
    emoji: '🔒',
    papeis: [Papel.ADMIN, Papel.COORDENADOR, Papel.SECRETARIA, Papel.PROFESSOR, Papel.ALUNO],
  },
];

const PAPEL_LABEL: Record<string, string> = {
  ADMIN: 'Administrador',
  COORDENADOR: 'Coordenador Acadêmico',
  SECRETARIA: 'Secretaria',
  PROFESSOR: 'Professor',
  ALUNO: 'Aluno',
};

function getInitials(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function AppShell() {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userPapel = usuario?.papel ?? '';
  const visibleItems = NAV_ITEMS.filter((item) => item.papeis.includes(userPapel));

  const isActive = (item: NavItem) => {
    if (item.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(item.path);
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        height: '100vh',
        background: 'white',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
        zIndex: 20,
      }}>
        {/* Logo */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}>
          <CebeesLogo size={32} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', letterSpacing: 0.3 }}>CEBEES</div>
            <div style={{ fontSize: 9, color: GRAY, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase' }}>Secretaria Educacional</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '10px 8px', flex: 1 }}>
          {visibleItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.id}
                to={item.path}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 12px',
                    borderRadius: 8,
                    marginBottom: 2,
                    cursor: 'pointer',
                    background: active ? GREEN_LIGHT : 'transparent',
                    color: active ? GREEN : '#374151',
                    fontWeight: active ? 700 : 500,
                    fontSize: 13,
                    transition: 'all 0.12s',
                    userSelect: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) (e.currentTarget as HTMLDivElement).style.background = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  <span style={{ fontSize: 14, opacity: 0.85 }}>{item.emoji}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.tag && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '1px 5px',
                      borderRadius: 99, background: GREEN, color: 'white',
                    }}>{item.tag}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid #f3f4f6',
          flexShrink: 0,
          position: 'relative',
        }}>
          <div
            onClick={() => setUserMenuOpen((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer', borderRadius: 8, padding: '6px 4px',
              transition: 'background 0.12s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#f9fafb'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: GREEN, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>
              {getInitials(usuario?.nome ?? '?')}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {usuario?.nome ?? ''}
              </div>
              <div style={{ fontSize: 11, color: GRAY }}>
                {PAPEL_LABEL[userPapel] ?? userPapel}
              </div>
            </div>
            <span style={{ fontSize: 10, color: GRAY }}>⌄</span>
          </div>

          {userMenuOpen && (
            <>
              {/* Click-away backdrop */}
              <div
                onClick={() => setUserMenuOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 30 }}
              />
              <div style={{
                position: 'absolute', bottom: 64, left: 10, right: 10,
                background: 'white', borderRadius: 10, border: '1px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                zIndex: 40, overflow: 'hidden',
              }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: 12, color: GRAY, wordBreak: 'break-all' }}>{usuario?.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%', padding: '10px 14px', background: 'none',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    fontSize: 13, fontWeight: 600, color: '#dc2626',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
                >
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top header */}
        <header style={{
          height: 58,
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          flexShrink: 0,
          zIndex: 10,
        }}>
          <div style={{ fontSize: 13, color: GRAY }}>
            {/* Breadcrumb could go here */}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              fontSize: 12, color: GRAY, background: '#f9fafb',
              border: '1px solid #e5e7eb', borderRadius: 8,
              padding: '4px 12px',
            }}>
              {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', background: '#f4f5f7' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
