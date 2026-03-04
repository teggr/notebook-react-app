import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function SettingsPanel({ onClose }) {
  const [settings, setSettings] = useState({ remoteUrl: '', token: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.getSettings()
      .then(setSettings)
      .catch(() => setMessage({ type: 'error', text: 'Failed to load settings' }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.updateSettings(settings);
      setMessage({ type: 'success', text: 'Settings saved!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <label>
                Remote URL
                <input
                  type="text"
                  value={settings.remoteUrl || ''}
                  onChange={(e) => setSettings({ ...settings, remoteUrl: e.target.value })}
                  placeholder="https://github.com/user/notes.git"
                />
              </label>
              <label>
                Token
                <input
                  type="password"
                  value={settings.token || ''}
                  onChange={(e) => setSettings({ ...settings, token: e.target.value })}
                  placeholder="Personal access token"
                />
              </label>
              {message && (
                <div className={`settings-message ${message.type}`}>{message.text}</div>
              )}
              <div className="modal-actions">
                <button className="btn-secondary" onClick={onClose}>Cancel</button>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
