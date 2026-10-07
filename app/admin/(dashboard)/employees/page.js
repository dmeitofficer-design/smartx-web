'use client';
import { useState, useEffect } from 'react';
import ImageUpload from '@/app/components/ImageUpload';
import ToastContainer, { useToast } from '@/app/components/Toast';
import { QRCode } from 'react-qrcode-logo'; // 🟢 Canvas-based beautiful QR generator

import styles from './employees.module.css';

export default function AdminEmployeesPage() {
  const { toasts, addToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit / Mode Tracking State
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [status, setStatus] = useState('Active');
  
  // Custom Metadata State Fields
  const [additionalFields, setAdditionalFields] = useState([]);
  const [customLabel, setCustomLabel] = useState('');
  const [customValue, setCustomValue] = useState('');
const [selectedEmployee, setSelectedEmployee] = useState(null);
const getBrowserIcon = (browser = '') => {
  if (browser.includes('Chrome')) return 'fa-brands fa-chrome';
  if (browser.includes('Firefox')) return 'fa-brands fa-firefox-browser';
  if (browser.includes('Edge')) return 'fa-brands fa-edge';
  if (browser.includes('Safari')) return 'fa-brands fa-safari';
  if (browser.includes('Opera')) return 'fa-brands fa-opera';
  return 'fa-solid fa-globe';
};
  useEffect(() => {
    fetchEmployees();
  }, []);
useEffect(() => {
  document.body.style.overflow = selectedEmployee
    ? 'hidden'
    : '';

  return () => {
    document.body.style.overflow = '';
  };
}, [selectedEmployee]);
const fetchEmployees = () => {
  // Pass { cache: 'no-store' } to ensure you always get live data
  fetch('/api/employees', { cache: 'no-store' })
    .then(res => res.json())
    .then(data => { setEmployees(data); setLoading(false); })
    .catch(() => addToast('Failed to fetch roster', 'error'));
};
  const checkIsDuplicate = (idValue) => {
    if (editingId) return false; 
    return employees.some(emp => emp.employeeId.toLowerCase() === idValue.trim().toLowerCase());
  };

  const handleAddCustomField = (e) => {
    e.preventDefault();
    if (!customLabel.trim() || !customValue.trim()) {
      addToast('Both Label and Value are required to add a credential field.', 'info');
      return;
    }
    setAdditionalFields([...additionalFields, { label: customLabel.trim(), value: customValue.trim() }]);
    setCustomLabel('');
    setCustomValue('');
  };

  const handleRemoveCustomField = (indexToRemove) => {
    setAdditionalFields(additionalFields.filter((_, idx) => idx !== indexToRemove));
  };

  const startEdit = (emp) => {
    setEditingId(emp._id);
    setEmployeeId(emp.employeeId);
    setName(emp.name);
    setDesignation(emp.designation);
    setProfilePic(emp.profilePic);
    setJoiningDate(emp.joiningDate ? emp.joiningDate.split('T')[0] : '');
    setStatus(emp.status || 'Active');
    setAdditionalFields(emp.additionalFields || []);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEmployeeId(''); setName(''); setDesignation(''); setProfilePic(null); setJoiningDate(''); setStatus('Active');
    setAdditionalFields([]);
    setCustomLabel(''); setCustomValue('');
  };

  const handleDeleteEmployee = async (id, nameStr) => {
    if (!confirm(`Are you sure you want to completely remove ${nameStr}?`)) return;
    try {
      const res = await fetch(`/api/employees?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Deletion failure');
      addToast(`${nameStr} was successfully removed.`, 'success');
      if (editingId === id) cancelEdit();
      fetchEmployees();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();

    if (checkIsDuplicate(employeeId)) {
      addToast(`Error: Employee ID "${employeeId}" already exists.`, 'error');
      return;
    }

    const payload = { 
      employeeId: employeeId.trim(), 
      name: name.trim(), 
      designation: designation.trim(), 
      profilePic, 
      joiningDate, 
      status, 
      additionalFields 
    };

    if (editingId) payload._id = editingId;

    try {
      const url = '/api/employees';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Saving error');

      addToast(editingId ? 'Employee profile updated!' : 'Employee entry created!', 'success');
      cancelEdit();

      // 🟢 OPTIMISTIC UPDATE: Use data straight from your API response right away
      if (data.employee) {
        const savedEmp = {
          ...data.employee,
          qrCodeLink: data.qrCodeLink // Keeps your generated secure token link intact
        };

        setEmployees(prev => {
          if (editingId) {
            // Replace the updated employee in state
            return prev.map(emp => emp._id === editingId ? savedEmp : emp);
          } else {
            // Prepend new employee to the roster list matching backend sort order
            return [savedEmp, ...prev];
          }
        });
      }

      // 🟢 Add a brief 300ms fallback delay so production DB clustering can settle
      setTimeout(() => {
        fetchEmployees();
      }, 300);

    } catch (err) {
      addToast(err.message, 'error');
    }
  };
return (
  <div className={styles.container}>
    <ToastContainer toasts={toasts} />
    <h1 className="admin-page-title">Employee Registry Management</h1>

    <div className={styles.layoutGrid}>
      {/* Creation & Editing Form Component */}
      <form onSubmit={handleSubmit} className="admin-section">
        <h2>{editingId ? '📝 Edit Employee Profile' : '👥 Register New Employee'}</h2>

        <div className="admin-form-grid">
          <div className="form-group">
            <label>Employee ID</label>
            <input
              type="text"
              className="form-input"
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              required
              placeholder="e.g. SX-102"
            />
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Designation</label>
            <input
              type="text"
              className="form-input"
              value={designation}
              onChange={e => setDesignation(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              className="form-input"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
          <div className="form-group">
            <label>Joining Date</label>
            <input
              type="date"
              className="form-input"
              value={joiningDate}
              onChange={e => setJoiningDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ margin: '1.5rem 0' }}>
          <label>Profile Picture</label>
          <ImageUpload value={profilePic} onChange={setProfilePic} context="team" height="140px" />
        </div>

        <div style={{ borderTop: '1px dashed var(--glass-border)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
            📂 Custom Identity Metadata Attributes
          </h3>

          {additionalFields.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
              {additionalFields.map((field, idx) => (
                <span key={idx} className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.35rem 0.75rem' }}>
                  <strong>{field.label}:</strong> {field.value}
                  <i
                    className="fa-solid fa-circle-xmark"
                    style={{ cursor: 'pointer', color: 'var(--color-danger)' }}
                    onClick={() => handleRemoveCustomField(idx)}
                  />
                </span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Label (e.g., Blood Group)"
                value={customLabel}
                onChange={e => setCustomLabel(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Value (e.g., B+)"
                value={customValue}
                onChange={e => setCustomValue(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-outline"
              style={{ padding: '0.65rem 1.2rem' }}
              onClick={handleAddCustomField}
            >
              <i className="fa-solid fa-plus" /> Add
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
            {editingId ? 'Save Profile Changes' : 'Generate Profile Node'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={cancelEdit}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Directory Listing */}
      <div className="admin-section">
        <h2>Active Directory Roster</h2>
        {loading ? (
          <p>Loading profiles...</p>
        ) : (
          <div className={styles.rosterList}>
            {employees.length === 0 ? (
              <p>No employee entries discovered.</p>
            ) : (
              employees.map((emp) => {
                const downloadPNG = () => {
                  const canvasElement = document.getElementById(`qr-canvas-${emp._id}`);
                  if (!canvasElement) return;
                  const pngURL = canvasElement.toDataURL('image/png');
                  const downloadLink = document.createElement('a');
                  downloadLink.href = pngURL;
                  downloadLink.download = `QR_${emp.name.replace(/\s+/g, '_')}_${emp.employeeId}.png`;
                  document.body.appendChild(downloadLink);
                  downloadLink.click();
                  document.body.removeChild(downloadLink);
                };

                return (
                  <div key={emp._id} className={styles.empCard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', width: '100%', gap: 'var(--space-md)' }}>
                      <img src={emp.profilePic|| '/avatar-placeholder.png'} className={styles.avatarImg} alt="" />

                      <div className={styles.empMeta} style={{ flex: 1 }}>
                        <h4>{emp.name}</h4>
                        <p>{emp.designation}</p>
                        <small style={{ color: 'var(--text-light)', display: 'block' }}>ID: {emp.employeeId}</small>

                       

                        <div className={styles.actionButtonGroup} style={{ marginTop: '12px' }}>
                          <button type="button" className={styles.editBtn} onClick={() => startEdit(emp)}>
                            <i className="fa-solid fa-user-pen" /> Edit
                          </button>
                          <button type="button" className={styles.deleteBtn} onClick={() => handleDeleteEmployee(emp._id, emp.name)}>
                            <i className="fa-solid fa-trash" /> Delete
                          </button>
                        </div>
                        
                      </div>

                      {/* QR Code Section */}
                      <div className={styles.qrContainerSleek}>
                        <div style={{
                          background: '#ffffff',
                          padding: '8px',
                          borderRadius: '12px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          <QRCode
                            value={emp.qrCodeLink}
                           size={512}
style={{
  width: '60px',
  height: '60px',
}}
                            id={`qr-canvas-${emp._id}`}
                            qrStyle="dots"
                            eyeRadius={[
                              { outer: [4, 4, 4, 4], inner: [2, 2, 2, 2] },
                              { outer: [4, 4, 4, 4], inner: [2, 2, 2, 2] },
                              { outer: [4, 4, 4, 4], inner: [2, 2, 2, 2] },
                            ]}
                            logoPaddingStyle='circle'
                            bgColor="#ffffff"
                            fgColor="#0B132B"
                            ecLevel="M"
                            quietZone={4}
                          />
                        </div>
                        <a href={emp.qrCodeLink} target="_blank" rel="noreferrer" className={styles.qrLinkStyle}>
                          <i className="fa-solid fa-arrow-up-right-from-square" /> Link
                        </a>

                        <button type="button" onClick={downloadPNG} className={styles.qrDownloadBtn}>
                          <i className="fa-solid fa-circle-down" /> PNG
                        </button>
                      </div>
                     <button
  type="button"
  className={styles.scanHistoryBtn}
  onClick={() => setSelectedEmployee(emp)}
>
  <i className="fa-solid fa-chart-line" />
  Scan Analytics

  <span className={styles.scanBadge}>
    {emp.scanCount || 0}
  </span>
</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
    {selectedEmployee && (
  <>
    <div
      className={styles.drawerBackdrop}
      onClick={() => setSelectedEmployee(null)}
    />

    <aside className={styles.scanDrawer}>
      <div className={styles.drawerHeader}>
        <div>
          <h3>{selectedEmployee.name}</h3>
          <p>{selectedEmployee.employeeId}</p>
        </div>

        <button
          type="button"
          className={styles.drawerCloseBtn}
          onClick={() => setSelectedEmployee(null)}
        >
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      <div className={styles.drawerStats}>
        <div className={styles.statCard}>
          <span>Total Scans</span>
          <strong style={{color:'white'}}>{selectedEmployee.scanCount || 0}</strong>
        </div>

        <div className={styles.statCard}>
          <span >Records</span>
          <strong  className={styles.scanText}>
            {selectedEmployee.scanHistory?.length || 0}
          </strong>
        </div>
      </div>

      <div className={styles.drawerBody}>
        {selectedEmployee.scanHistory?.length > 0 ? (
          [...selectedEmployee.scanHistory]
            .reverse()
            .map((log, index) => (
              <div
                key={index}
                className={styles.scanEventCard}
              >
                <div className={styles.scanEventTop}>
                 <strong className={styles.scanText}>
  <i
    className={
      log.device === 'Mobile'
        ? 'fa-solid fa-mobile-screen-button'
        : 'fa-solid fa-desktop'
    }
  />
  {' '}
  {log.device === 'Mobile'
    ? 'Mobile'
    : 'Desktop'}
</strong>

                  <span>
                    {new Date(log.scannedAt).toLocaleString(
                      'en-GB'
                    )}
                  </span>
                </div>

                <div className={styles.scanEventDetails}>
                  <div>
                    <label>Browser</label>
                 <p className={styles.scanText}>
  <i className={getBrowserIcon(log.browser)} />
  {log.browser}
</p>
                  </div>

                  <div>
                    <label>IP Address</label>
                    <code className={styles.scanTextaccent}>{log.ipAddress}</code>
                  </div>
                </div>
              </div>
            ))
        ) : (
          <div className={styles.emptyDrawerState}>
            No scan activity recorded yet.
          </div>
        )}
      </div>
    </aside>
  </>
)}
  </div>
);
}