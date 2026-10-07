'use client';
import { useState, useCallback, useEffect } from 'react';

let _addToast = null;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  useEffect(() => { _addToast = addToast; }, [addToast]);

  return { toasts, addToast };
}

export function toast(message, type = 'info') {
  if (_addToast) _addToast(message, type);
}

const ICONS = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info', warning: 'fa-triangle-exclamation' };
const COLORS = { success: 'var(--color-success)', error: 'var(--color-danger)', info: 'var(--color-primary)', warning: 'var(--color-warning)' };

export default function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast-item toast-${t.type}`}>
          <i className={`fa-solid ${ICONS[t.type] || ICONS.info}`} style={{ color: COLORS[t.type], fontSize: '1rem' }} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
