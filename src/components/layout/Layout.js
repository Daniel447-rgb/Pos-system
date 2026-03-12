import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Package, ShoppingCart, BarChart2,
  Users, LogOut, Menu, X, ShoppingBag, Boxes, ChevronRight
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

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout } = useAuth();
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
      {/* Logo */}
      <div style={{ padding: '8px 12px 24px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '9px', flexShrink: 0,
            background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShoppingBag size={18} color="#050b14" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>
            Swift<span style={{ color: 'var(--accent-cyan)' }}>POS</span>
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <p style={{ fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', padding: '0 14px', margin: '0 0 8px' }}>
          Navigation
        </p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
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

      {/* User */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,212,255,0.04)', marginBottom: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,153,204,0.2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Syne', fontWeight: 700, fontSize: '13px', color: 'var(--accent-cyan)'
          }}>
            {currentUser?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontFamily: 'Syne', fontSize: '13px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Admin</p>
            <p style={{ fontSize: '11px', margin: 0, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser?.email}
            </p>
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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Desktop sidebar */}
      <aside style={{
        width: '220px', flexShrink: 0, position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 200,
        background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
        display: 'none'
      }} className="lg-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(5,11,20,0.8)', zIndex: 300, backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* Mobile sidebar */}
      <aside style={{
        width: '240px', position: 'fixed', left: sidebarOpen ? 0 : '-240px', top: 0, bottom: 0, zIndex: 400,
        background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
        transition: 'left 0.25s ease'
      }}>
        <button onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', right: '12px', top: '20px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <X size={16} />
        </button>
        <SidebarContent />
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column' }} id="main-content">
        {/* Top bar */}
        <div style={{
          height: '56px', background: 'rgba(13, 27, 46, 0.8)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center',
          padding: '0 20px', gap: '12px', position: 'sticky', top: 0, zIndex: 100
        }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <Menu size={18} />
          </button>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
            Swift<span style={{ color: 'var(--accent-cyan)' }}>POS</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 8px rgba(0,229,160,0.6)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'Syne' }}>Live</span>
          </div>
        </div>

        <div style={{ flex: 1, padding: '24px 20px', maxWidth: '1400px', width: '100%', margin: '0 auto' }} className="page-enter">
          {children}
        </div>
      </main>

      <style>{`
        @media (min-width: 1024px) {
          .lg-sidebar { display: block !important; }
          #main-content { margin-left: 220px !important; }
        }
      `}</style>
    </div>
  );
}
