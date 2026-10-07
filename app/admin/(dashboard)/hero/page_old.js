'use client';
import { useState, useEffect } from 'react';
import ImageUpload from '@/app/components/ImageUpload';
import ToastContainer, { useToast } from '@/app/components/Toast';
import styles from './hero.module.css';

export default function AdminHeroPage() {
  const { toasts, addToast } = useToast();
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/hero').then(r => r.json()).then(setData);
  }, []);

  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  const setStatField = (i, field, val) => {
    const stats = [...(data.stats || [])];
    stats[i] = { ...stats[i], [field]: val };
    set('stats', stats);
  };

  const addStat = () => set('stats', [...(data.stats || []), { value: '', label: '' }]);
  const removeStat = (i) => set('stats', data.stats.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      addToast('Hero section saved!', 'success');
    } catch {
      addToast('Save failed. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!data) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loader" /></div>;

  return (
    <div>
      <ToastContainer toasts={toasts} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Hero Section</h1>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? <><span className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Changes</>}
        </button>
      </div>

      {/* Badge */}
      <div className="admin-section">
        <h2>Badge & Background</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Top Badge Text</label>
            <input className="form-input" value={data.badge || ''} onChange={e => set('badge', e.target.value)} placeholder="Authorized DRGEM Distributor — Bangladesh" />
          </div>
          <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
            <label>Background / Hero Image</label>
            <ImageUpload value={data.bgImage || ''} onChange={v => set('bgImage', v)} label="Hero Background Image" height="220px" />
          </div>
        </div>
      </div>

      {/* Headline & CTA */}
      <div className="admin-section">
        <h2>Headline & Call-to-Action</h2>
        <div className="form-grid" style={{ gap: 'var(--space-lg)' }}>
          <div className="form-group">
            <label>Main Headline</label>
            <input className="form-input" value={data.headline || ''} onChange={e => set('headline', e.target.value)} placeholder="Precision Imaging for Better Healthcare" />
          </div>
          <div className="form-group">
            <label>Subheadline</label>
            <textarea className="form-input" rows={3} value={data.subheadline || ''} onChange={e => set('subheadline', e.target.value)} />
          </div>
          <div className={styles.ctaGrid}>
            <div className="form-group">
              <label>Primary CTA Label</label>
              <input className="form-input" value={data.ctaLabel || ''} onChange={e => set('ctaLabel', e.target.value)} placeholder="Explore Products" />
            </div>
            <div className="form-group">
              <label>Primary CTA Link</label>
              <input className="form-input" value={data.ctaHref || ''} onChange={e => set('ctaHref', e.target.value)} placeholder="#products" />
            </div>
            <div className="form-group">
              <label>Secondary CTA Label</label>
              <input className="form-input" value={data.ctaSecondaryLabel || ''} onChange={e => set('ctaSecondaryLabel', e.target.value)} placeholder="Request a Quote" />
            </div>
            <div className="form-group">
              <label>Secondary CTA Link</label>
              <input className="form-input" value={data.ctaSecondaryHref || ''} onChange={e => set('ctaSecondaryHref', e.target.value)} placeholder="#contact" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
          <h2 style={{ marginBottom: 0 }}>Statistics Bar</h2>
          <button className="btn btn-outline btn-sm" onClick={addStat}>
            <i className="fa-solid fa-plus" /> Add Stat
          </button>
        </div>
        <div className={styles.statsList}>
          {(data.stats || []).map((s, i) => (
            <div key={i} className={styles.statRow}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Value</label>
                <input className="form-input" value={s.value} onChange={e => setStatField(i, 'value', e.target.value)} placeholder="500+" />
              </div>
              <div className="form-group" style={{ flex: 2 }}>
                <label>Label</label>
                <input className="form-input" value={s.label} onChange={e => setStatField(i, 'label', e.target.value)} placeholder="Installations" />
              </div>
              <button className="btn btn-danger btn-sm" style={{ marginTop: '1.5rem' }} onClick={() => removeStat(i)}>
                <i className="fa-solid fa-trash" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
