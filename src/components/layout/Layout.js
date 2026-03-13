import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, Package, ShoppingCart, BarChart2,
  Users, LogOut, Menu, X, ShoppingBag, Boxes, Sun, Moon
} from 'lucide-react';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pos', icon: ShoppingCart, label: 'POS Sale' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/inventory', icon: Boxes, label: 'Inventory' },
  { to: '/sales', icon: BarChart2, label: 'Sales History' },
  { to: '/customers', icon: Users, label: 'Customers' },
];

const bottomNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/pos', icon: ShoppingCart, label: 'POS' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/sales', icon: BarChart2, label: 'Sales' },
  { to: '/customers', icon: Users, label: 'More' },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out');
    } catch {
      toast.error('Logout failed');
    }
  }

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 12px' }}>
      <div style={{ padding: '8px 12px 24px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '9px', flexShrink: 0, background: 'linear-gradient(135deg, #00d4ff, #0099cc)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={18} color="#050b14" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>
            Swift<span style={{ color: 'var(--accent-cyan)' }}>POS</span>
          </span>
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <p style={{ fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', padding: '0 14px', margin: '0 0 8px' }}>
          Navigation
        </p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <Icon size={17} />
            <span>{label}</span>
            {to === '/pos' && (
              <span style={{ marginLeft: 'auto', fontSize: '9px', fontFamily: 'Syne', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(0, 229, 160, 0.15)', color: 'var(--accent-emerald)', padding: '2px 7px', borderRadius: '999px' }}>
                Live
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
        {/* Theme Toggle in sidebar */}
        <button onClick={toggleTheme} className="sidebar-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', marginBottom: '4px' }}>
          {theme === 'dark' ? <Sun size={16} style={{ color: 'var(--accent-amber)' }} /> : <Moon size={16} style={{ color: 'var(--accent-cyan)' }} />}
          <span style={{ color: theme === 'dark' ? 'var(--accent-amber)' : 'var(--accent-cyan)' }}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,212,255,0.04)', marginBottom: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,153,204,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 700, fontSize: '13px', color: 'var(--accent-cyan)' }}>
            {currentUser?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontFamily: 'Syne', fontSize: '13px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Admin</p>
            <p style={{ fontSize: '11px', margin: 0, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
          <LogOut size={16} style={{ color: 'var(--accent-rose)' }} />
          <span style={{ color: 'var(--accent-rose)' }}>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--bg-primary)' }}>
      {/* Desktop sidebar */}
      <aside style={{ width: '220px', flexShrink: 0, position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 200, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', display: 'none' }} className="lg-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(5,11,20,0.85)', zIndex: 300, backdropFilter: 'blur(4px)' }} />
      )}

      {/* Drawer sidebar */}
      <aside style={{ width: '260px', position: 'fixed', left: sidebarOpen ? 0 : '-260px', top: 0, bottom: 0, zIndex: 400, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', transition: 'left 0.28s cubic-bezier(0.4,0,0.2,1)', overflowY: 'auto' }}>
        <button onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', right: '12px', top: '16px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)', zIndex: 1 }}>
          <X size={16} />
        </button>
        <SidebarContent />
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: 0, minHeight: '100dvh', display: 'flex', flexDirection: 'column' }} id="main-content">
        {/* Top bar */}
        <div style={{ height: '56px', background: theme === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(13, 27, 46, 0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '12px', position: 'sticky', top: 0, zIndex: 100 }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Menu size={18} />
          </button>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)' }}>
            Swift<span style={{ color: 'var(--accent-cyan)' }}>POS</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Theme toggle in topbar (visible on mobile) */}
            <button onClick={toggleTheme} className="theme-toggle-mobile" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: theme === 'dark' ? 'var(--accent-amber)' : 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 8px rgba(0,229,160,0.6)', flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'Syne' }}>Live</span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, padding: '20px 16px', paddingBottom: '90px', maxWidth: '1400px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }} className="page-enter" id="page-content">
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, background: theme === 'light' ? 'rgba(255,255,255,0.97)' : 'rgba(13, 27, 46, 0.97)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', paddingBottom: 'env(safe-area-inset-bottom)', height: 'calc(60px + env(safe-area-inset-bottom))' }} className="mobile-bottom-nav">
          {bottomNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              style={({ isActive }) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', padding: '8px 12px', borderRadius: '12px', textDecoration: 'none', color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)', background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent', transition: 'all 0.15s ease', minWidth: '52px', flex: 1, position: 'relative' })}>
              {({ isActive }) => (
                <>
                  {to === '/pos' ? (
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: isActive ? 'linear-gradient(135deg, #00d4ff, #0099cc)' : 'rgba(0,212,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: isActive ? 'none' : '1px solid rgba(0,212,255,0.25)', marginTop: '-16px', boxShadow: isActive ? '0 4px 16px rgba(0,212,255,0.4)' : 'none' }}>
                      <Icon size={20} color={isActive ? '#050b14' : 'var(--accent-cyan)'} strokeWidth={2.5} />
                    </div>
                  ) : (
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  )}
                  <span style={{ fontSize: '10px', fontFamily: 'Syne', fontWeight: isActive ? 700 : 500, letterSpacing: '0.02em', marginTop: to === '/pos' ? '2px' : '0' }}>{label}</span>
                  {isActive && to !== '/pos' && (
                    <div style={{ position: 'absolute', bottom: '4px', width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </main>

      <style>{`
        @media (min-width: 1024px) {
          .lg-sidebar { display: block !important; }
          #main-content { margin-left: 220px !important; }
          #page-content { padding-bottom: 24px !important; }
          .mobile-bottom-nav { display: none !important; }
          .theme-toggle-mobile { display: none !important; }
        }
        @media (max-width: 380px) {
          #page-content { padding: 12px !important; padding-bottom: 90px !important; }
        }
        * { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
        #page-content { -webkit-overflow-scrolling: touch; }
      `}</style>
    </div>
  );
}
