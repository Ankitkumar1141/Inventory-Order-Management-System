import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    dashboardApi.getStats()
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <div className="page-header"><h1>Dashboard</h1></div>
      <div className="page-body"><div className="loading"><div className="spinner" /> Loading...</div></div>
    </div>
  );

  if (error) return (
    <div>
      <div className="page-header"><h1>Dashboard</h1></div>
      <div className="page-body"><div className="error-msg">{error}</div></div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>Overview of your inventory</span>
      </div>
      <div className="page-body">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">📦</div>
            <div>
              <div className="stat-value">{stats.total_products}</div>
              <div className="stat-label">Total Products</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">👥</div>
            <div>
              <div className="stat-value">{stats.total_customers}</div>
              <div className="stat-label">Total Customers</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">🛒</div>
            <div>
              <div className="stat-value">{stats.total_orders}</div>
              <div className="stat-label">Total Orders</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange">⚠️</div>
            <div>
              <div className="stat-value">{stats.low_stock_products.length}</div>
              <div className="stat-label">Low Stock Items</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">💰</div>
            <div>
              <div className="stat-value">${stats.total_revenue.toFixed(2)}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">🏷️</div>
            <div>
              <div className="stat-value">${stats.inventory_value.toFixed(2)}</div>
              <div className="stat-label">Inventory Value</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">⚠️ Low Stock Products</span>
            <Link to="/products" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          {stats.low_stock_products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <h3>All products are well-stocked</h3>
              <p>No products below the low stock threshold</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.low_stock_products.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td><code style={{ background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{p.sku}</code></td>
                      <td>${p.price.toFixed(2)}</td>
                      <td>{p.quantity}</td>
                      <td>
                        <span className={`badge ${p.quantity === 0 ? 'badge-cancelled' : 'badge-warning'}`}>
                          {p.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
