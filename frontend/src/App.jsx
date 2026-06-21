import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';

const navItems = [
  { to: '/', icon: '📊', label: 'Dashboard', end: true },
  { to: '/products', icon: '📦', label: 'Products' },
  { to: '/customers', icon: '👥', label: 'Customers' },
  { to: '/orders', icon: '🛒', label: 'Orders' },
];

export default function App() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span>🏭</span>
            <div>
              <div>Inventory</div>
              <div style={{ fontSize: 11, fontWeight: 400, color: 'var(--gray-400)' }}>& Order Management</div>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Navigation</div>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid var(--gray-700)', color: 'var(--gray-500)', fontSize: 12 }}>
          v1.0.0
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
        </Routes>
      </main>
    </div>
  );
}
