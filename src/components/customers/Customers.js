import React, { useEffect, useState } from 'react';
import { subscribeCustomers, addCustomer, updateCustomer, deleteCustomer, subscribeTransactions } from '../../firebase/services';
import { Users, Plus, Search, Edit2, Trash2, X, Check, Phone, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const EMPTY = { name: '', phone: '', email: '', notes: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { subscribeCustomers(setCustomers); subscribeTransactions(setTransactions); }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  function getCustomerTx(customerId) {
    return transactions.filter(t => t.customerId === customerId);
  }

  function openAdd() { setForm(EMPTY); setEditId(null); setModal('form'); }
  function openEdit(c) { setForm({ name: c.name, phone: c.phone || '', email: c.email || '', notes: c.notes || '' }); setEditId(c.id); setModal('form'); }

  async function handleSave() {
    if (!form.name.trim()) return toast.error('Customer name required');
    setSaving(true);
    try {
      if (editId) { await updateCustomer(editId, form); toast.success('Customer updated'); }
      else { await addCustomer(form); toast.success('Customer added'); }
      setModal(null);
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    try { await deleteCustomer(id); toast.success('Customer deleted'); setDeleteConfirm(null); }
    catch { toast.error('Delete failed'); }
  }

  const totalRevenue = customers.reduce((s, c) => s + (c.totalSpent || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '26px', margin: '0 0 4px' }}>Customers</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>{customers.length} registered customers</p>
        </div>
        <button className="btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} strokeWidth={2.5} /> Add Customer
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Customers', value: customers.length, icon: Users, color: '#00d4ff' },
          { label: 'Total Revenue', value: `₦${totalRevenue.toLocaleString()}`, icon: ShoppingBag, color: '#00e5a0' },
          { label: 'Avg Spend', value: customers.length > 0 ? `₦${Math.round(totalRevenue / customers.length).toLocaleString()}` : '₦0', icon: ShoppingBag, color: '#ffb800' },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${s.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <div style={{ fontFamily: 'Syne', fontSize: '20px', fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', fontFamily: 'Syne', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input-field" placeholder="Search by name, phone, or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '36px' }} />
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Visits</th>
              <th>Total Spent</th>
              <th>Last Visit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <Users size={32} style={{ display: 'block', margin: '0 auto 8px', opacity: 0.3 }} />
                  <p style={{ fontFamily: 'Syne', fontSize: '14px', margin: 0 }}>No customers found</p>
                </td>
              </tr>
            ) : filtered.map(c => {
              const txList = getCustomerTx(c.id);
              return (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,153,204,0.2))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Syne', fontWeight: 700, fontSize: '14px', color: 'var(--accent-cyan)'
                      }}>
                        {c.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontFamily: 'Syne', fontSize: '14px', fontWeight: 600, margin: '0 0 2px' }}>{c.name}</p>
                        {c.notes && <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{c.notes}</p>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px' }}>
                      {c.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}><Phone size={11} /> {c.phone}</div>}
                      {c.email && <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>{c.email}</div>}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-muted">{c.transactionCount || txList.length} visits</span>
                  </td>
                  <td style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    ₦{(c.totalSpent || 0).toLocaleString()}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {c.lastVisit?.toDate ? format(c.lastVisit.toDate(), 'MMM d, yyyy') : c.createdAt?.toDate ? format(c.createdAt.toDate(), 'MMM d, yyyy') : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => openEdit(c)} style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '7px', padding: '6px 10px', cursor: 'pointer', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Syne', fontSize: '12px', fontWeight: 600 }}>
                        <Edit2 size={11} /> Edit
                      </button>
                      <button onClick={() => setDeleteConfirm(c.id)} style={{ background: 'rgba(255,77,109,0.06)', border: '1px solid rgba(255,77,109,0.15)', borderRadius: '7px', padding: '6px', cursor: 'pointer', color: 'var(--accent-rose)', display: 'flex' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {modal === 'form' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '20px', margin: 0 }}>{editId ? 'Edit Customer' : 'Add Customer'}</h2>
              <button onClick={() => setModal(null)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Full Name *', key: 'name', placeholder: 'Customer full name', type: 'text' },
                { label: 'Phone Number', key: 'phone', placeholder: '+234 800 000 0000', type: 'tel' },
                { label: 'Email Address', key: 'email', placeholder: 'customer@example.com', type: 'email' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontFamily: 'Syne', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{f.label}</label>
                  <input className="input-field" type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontFamily: 'Syne', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Notes</label>
                <textarea className="input-field" placeholder="Optional notes..." rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => setModal(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleSave} className="btn-primary" disabled={saving} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {saving ? 'Saving...' : <><Check size={15} /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '360px', textAlign: 'center' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={22} style={{ color: 'var(--accent-rose)' }} />
            </div>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '18px', margin: '0 0 8px' }}>Delete Customer?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 24px' }}>This cannot be undone.</p>
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
