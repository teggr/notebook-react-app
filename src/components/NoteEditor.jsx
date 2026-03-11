import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../api';

function countWords(content) {
  if (!content || !content.trim()) return 0;
  return content.trim().split(/\s+/).filter(token => /[\p{L}\p{N}]/u.test(token)).length;
}

export default function NoteEditor({ note, onChange }) {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const prevWordCountRef = useRef(0);
  const [wordCountBounce, setWordCountBounce] = useState(false);
  const wordCount = useMemo(() => countWords(note?.content || ''), [note?.content]);

  useEffect(() => {
    if (textareaRef.current && note) {
      textareaRef.current.focus();
    }
  }, [note]);

  useEffect(() => {
    if (!note) return;
    if (wordCount !== prevWordCountRef.current) {
      setWordCountBounce(false);
      requestAnimationFrame(() => {
        setWordCountBounce(true);
      });
      prevWordCountRef.current = wordCount;
    }
  }, [note, wordCount]);

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
        <div className="editor-title-group" aria-live="polite">
          <input
            className="editor-title"
            value={note.title || ''}
            readOnly
            placeholder="Untitled"
          />
          <span className={`editor-word-count${wordCountBounce ? ' bounce' : ''}`}>
            ({wordCount})
          </span>
        </div>
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
      <div className="editor-split">
        <div className="editor-pane">
          <textarea
            ref={textareaRef}
            className="editor-textarea"
            value={note.content || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Start writing markdown..."
            spellCheck={true}
          />
        </div>
        <div className="editor-preview" aria-label="Markdown preview">
          <div className="editor-preview-content">
            {note.content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
            ) : (
              <p className="editor-preview-empty">Nothing to preview yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
