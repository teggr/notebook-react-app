export function sanitizeNoteExportFilename(title) {
  const normalized = (title || 'Untitled')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\.md$/i, '')
    .replace(/[^a-zA-Z0-9._ -]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[ ._-]+$/g, '')
    .replace(/^[ ._-]+/g, '')
    .slice(0, 120);

  const safeBase = normalized || 'Untitled';
  return `${safeBase}.md`;
}
