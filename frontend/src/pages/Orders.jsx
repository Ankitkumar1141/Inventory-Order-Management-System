import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ordersApi, customersApi, productsApi } from '../services/api';

const emptyForm = { customer_id: '', items: [{ product_id: '', quantity: 1 }] };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadOrders = () => {
    setLoading(true);
    ordersApi.getAll()
      .then(res => setOrders(res.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
    customersApi.getAll().then(res => setCustomers(res.data));
    productsApi.getAll().then(res => setProducts(res.data));
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const addItem = () => {
    setForm(f => ({ ...f, items: [...f.items, { product_id: '', quantity: 1 }] }));
  };

  const removeItem = (idx) => {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  const updateItem = (idx, field, value) => {
    setForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...f, items };
    });
  };

  const calcTotal = () => {
    return form.items.reduce((sum, item) => {
      const product = products.find(p => p.id === parseInt(item.product_id));
      if (!product || !item.quantity) return sum;
      return sum + product.price * parseInt(item.quantity);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.customer_id) { setFormError('Please select a customer.'); return; }
    for (const item of form.items) {
      if (!item.product_id) { setFormError('Please select a product for all items.'); return; }
      if (!item.quantity || parseInt(item.quantity) <= 0) { setFormError('Quantity must be greater than 0.'); return; }
    }
    const payload = {
      customer_id: parseInt(form.customer_id),
      items: form.items.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) })),
    };
    setSubmitting(true);
    try {
      await ordersApi.create(payload);
      toast.success('Order created');
      setShowModal(false);
      loadOrders();
      productsApi.getAll().then(res => setProducts(res.data));
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Cancel order #${id}?`)) return;
    try {
      await ordersApi.delete(id);
      toast.success('Order cancelled');
      loadOrders();
      productsApi.getAll().then(res => setProducts(res.data));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to cancel order');
    }
  };

  const statusBadge = (status) => {
    const map = { pending: 'badge-pending', completed: 'badge-completed', cancelled: 'badge-cancelled' };
    return <span className={`badge ${map[status] || ''}`}>{status}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Orders</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Create Order</button>
      </div>
      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <span className="card-title">🛒 Order List ({orders.length})</span>
          </div>
          {loading ? (
            <div className="loading"><div className="spinner" /> Loading...</div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🛒</div>
              <h3>No orders yet</h3>
              <p>Create your first order to get started</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td><Link to={`/orders/${o.id}`} style={{ color: 'var(--primary)', fontWeight: 500 }}>#{o.id}</Link></td>
                      <td>{o.customer?.full_name || `Customer #${o.customer_id}`}</td>
                      <td>{o.items.length} item{o.items.length !== 1 ? 's' : ''}</td>
                      <td style={{ fontWeight: 500 }}>${o.total_amount.toFixed(2)}</td>
                      <td>{statusBadge(o.status)}</td>
                      <td style={{ color: 'var(--gray-500)' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Link to={`/orders/${o.id}`} className="btn btn-secondary btn-sm">View</Link>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>Cancel</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <span className="modal-title">Create Order</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && <div className="error-msg">{formError}</div>}
                <div className="form-group">
                  <label className="form-label">Customer *</label>
                  <select className="form-control" value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}>
                    <option value="">Select a customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
                  </select>
                </div>

                <hr className="divider" />
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: 'var(--gray-700)' }}>Order Items</div>

                {form.items.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <select className="form-control" value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)}>
                      <option value="">Select product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                          {p.name} — ${p.price.toFixed(2)} (stock: {p.quantity})
                        </option>
                      ))}
                    </select>
                    <input className="form-control" type="number" min="1" value={item.quantity}
                      onChange={e => updateItem(idx, 'quantity', e.target.value)} placeholder="Qty" />
                    <button type="button" className="btn btn-danger btn-icon" onClick={() => removeItem(idx)}
                      disabled={form.items.length === 1}>✕</button>
                  </div>
                ))}

                <button type="button" className="add-item-btn" onClick={addItem}>+ Add Item</button>

                {calcTotal() > 0 && (
                  <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>Estimated Total</span>
                    <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary)' }}>${calcTotal().toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
