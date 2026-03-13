import React, { useEffect, useState } from 'react';
import { subscribeTransactions } from '../../firebase/services';
import { format } from 'date-fns';
import { BarChart2, DollarSign, ShoppingBag, TrendingUp, Calendar, Eye, X, Printer, Download } from 'lucide-react';

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

  function exportCSV() {
    if (displayed.length === 0) return;

    const rows = [
      ['Receipt #', 'Date', 'Time', 'Customer', 'Items', 'Payment Method', 'Subtotal', 'Total', 'Change'],
      ...displayed.map(tx => [
        '#' + tx.id.slice(-6).toUpperCase(),
        tx.date || '',
        tx.createdAt?.toDate ? format(tx.createdAt.toDate(), 'HH:mm:ss') : '',
        tx.customerName || 'Walk-in',
        tx.items?.length || 0,
        tx.paymentMethod || 'Cash',
        tx.subtotal || 0,
        tx.total || 0,
        tx.change || 0,
      ])
    ];

    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swiftpos-sales-${viewAll ? 'all' : dateFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '24px', margin: '0 0 4px' }}>Sales History</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
          {viewAll ? `${transactions.length} total transactions` : `Results for ${format(new Date(dateFilter), 'MMM d, yyyy')}`}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '140px' }}>
          <Calendar size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="date"
            className="input-field"
            value={dateFilter}
            onChange={e => { setDateFilter(e.target.value); setViewAll(false); }}
            style={{ paddingLeft: '32px' }}
          />
        </div>
        <button onClick={() => setViewAll(!viewAll)} className={viewAll ? 'btn-primary' : 'btn-secondary'} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
          {viewAll ? 'Date Filter' : 'View All'}
        </button>
        <button
          onClick={exportCSV}
          disabled={displayed.length === 0}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)', color: 'var(--accent-emerald)', fontFamily: 'Syne', fontSize: '13px', fontWeight: 600, cursor: displayed.length === 0 ? 'not-allowed' : 'pointer', opacity: displayed.length === 0 ? 0.5 : 1, flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Summary Cards — 2 column grid on all screens */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Revenue', value: `₦${totalSales.toLocaleString()}`, icon: DollarSign, color: '#00d4ff' },
          { label: 'Transactions', value: displayed.length, icon: ShoppingBag, color: '#00e5a0' },
          { label: 'Items Sold', value: totalItems, icon: BarChart2, color: '#ffb800' },
          { label: 'Avg Sale', value: `₦${Math.round(avgSale).toLocaleString()}`, icon: TrendingUp, color: '#c084fc' },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${s.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={17} style={{ color: s.color }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'Syne', fontSize: '17px', fontWeight: 800, lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px', fontFamily: 'Syne', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Transaction Cards — replaces table for mobile friendliness */}
      {displayed.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <ShoppingBag size={32} style={{ display: 'block', margin: '0 auto 8px', opacity: 0.3 }} />
          <p style={{ fontFamily: 'Syne', fontSize: '14px', margin: 0 }}>No transactions found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {displayed.map(tx => (
            <div key={tx.id} className="glass-card" style={{ padding: '16px', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>

              {/* Row 1: ID + Amount */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '14px', color: 'var(--accent-cyan)' }}>
                    #{tx.id.slice(-6).toUpperCase()}
                  </span>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '3px 0 0' }}>
                    {tx.date}{tx.createdAt?.toDate ? ' · ' + format(tx.createdAt.toDate(), 'HH:mm') : ''}
                  </p>
                </div>
                <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '20px', color: 'var(--accent-emerald)' }}>
                  ₦{(tx.total || 0).toLocaleString()}
                </span>
              </div>

              {/* Row 2: Badges */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px', alignItems: 'center' }}>
                <span className="badge badge-muted">{tx.items?.length || 0} item{tx.items?.length !== 1 ? 's' : ''}</span>
                <span className={`badge ${tx.paymentMethod === 'Cash' ? 'badge-emerald' : tx.paymentMethod === 'Card' ? 'badge-cyan' : 'badge-muted'}`}>
                  {tx.paymentMethod || 'Cash'}
                </span>
                <span style={{ fontSize: '12px', color: tx.customerName ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                  {tx.customerName ? `👤 ${tx.customerName}` : 'Walk-in'}
                </span>
              </div>

              {/* Row 3: View Receipt button */}
              <button
                onClick={() => setDetailTx(tx)}
                style={{
                  width: '100%', padding: '10px', borderRadius: '10px',
                  background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)',
                  color: 'var(--accent-cyan)', fontFamily: 'Syne', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}>
                <Eye size={14} /> View Receipt
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Receipt Detail Modal */}
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
              <button onClick={() => setDetailTx(null)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
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
                  <span style={{ fontFamily: 'Syne', fontWeight: 700 }}>₦{item.subtotal?.toLocaleString()}</span>
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
