'use client';
import { useState, useEffect } from 'react';
import ImageUpload from '@/app/components/ImageUpload';
import ToastContainer, { useToast } from '@/app/components/Toast';
import styles from './team.module.css';

const EMPTY = { name: '', role: '', bio: '', image: '', email: '', phone: '', linkedin: '', order: 0, published: true };

function MemberForm({ initial, onSave, onCancel, saving }) {
  const [data, setData] = useState(initial);
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  return (
    <div>
      <div className={styles.formGrid}>
        <div>
          <div className="admin-section">
            <h2>Member Details</h2>
            <div className="form-grid" style={{ gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label>Full Name *</label>
                <input className="form-input" value={data.name} onChange={e => set('name', e.target.value)} placeholder="Dr. Ahmed Khan" />
              </div>
              <div className="form-group">
                <label>Role / Title *</label>
                <input className="form-input" value={data.role} onChange={e => set('role', e.target.value)} placeholder="Managing Director" />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea className="form-input" rows={4} value={data.bio} onChange={e => set('bio', e.target.value)} placeholder="Brief professional biography..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-input" type="email" value={data.email} onChange={e => set('email', e.target.value)} placeholder="member@smartxlimited.com" />
                </div>
                <div className="form-group">
                  <label>Phone (direct)</label>
                  <input className="form-input" value={data.phone} onChange={e => set('phone', e.target.value)} placeholder="+880-1XX-XXXXXXX" />
                </div>
              </div>
              <div className="form-group">
                <label>LinkedIn URL</label>
                <input className="form-input" value={data.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label>Display Order</label>
                  <input className="form-input" type="number" value={data.order} onChange={e => set('order', Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-input" value={data.published ? 'true' : 'false'} onChange={e => set('published', e.target.value === 'true')}>
                    <option value="true">Published</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="admin-section">
            <h2>Photo</h2>
            <ImageUpload value={data.image} onChange={v => set('image', v)} label="Member Photo" height="280px" aspectRatio="1/1" />
          </div>
        </div>
      </div>
      <div className={styles.formActions}>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" disabled={saving} onClick={() => onSave(data)}>
          {saving ? <><span className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> {initial._id ? 'Update Member' : 'Add Member'}</>}
        </button>
      </div>
    </div>
  );
}

export default function AdminTeamPage() {
  const { toasts, addToast } = useToast();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = () => {
    setLoading(true);
    fetch('/api/team').then(r => r.json()).then(data => { setTeam(Array.isArray(data) ? data : []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      const method = data._id ? 'PUT' : 'POST';
      const res = await fetch('/api/team', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error();
      addToast(data._id ? 'Member updated!' : 'Member added!', 'success');
      load(); setView('list');
    } catch { addToast('Save failed.', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/team?id=${id}`, { method: 'DELETE' });
      addToast('Member removed.', 'info'); load();
    } catch { addToast('Delete failed.', 'error'); }
    finally { setDeleteId(null); }
  };

  if (view !== 'list') {
    return (
      <div>
        <ToastContainer toasts={toasts} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setView('list')}><i className="fa-solid fa-arrow-left" /> Back</button>
          <h1 className="admin-page-title" style={{ marginBottom: 0 }}>{view === 'create' ? 'Add Team Member' : 'Edit Member'}</h1>
        </div>
        <MemberForm initial={view === 'create' ? EMPTY : editing} onSave={handleSave} onCancel={() => setView('list')} saving={saving} />
      </div>
    );
  }

  return (
    <div>
      <ToastContainer toasts={toasts} />
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Remove Team Member?</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-sm)' }}>This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}><i className="fa-solid fa-trash" /> Remove</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Team</h1>
        <button className="btn btn-primary" onClick={() => setView('create')}><i className="fa-solid fa-plus" /> Add Member</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loader" /></div>
      ) : team.length === 0 ? (
        <div className={styles.empty}>
          <i className="fa-solid fa-users" style={{ fontSize: '2.5rem', opacity: 0.3 }} />
          <p>No team members yet.</p>
          <button className="btn btn-primary" onClick={() => setView('create')}>Add First Member</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {team.map(m => (
            <div key={m._id} className={styles.card}>
              <div className={styles.cardImg}>
                {m.image ? <img src={m.image} alt={m.name} /> : (
                  <div className={styles.initials}>{m.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}</div>
                )}
              </div>
              <div className={styles.cardBody}>
                <div style={{ fontWeight: 700 }}>{m.name}</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', fontWeight: 600 }}>{m.role}</div>
                <span className={`badge ${m.published ? 'badge-new' : ''}`} style={!m.published ? { background: 'rgba(100,116,139,0.1)', color: 'var(--text-muted)', marginTop: 'var(--space-xs)' } : { marginTop: 'var(--space-xs)' }}>
                  {m.published ? 'Visible' : 'Hidden'}
                </span>
              </div>
              <div className={styles.cardActions}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(m); setView('edit'); }}><i className="fa-solid fa-pen" /></button>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(m._id)}><i className="fa-solid fa-trash" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
