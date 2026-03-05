import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from './api';
import Toolbar from './components/Toolbar';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import SettingsPanel from './components/SettingsPanel';
import './App.css';

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
  const syncTimer = useRef(null);

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
    loadNotes();
  }, [loadNotes]);

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
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    }, 1000);
  }, [selectedId, loadNotes]);

  const handleSync = async () => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    setSyncStatus({ type: 'info', message: 'Syncing...' });
    try {
      const result = await api.sync();
      setSyncStatus({ type: 'success', message: result.message || 'Synced!' });
    } catch (err) {
      setSyncStatus({ type: 'error', message: err.message });
    }
    syncTimer.current = setTimeout(() => setSyncStatus(null), 4000);
  };

  return (
    <div className="app">
      <Toolbar
        onNewNote={handleNewNote}
        onDeleteNote={handleDeleteNote}
        onSync={handleSync}
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
