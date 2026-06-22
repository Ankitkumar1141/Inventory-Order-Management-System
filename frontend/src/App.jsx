import React from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

const navItems = [
  { to: '/', icon: '📊', label: 'Dashboard', end: true },
  { to: '/products', icon: '📦', label: 'Products' },
  { to: '/customers', icon: '👥', label: 'Customers' },
  { to: '/orders', icon: '🛒', label: 'Orders' },
];

function AuthenticatedLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--gray-700)' }}>
          <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 8 }}>
            Signed in as <strong style={{ color: 'var(--gray-200)' }}>{user?.username}</strong>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ width: '100%', fontSize: 13, padding: '6px 12px' }}
          >
            Sign Out
          </button>
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

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
