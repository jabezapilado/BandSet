const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

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
  listSetlists: () => request('/setlists'),
  createSetlist: (setlist) => request('/setlists', { method: 'POST', body: JSON.stringify(setlist) }),
  getSetlist: (id) => request(`/setlists/${id}`),
  addSongToSetlist: (setlistId, songId) => request(`/setlists/${setlistId}/songs`, { method: 'POST', body: JSON.stringify({ songId }) }),
};
