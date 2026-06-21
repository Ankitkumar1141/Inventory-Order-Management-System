import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ordersApi } from '../services/api';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.getById(id)
      .then(res => setOrder(res.data))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm(`Cancel order #${id}?`)) return;
    try {
      await ordersApi.delete(id);
      toast.success('Order cancelled');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to cancel');
    }
  };

  const statusBadge = (status) => {
    const map = { pending: 'badge-pending', completed: 'badge-completed', cancelled: 'badge-cancelled' };
    return <span className={`badge ${map[status] || ''}`} style={{ fontSize: 13 }}>{status}</span>;
  };

  if (loading) return (
    <div>
      <div className="page-header"><h1>Order Details</h1></div>
      <div className="page-body"><div className="loading"><div className="spinner" /> Loading...</div></div>
    </div>
  );

  if (!order) return (
    <div>
      <div className="page-header"><h1>Order Details</h1></div>
      <div className="page-body"><div className="error-msg">Order not found.</div></div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/orders" className="btn btn-secondary btn-sm">← Back</Link>
          <h1>Order #{order.id}</h1>
          {statusBadge(order.status)}
        </div>
        <button className="btn btn-danger" onClick={handleCancel}>Cancel Order</button>
      </div>
      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Customer Info</span></div>
            <div className="card-body">
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 2 }}>Name</div>
                <div style={{ fontWeight: 600 }}>{order.customer?.full_name}</div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 2 }}>Email</div>
                <div>{order.customer?.email}</div>
              </div>
              {order.customer?.phone && (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 2 }}>Phone</div>
                  <div>{order.customer.phone}</div>
                </div>
              )}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Order Summary</span></div>
            <div className="card-body">
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 2 }}>Status</div>
                <div>{statusBadge(order.status)}</div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 2 }}>Date</div>
                <div>{new Date(order.created_at).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 2 }}>Total Amount</div>
                <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--primary)' }}>${order.total_amount.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Order Items</span></div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--gray-400)' }}>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{item.product?.name || `Product #${item.product_id}`}</td>
                    <td><code style={{ background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{item.product?.sku || '—'}</code></td>
                    <td>${item.unit_price.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td style={{ fontWeight: 600 }}>${(item.unit_price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} style={{ textAlign: 'right', fontWeight: 600, paddingRight: 16, paddingTop: 12, paddingBottom: 12 }}>Total</td>
                  <td style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary)', paddingTop: 12, paddingBottom: 12 }}>${order.total_amount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
