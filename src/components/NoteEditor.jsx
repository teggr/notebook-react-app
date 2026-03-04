import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api';

export default function NoteEditor({ note, onChange, onImageUpload }) {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (textareaRef.current && note) {
      textareaRef.current.focus();
    }
  }, [note?.id]);

  if (!note) {
    return (
      <div className="editor-empty">
        <p>Select a note or create a new one</p>
      </div>
    );
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await api.uploadImage(file);
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const content = note.content || '';
      const newContent = content.slice(0, start) + result.markdown + content.slice(end);
      onChange(newContent);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + result.markdown.length;
        textarea.focus();
      }, 0);
    } catch (err) {
      alert('Image upload failed: ' + err.message);
    } finally {
      setUploading(false);
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-toolbar">
        <input
          className="editor-title"
          value={note.title || ''}
          readOnly
          placeholder="Untitled"
        />
        <button
          className="editor-img-btn"
          title="Upload Image"
          disabled={uploading}
          onClick={() => fileInputRef.current.click()}
        >
          {uploading ? (
            <span>...</span>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
      </div>
      <textarea
        ref={textareaRef}
        className="editor-textarea"
        value={note.content || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Start writing..."
        spellCheck={true}
      />
    </div>
  );
}
