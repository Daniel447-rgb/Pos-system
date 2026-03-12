import React, { useEffect, useState } from 'react';
import { subscribeProducts, addProduct, updateProduct, deleteProduct, CATEGORIES } from '../../firebase/services';
import { Plus, Search, Edit2, Trash2, Package, Image, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { name: '', price: '', stock: '', category: 'Other', description: '', imageUrl: '', sku: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => subscribeProducts(setProducts), []);

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || p.category === catFilter;
    return matchSearch && matchCat;
  });

  function openAdd() { setForm(EMPTY); setEditId(null); setModal('form'); }
  function openEdit(p) { setForm({ name: p.name, price: p.price, stock: p.stock, category: p.category, description: p.description || '', imageUrl: p.imageUrl || '', sku: p.sku || '' }); setEditId(p.id); setModal('form'); }

  async function handleSave() {
    if (!form.name.trim()) return toast.error('Product name required');
    if (!form.price || isNaN(form.price)) return toast.error('Valid price required');
    if (form.stock === '' || isNaN(form.stock)) return toast.error('Valid stock quantity required');
    setSaving(true);
    try {
      const data = { name: form.name.trim(), price: parseFloat(form.price), stock: parseInt(form.stock), category: form.category, description: form.description, imageUrl: form.imageUrl, sku: form.sku };
      if (editId) {
        await updateProduct(editId, data);
        toast.success('Product updated');
      } else {
        await addProduct(data);
        toast.success('Product added');
      }
      setModal(null);
    } catch (err) {
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      setDeleteConfirm(null);
    } catch {
      toast.error('Delete failed');
    }
  }

  const cats = ['All', ...CATEGORIES];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '26px', margin: '0 0 4px' }}>Products</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>{products.length} products in catalog</p>
        </div>
        <button className="btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} strokeWidth={2.5} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" placeholder="Search products or SKU..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '36px' }} />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {cats.slice(0, 6).map(c => (
            <button key={c} onClick={() => setCatFilter(c)} style={{
              padding: '8px 14px', borderRadius: '8px', border: '1px solid',
              borderColor: catFilter === c ? 'rgba(0,212,255,0.4)' : 'var(--border)',
              background: catFilter === c ? 'rgba(0,212,255,0.1)' : 'transparent',
              color: catFilter === c ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontFamily: 'Syne', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
            }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Package size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p style={{ fontFamily: 'Syne', fontSize: '16px', fontWeight: 600, margin: '0 0 4px' }}>No products found</p>
          <p style={{ fontSize: '13px', margin: 0 }}>Add your first product or adjust filters</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
          {filtered.map(p => (
            <div key={p.id} className="glass-card" style={{ padding: '16px', transition: 'all 0.2s ease' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              {/* Image */}
              <div style={{ height: '100px', borderRadius: '10px', background: 'rgba(0,212,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', overflow: 'hidden' }}>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Package size={32} style={{ opacity: 0.2, color: 'var(--accent-cyan)' }} />
                )}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '14px', margin: '0 0 4px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 8px' }}>{p.category}{p.sku ? ` · ${p.sku}` : ''}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '18px', color: 'var(--accent-cyan)' }}>₦{p.price?.toLocaleString()}</span>
                  <span className={`badge ${p.stock <= 5 ? 'badge-amber' : p.stock <= 0 ? 'badge-rose' : 'badge-emerald'}`}>
                    {p.stock} in stock
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openEdit(p)} className="btn-secondary" style={{ flex: 1, padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px' }}>
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => setDeleteConfirm(p.id)} className="btn-danger" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {modal === 'form' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '20px', margin: 0 }}>{editId ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setModal(null)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Product Name *', key: 'name', placeholder: 'e.g. Coca-Cola 500ml' },
                { label: 'SKU / Barcode', key: 'sku', placeholder: 'e.g. CC-500-REG' },
                { label: 'Image URL', key: 'imageUrl', placeholder: 'https://...' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontFamily: 'Syne', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{f.label}</label>
                  <input className="input-field" placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Syne', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Price (₦) *</label>
                  <input className="input-field" type="number" min="0" placeholder="0.00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Syne', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Stock Qty *</label>
                  <input className="input-field" type="number" min="0" placeholder="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'Syne', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Category</label>
                <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'Syne', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Description</label>
                <textarea className="input-field" placeholder="Optional product description..." rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => setModal(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleSave} className="btn-primary" disabled={saving} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {saving ? 'Saving...' : <><Check size={15} /> Save Product</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '360px', textAlign: 'center' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={22} style={{ color: 'var(--accent-rose)' }} />
            </div>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '18px', margin: '0 0 8px' }}>Delete Product?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 24px' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
