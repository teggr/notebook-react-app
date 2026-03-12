import test from 'node:test';
import assert from 'node:assert/strict';

import { sanitizeNoteExportFilename } from './exportFilename.js';

test('sanitizeNoteExportFilename returns fallback for empty values', () => {
  assert.equal(sanitizeNoteExportFilename(''), 'Untitled.md');
  assert.equal(sanitizeNoteExportFilename('   '), 'Untitled.md');
  assert.equal(sanitizeNoteExportFilename(null), 'Untitled.md');
});

test('sanitizeNoteExportFilename strips unsafe characters and normalizes spacing', () => {
  assert.equal(
    sanitizeNoteExportFilename('  My / unsafe : note  '),
    'My - unsafe - note.md'
  );
});

test('sanitizeNoteExportFilename strips trailing extension and preserves single .md', () => {
  assert.equal(sanitizeNoteExportFilename('Design Doc.md'), 'Design Doc.md');
  assert.equal(sanitizeNoteExportFilename('Design Doc.MD'), 'Design Doc.md');
});
