'use client';
import { useState, useEffect } from 'react';
import ImageUpload from '@/app/components/ImageUpload';
import ToastContainer, { useToast } from '@/app/components/Toast';
import styles from './about.module.css';

export default function AdminAboutPage() {
  const { toasts, addToast } = useToast();
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/about').then(r => r.json()).then(setData);
  }, []);

  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  const setHighlight = (i, field, val) => {
    const h = [...(data.highlights || [])];
    h[i] = { ...h[i], [field]: val };
    set('highlights', h);
  };
  const addHighlight = () => set('highlights', [...(data.highlights || []), { icon: '✅', title: '', description: '' }]);
  const removeHighlight = (i) => set('highlights', data.highlights.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      addToast('About section saved!', 'success');
    } catch {
      addToast('Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!data) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loader" /></div>;

  return (
    <div>
      <ToastContainer toasts={toasts} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <h1 className="admin-page-title" style={{ marginBottom: 0 }}>About Section</h1>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? <><span className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Changes</>}
        </button>
      </div>

      {/* Main content */}
      <div className="admin-section">
        <h2>Main Content</h2>
        <div className="form-grid" style={{ gap: 'var(--space-lg)' }}>
          <div className="form-group">
            <label>Section Heading</label>
            <input className="form-input" value={data.heading || ''} onChange={e => set('heading', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Body Text (use blank lines for paragraphs)</label>
            <textarea className="form-input" rows={8} value={data.body || ''} onChange={e => set('body', e.target.value)} />
          </div>
          <div className={styles.mvGrid}>
            <div className="form-group">
              <label>Mission Statement</label>
              <textarea className="form-input" rows={3} value={data.mission || ''} onChange={e => set('mission', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Vision Statement</label>
              <textarea className="form-input" rows={3} value={data.vision || ''} onChange={e => set('vision', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>About Image</label>
            <ImageUpload value={data.image || ''} onChange={v => set('image', v)} label="About Section Image" height="240px" />
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="admin-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
          <h2 style={{ marginBottom: 0 }}>Highlight Cards</h2>
          <button className="btn btn-outline btn-sm" onClick={addHighlight}>
            <i className="fa-solid fa-plus" /> Add Card
          </button>
        </div>
        <div className={styles.hlGrid}>
          {(data.highlights || []).map((h, i) => (
            <div key={i} className={styles.hlCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-muted)' }}>Card {i + 1}</span>
                <button className="btn btn-danger btn-sm" onClick={() => removeHighlight(i)}><i className="fa-solid fa-trash" /></button>
              </div>
              <div className="form-group" style={{ marginBottom: 'var(--space-sm)' }}>
                <label>Icon (emoji)</label>
                <input className="form-input" value={h.icon} onChange={e => setHighlight(i, 'icon', e.target.value)} placeholder="🏆" style={{ fontSize: '1.2rem' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 'var(--space-sm)' }}>
                <label>Title</label>
                <input className="form-input" value={h.title} onChange={e => setHighlight(i, 'title', e.target.value)} placeholder="Backed by DME Group" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" rows={2} value={h.description} onChange={e => setHighlight(i, 'description', e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
