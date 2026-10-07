'use client';
import { useRef, useState, useCallback } from 'react';
import styles from './ImageUpload.module.css';

function formatBytes(n = 0) {
  if (n > 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  if (n > 1024)        return `${(n / 1024).toFixed(0)} KB`;
  return `${n} B`;
}

function isSvgFile(file) {
  return file?.type === 'image/svg+xml' || file?.name?.toLowerCase().endsWith('.svg');
}

function isPdfFile(file) {
  return file?.type === 'application/pdf' || file?.name?.toLowerCase().endsWith('.pdf');
}

function extractPublicId(url = '') {
  if (!url || typeof url !== 'string' || url.startsWith('data:')) return null;

  // Local uploads stored in /uploads/
  if (url.startsWith('/uploads/')) {
    const parts = url.split('/');
    return parts[parts.length - 1];
  }

  // Cloudinary CDN URLs
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export default function ImageUpload({
  value       = '',
  onChange,
  label       = 'Image',
  height      = '200px',
  allowSvg    = true,
  allowPdf    = true,
  context     = 'general',
  note        = '',
}) {
  const inputRef  = useRef();
  const [dragging,    setDragging]    = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [error,       setError]       = useState('');
  const [mode,        setMode]        = useState('optimized');
  const [uploadInfo,  setUploadInfo]  = useState(null);

  const uploadFile = useCallback(async (file) => {
    if (!file) return;
    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file',    file);
      formData.append('context', context);
      formData.append('mode',    (isSvgFile(file) || isPdfFile(file)) ? 'original' : mode);

      const res  = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Upload failed');
        return;
      }

      // Automatically remove old file if replaced
      const oldPublicId = extractPublicId(value);
      if (oldPublicId) {
        const isPdf = value.toLowerCase().endsWith('.pdf') || value.includes('/catalogs/');
        fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId: oldPublicId, format: isPdf ? 'pdf' : 'image' }),
        }).catch(() => {});
      }

      setUploadInfo({ format: data.format, bytes: data.bytes });
      onChange(data.url);
    } catch (err) {
      setError('Upload failed. Check your connection.');
    } finally {
      setUploading(false);
    }
  }, [context, mode, value, onChange]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = async () => {
    const oldPublicId = extractPublicId(value);

    // 1. Immediately reset component state so dropzone renders instantly
    setUploadInfo(null);
    onChange('');

    // 2. Perform backend deletion asynchronously
    if (oldPublicId) {
      const isPdf = value.toLowerCase().endsWith('.pdf') || value.includes('/catalogs/') || context === 'catalog';
      try {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId: oldPublicId, format: isPdf ? 'pdf' : 'image' }),
        });
      } catch (err) {
        console.error('Failed to delete file from disk:', err);
      }
    }
  };

  // 🟢 Strict evaluation: isPdfUrl and isSvgUrl are ONLY true if value is non-empty
  const safeVal  = typeof value === 'string' ? value.trim() : '';
  const lowerVal = safeVal.toLowerCase();
  const hasValue = safeVal.length > 0;

  const isSvgUrl = hasValue && (lowerVal.endsWith('.svg') || lowerVal.includes('/svg'));
  const isPdfUrl = hasValue && (lowerVal.endsWith('.pdf') || lowerVal.includes('/catalogs/') || context === 'catalog');

  const acceptTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowSvg) acceptTypes.push('image/svg+xml');
  if (allowPdf) acceptTypes.push('application/pdf', '.pdf');
  const accept = acceptTypes.join(',');

  return (
    <div className={styles.wrap}>
      {!isPdfUrl && (
        <div className={styles.modeToggle}>
          <span className={styles.modeLabel}>Upload quality:</span>
          {[
            { val: 'optimized', icon: 'fa-wand-magic-sparkles', label: 'Optimized', hint: 'Auto WebP · compressed' },
            { val: 'original',  icon: 'fa-image',               label: 'Original',  hint: 'Lossless quality' },
          ].map(opt => (
            <button
              key={opt.val}
              type="button"
              className={`${styles.modeBtn} ${mode === opt.val ? styles.modeBtnActive : ''}`}
              onClick={() => setMode(opt.val)}
              disabled={uploading}
            >
              <i className={`fa-solid ${opt.icon}`} />
              {opt.label}
              <span className={styles.modeHint}>{opt.hint}</span>
            </button>
          ))}
        </div>
      )}

      {/* Preview or Dropzone */}
      {hasValue ? (
        <div className={styles.preview} style={{ height }}>
          {isPdfUrl ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', padding: '16px', textAlign: 'center' }}>
              <i className="fa-solid fa-file-pdf" style={{ fontSize: '2.5rem', color: '#ef4444' }} />
              <a href={safeVal} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--brand-primary, #0070f3)', textDecoration: 'underline', wordBreak: 'break-all' }}>
                Preview PDF Document
              </a>
            </div>
          ) : (
            <img
              src={safeVal}
              alt={label}
              className={styles.img}
              style={{ objectFit: isSvgUrl ? 'contain' : 'cover', padding: isSvgUrl ? '12px' : 0 }}
            />
          )}

          <div className={styles.infoBadge}>
            <i className={isPdfUrl ? "fa-solid fa-file-pdf" : "fa-brands fa-cloudinary"} style={{ color: isPdfUrl ? '#ef4444' : '#3448C5' }} />
            {uploadInfo
              ? `${uploadInfo.format?.toUpperCase() || 'FILE'} · ${formatBytes(uploadInfo.bytes)}`
              : (isPdfUrl ? 'PDF Document' : 'Cloudinary CDN')}
          </div>

          <div className={styles.previewActions}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading
                ? <><span className={styles.spinnerSm} /> Uploading…</>
                : <><i className="fa-solid fa-arrows-rotate" /> Replace</>}
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={handleRemove} disabled={uploading}>
              <i className="fa-solid fa-trash" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`${styles.dropzone} ${dragging ? styles.dragging : ''} ${uploading ? styles.uploading : ''}`}
          style={{ height }}
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className={styles.uploadingState}>
              <div className={styles.spinner} />
              <span>Uploading File…</span>
              <span className={styles.uploadSub}>Please wait</span>
            </div>
          ) : (
            <>
              <div className={styles.uploadIcon}>
                <i className="fa-solid fa-cloud-arrow-up" />
              </div>
              <span className={styles.uploadLabel}>{label}</span>
              <span className={styles.uploadSub}>Click or drag & drop</span>
              <div className={styles.uploadFormats}>
                {allowPdf ? 'PDF · JPG · PNG · WebP · SVG' : 'JPG · PNG · WebP · SVG'}
              </div>
              {note && <span className={styles.uploadNote}>{note}</span>}
            </>
          )}
        </div>
      )}

      {error && (
        <div className={styles.errorMsg}>
          <i className="fa-solid fa-triangle-exclamation" /> {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className={styles.hidden}
        onChange={e => uploadFile(e.target.files[0])}
      />
    </div>
  );
}