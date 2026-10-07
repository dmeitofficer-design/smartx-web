'use client';
import { useState, useEffect } from 'react';
import ImageUpload from '@/app/components/ImageUpload';
import ToastContainer, { useToast } from '@/app/components/Toast';
import styles from './products.module.css';

const CATEGORIES = ['X-Ray Systems', 'Mobile X-ray', 'Ultrasound', 'Imaging Software','C-Arm', 'Accessories','FPD','BMD','OPG','Printer'];
const BADGES = ['', 'New', 'Bestseller', 'Featured', 'Limited'];

const EMPTY_PRODUCT = {
  name: '', category: 'X-Ray Systems', tagline: '', description: '', link: '', catalog: '',
  image: '', gallery: [], badge: '', published: true, order: 0,
  features: [], specifications: [],
};

function ProductForm({ initial, onSave, onCancel, saving }) {
  // Merge incoming record values with EMPTY_PRODUCT to ensure gallery is always an array
  const [data, setData] = useState({ ...EMPTY_PRODUCT, ...initial });
  
  const set = (k, v) => {
    setData(d => {
      const updated = { ...d, [k]: v };
      localStorage.setItem('product_form_draft', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    setData({ ...EMPTY_PRODUCT, ...initial });
  }, [initial]);

  const setFeature = (i, f, v) => {
    const arr = [...data.features]; arr[i] = { ...arr[i], [f]: v }; set('features', arr);
  };
  const addFeature = () => set('features', [...data.features, { title: '', description: '' }]);
  const removeFeature = (i) => set('features', data.features.filter((_, idx) => idx !== i));

  const setSpec = (i, f, v) => {
    const arr = [...data.specifications]; arr[i] = { ...arr[i], [f]: v }; set('specifications', arr);
  };
  const addSpec = () => set('specifications', [...data.specifications, { label: '', value: '' }]);
  const removeSpec = (i) => set('specifications', data.specifications.filter((_, idx) => idx !== i));

  // Dynamic gallery handler actions
  const addGalleryImage = () => set('gallery', [...(data.gallery || []), '']);
  const removeGalleryImage = (i) => set('gallery', (data.gallery || []).filter((_, idx) => idx !== i));
  const setGalleryImage = (i, val) => {
    const arr = [...(data.gallery || [])];
    arr[i] = val;
    set('gallery', arr);
  };

  return (
    <div className={styles.formWrap}>
      <div className={styles.formGrid}>
        {/* Left column */}
        <div className={styles.formLeft}>
          <div className="admin-section">
            <h2>Basic Information</h2>
            <div className="form-grid" style={{ gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label>Product Name *</label>
                <input className="form-input" required value={data.name} onChange={e => set('name', e.target.value)} placeholder="DRGEM GXR-SD" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label>Category *</label>
                  <select className="form-input" value={data.category} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Badge</label>
                  <select className="form-input" value={data.badge} onChange={e => set('badge', e.target.value)}>
                    {BADGES.map(b => <option key={b} value={b}>{b || '— None —'}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Tagline</label>
                <input className="form-input" value={data.tagline} onChange={e => set('tagline', e.target.value)} placeholder="Short description shown on product card" />
              </div>
              <div className="form-group">
                <label>Full Description</label>
                <textarea className="form-input" rows={5} value={data.description} onChange={e => set('description', e.target.value)} placeholder="Detailed product description..." />
              </div>

              {/* Fixed Layout Grid for Status, Order and External Link */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label>Display Order</label>
                  <input className="form-input" type="number" value={data.order} onChange={e => set('order', Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-input" value={data.published ? 'true' : 'false'} onChange={e => set('published', e.target.value === 'true')}>
                    <option value="true">Published</option>
                    <option value="false">Draft</option>
                  </select>
                </div>
              </div>

              {/* 🟢 Clean Link Field Placement */}
              <div className="form-group">
                <label>External / Reference Link</label>
                <input className="form-input" value={data.link || ''} onChange={e => set('link', e.target.value)} placeholder="https://example.com/product-page" />
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="admin-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
              <h2 style={{ marginBottom: 0 }}>Key Features</h2>
              <button type="button" className="btn btn-outline btn-sm" onClick={addFeature}><i className="fa-solid fa-plus" /> Add Feature</button>
            </div>
            {data.features.map((f, i) => (
              <div key={i} className={styles.featureRow}>
                <div style={{ flex: 1 }}>
                  <input className="form-input" value={f.title} onChange={e => setFeature(i, 'title', e.target.value)} placeholder="Feature title" style={{ marginBottom: 'var(--space-xs)' }} />
                  <input className="form-input" value={f.description} onChange={e => setFeature(i, 'description', e.target.value)} placeholder="Feature description (optional)" />
                </div>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeFeature(i)}><i className="fa-solid fa-trash" /></button>
              </div>
            ))}
            {data.features.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>No features yet.</p>}
          </div>
        </div>

        {/* Right column */}
        <div className={styles.formRight}>
          {/* Main Cover Image */}
          <div className="admin-section">
            <h2>Product Image (Cover)</h2>
            <ImageUpload value={data.image} onChange={v => set('image', v)} label="Product Image" height="220px" context="product" />
          </div>

          {/* 🟢 Product Catalog PDF / Brochure Upload Option */}
          <div className="admin-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xs)' }}>
              <h2>Product Catalog / Brochure</h2>
              {data.catalog && (
                <a 
                  href={data.catalog} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline btn-sm" 
                  style={{ textDecoration: 'none' }}
                >
                  <i className="fa-solid fa-file-pdf" /> Test Download
                </a>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 0, marginBottom: 'var(--space-sm)' }}>
              Upload or paste link to the downloadable product catalog PDF.
            </p>
            <ImageUpload 
              value={data.catalog || ''} 
              onChange={v => set('catalog', v)} 
              label="Upload Catalog PDF or URL" 
              height="100px" 
              allowPdf={true}
              context="catalog"
            />
          </div>

          {/* Product Gallery Section */}
          <div className="admin-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <h2 style={{ marginBottom: 0 }}>Product Gallery</h2>
              <button type="button" className="btn btn-outline btn-sm" onClick={addGalleryImage}>
                <i className="fa-solid fa-images" /> Add Image
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              {(data.gallery || []).map((img, i) => (
                <div key={i} style={{ position: 'relative', border: '1px solid var(--glass-border)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
                  <ImageUpload 
                    value={img} 
                    onChange={v => setGalleryImage(i, v)} 
                    label={`Gallery view #${i + 1}`} 
                    height="120px" 
                    context="product"
                  />
                  <button 
                    type="button" 
                    className="btn btn-danger btn-sm" 
                    style={{ position: 'absolute', top: '10px', right: '10px', padding: '4px 8px', zIndex: 5 }}
                    onClick={() => removeGalleryImage(i)}
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
              ))}
            </div>
            {(data.gallery || []).length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>No gallery thumbnails attached yet.</p>
            )}
          </div>

          {/* Specifications */}
          <div className="admin-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
              <h2 style={{ marginBottom: 0 }}>Specifications</h2>
              <button type="button" className="btn btn-outline btn-sm" onClick={addSpec}><i className="fa-solid fa-plus" /> Add Row</button>
            </div>
            {data.specifications.map((s, i) => (
              <div key={i} className={styles.specRow}>
                <input className="form-input" value={s.label} onChange={e => setSpec(i, 'label', e.target.value)} placeholder="Parameter" />
                <input className="form-input" value={s.value} onChange={e => setSpec(i, 'value', e.target.value)} placeholder="Value" />
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeSpec(i)}><i className="fa-solid fa-trash" /></button>
              </div>
            ))}
            {data.specifications.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>No specs yet.</p>}
          </div>
        </div>
      </div>

      {/* Form actions */}
      <div className={styles.formActions}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="button" className="btn btn-primary" disabled={saving} onClick={() => onSave(data)}>
          {saving ? <><span className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> {initial._id ? 'Update Product' : 'Create Product'}</>}
        </button>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const { toasts, addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [hasDraft, setHasDraft] = useState(false);

  // 🟢 FIXED: Fetch with ?admin=true so unpublished/draft items don't get filtered out
  const load = () => {
    setLoading(true);
   fetch(`/api/products?admin=true&t=${Date.now()}`)
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); });
  };

  useEffect(() => { 
    load(); 
    const savedDraft = localStorage.getItem('product_form_draft');
    if (savedDraft) setHasDraft(true);
  }, []);

  const handleRestoreDraft = () => {
    const savedDraft = localStorage.getItem('product_form_draft');
    if (savedDraft) {
      const parsed = JSON.parse(savedDraft);
      setEditing(parsed);
      setView(parsed._id ? 'edit' : 'create');
      setHasDraft(false);
      addToast('Draft recovered successfully!', 'success');
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem('product_form_draft');
    setHasDraft(false);
    addToast('Draft permanently discarded.', 'info');
  };

  const clearFormDraft = () => {
    localStorage.removeItem('product_form_draft');
    setHasDraft(false);
  };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      const method = data._id ? 'PUT' : 'POST';
      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      addToast(data._id ? 'Product updated!' : 'Product created!', 'success');
      clearFormDraft();
      load();
      setView('list');
    } catch {
      addToast('Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      addToast('Product deleted.', 'info');
      load();
    } catch {
      addToast('Delete failed.', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  if (view !== 'list') {
    return (
      <div>
        <ToastContainer toasts={toasts} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { clearFormDraft(); setView('list'); }}>
            <i className="fa-solid fa-arrow-left" /> Back
          </button>
          <h1 className="admin-page-title" style={{ marginBottom: 0 }}>
            {view === 'create' ? 'Add Product' : 'Edit Product'}
          </h1>
        </div>
        <ProductForm
          initial={view === 'create' ? EMPTY_PRODUCT : editing}
          onSave={handleSave}
          onCancel={() => { clearFormDraft(); setView('list'); }}
          saving={saving}
        />
      </div>
    );
  }

  return (
    <div>
      <ToastContainer toasts={toasts} />

      {hasDraft && (
        <div style={{
          background: 'var(--bg-card, #1e293b)',
          border: '1px solid var(--brand-primary, #0070f3)',
          padding: 'var(--space-md) var(--space-lg)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-md)'
        }}>
          <div>
            <span style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>⚠️ Unsaved changes found!</span>
            <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
              It looks like you left a product draft open before closing the tab. Would you like to recover it?
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button className="btn btn-outline btn-sm" onClick={handleDiscardDraft}>Discard</button>
            <button className="btn btn-primary btn-sm" onClick={handleRestoreDraft}>Recover Work</button>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Delete Product?</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-sm)' }}>
              This action cannot be undone. The product will be permanently removed.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}>
                <i className="fa-solid fa-trash" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Products</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            clearFormDraft();
            setEditing(null);
            setView('create');
          }}
        >
          <i className="fa-solid fa-plus" /> Add Product
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loader" /></div>
      ) : products.length === 0 ? (
        <div className={styles.empty}>
          <i className="fa-solid fa-box-open" style={{ fontSize: '2.5rem', opacity: 0.3 }} />
          <p>No products yet. Add your first DRGEM product.</p>
          <button className="btn btn-primary" onClick={() => setView('create')}>Add First Product</button>
        </div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>Product</span>
            <span>Category</span>
            <span>Status</span>
            <span>Order</span>
            <span>Actions</span>
          </div>
          {products.map(p => (
            <div key={p._id} className={styles.tableRow}>
              <div className={styles.productCell}>
                <div className={styles.productThumb}>
                  {p.image ? <img src={p.image} alt={p.name} /> : <i className="fa-solid fa-image" style={{ color: 'var(--text-light)' }} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{p.tagline || '—'}</div>
                </div>
              </div>
              <div>
                <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>{p.category}</span>
              </div>
              <div>
                <span className={`badge ${p.published ? 'badge-new' : ''}`} style={!p.published ? { background: 'rgba(100,116,139,0.1)', color: 'var(--text-muted)' } : {}}>
                  {p.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>{p.order}</div>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                {/* 🟢 FIXED: Wiping localStorage on edit prevents draft collisions */}
                <button 
                  className="btn btn-ghost btn-sm" 
                  onClick={() => { 
                    clearFormDraft(); 
                    setEditing(p); 
                    setView('edit'); 
                  }}
                >
                  <i className="fa-solid fa-pen" /> Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(p._id)}>
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}