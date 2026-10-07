'use client';
import { useState, useEffect } from 'react';
import ToastContainer, { useToast } from '@/app/components/Toast';
import styles from './messages.module.css';

export default function AdminMessagesPage() {
  const { toasts, addToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    fetch('/api/contact').then(r => r.json()).then(data => {
      setMessages(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const markRead = async (msg) => {
    if (msg.read) return;
    await fetch('/api/contact', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: msg._id, read: true }),
    });
    setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, read: true } : m));
  };

  const toggleReplied = async (msg) => {
    await fetch('/api/contact', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: msg._id, replied: !msg.replied }),
    });
    setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, replied: !m.replied } : m));
    if (selected?._id === msg._id) setSelected(s => ({ ...s, replied: !s.replied }));
    addToast('Status updated.', 'info');
  };

  const handleDelete = async (id) => {
    await fetch(`/api/contact?id=${id}`, { method: 'DELETE' });
    addToast('Message deleted.', 'info');
    setMessages(prev => prev.filter(m => m._id !== id));
    if (selected?._id === id) setSelected(null);
    setDeleteId(null);
  };

  const openMessage = (msg) => {
    setSelected(msg);
    markRead(msg);
    setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, read: true } : m));
  };

  const filtered = messages.filter(m => {
    if (filter === 'unread') return !m.read;
    if (filter === 'replied') return m.replied;
    if (filter === 'pending') return !m.replied;
    return true;
  });

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div>
      <ToastContainer toasts={toasts} />
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Delete Message?</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-sm)' }}>This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}><i className="fa-solid fa-trash" /> Delete</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Inbox</h1>
          {unreadCount > 0 && <span className="badge badge-hot">{unreadCount} unread</span>}
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        {[['all','All'], ['unread','Unread'], ['pending','Pending Reply'], ['replied','Replied']].map(([val, label]) => (
          <button key={val} className={`${styles.filterBtn} ${filter === val ? styles.active : ''}`} onClick={() => setFilter(val)}>
            {label}
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        {/* List panel */}
        <div className={styles.listPanel}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="loader" /></div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <i className="fa-solid fa-inbox" style={{ fontSize: '2rem', opacity: 0.3 }} />
              <p>No messages here.</p>
            </div>
          ) : (
            filtered.map(m => (
              <div
                key={m._id}
                className={`${styles.msgItem} ${selected?._id === m._id ? styles.active : ''} ${!m.read ? styles.unread : ''}`}
                onClick={() => openMessage(m)}
              >
                <div className={styles.msgDot} style={{ background: !m.read ? 'var(--color-primary)' : 'transparent' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: !m.read ? 700 : 500, fontSize: 'var(--font-size-sm)' }}>{m.name}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
                      {new Date(m.createdAt).toLocaleDateString('en-BD', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {m.product && <div style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 600, marginTop: 1 }}>{m.product}</div>}
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                    {m.message}
                  </div>
                  {m.replied && <span style={{ fontSize: '0.68rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '1px 6px', borderRadius: 99, marginTop: 2, display: 'inline-block' }}>✓ Replied</span>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail panel */}
        <div className={styles.detailPanel}>
          {!selected ? (
            <div className={styles.detailEmpty}>
              <i className="fa-regular fa-envelope" style={{ fontSize: '2.5rem', opacity: 0.2 }} />
              <p>Select a message to read it</p>
            </div>
          ) : (
            <div className={styles.detail}>
              <div className={styles.detailHead}>
                <div>
                  <h3 style={{ marginBottom: 4 }}>{selected.name}</h3>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                    {new Date(selected.createdAt).toLocaleString('en-BD', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                  <button
                    className={`btn btn-sm ${selected.replied ? 'btn-ghost' : 'btn-outline'}`}
                    onClick={() => toggleReplied(selected)}
                  >
                    <i className={`fa-solid ${selected.replied ? 'fa-rotate-left' : 'fa-check'}`} />
                    {selected.replied ? 'Mark Pending' : 'Mark Replied'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(selected._id)}>
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              </div>

              {/* Contact info */}
              <div className={styles.contactInfo}>
                {[
                  { icon: 'fa-envelope', label: 'Email',   val: selected.email,        href: `mailto:${selected.email}` },
                  { icon: 'fa-phone',    label: 'Phone',   val: selected.phone,         href: `tel:${selected.phone}` },
                  { icon: 'fa-building', label: 'Organization', val: selected.organization, href: null },
                  { icon: 'fa-box',      label: 'Product Interest', val: selected.product, href: null },
                ].filter(f => f.val).map((f, i) => (
                  <div key={i} className={styles.infoRow}>
                    <i className={`fa-solid ${f.icon}`} style={{ color: 'var(--color-primary)', width: 16 }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', minWidth: 100 }}>{f.label}</span>
                    {f.href
                      ? <a href={f.href} style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text)' }}>{f.val}</a>
                      : <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{f.val}</span>
                    }
                  </div>
                ))}
              </div>

              {/* Message body */}
              <div className={styles.msgBody}>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-sm)' }}>Message</div>
                <p style={{ lineHeight: 1.8, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{selected.message}</p>
              </div>

              {/* Quick reply */}
              <div className={styles.quickReply}>
                <a href={`mailto:${selected.email}?subject=Re: Your DRGEM Inquiry`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <i className="fa-solid fa-reply" /> Reply via Email
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
