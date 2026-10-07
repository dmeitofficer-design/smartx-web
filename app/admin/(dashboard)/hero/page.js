'use client';
import { useState, useEffect } from 'react';
import ImageUpload from '@/app/components/ImageUpload';
import ToastContainer, { useToast } from '@/app/components/Toast';
import styles from './hero.module.css';

const newKey = () => Math.random().toString(36).slice(2);

export default function AdminHeroPage() {
  const { toasts, addToast } = useToast();
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetch('/api/hero')
      .then(r => r.json())
      .then(initialData => {
        // Backward compat: migrate old heroImage → heroImages
        if (initialData.heroImage && !initialData.heroImages?.length) {
          initialData.heroImages = [{ image: initialData.heroImage, badgeIndices: [], model: '', tagline: '', link: '' }];
          delete initialData.heroImage;
        }

        // Migrate old string[] heroImages to object format
        if (initialData.heroImages?.length > 0 && typeof initialData.heroImages[0] === 'string') {
          initialData.heroImages = initialData.heroImages.map(img => ({
            image: img,
            badgeIndices: [],
            model: '',
            tagline: '',
            link: ''
          }));
        }

        // Backward compat: migrate single ceBadge → badges array
        if (!initialData.badges?.length) {
          initialData.badges = [
            {
              label: initialData.ceBadgeLabel || 'CE Certified',
              sub:   initialData.ceBadgeSub   || 'DRGEM Equipment',
              icon:  initialData.ceBadgeIcon  || '',
            },
          ];
        }
        setData(initialData);
      });
  }, []);

  // Handle files from drop or paste
  const handleFiles = async (files) => {
    if (!data) return;

    const currentCount = (data.heroImages || []).length;
    const slotsLeft = 10 - currentCount;
    
    if (slotsLeft <= 0) {
      alert("You've already reached the maximum limit of images.");
      return;
    }

    const validFiles = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .slice(0, slotsLeft);

    if (validFiles.length === 0) return;

    const newImageUrls = validFiles.map(file => URL.createObjectURL(file));
    const newItems = newImageUrls.map(url => ({ 
      _key: newKey(),
      image: url, 
      badgeIndices: [],
      model: '',
      tagline: '',
      link: ''
    }));
    
    set('heroImages', [...(data.heroImages || []), ...newItems]);
  };

  // Drag & Drop + Paste handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handlePaste = (event) => {
    if (!data) return;
    const items = event.clipboardData?.items;
    if (!items) return;

    const files = [];
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length > 0) {
      event.preventDefault();
      handleFiles(files);
    }
  };

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [data]);

  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  // ── Stats helpers ──
  const setStatField = (i, field, val) => {
    const stats = [...(data.stats || [])];
    stats[i] = { ...stats[i], [field]: val };
    set('stats', stats);
  };
  const addStat    = () => set('stats', [...(data.stats || []), { value: '', label: '' }]);
  const removeStat = (i) => set('stats', data.stats.filter((_, idx) => idx !== i));

  // ── Hero Images helpers ──
  const addHeroImage = () => {
    set('heroImages', [...(data.heroImages || []), { _key: newKey(), image: '', badgeIndices: [], model: '', tagline: '', link: '' }]);
  };

  const updateHeroImage = (index, url) => {
    const imgs = [...(data.heroImages || [])];
    imgs[index] = { ...imgs[index], image: url };
    set('heroImages', imgs);
  };

  const updateHeroImageField = (index, field, value) => {
    const imgs = [...(data.heroImages || [])];
    imgs[index] = { ...imgs[index], [field]: value };
    set('heroImages', imgs);
  };

  const updateHeroBadges = (index, newBadgeIndices) => {
    const imgs = [...(data.heroImages || [])];
    imgs[index] = { ...imgs[index], badgeIndices: newBadgeIndices };
    set('heroImages', imgs);
  };

  // Move a slide to a new serial position (0-based)
  const moveHeroImage = (from, to) => {
    const imgs = [...(data.heroImages || [])];
    if (to < 0 || to >= imgs.length || from === to) return;
    const [item] = imgs.splice(from, 1);
    imgs.splice(to, 0, item);
    set('heroImages', imgs);
  };

  const removeHeroImage = (index) =>
    set('heroImages', (data.heroImages || []).filter((_, i) => i !== index));

  // ── Badges helpers ──
  const addBadge = () =>
    set('badges', [...(data.badges || []), { label: '', sub: '', icon: '' }]);

  const updateBadgeField = (i, field, val) => {
    const badges = [...(data.badges || [])];
    badges[i] = { ...badges[i], [field]: val };
    set('badges', badges);
  };

  const removeBadge = (i) =>
    set('badges', (data.badges || []).filter((_, idx) => idx !== i));

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

  if (!data) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <div className="loader" />
    </div>
  );

  return (
    <div>
      <ToastContainer toasts={toasts} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Hero Section</h1>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving
            ? <><span className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving…</>
            : <><i className="fa-solid fa-floppy-disk" /> Save Changes</>}
        </button>
      </div>

      {/* ── 1. Background ─────────────────────────────── */}
      <div className="admin-section">
        <h2>Section Background</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-lg)' }}>
          Full hero section background. Choose the default plain background, a solid color, or upload an image.
        </p>

        <div className={styles.bgTypeRow}>
          {[
            { val: 'gradient', icon: 'fa-ban',     label: 'Default' },
            { val: 'color',    icon: 'fa-palette',  label: 'Solid Color' },
            { val: 'image',    icon: 'fa-image',    label: 'Image' },
          ].map(opt => (
            <button
              key={opt.val}
              type="button"
              className={`${styles.bgTypeBtn} ${data.bgType === opt.val ? styles.bgTypeBtnActive : ''}`}
              onClick={() => set('bgType', opt.val)}
            >
              <i className={`fa-solid ${opt.icon}`} />
              {opt.label}
            </button>
          ))}
        </div>

        {data.bgType === 'color' && (
          <div className="form-group" style={{ marginTop: 'var(--space-lg)', maxWidth: 320 }}>
            <label>Background Color</label>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
              <input
                type="color"
                value={data.bgColor || '#0c1524'}
                onChange={e => set('bgColor', e.target.value)}
                style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', border: '1.5px solid var(--glass-border)', padding: 2, cursor: 'pointer', background: 'none' }}
              />
              <input
                className="form-input"
                value={data.bgColor || ''}
                onChange={e => set('bgColor', e.target.value)}
                placeholder="#0c1524"
              />
            </div>
          </div>
        )}

        {data.bgType === 'image' && (
          <div className="form-group" style={{ marginTop: 'var(--space-lg)' }}>
            <label>Background Image</label>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 'var(--space-sm)' }}>
              Full-bleed background. Use a wide landscape photo (1920×1080 recommended).
            </p>
            <ImageUpload
              value={data.bgImage || ''}
              onChange={v => set('bgImage', v)}
              label="Background Image"
              height="200px"
              note="Recommended: 1920×1080 landscape · dark overlay applied automatically"
            />
          </div>
        )}
      </div>

      {/* ── 2. Hero Product Images (Updated with per-slide details) ──────────────────────── */}
      <div 
        className={`admin-section ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          position: 'relative',
          border: isDragging ? '2px dashed var(--brand-primary, #0070f3)' : '1px solid transparent',
          borderRadius: 'var(--radius-md)',
          transition: 'all 0.2s ease',
          backgroundColor: isDragging ? 'var(--bg-highlight, rgba(0, 112, 243, 0.05))' : 'transparent',
          padding: '4px'
        }}
      >
        {/* Drag Overlay */}
        {isDragging && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 112, 243, 0.1)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ background: '#fff', padding: '1rem var(--space-lg)', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 600 }}>
              <i className="fa-solid fa-cloud-arrow-up" style={{ marginRight: '0.5rem' }} /> Drop images here!
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
          <div>
            <h2 style={{ marginBottom: '0.25rem' }}>Hero Product Images</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
              Up to 10 images, shown in serial order. Each image can have its own model name, tagline, link, and floating badges.
            </p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={addHeroImage} disabled={(data.heroImages || []).length >= 10}>
            <i className="fa-solid fa-plus" /> Add Image
          </button>
        </div>

        {(data.heroImages || []).length === 0 && (
          <div style={{ 
            border: '2px dashed var(--glass-border, #ccc)', 
            borderRadius: 'var(--radius-md)', 
            padding: 'var(--space-xl) 0', 
            textAlign: 'center',
            marginBottom: 'var(--space-md)'
          }}>
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
              No images yet. Add images and assign details.
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
          {(data.heroImages || []).map((heroItem, index) => {
            const currentBadges = heroItem?.badgeIndices || [];
            return (
              <div key={heroItem?._id || heroItem?._key || index} style={{ 
                display: 'flex', 
                gap: 'var(--space-md)', 
                alignItems: 'flex-start',
                border: '1px solid var(--glass-border)',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ flex: 1 }}>
                  {/* Serial (slide order) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                    <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, margin: 0 }}>Serial</label>
                    <select
                      className="form-input"
                      style={{ width: 'auto', minWidth: 80 }}
                      value={index}
                      onChange={e => moveHeroImage(index, Number(e.target.value))}
                    >
                      {(data.heroImages || []).map((_, i) => (
                        <option key={i} value={i}>{i + 1}</option>
                      ))}
                    </select>
                    <button type="button" className="btn btn-outline btn-sm" title="Move up" disabled={index === 0} onClick={() => moveHeroImage(index, index - 1)}>
                      <i className="fa-solid fa-arrow-up" />
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" title="Move down" disabled={index === (data.heroImages || []).length - 1} onClick={() => moveHeroImage(index, index + 1)}>
                      <i className="fa-solid fa-arrow-down" />
                    </button>
                  </div>

                  <ImageUpload
                    value={heroItem?.image || ''}
                    onChange={v => updateHeroImage(index, v)}
                    label={`Image ${index + 1}${index === 0 ? ' (Primary)' : ''}`}
                    height="220px"
                    note="Recommended: square or portrait · transparent PNG works great"
                  />

                  {/* Additional Product Info Fields */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                    <div className="form-group">
                      <label>Model</label>
                      <input 
                        className="form-input" 
                        value={heroItem?.model || ''} 
                        onChange={e => updateHeroImageField(index, 'model', e.target.value)} 
                        placeholder="e.g. TOPAZ 32D" 
                      />
                    </div>
                    <div className="form-group">
                      <label>Link</label>
                      <input 
                        className="form-input" 
                        value={heroItem?.link || ''} 
                        onChange={e => updateHeroImageField(index, 'link', e.target.value)} 
                        placeholder="e.g. /products/topaz-32d or #products" 
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: 'var(--space-sm)' }}>
                    <label>Tagline</label>
                    <input 
                      className="form-input" 
                      value={heroItem?.tagline || ''} 
                      onChange={e => updateHeroImageField(index, 'tagline', e.target.value)} 
                      placeholder="e.g. Motorized Mobile DR System" 
                    />
                  </div>

                  {/* Per-slide badge selection */}
                  <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
                    <label>Badges for this slide (select multiple)</label>
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '0.5rem', 
                      padding: '0.75rem', 
                      background: 'var(--bg-card)', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--glass-border)' 
                    }}>
                      {(data.badges || []).map((badge, bIdx) => {
                        const isSelected = currentBadges.includes(bIdx);
                        return (
                          <label 
                            key={bIdx} 
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.35rem 0.75rem',
                              background: isSelected ? 'var(--brand-primary)' : 'transparent',
                              color: isSelected ? '#fff' : 'var(--text)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '9999px',
                              fontSize: '0.82rem',
                              cursor: 'pointer'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const newIndices = e.target.checked
                                  ? [...currentBadges, bIdx]
                                  : currentBadges.filter(i => i !== bIdx);
                                updateHeroBadges(index, newIndices);
                              }}
                            />
                            {badge.label || `Badge ${bIdx + 1}`}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-danger btn-sm"
                  style={{ marginTop: '1.75rem', flexShrink: 0 }}
                  onClick={() => removeHeroImage(index)}
                >
                  <i className="fa-solid fa-trash" /> Remove
                </button>
              </div>
            );
          })}
        </div>

        {/* Preview */}
        {(data.heroImages || []).filter(item => item?.image).length > 0 && (
          <div style={{ marginTop: 'var(--space-xl)' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>
              Preview — {(data.heroImages || []).filter(item => item?.image).length} image(s)
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              {(data.heroImages || []).map((item, i) =>
                item?.image ? (
                  <div key={item._id || item._key || i} style={{ textAlign: 'center', maxWidth: 160 }}>
                    <img
                      src={item.image}
                      alt={`Hero ${i + 1}`}
                      style={{ height: 140, width: '100%', borderRadius: 'var(--radius-md)', objectFit: 'contain', border: '1px solid var(--glass-border)', background: 'var(--bg-card)' }}
                    />
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>#{i + 1}</div>
                    {item.model && (
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.model}
                      </div>
                    )}
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {item.badgeIndices?.length || 0} badge(s)
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Floating Badges (Global Pool) ──────────────────────────── */}
      <div className="admin-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
          <div>
            <h2 style={{ marginBottom: '0.25rem' }}>Floating Badge Cards</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
              Global badge pool. Select which badges appear on each slide above.
            </p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={addBadge}>
            <i className="fa-solid fa-plus" /> Add Badge
          </button>
        </div>

        {(data.badges || []).length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No badges yet.</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          {(data.badges || []).map((badge, i) => (
            <div key={i} className={styles.badgeEditorRow}>
              <div className={styles.badgeEditorFields}>
                <div className="form-group">
                  <label>Badge Title</label>
                  <input className="form-input" value={badge.label || ''} onChange={e => updateBadgeField(i, 'label', e.target.value)} placeholder="CE Certified" />
                </div>
                <div className="form-group">
                  <label>Badge Subtitle</label>
                  <input className="form-input" value={badge.sub || ''} onChange={e => updateBadgeField(i, 'sub', e.target.value)} placeholder="DRGEM Equipment" />
                </div>
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>Preview</div>
                  <div className={styles.cePreview}>
                    {badge.icon ? (
                      <img src={badge.icon} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                    ) : (
                      <i className="fa-solid fa-shield-check" style={{ color: 'var(--color-success)', fontSize: '1.2rem' }} />
                    )}
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{badge.label || 'Badge Title'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{badge.sub || 'Badge Subtitle'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.badgeEditorRight}>
                <div className="form-group">
                  <label>Icon (SVG or PNG)</label>
                  <ImageUpload
                    value={badge.icon || ''}
                    onChange={v => updateBadgeField(i, 'icon', v)}
                    label="Badge Icon"
                    height="120px"
                    allowSvg={true}
                    note="SVG · 64×64 · transparent bg"
                  />
                </div>
                <button className="btn btn-danger btn-sm" style={{ marginTop: 'var(--space-sm)', width: '100%' }} onClick={() => removeBadge(i)}>
                  <i className="fa-solid fa-trash" /> Remove Badge
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Badge & Headline */}
      <div className="admin-section">
        <h2>Badge &amp; Headline</h2>
        <div className="form-grid" style={{ gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label>Top Badge Text</label>
            <input className="form-input" value={data.badge || ''} onChange={e => set('badge', e.target.value)} placeholder="Authorized DRGEM Distributor — Bangladesh" />
          </div>
          <div className="form-group">
            <label>Main Headline</label>
            <input className="form-input" value={data.headline || ''} onChange={e => set('headline', e.target.value)} placeholder="Precision Imaging for Better Healthcare" />
          </div>
          <div className="form-group">
            <label>Subheadline</label>
            <textarea className="form-input" rows={3} value={data.subheadline || ''} onChange={e => set('subheadline', e.target.value)} />
          </div>
        </div>
      </div>

      {/* 5. CTA Buttons */}
      <div className="admin-section">
        <h2>Call-to-Action Buttons</h2>
        <div className={styles.ctaGrid}>
          <div className="form-group">
            <label>Primary Button Label</label>
            <input className="form-input" value={data.ctaLabel || ''} onChange={e => set('ctaLabel', e.target.value)} placeholder="Explore Products" />
          </div>
          <div className="form-group">
            <label>Primary Button Link</label>
            <input className="form-input" value={data.ctaHref || ''} onChange={e => set('ctaHref', e.target.value)} placeholder="#products" />
          </div>
          <div className="form-group">
            <label>Secondary Button Label</label>
            <input className="form-input" value={data.ctaSecondaryLabel || ''} onChange={e => set('ctaSecondaryLabel', e.target.value)} placeholder="Request a Quote" />
          </div>
          <div className="form-group">
            <label>Secondary Button Link</label>
            <input className="form-input" value={data.ctaSecondaryHref || ''} onChange={e => set('ctaSecondaryHref', e.target.value)} placeholder="#contact" />
          </div>
        </div>
      </div>

      {/* 6. Stats */}
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