import React from 'react';

export default function NoteList({ notes, selectedId, onSelect, loading }) {
  if (loading) {
    return (
      <div className="note-list">
        <div className="note-list-empty">Loading notes...</div>
      </div>
    );
  }

  if (!notes.length) {
    return (
      <div className="note-list">
        <div className="note-list-empty">No notes yet.<br/>Click + New to create one.</div>
      </div>
    );
  }

  return (
    <div className="note-list">
      {notes.map((note) => (
        <div
          key={note.id}
          className={`note-item ${note.id === selectedId ? 'active' : ''}`}
          onClick={() => onSelect(note.id)}
        >
          <div className="note-item-title">{note.title || 'Untitled'}</div>
          <div className="note-item-date">{note.lastModifiedFormatted || ''}</div>
        </div>
      ))}
    </div>
  );
}
