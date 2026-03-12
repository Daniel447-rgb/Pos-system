import React, { useEffect, useState } from 'react';
import { subscribeTransactions, getTransactionById } from '../../firebase/services';
import { format } from 'date-fns';
import { BarChart2, DollarSign, ShoppingBag, TrendingUp, Calendar, Eye, X, Receipt, Printer } from 'lucide-react';

export default function SalesHistory() {
  const [transactions, setTransactions] = useState([]);
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [viewAll, setViewAll] = useState(false);
  const [detailTx, setDetailTx] = useState(null);

  useEffect(() => subscribeTransactions(setTransactions), []);

  const displayed = viewAll ? transactions : transactions.filter(t => t.date === dateFilter);
  const totalSales = displayed.reduce((s, t) => s + (t.total || 0), 0);
  const avgSale = displayed.length > 0 ? totalSales / displayed.length : 0;
  const totalItems = displayed.reduce((s, t) => s + (t.items?.reduce((si, i) => si + i.quantity, 0) || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '26px', margin: '0 0 4px' }}>Sales History</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            {viewAll ? `${transactions.length} total transactions` : `Showing results for ${format(new Date(dateFilter), 'MMM d, yyyy')}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Calendar size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="date"
              className="input-field"
              value={dateFilter}
              onChange={e => { setDateFilter(e.target.value); setViewAll(false); }}
              style={{ paddingLeft: '32px', width: '160px' }}
            />
          </div>
          <button onClick={() => setViewAll(!viewAll)} className={viewAll ? 'btn-primary' : 'btn-secondary'} style={{ whiteSpace: 'nowrap' }}>
            {viewAll ? 'Date Filter' : 'View All'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Revenue', value: `₦${totalSales.toLocaleString()}`, icon: DollarSign, color: '#00d4ff' },
          { label: 'Transactions', value: displayed.length, icon: ShoppingBag, color: '#00e5a0' },
          { label: 'Items Sold', value: totalItems, icon: BarChart2, color: '#ffb800' },
          { label: 'Avg Sale', value: `₦${Math.round(avgSale).toLocaleString()}`, icon: TrendingUp, color: '#c084fc' },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${s.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <div style={{ fontFamily: 'Syne', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', fontFamily: 'Syne', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Receipt #</th>
              <th>Date & Time</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <ShoppingBag size={32} style={{ marginBottom: '8px', opacity: 0.3, display: 'block', margin: '0 auto 8px' }} />
                  <p style={{ fontFamily: 'Syne', fontSize: '14px', margin: 0 }}>No transactions found</p>
                </td>
              </tr>
            ) : displayed.map(tx => (
              <tr key={tx.id}>
                <td style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '13px', color: 'var(--accent-cyan)' }}>
                  #{tx.id.slice(-6).toUpperCase()}
                </td>
                <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <div>{tx.date}</div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {tx.createdAt?.toDate ? format(tx.createdAt.toDate(), 'HH:mm:ss') : '—'}
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{tx.customerName || 'Walk-in'}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{tx.items?.length || 0} items</td>
                <td><span className={`badge ${tx.paymentMethod === 'Cash' ? 'badge-emerald' : tx.paymentMethod === 'Card' ? 'badge-cyan' : 'badge-muted'}`}>{tx.paymentMethod || 'Cash'}</span></td>
                <td style={{ fontFamily: 'Syne', fontWeight: 800, color: 'var(--accent-emerald)' }}>₦{(tx.total || 0).toLocaleString()}</td>
                <td>
                  <button onClick={() => setDetailTx(tx)}
                    style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: 'var(--accent-cyan)', fontFamily: 'Syne', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Eye size={12} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {detailTx && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '18px', margin: '0 0 2px' }}>
                  Receipt #{detailTx.id.slice(-6).toUpperCase()}
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                  {detailTx.createdAt?.toDate ? format(detailTx.createdAt.toDate(), 'MMM d, yyyy · HH:mm') : detailTx.date}
                </p>
              </div>
              <button onClick={() => setDetailTx(null)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={16} />
              </button>
            </div>

            {detailTx.customerName && (
              <div style={{ padding: '10px 14px', background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Customer: </span>
                <span style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: '13px' }}>{detailTx.customerName}</span>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              {detailTx.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(26,48,80,0.5)' }}>
                  <div>
                    <p style={{ fontFamily: 'Syne', fontSize: '14px', fontWeight: 600, margin: '0 0 2px' }}>{item.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>₦{item.price?.toLocaleString()} × {item.quantity}</p>
                  </div>
                  <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--text-primary)' }}>₦{item.subtotal?.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(0,229,160,0.04)', border: '1px solid rgba(0,229,160,0.1)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Subtotal</span>
                <span style={{ fontFamily: 'Syne', fontWeight: 600 }}>₦{detailTx.subtotal?.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'Syne', fontWeight: 700 }}>Total</span>
                <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '18px', color: 'var(--accent-emerald)' }}>₦{detailTx.total?.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>Method: <span style={{ color: 'var(--text-secondary)', fontFamily: 'Syne', fontWeight: 600 }}>{detailTx.paymentMethod}</span></span>
                {detailTx.change > 0 && <span>Change: ₦{detailTx.change?.toLocaleString()}</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => window.print()} className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Printer size={14} /> Print
              </button>
              <button onClick={() => setDetailTx(null)} className="btn-primary" style={{ flex: 1 }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
