import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from './api';
import Toolbar from './components/Toolbar';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import SettingsPanel from './components/SettingsPanel';
import './App.css';

const STARTUP_SYNC_DELAY_MS = 1000;
const POST_EDIT_SYNC_DELAY_MS = 2000;
const PERIODIC_SYNC_INTERVAL_MS = 120000;

function extractTitle(content) {
  if (!content || !content.trim()) return 'Untitled';
  const lines = content.split('\n');
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith('# ')) return line.slice(2).trim() || 'Untitled';
    if (line) return line;
  }
  return 'Untitled';
}

export default function App() {
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [currentNote, setCurrentNote] = useState(null);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const debounceTimer = useRef(null);
  const postEditSyncTimer = useRef(null);
  const startupSyncTimer = useRef(null);
  const periodicSyncTimer = useRef(null);
  const syncInFlight = useRef(false);
  const syncQueued = useRef(false);

  const getSyncErrorMessage = useCallback((rawMessage) => {
    if (!rawMessage) return 'Sync failed';
    if (rawMessage.includes('Remote URL not configured')) {
      return 'Set remote in Settings to enable auto-sync';
    }
    if (rawMessage.includes('No local commits to push yet')) {
      return 'No changes to sync yet';
    }
    return rawMessage;
  }, []);

  const runSync = useCallback(async (reason = 'auto') => {
    if (syncInFlight.current) {
      syncQueued.current = true;
      return;
    }

    syncInFlight.current = true;
    setSyncStatus({ type: 'info', message: 'Syncing...' });

    try {
      const result = await api.sync();
      const status = result?.status;
      const message = result?.message;

      if (status && status !== 'ok') {
        setSyncStatus({ type: 'error', message: getSyncErrorMessage(message) });
      } else {
        setSyncStatus({ type: 'success', message: message || 'Up to date' });
      }
    } catch (err) {
      setSyncStatus({ type: 'error', message: getSyncErrorMessage(err.message) });
    } finally {
      syncInFlight.current = false;
      if (syncQueued.current) {
        // Clear the queued flag before starting the queued sync, and also
        // ensure it is reset in the async flow via a dedicated try/finally.
        syncQueued.current = false;
        (async () => {
          try {
            await runSync(`queued:${reason}`);
          } catch (err) {
            console.error('Queued sync failed:', err);
            setSyncStatus({ type: 'error', message: getSyncErrorMessage(err.message) });
          } finally {
            // Guarantee cleanup even if the queued sync throws unexpectedly.
            syncQueued.current = false;
          }
        })();
      }
    }
  }, [getSyncErrorMessage]);

  const loadNotes = useCallback(async () => {
    try {
      const data = await api.listNotes();
      setNotes(data);
      return data;
    } catch (err) {
      console.error('Failed to load notes:', err);
      return [];
    } finally {
      setLoadingNotes(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const init = async () => {
      await loadNotes();
      if (!active) return;
      startupSyncTimer.current = setTimeout(() => {
        void runSync('startup');
      }, STARTUP_SYNC_DELAY_MS);
    };

    void init();

    return () => {
      active = false;
      if (startupSyncTimer.current) clearTimeout(startupSyncTimer.current);
    };
  }, [loadNotes, runSync]);

  useEffect(() => {
    periodicSyncTimer.current = setInterval(() => {
      void runSync('periodic');
    }, PERIODIC_SYNC_INTERVAL_MS);

    return () => {
      if (periodicSyncTimer.current) clearInterval(periodicSyncTimer.current);
    };
  }, [runSync]);

  useEffect(() => () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (postEditSyncTimer.current) clearTimeout(postEditSyncTimer.current);
    if (startupSyncTimer.current) clearTimeout(startupSyncTimer.current);
    if (periodicSyncTimer.current) clearInterval(periodicSyncTimer.current);
  }, []);

  const selectNote = useCallback(async (id) => {
    setSelectedId(id);
    try {
      const note = await api.getNote(id);
      setCurrentNote(note);
    } catch (err) {
      console.error('Failed to load note:', err);
    }
  }, []);

  const handleNewNote = async () => {
    try {
      const note = await api.createNote({ title: 'New Note', content: '' });
      await loadNotes();
      await selectNote(note.id);
    } catch (err) {
      console.error('Failed to create note:', err);
      alert('Failed to create note: ' + err.message);
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedId) return;
    if (!window.confirm('Delete this note?')) return;
    try {
      await api.deleteNote(selectedId);
      setCurrentNote(null);
      setSelectedId(null);
      await loadNotes();
    } catch (err) {
      console.error('Failed to delete note:', err);
      alert('Failed to delete note: ' + err.message);
    }
  };

  const handleContentChange = useCallback((newContent) => {
    setCurrentNote((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        content: newContent,
        title: extractTitle(newContent),
      };
    });
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      if (!selectedId) return;
      try {
        const updatedNote = await api.updateNote(selectedId, { content: newContent });
        setCurrentNote((prev) => {
          if (!prev || prev.id !== updatedNote.id) return prev;
          return {
            ...prev,
            ...updatedNote,
          };
        });
        await loadNotes();

        if (postEditSyncTimer.current) clearTimeout(postEditSyncTimer.current);
        postEditSyncTimer.current = setTimeout(() => {
          void runSync('post-edit');
        }, POST_EDIT_SYNC_DELAY_MS);
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    }, 1000);
  }, [selectedId, loadNotes, runSync]);

  const handleSync = useCallback(() => {
    void runSync('manual');
  }, [runSync]);

  return (
    <div className="app">
      <Toolbar
        onNewNote={handleNewNote}
        onDeleteNote={handleDeleteNote}
        onSync={handleSync}
        onRetry={handleSync}
        onSettings={() => setShowSettings(true)}
        syncStatus={syncStatus}
        hasNote={!!selectedId}
      />
      <div className="main-layout">
        <aside className="sidebar">
          <NoteList
            notes={notes}
            selectedId={selectedId}
            onSelect={selectNote}
            loading={loadingNotes}
          />
        </aside>
        <main className="editor-area">
          <NoteEditor
            note={currentNote}
            onChange={handleContentChange}
          />
        </main>
      </div>
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}
