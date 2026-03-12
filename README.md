# Notebook

A Simplenote-like note-taking React application built with Vite.

## Features

- Create, view, edit, and delete notes
- Search notes from the top toolbar (title + content)
- Export selected note as a markdown file from the top toolbar
- Auto-save with 1-second debounce
- Live word count in the editor toolbar with reduced-motion-safe bounce feedback
- Image upload and inline markdown insertion
- Git sync (push/pull via backend)
- Configurable settings (remote URL and access token)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env.local` and configure your API server:
   ```
   VITE_API_BASE_URL=http://localhost:8080
   ```

3. Start the dev server:
   ```
   npm run dev
   ```

## Building

```
npm run build
```

## API

This app connects to a REST API backend. See `.env.example` for configuration. Required endpoints:

- `GET /api/notes` — list notes
- `GET /api/notes/search?q=...&limit=...` — search notes (title + content, max 10)
- `GET /api/notes/:id` — get a note
- `POST /api/notes` — create a note
- `PUT /api/notes/:id` — update a note
- `DELETE /api/notes/:id` — delete a note
- `POST /api/images` — upload an image
- `POST /api/git/sync` — sync with remote git
- `GET /api/settings` — get settings
- `PUT /api/settings` — update settings
