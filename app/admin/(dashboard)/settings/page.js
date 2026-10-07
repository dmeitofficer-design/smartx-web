'use client';
import { useState, useEffect } from 'react';
import ToastContainer, { useToast } from '@/app/components/Toast';
import ImageUpload from '@/app/components/ImageUpload';
import styles from './settings.module.css';

const FONT_OPTIONS = [
  { label: 'Cal Sans (Default)', value: "'Cal Sans', 'Inter', sans-serif" },
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Poppins', value: "'Poppins', sans-serif" },
  { label: 'Montserrat', value: "'Montserrat', sans-serif" },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Roboto Slab', value: "'Roboto Slab', serif" },
    { label: 'Kangge', value: "var(--font-accent), sans-serif" },
    { label: 'Copperplate Gothic Bold', value: "var(--font-accent), sans-serif" },
];

const BODY_FONT_OPTIONS = [
  { label: 'Inter (Default)', value: "'Inter', sans-serif" },
  { label: 'Roboto', value: "'Roboto', sans-serif" },
  { label: 'Open Sans', value: "'Open Sans', sans-serif" },
  { label: 'Lato', value: "'Lato', sans-serif" },
  { label: 'Source Sans Pro', value: "'Source Sans Pro', sans-serif" },
  { label: 'Merriweather', value: "'Merriweather', serif" },
  { label: 'megiko', value: "var(--font-accent2), sans-serif" },
  { label: 'Stark', value: "var(--font-accent4), sans-serif" },
  { label: 'Gebuk Regular', value: "var(--font-accent3), sans-serif" },
];

const COLOR_PRESETS = [
  { label: 'Ocean Blue', primary: '#0ea5e9', secondary: '#6366f1', accent: '#06b6d4' },
  { label: 'Medical Green', primary: '#10b981', secondary: '#0ea5e9', accent: '#34d399' },
  { label: 'Prestige Purple', primary: '#8b5cf6', secondary: '#ec4899', accent: '#a78bfa' },
  { label: 'Royal Navy', primary: '#1e40af', secondary: '#0ea5e9', accent: '#3b82f6' },
  { label: 'Sunset Orange', primary: '#f97316', secondary: '#ef4444', accent: '#fb923c' },
];

export default function AdminSettingsPage() {
  const { toasts, addToast } = useToast();
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setData);
  }, []);

  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  const setNavLink = (i, f, v) => {
    const links = [...(data.navLinks || [])];
    links[i] = { ...links[i], [f]: v };
    set('navLinks', links);
  };
  const addNavLink = () => set('navLinks', [...(data.navLinks || []), { label: '', href: '' }]);
  const removeNavLink = (i) => set('navLinks', data.navLinks.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      addToast('Settings saved! Refresh the site to see color/font changes.', 'success');
    } catch {
      addToast('Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (preset) => {
    setData(d => ({ ...d, colorPrimary: preset.primary, colorSecondary: preset.secondary, colorAccent: preset.accent }));
  };

  if (!data) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loader" /></div>;

  const TABS = [
    { id: 'branding',  icon: 'fa-palette',     label: 'Branding & Colors' },
    { id: 'contact',   icon: 'fa-address-card', label: 'Contact Info' },
    { id: 'nav',       icon: 'fa-bars',         label: 'Navigation' },
    { id: 'seo',       icon: 'fa-magnifying-glass', label: 'SEO' },
  ];

  return (
    <div>
      <ToastContainer toasts={toasts} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Site Settings</h1>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? <><span className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save All Settings</>}
        </button>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t.id} className={`${styles.tab} ${activeTab === t.id ? styles.activeTab : ''}`} onClick={() => setActiveTab(t.id)}>
            <i className={`fa-solid ${t.icon}`} /> {t.label}
          </button>
        ))}
      </div>

      {/* Branding & Colors */}
      {activeTab === 'branding' && (
        <>
          <div className="admin-section">
            <h2>Site Identity</h2>
            <div className="form-grid" style={{ gap: 'var(--space-md)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label>Site Name</label>
                  <input className="form-input" value={data.siteName || ''} onChange={e => set('siteName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Logo Text</label>
                  <input className="form-input" value={data.logoText || ''} onChange={e => set('logoText', e.target.value)} placeholder="SmartX" />
                </div>
              </div>
              <div className="form-group">
                <label>Site Tagline</label>
                <input className="form-input" value={data.siteTagline || ''} onChange={e => set('siteTagline', e.target.value)} />
              </div>

              {/* Logo image upload */}
              <div>
                <div style={{ fontSize:'var(--font-size-sm)', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'var(--space-sm)' }}>
                  Logo Image <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0 }}>(shown beside logo text in navbar)</span>
                </div>
                <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:'var(--space-md)' }}>
                  SVG or PNG for the navbar logo icon. SVG recommended — scales perfectly at any size. Leave blank to use the default ⚕ symbol.
                </p>
                <div style={{ maxWidth: 360 }}>
                  <ImageUpload
                    value={data.logoImage || ''}
                    onChange={v => set('logoImage', v)}
                    label="Logo Icon (SVG or PNG)"
                    height="120px"
                    allowSvg={true}
                    note="SVG recommended · transparent background · square"
                  />
                </div>
                {data.logoImage && (
                  <div style={{ marginTop:'var(--space-md)', display:'flex', alignItems:'center', gap:'var(--space-sm)', padding:'0.75rem 1rem', background:'#ebedf0', borderRadius:'var(--radius-md)', width:'fit-content' }}>
                    <img src={data.logoImage} alt="Logo preview" style={{ height:28, width:'auto', objectFit:'contain' }} />
                    <span style={{ color:'#f1f5f9', fontWeight:700, fontSize:'1.2rem', fontFamily:'var(--font-heading)' }}></span>
                    <span style={{ color:'#64748b', fontSize:'0.72rem' }}>← Navbar preview</span>
                  </div>
                )}
              </div>
              {/* <div>
                <div style={{ fontSize:'var(--font-size-sm)', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'var(--space-sm)' }}>
                  Logo Image <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0 }}>(shown beside logo text in navbar)</span>
                </div>
                <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:'var(--space-md)' }}>
                  SVG or PNG for the navbar logo icon. SVG recommended — scales perfectly at any size. Leave blank to use the default ⚕ symbol.
                </p>
                <div style={{ maxWidth: 360 }}>
                  <ImageUpload
                    value={data.textImage || ''}
                    onChange={v => set('textImage', v)}
                    label="Logo Icon (SVG or PNG)"
                    height="120px"
                    allowSvg={true}
                    note="SVG recommended · transparent background · square"
                  />
                </div>
                {data.textImage && (
                  <div style={{ marginTop:'var(--space-md)', display:'flex', alignItems:'center', gap:'var(--space-sm)', padding:'0.75rem 1rem', background:'#0c1524', borderRadius:'var(--radius-md)', width:'fit-content' }}>
                    <img src={data.textImage} alt="Logo preview" style={{ height:28, width:'auto', objectFit:'contain' }} />
                    
                    <span style={{ color:'#64748b', fontSize:'0.72rem' }}>← Navbar preview</span>
                  </div>
                )}
              </div> */}


                 {/* footer Logo image upload */}
              <div>
                <div style={{ fontSize:'var(--font-size-sm)', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'var(--space-sm)' }}>
                  Logo Image <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0 }}>(shown beside logo text in navbar)</span>
                </div>
                <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:'var(--space-md)' }}>
                  SVG or PNG for the navbar logo icon. SVG recommended — scales perfectly at any size. Leave blank to use the default ⚕ symbol.
                </p>
                <div style={{ maxWidth: 360 }}>
                  <ImageUpload
                    value={data.logoImagef || ''}
                    onChange={v => set('logoImagef', v)}
                    label="Logo Icon (SVG or PNG)"
                    height="120px"
                    allowSvg={true}
                    note="SVG recommended · transparent background · square"
                  />
                </div>
                {data.logoImage && (
                  <div style={{ marginTop:'var(--space-md)', display:'flex', alignItems:'center', gap:'var(--space-sm)', padding:'0.75rem 1rem', background:'#0c1524', borderRadius:'var(--radius-md)', width:'fit-content' }}>
                    <img src={data.logoImagef} alt="Logo preview" style={{ height:28, width:'auto', objectFit:'contain' }} />
                    <span style={{ color:'#f1f5f9', fontWeight:700, fontSize:'1.2rem', fontFamily:'var(--font-heading)' }}>{data.logoText || 'SmartX'}</span>
                    <span style={{ color:'#64748b', fontSize:'0.72rem' }}>← footer preview</span>
                  </div>
                )}
              </div>
              {/* <div>
                <div style={{ fontSize:'var(--font-size-sm)', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'var(--space-sm)' }}>
                  Logo Image <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0 }}>(shown beside logo text in navbar)</span>
                </div>
                <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:'var(--space-md)' }}>
                  SVG or PNG for the navbar logo icon. SVG recommended — scales perfectly at any size. Leave blank to use the default ⚕ symbol.
                </p>
                <div style={{ maxWidth: 360 }}>
                  <ImageUpload
                    value={data.textImagef || ''}
                    onChange={v => set('textImagef', v)}
                    label="Logo Icon (SVG or PNG)"
                    height="120px"
                    allowSvg={true}
                    note="SVG recommended · transparent background · square"
                  />
                </div>
                {data.textImagef && (
                  <div style={{ marginTop:'var(--space-md)', display:'flex', alignItems:'center', gap:'var(--space-sm)', padding:'0.75rem 1rem', background:'#0c1524', borderRadius:'var(--radius-md)', width:'fit-content' }}>
                    <img src={data.textImagef} alt="Logo preview" style={{ height:28, width:'auto', objectFit:'contain' }} />
                    
                    <span style={{ color:'#64748b', fontSize:'0.72rem' }}>← footer preview</span>
                  </div>
                )}
              </div> */}
            </div>
          </div>

          <div className="admin-section">
            <h2>Color Scheme</h2>
            {/* Presets */}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-sm)' }}>Quick Presets</div>
              <div className={styles.presets}>
                {COLOR_PRESETS.map(p => (
                  <button key={p.label} className={styles.preset} onClick={() => applyPreset(p)} title={p.label}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 4, background: p.primary }} />
                      <div style={{ width: 20, height: 20, borderRadius: 4, background: p.secondary }} />
                      <div style={{ width: 20, height: 20, borderRadius: 4, background: p.accent }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Custom colors */}
            <div className={styles.colorGrid}>
              {[
                ['Primary Color',   'colorPrimary'],
                ['Secondary Color', 'colorSecondary'],
                ['Accent Color',    'colorAccent'],
              ].map(([label, key]) => (
                <div key={key} className={styles.colorRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>{label}</label>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={data[key] || '#0ea5e9'}
                        onChange={e => set(key, e.target.value)}
                        className={styles.colorPicker}
                      />
                      <input
                        className="form-input"
                        value={data[key] || ''}
                        onChange={e => set(key, e.target.value)}
                        placeholder="#0ea5e9"
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-section">
            <h2>Typography</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label>Heading Font</label>
                <select className="form-input" value={data.fontHeading || ''} onChange={e => set('fontHeading', e.target.value)}>
                  {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                <div style={{ marginTop: 'var(--space-xs)', fontSize: 'var(--font-size-sm)', fontFamily: data.fontHeading, color: 'var(--text-muted)' }}>
                  Preview: The Quick Brown Fox
                </div>
              </div>
              <div className="form-group">
                <label>Body Font</label>
                <select className="form-input" value={data.fontBody || ''} onChange={e => set('fontBody', e.target.value)}>
                  {BODY_FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                <div style={{ marginTop: 'var(--space-xs)', fontSize: 'var(--font-size-sm)', fontFamily: data.fontBody, color: 'var(--text-muted)' }}>
                  Preview: DRGEM Medical Imaging Equipment
                </div>
              </div>
            </div>
          </div>

          <div className="admin-section">
            <h2>CTA Button</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label>Button Label</label>
                <input className="form-input" value={data.ctaLabel || ''} onChange={e => set('ctaLabel', e.target.value)} placeholder="Request a Quote" />
              </div>
              <div className="form-group">
                <label>Button Link</label>
                <input className="form-input" value={data.ctaHref || ''} onChange={e => set('ctaHref', e.target.value)} placeholder="#contact" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Contact */}
      {activeTab === 'contact' && (
        <div className="admin-section">
          <h2>Contact Information</h2>
          <div className="form-grid" style={{ gap: 'var(--space-md)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label>Phone</label>
                <input className="form-input" value={data.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="+880-2-XXXXXXX" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="form-input" value={data.email || ''} onChange={e => set('email', e.target.value)} placeholder="info@smartxbdlimited.com" />
              </div>
              <div className="form-group">
                <label>LinkedIN</label>
                <input className="form-input" value={data.linkedin || ''} onChange={e => set('linkedin', e.target.value)} placeholder="www.linkedin.com/user" />
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <input className="form-input" value={data.address || ''} onChange={e => set('address', e.target.value)} placeholder="House XX, Road XX, Dhaka 1000" />
            </div>
            <div className="form-group">
              <label>WhatsApp Number (with country code)</label>
              <input className="form-input" value={data.whatsapp || ''} onChange={e => set('whatsapp', e.target.value)} placeholder="+8801XXXXXXXXX" />
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />
            <h3 style={{ marginBottom: 'var(--space-md)' }}>Social Media</h3>
            {[
              ['Facebook URL', 'facebook', 'https://facebook.com/...'],
              ['LinkedIn URL', 'linkedin', 'https://linkedin.com/company/...'],
              ['YouTube URL',  'youtube',  'https://youtube.com/...'],
            ].map(([label, key, ph]) => (
              <div className="form-group" key={key}>
                <label>{label}</label>
                <input className="form-input" value={data[key] || ''} onChange={e => set(key, e.target.value)} placeholder={ph} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      {activeTab === 'nav' && (
        <div className="admin-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
            <h2 style={{ marginBottom: 0 }}>Navigation Links</h2>
            <button className="btn btn-outline btn-sm" onClick={addNavLink}><i className="fa-solid fa-plus" /> Add Link</button>
          </div>
          <div className={styles.navList}>
            {(data.navLinks || []).map((link, i) => (
              <div key={i} className={styles.navRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Label</label>
                  <input className="form-input" value={link.label} onChange={e => setNavLink(i, 'label', e.target.value)} placeholder="Products" />
                </div>
                <div className="form-group" style={{ flex: 2 }}>
                  <label>URL / Anchor</label>
                  <input className="form-input" value={link.href} onChange={e => setNavLink(i, 'href', e.target.value)} placeholder="#products or /page" />
                </div>
                <button className="btn btn-danger btn-sm" style={{ marginTop: '1.5rem' }} onClick={() => removeNavLink(i)}>
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEO */}
      {activeTab === 'seo' && (
        <div className="admin-section">
          <h2>SEO & Meta Tags</h2>
          <div className="form-grid" style={{ gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label>Meta Title</label>
              <input className="form-input" value={data.metaTitle || ''} onChange={e => set('metaTitle', e.target.value)} placeholder="SmartX Technology Limited | DRGEM Medical Imaging Equipment" />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 4 }}>
                {(data.metaTitle || '').length}/60 chars recommended
              </div>
            </div>
            <div className="form-group">
              <label>Meta Description</label>
              <textarea className="form-input" rows={3} value={data.metaDescription || ''} onChange={e => set('metaDescription', e.target.value)} placeholder="Exclusive distributor of DRGEM medical imaging equipment..." />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 4 }}>
                {(data.metaDescription || '').length}/160 chars recommended
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
