import React, { useEffect, useState } from 'react';
import { subscribeProducts, updateProduct } from '../../firebase/services';
import { AlertTriangle, Package, TrendingDown, Edit2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [editingStock, setEditingStock] = useState(null);
  const [newStock, setNewStock] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => subscribeProducts(setProducts), []);

  const filtered = products.filter(p => {
    if (filter === 'low') return p.stock <= 5 && p.stock > 0;
    if (filter === 'out') return p.stock <= 0;
    if (filter === 'ok') return p.stock > 5;
    return true;
  });

  const lowCount = products.filter(p => p.stock <= 5 && p.stock > 0).length;
  const outCount = products.filter(p => p.stock <= 0).length;
  const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);

  async function saveStock(id) {
    if (newStock === '' || isNaN(newStock)) return toast.error('Enter valid stock');
    try {
      await updateProduct(id, { stock: parseInt(newStock) });
      toast.success('Stock updated');
      setEditingStock(null);
    } catch {
      toast.error('Failed to update');
    }
  }

  const filters = [
    { key: 'all', label: 'All Products', count: products.length },
    { key: 'low', label: 'Low Stock', count: lowCount, color: 'amber' },
    { key: 'out', label: 'Out of Stock', count: outCount, color: 'rose' },
    { key: 'ok', label: 'In Stock', count: products.length - lowCount - outCount, color: 'emerald' },
  ];

  function getStockStatus(stock) {
    if (stock <= 0) return { label: 'Out of Stock', class: 'badge-rose' };
    if (stock <= 5) return { label: 'Low Stock', class: 'badge-amber' };
    return { label: 'In Stock', class: 'badge-emerald' };
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '26px', margin: '0 0 4px' }}>Inventory</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Track and manage product stock levels</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Products', value: products.length, icon: Package, color: '#00d4ff' },
          { label: 'Total Stock Units', value: totalStock.toLocaleString(), icon: Package, color: '#00e5a0' },
          { label: 'Low Stock Items', value: lowCount, icon: TrendingDown, color: '#ffb800' },
          { label: 'Out of Stock', value: outCount, icon: AlertTriangle, color: '#ff4d6d' },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${s.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <div style={{ fontFamily: 'Syne', fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', fontFamily: 'Syne', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '8px 16px', borderRadius: '8px', border: '1px solid',
            borderColor: filter === f.key ? 'rgba(0,212,255,0.4)' : 'var(--border)',
            background: filter === f.key ? 'rgba(0,212,255,0.1)' : 'transparent',
            color: filter === f.key ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            fontFamily: 'Syne', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            {f.label}
            <span style={{ background: filter === f.key ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.06)', padding: '1px 7px', borderRadius: '999px', fontSize: '11px' }}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {lowCount > 0 && filter !== 'ok' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', background: 'rgba(255,184,0,0.06)', borderBottom: '1px solid rgba(255,184,0,0.15)' }}>
            <AlertTriangle size={16} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
            <p style={{ fontSize: '13px', color: 'var(--accent-amber)', margin: 0, fontFamily: 'Syne', fontWeight: 600 }}>
              {lowCount} item{lowCount > 1 ? 's' : ''} running low on stock. Consider restocking soon.
            </p>
          </div>
        )}
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <Package size={32} style={{ marginBottom: '8px', opacity: 0.3, display: 'block', margin: '0 auto 8px' }} />
                  No products in this category
                </td>
              </tr>
            ) : filtered.map(p => {
              const status = getStockStatus(p.stock);
              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(0,212,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <Package size={14} style={{ opacity: 0.3, color: 'var(--accent-cyan)' }} />}
                      </div>
                      <span style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: '14px' }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'Syne' }}>{p.sku || '—'}</td>
                  <td><span className="badge badge-muted">{p.category}</span></td>
                  <td style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--accent-cyan)' }}>₦{p.price?.toLocaleString()}</td>
                  <td>
                    {editingStock === p.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          className="input-field"
                          type="number" min="0"
                          value={newStock}
                          onChange={e => setNewStock(e.target.value)}
                          style={{ width: '70px', padding: '6px 8px', fontSize: '13px' }}
                          autoFocus
                          onKeyDown={e => { if (e.key === 'Enter') saveStock(p.id); if (e.key === 'Escape') setEditingStock(null); }}
                        />
                        <button onClick={() => saveStock(p.id)} style={{ background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: 'var(--accent-emerald)', display: 'flex' }}>
                          <Check size={12} />
                        </button>
                        <button onClick={() => setEditingStock(null)} style={{ background: 'rgba(255,77,109,0.06)', border: '1px solid rgba(255,77,109,0.15)', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: 'var(--accent-rose)', display: 'flex' }}>
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '16px', color: p.stock <= 0 ? 'var(--accent-rose)' : p.stock <= 5 ? 'var(--accent-amber)' : 'var(--text-primary)' }}>
                        {p.stock}
                      </span>
                    )}
                  </td>
                  <td><span className={`badge ${status.class}`}>{status.label}</span></td>
                  <td>
                    {editingStock !== p.id && (
                      <button onClick={() => { setEditingStock(p.id); setNewStock(String(p.stock)); }}
                        style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: 'var(--accent-cyan)', fontFamily: 'Syne', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Edit2 size={11} /> Adjust
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
