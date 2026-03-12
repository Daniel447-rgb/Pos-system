import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, Lock, Mail, Eye, EyeOff, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      toast.error('Invalid credentials. Check email and password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center p-4">
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(#00d4ff 1px, transparent 1px), linear-gradient(90deg, #00d4ff 1px, transparent 1px)',
        backgroundSize: '60px 60px', pointerEvents: 'none'
      }} />

      {/* Glow orbs */}
      <div style={{
        position: 'fixed', top: '20%', left: '15%', width: '400px', height: '400px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            background: 'rgba(0, 212, 255, 0.08)', border: '1px solid rgba(0, 212, 255, 0.2)',
            borderRadius: '16px', padding: '12px 24px', marginBottom: '24px'
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ShoppingCart size={20} color="#050b14" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '22px', letterSpacing: '-0.02em', color: '#e8f4ff' }}>
              Swift<span style={{ color: '#00d4ff' }}>POS</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Point of Sale System v1.0
          </p>
        </div>

        {/* Card */}
        <div className="glass-card glow-cyan" style={{ padding: '36px' }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '24px', margin: '0 0 6px', color: 'var(--text-primary)' }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
              Sign in to access your store dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontFamily: 'Syne', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="input-field"
                  placeholder="admin@yourstore.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontFamily: 'Syne', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: '38px', paddingRight: '40px' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '13px', fontSize: '14px', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {loading ? (
                <>
                  <div style={{ width: '16px', height: '16px', border: '2px solid rgba(5,11,20,0.3)', borderTopColor: '#050b14', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  Signing in...
                </>
              ) : (
                <>
                  <Zap size={16} strokeWidth={2.5} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(0, 229, 160, 0.05)', border: '1px solid rgba(0, 229, 160, 0.1)', borderRadius: '10px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Demo: </span>
              Create a Firebase account and update <code style={{ background: 'rgba(255,255,255,0.05)', padding: '1px 4px', borderRadius: '4px', fontSize: '11px' }}>src/firebase/config.js</code> with your credentials.
            </p>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
