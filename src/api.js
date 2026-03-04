const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  try {
    const res = await fetch(url, options);
    if (res.status === 204) return null;
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error('Cannot connect to API server');
    }
    throw err;
  }
}

export const api = {
  listNotes: () => request('/api/notes'),
  getNote: (id) => request(`/api/notes/${id}`),
  createNote: (data = {}) => request('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  updateNote: (id, data) => request(`/api/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  deleteNote: (id) => request(`/api/notes/${id}`, { method: 'DELETE' }),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/images', { method: 'POST', body: formData });
  },
  sync: () => request('/api/git/sync', { method: 'POST' }),
  getSettings: () => request('/api/settings'),
  updateSettings: (data) => request('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
};
