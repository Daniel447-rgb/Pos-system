import React, { useEffect, useState, useRef } from 'react';
import { subscribeProducts, subscribeCustomers, createTransaction, updateCustomerStats } from '../../firebase/services';
import { Search, Plus, Minus, Trash2, ShoppingCart, X, CreditCard, Banknote, Receipt, User, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function POS() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [receiptModal, setReceiptModal] = useState(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [processing, setProcessing] = useState(false);
  const searchRef = useRef();

  useEffect(() => { subscribeProducts(setProducts); subscribeCustomers(setCustomers); }, []);
  useEffect(() => { if (searchRef.current) searchRef.current.focus(); }, []);

  const categories = ['All', ...new Set(products.map(p => p.category))];
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || p.category === catFilter;
    return matchSearch && matchCat && p.stock > 0;
  });

  function addToCart(product) {
    if (product.stock <= 0) return toast.error('Out of stock');
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return toast.error('Not enough stock') || prev;
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1, maxStock: product.stock }];
    });
  }

  function updateQty(productId, delta) {
    setCart(prev => prev.map(i => {
      if (i.productId !== productId) return i;
      const newQty = i.quantity + delta;
      if (newQty <= 0) return null;
      if (newQty > i.maxStock) { toast.error('Not enough stock'); return i; }
      return { ...i, quantity: newQty };
    }).filter(Boolean));
  }

  function removeFromCart(productId) { setCart(prev => prev.filter(i => i.productId !== productId)); }

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = 0; // add tax logic if needed
  const total = subtotal + tax;
  const change = parseFloat(amountPaid || 0) - total;

  async function processPayment() {
    if (cart.length === 0) return toast.error('Cart is empty');
    if (paymentMethod === 'Cash' && parseFloat(amountPaid) < total) return toast.error('Insufficient payment amount');
    setProcessing(true);
    try {
      const txData = {
        items: cart.map(i => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity, subtotal: i.price * i.quantity })),
        subtotal, tax, total,
        paymentMethod,
        amountPaid: paymentMethod === 'Cash' ? parseFloat(amountPaid) : total,
        change: paymentMethod === 'Cash' ? Math.max(0, change) : 0,
        customerId: selectedCustomer?.id || null,
        customerName: selectedCustomer?.name || null,
      };
      const txId = await createTransaction(txData);
      if (selectedCustomer) await updateCustomerStats(selectedCustomer.id, total);

      const receipt = { ...txData, id: txId, createdAt: new Date() };
      setCart([]);
      setAmountPaid('');
      setSelectedCustomer(null);
      setCheckoutModal(false);
      setReceiptModal(receipt);
      toast.success('Sale completed!');
    } catch (err) {
      toast.error('Transaction failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  }

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.includes(customerSearch)
  );

  return (
    <div style={{ display: 'flex', gap: '16px', height: 'calc(100vh - 104px)' }}>
      {/* Left: Product Grid */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input ref={searchRef} className="input-field" placeholder="Search product name or scan barcode..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '42px', fontSize: '15px', padding: '13px 14px 13px 42px' }} />
          </div>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map(c => (
              <button key={c} onClick={() => setCatFilter(c)} style={{
                padding: '6px 14px', borderRadius: '8px', border: '1px solid', whiteSpace: 'nowrap',
                borderColor: catFilter === c ? 'rgba(0,212,255,0.4)' : 'var(--border)',
                background: catFilter === c ? 'rgba(0,212,255,0.1)' : 'transparent',
                color: catFilter === c ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontFamily: 'Syne', fontSize: '12px', fontWeight: 600, cursor: 'pointer'
              }}>{c}</button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', alignContent: 'start' }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <Search size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <p style={{ fontFamily: 'Syne', fontSize: '14px', fontWeight: 600, margin: 0 }}>No products found</p>
            </div>
          ) : filtered.map(p => (
            <div key={p.id} className="product-card-pos" onClick={() => addToCart(p)} style={{ padding: '14px', cursor: 'pointer' }}>
              <div style={{ height: '70px', borderRadius: '8px', background: 'rgba(0,212,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', overflow: 'hidden' }}>
                {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                  : <div style={{ fontSize: '28px' }}>{p.category === 'Beverages' ? '🥤' : p.category === 'Grocery' ? '🛒' : p.category === 'Dairy' ? '🥛' : '📦'}</div>}
              </div>
              <p style={{ fontFamily: 'Syne', fontSize: '13px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '15px', color: 'var(--accent-cyan)' }}>₦{p.price?.toLocaleString()}</span>
                <span style={{ fontSize: '10px', color: p.stock <= 5 ? 'var(--accent-amber)' : 'var(--text-muted)', fontFamily: 'Syne', fontWeight: 600 }}>{p.stock}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="glass-card" style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '16px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={18} style={{ color: 'var(--accent-cyan)' }} />
            Cart
          </h2>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px', fontFamily: 'Syne', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Customer */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ position: 'relative' }}>
            <User size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input-field" placeholder="Search customer (optional)..." value={customerSearch}
              onChange={e => { setCustomerSearch(e.target.value); if (!e.target.value) setSelectedCustomer(null); }}
              style={{ paddingLeft: '32px', fontSize: '13px', paddingTop: '9px', paddingBottom: '9px' }} />
          </div>
          {customerSearch && !selectedCustomer && filteredCustomers.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', marginTop: '4px', overflow: 'hidden', maxHeight: '120px', overflowY: 'auto' }}>
              {filteredCustomers.slice(0, 4).map(c => (
                <div key={c.id} onClick={() => { setSelectedCustomer(c); setCustomerSearch(c.name); }} style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <p style={{ fontFamily: 'Syne', fontSize: '13px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>{c.name}</p>
                  <p style={{ fontSize: '11px', margin: 0, color: 'var(--text-muted)' }}>{c.phone}</p>
                </div>
              ))}
            </div>
          )}
          {selectedCustomer && (
            <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: '8px' }}>
              <Check size={12} style={{ color: 'var(--accent-emerald)' }} />
              <span style={{ fontSize: '12px', color: 'var(--accent-emerald)', fontFamily: 'Syne', fontWeight: 600 }}>{selectedCustomer.name}</span>
              <button onClick={() => { setSelectedCustomer(null); setCustomerSearch(''); }} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '14px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <ShoppingCart size={36} style={{ marginBottom: '12px', opacity: 0.2 }} />
              <p style={{ fontSize: '13px', fontFamily: 'Syne', margin: 0 }}>Click products to add them</p>
            </div>
          ) : cart.map(item => (
            <div key={item.productId} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid rgba(26,48,80,0.5)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'Syne', fontSize: '13px', fontWeight: 600, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                <p style={{ fontSize: '12px', margin: 0, color: 'var(--accent-cyan)', fontFamily: 'Syne', fontWeight: 700 }}>₦{(item.price * item.quantity).toLocaleString()}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button onClick={() => updateQty(item.productId, -1)} style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Minus size={12} />
                </button>
                <span style={{ fontFamily: 'Syne', fontSize: '14px', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                <button onClick={() => updateQty(item.productId, 1)} style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', cursor: 'pointer', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={12} />
                </button>
                <button onClick={() => removeFromCart(item.productId)} style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'rgba(255,77,109,0.06)', border: '1px solid rgba(255,77,109,0.15)', cursor: 'pointer', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Subtotal</span>
            <span style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: '13px' }}>₦{subtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border)', marginTop: '6px' }}>
            <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '15px' }}>Total</span>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '18px', color: 'var(--accent-cyan)' }}>₦{total.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={() => setCheckoutModal(true)}
          disabled={cart.length === 0}
          className="btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: cart.length === 0 ? 0.5 : 1 }}
        >
          <Receipt size={18} strokeWidth={2.5} />
          Checkout · ₦{total.toLocaleString()}
        </button>
      </div>

      {/* Checkout Modal */}
      {checkoutModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '20px', margin: 0 }}>Checkout</h2>
              <button onClick={() => setCheckoutModal(false)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {['Cash', 'Card', 'Transfer'].map(m => (
                <button key={m} onClick={() => setPaymentMethod(m)} style={{
                  flex: 1, padding: '12px 8px', borderRadius: '10px', border: '1px solid', cursor: 'pointer',
                  borderColor: paymentMethod === m ? 'rgba(0,212,255,0.5)' : 'var(--border)',
                  background: paymentMethod === m ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.02)',
                  color: paymentMethod === m ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  fontFamily: 'Syne', fontSize: '13px', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
                }}>
                  {m === 'Cash' ? <Banknote size={18} /> : m === 'Card' ? <CreditCard size={18} /> : <Receipt size={18} />}
                  {m}
                </button>
              ))}
            </div>

            <div style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              {cart.map(i => (
                <div key={i.productId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{i.name} × {i.quantity}</span>
                  <span style={{ fontFamily: 'Syne', fontSize: '13px', fontWeight: 600 }}>₦{(i.price * i.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'Syne', fontWeight: 700 }}>Total</span>
                <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '18px', color: 'var(--accent-cyan)' }}>₦{total.toLocaleString()}</span>
              </div>
            </div>

            {paymentMethod === 'Cash' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontFamily: 'Syne', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Amount Tendered</label>
                <input className="input-field" type="number" placeholder="0.00" value={amountPaid}
                  onChange={e => setAmountPaid(e.target.value)}
                  style={{ fontSize: '18px', fontFamily: 'Syne', fontWeight: 700, textAlign: 'right', color: 'var(--accent-emerald)' }} />
                {parseFloat(amountPaid) >= total && (
                  <p style={{ textAlign: 'right', fontFamily: 'Syne', fontSize: '13px', color: 'var(--accent-emerald)', marginTop: '8px', fontWeight: 600 }}>
                    Change: ₦{(parseFloat(amountPaid) - total).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            <button onClick={processPayment} disabled={processing} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              {processing ? 'Processing...' : <><Check size={18} strokeWidth={2.5} /> Complete Sale</>}
            </button>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptModal && (
        <div className="modal-overlay">
          <div className="modal-box receipt-print" style={{ maxWidth: '380px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #00e5a0, #00b37a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Check size={26} color="#050b14" strokeWidth={3} />
              </div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '20px', margin: '0 0 4px', color: 'var(--accent-emerald)' }}>Sale Complete!</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Receipt #{receiptModal.id?.slice(-6).toUpperCase()}</p>
            </div>

            <div style={{ background: 'rgba(0,229,160,0.04)', border: '1px solid rgba(0,229,160,0.1)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed rgba(0,229,160,0.2)' }}>
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '22px', color: 'var(--accent-emerald)' }}>SwiftPOS</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{format(receiptModal.createdAt, 'MMM d, yyyy · HH:mm')}</div>
              </div>
              {receiptModal.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.name} × {item.quantity}</span>
                  <span style={{ fontFamily: 'Syne', fontSize: '13px', fontWeight: 600 }}>₦{item.subtotal?.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px dashed rgba(0,229,160,0.2)', paddingTop: '10px', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'Syne', fontWeight: 700 }}>Total</span>
                  <span style={{ fontFamily: 'Syne', fontWeight: 800, color: 'var(--accent-cyan)' }}>₦{receiptModal.total?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>Payment: {receiptModal.paymentMethod}</span>
                  {receiptModal.change > 0 && <span>Change: ₦{receiptModal.change?.toLocaleString()}</span>}
                </div>
                {receiptModal.customerName && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>Customer: {receiptModal.customerName}</div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => window.print()} className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Receipt size={15} /> Print
              </button>
              <button onClick={() => setReceiptModal(null)} className="btn-primary" style={{ flex: 1 }}>
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
