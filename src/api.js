const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api');

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? 'The request failed.');
  return body;
}

export const api = {
  listSongs: () => request('/songs'),
  createSong: (song) => request('/songs', { method: 'POST', body: JSON.stringify(song) }),
  updateSong: (id, song) => request(`/songs/${id}`, { method: 'PUT', body: JSON.stringify(song) }),
  deleteSong: (id) => request(`/songs/${id}`, { method: 'DELETE' }),
  listSetlists: () => request('/setlists'),
  createSetlist: (setlist) => request('/setlists', { method: 'POST', body: JSON.stringify(setlist) }),
  updateSetlist: (id, setlist) => request(`/setlists/${id}`, { method: 'PUT', body: JSON.stringify(setlist) }),
  deleteSetlist: (id) => request(`/setlists/${id}`, { method: 'DELETE' }),
  getSetlist: (id) => request(`/setlists/${id}`),
  addSongToSetlist: (setlistId, songId) => request(`/setlists/${setlistId}/songs`, { method: 'POST', body: JSON.stringify({ songId }) }),
  removeSongFromSetlist: (setlistId, songId) => request(`/setlists/${setlistId}/songs/${songId}`, { method: 'DELETE' }),
};
