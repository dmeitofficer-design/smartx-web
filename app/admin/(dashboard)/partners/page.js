'use client';
import { useState, useEffect } from 'react';
import ImageUpload from '@/app/components/ImageUpload';
import ToastContainer, { useToast } from '@/app/components/Toast';
import styles from './partners.module.css';

export default function AdminPartnersPage() {
  const { toasts, addToast } = useToast();
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/partners')
      .then(r => r.json())
      .then(setData);
  }, []);

  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  // Add object record holding both properties
  const addImage = (section) => {
    set(section, [...(data?.[section] || []), { image: '', link: '' }]);
  };

  // Update specific inner keys safely
  const updateItemField = (section, index, field, value) => {
    const records = [...(data?.[section] || [])];
    records[index] = { ...records[index], [field]: value };
    set(section, records);
  };

  const removeImage = (section, index) => {
    set(section, (data?.[section] || []).filter((_, i) => i !== index));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/partners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      addToast('Partners & Clients saved!', 'success');
    } catch {
      addToast('Save failed. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!data) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <div className="loader" />
    </div>
  );

  return (
    <div>
      <ToastContainer toasts={toasts} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Partners & Clients</h1>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? (
            <><span className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving…</>
          ) : (
            <><i className="fa-solid fa-floppy-disk" /> Save Changes</>
          )}
        </button>
      </div>

      {/* Title */}
      <div className="admin-section">
        <h2>Section Title</h2>
        <div className="form-group">
          <label>Main Title</label>
          <input
            className="form-input"
            value={data.title || ''}
            onChange={e => set('title', e.target.value)}
            placeholder="Our Trusted Partners & Clients"
          />
        </div>
      </div>

    {/* Partners Section */}
<div className="admin-section">
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
    <h2>Partners</h2>
    <button className="btn btn-outline btn-sm" onClick={() => addImage('partners')}>
      <i className="fa-solid fa-plus" /> Add Partner Logo
    </button>
  </div>
  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-lg)' }}>
    Upload partner logos and provide fallback destination redirect links.
  </p>

  <div style={{ display: 'grid', gap: 'var(--space-xl)' }}>
    {(data.partners || []).map((item, index) => {
      // 🟢 SAFELY NORMALIZE: Handle if item is a legacy string or a new object
      const isString = typeof item === 'string';
      const imageValue = isString ? item : (item?.image || '');
      const linkValue = isString ? '' : (item?.link || '');

      return (
        <div key={index} style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start', background: 'rgba(var(--color-primary-rgb), 0.02)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <ImageUpload
              value={imageValue} // 🟢 Restores old logos safely
              onChange={v => updateItemField('partners', index, 'image', v)}
              label={`Partner Logo ${index + 1}`}
              height="140px"
              allowSvg={true}
              note="SVG recommended for crisp logos • Transparent background works best"
            />
            <div className="form-group">
              <label style={{ fontSize: '11px' }}>Website Link URL</label>
              <input
                type="url"
                className="form-input"
                value={linkValue} // 🟢 Fixes the uncontrolled input console warning
                onChange={e => updateItemField('partners', index, 'link', e.target.value)}
                placeholder="https://partner-website.com"
              />
            </div>
          </div>
          <button
            className="btn btn-danger btn-sm"
            style={{ marginTop: '2.2rem' }}
            onClick={() => removeImage('partners', index)}
          >
            <i className="fa-solid fa-trash" /> Remove
          </button>
        </div>
      );
    })}
  </div>
</div>

  {/* Clients Section */}
<div className="admin-section">
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
    <h2>Clients</h2>
    <button className="btn btn-outline btn-sm" onClick={() => addImage('clients')}>
      <i className="fa-solid fa-plus" /> Add Client Logo
    </button>
  </div>
  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-lg)' }}>
    Upload client logos and provide redirect destination links.
  </p>

  <div style={{ display: 'grid', gap: 'var(--space-xl)' }}>
    {(data.clients || []).map((item, index) => {
      // 🟢 SAFELY NORMALIZE: Handle if item is a legacy string or a new object
      const isString = typeof item === 'string';
      const imageValue = isString ? item : (item?.image || '');
      const linkValue = isString ? '' : (item?.link || '');

      return (
        <div key={index} style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start', background: 'rgba(var(--color-primary-rgb), 0.02)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <ImageUpload
              value={imageValue} // 🟢 Restores old logos safely
              onChange={v => updateItemField('clients', index, 'image', v)}
              label={`Client Logo ${index + 1}`}
              height="140px"
              allowSvg={true}
              note="SVG recommended • JPG/PNG also supported"
            />
            <div className="form-group">
              <label style={{ fontSize: '11px' }}>Client Link URL</label>
              <input
                type="url"
                className="form-input"
                value={linkValue} // 🟢 Fixes the uncontrolled input console warning
                onChange={e => updateItemField('clients', index, 'link', e.target.value)}
                placeholder="https://client-hospital.com"
              />
            </div>
          </div>
          <button
            className="btn btn-danger btn-sm"
            style={{ marginTop: '2.2rem' }}
            onClick={() => removeImage('clients', index)}
          >
            <i className="fa-solid fa-trash" /> Remove
          </button>
        </div>
      );
    })}
  </div>
</div>
      
    </div>
  );
}