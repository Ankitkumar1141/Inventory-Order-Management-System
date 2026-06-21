import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { productsApi } from '../services/api';

const emptyForm = { name: '', sku: '', price: '', quantity: '', description: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadProducts = () => {
    setLoading(true);
    productsApi.getAll()
      .then(res => setProducts(res.data))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProducts(); }, []);

  const openAdd = () => {
    setEditProduct(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: product.quantity,
      description: product.description || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name || !form.sku || form.price === '' || form.quantity === '') {
      setFormError('Name, SKU, price, and quantity are required.');
      return;
    }
    const payload = {
      name: form.name,
      sku: form.sku,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity),
      description: form.description || null,
    };
    setSubmitting(true);
    try {
      if (editProduct) {
        await productsApi.update(editProduct.id, payload);
        toast.success('Product updated');
      } else {
        await productsApi.create(payload);
        toast.success('Product created');
      }
      setShowModal(false);
      loadProducts();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete product "${name}"?`)) return;
    try {
      await productsApi.delete(id);
      toast.success('Product deleted');
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>
      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <span className="card-title">📦 Product List ({products.length})</span>
          </div>
          {loading ? (
            <div className="loading"><div className="spinner" /> Loading...</div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3>No products yet</h3>
              <p>Add your first product to get started</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={p.id}>
                      <td style={{ color: 'var(--gray-400)' }}>{i + 1}</td>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td><code style={{ background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{p.sku}</code></td>
                      <td>${p.price.toFixed(2)}</td>
                      <td>{p.quantity}</td>
                      <td>
                        <span className={`badge ${p.quantity === 0 ? 'badge-cancelled' : p.quantity <= 10 ? 'badge-warning' : 'badge-success'}`}>
                          {p.quantity === 0 ? 'Out of Stock' : p.quantity <= 10 ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>Delete</button>
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
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editProduct ? 'Edit Product' : 'Add Product'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && <div className="error-msg">{formError}</div>}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Product name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SKU *</label>
                    <input className="form-control" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="e.g. PROD-001" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Price ($) *</label>
                    <input className="form-control" type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quantity *</label>
                    <input className="form-control" type="number" min="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="0" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
