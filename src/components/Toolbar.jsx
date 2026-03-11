import React from 'react';

export default function Toolbar({ onNewNote, onDuplicateNote, onDeleteNote, onSync, onRetry, onSettings, syncStatus, hasNote }) {
  const syncFailed = syncStatus?.type === 'error';

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <span className="app-title">Notebook</span>
      </div>
      <div className="toolbar-actions">
        <button className="toolbar-btn" onClick={onNewNote} title="New Note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>New</span>
        </button>
        <button className="toolbar-btn" onClick={onDuplicateNote} title="Duplicate Note" disabled={!hasNote}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="10" height="10" rx="2"/>
            <rect x="5" y="5" width="10" height="10" rx="2"/>
          </svg>
          <span>Duplicate</span>
        </button>
        <button className="toolbar-btn danger" onClick={onDeleteNote} title="Delete Note" disabled={!hasNote}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
          <span>Delete</span>
        </button>
        <button className="toolbar-btn" onClick={onSettings} title="Settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
          <span>Settings</span>
        </button>
      </div>
      <div className="toolbar-right">
        {syncStatus && (
          <div className={`sync-status ${syncStatus.type}`}>{syncStatus.message}</div>
        )}
        <button
          className={`toolbar-btn secondary ${syncFailed ? 'retry' : ''}`}
          onClick={syncFailed ? onRetry : onSync}
          title={syncFailed ? 'Retry Sync' : 'Sync now'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
          <span>{syncFailed ? 'Retry' : 'Sync'}</span>
        </button>
      </div>
    </div>
  );
}
