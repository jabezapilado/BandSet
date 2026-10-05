import { useEffect, useMemo, useState } from 'react';
import { api } from './api.js';

function formatDuration(seconds) {
  if (!Number.isInteger(seconds)) return '—';
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function Header({ page, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pages = ['Home', 'Songs', 'Setlists'];

  function navigate(nextPage) {
    onNavigate(nextPage);
    setMenuOpen(false);
  }

  return <header className="site-header"><div className="nav-wrap">
    <button className="brand" onClick={() => navigate('Home')} aria-label="Go to BandSet home">BandSet</button>
    <button className="menu-button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen}>☰ <span>Menu</span></button>
    <nav className={menuOpen ? 'nav-links open' : 'nav-links'} aria-label="Main navigation">
      {pages.map((item) => <button key={item} className={page === item ? 'active' : ''} onClick={() => navigate(item)}>{item}</button>)}
    </nav>
  </div></header>;
}

function SetlistCard({ setlist, onOpen, onEdit, onDelete }) {
  return <article className="setlist-card">
    <button className="setlist-open" onClick={onOpen}><strong>{setlist.title}</strong>{setlist.description && <p className="setlist-card-description">{setlist.description}</p>}<span>{setlist.songCount} {setlist.songCount === 1 ? 'song' : 'songs'}</span><small>Open setlist →</small></button>
    {(onEdit || onDelete) && <div className="card-actions" aria-label={`Actions for ${setlist.title}`}>
      <button className="small-button" onClick={() => onEdit(setlist)}>Edit</button>
      <button className="small-button danger-button" onClick={() => onDelete(setlist)}>Delete</button>
    </div>}
  </article>;
}

function SongRow({ song, onSelect, selected, position, onEdit, onDelete, onRemove }) {
  return <div className={selected ? 'song-row selected' : 'song-row'}>
    <button className="song-select" onClick={() => onSelect(song)}>
      <span className="song-title">{position ? `${position}. ${song.title}` : song.title}<small>Key: {song.key ?? '—'} · {formatDuration(song.durationSeconds)}</small></span>
      <span className="song-meta">{song.key ?? '—'}</span><span className="song-meta">{song.bpm ? `${song.bpm} BPM` : '—'}</span>
      <span className="song-status">{song.status}</span>{position && <span className="song-controls">{position}</span>}
    </button>
    {(onEdit || onDelete || onRemove) && <div className="row-actions" aria-label={`Actions for ${song.title}`}>
      {onEdit && <button className="small-button" onClick={() => onEdit(song)}>Edit</button>}
      {onDelete && <button className="small-button danger-button" onClick={() => onDelete(song)}>Delete</button>}
      {onRemove && <button className="small-button danger-button" onClick={() => onRemove(song)}>Remove</button>}
    </div>}
  </div>;
}

function SongForm({ song, onSave, onCancel, saving }) {
  const [form, setForm] = useState(() => ({ title: song?.title ?? '', key: song?.key ?? '', bpm: song?.bpm ?? '', durationSeconds: song?.durationSeconds ?? '', status: song?.status ?? 'Draft', notes: song?.notes ?? '' }));
  function update(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  function submit(event) {
    event.preventDefault();
    onSave({ ...form, bpm: form.bpm === '' ? null : Number(form.bpm), durationSeconds: form.durationSeconds === '' ? null : Number(form.durationSeconds) });
  }
  return <form className="entry-form" onSubmit={submit}>
    <h2>{song ? 'Edit song' : 'Add a song'}</h2>
    <label>Song title<input required name="title" value={form.title} onChange={update} maxLength="120" /></label>
    <div className="form-grid">
      <label>Key<input name="key" value={form.key} onChange={update} maxLength="8" placeholder="E" /></label>
      <label>BPM<input name="bpm" value={form.bpm} onChange={update} type="number" min="30" max="300" placeholder="120" /></label>
      <label>Duration (seconds)<input name="durationSeconds" value={form.durationSeconds} onChange={update} type="number" min="0" max="3600" placeholder="220" /></label>
      <label>Status<select name="status" value={form.status} onChange={update}><option>Draft</option><option>Learning</option><option>Rehearsing</option><option>Ready</option></select></label>
    </div>
    <label>Notes<textarea name="notes" value={form.notes} onChange={update} maxLength="1000" placeholder="Optional rehearsal notes" /></label>
    <div className="form-actions"><button type="button" className="secondary-button" onClick={onCancel}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? 'Saving…' : song ? 'Update song' : 'Save song'}</button></div>
  </form>;
}

function SetlistForm({ setlist, onSave, onCancel, saving }) {
  const [title, setTitle] = useState(setlist?.title ?? '');
  const [description, setDescription] = useState(setlist?.description ?? '');
  return <form className="entry-form compact-form" onSubmit={(event) => { event.preventDefault(); onSave({ title, description }); }}>
    <h2>{setlist ? 'Edit setlist' : 'New setlist'}</h2><label>Setlist title<input required value={title} onChange={(event) => setTitle(event.target.value)} maxLength="120" /></label>
    <label>Setlist description<textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength="1000" placeholder="Optional performance notes, venue details, or set goals" /></label>
    <div className="form-actions"><button type="button" className="secondary-button" onClick={onCancel}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? 'Saving…' : setlist ? 'Update setlist' : 'Save setlist'}</button></div>
  </form>;
}

export default function App() {
  const [page, setPage] = useState('Home');
  const [songs, setSongs] = useState([]);
  const [setlists, setSetlists] = useState([]);
  const [selectedSetlist, setSelectedSetlist] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [query, setQuery] = useState('');
  const [showSongForm, setShowSongForm] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [showSetlistForm, setShowSetlistForm] = useState(false);
  const [editingSetlist, setEditingSetlist] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const visibleSongs = useMemo(() => songs.filter((song) => song.title.toLowerCase().includes(query.toLowerCase())), [songs, query]);

  async function loadLibrary() {
    setLoading(true); setError('');
    try {
      const [nextSongs, nextSetlists] = await Promise.all([api.listSongs(), api.listSetlists()]);
      setSongs(nextSongs); setSetlists(nextSetlists);
    } catch (loadError) {
      setError('BandSet could not reach the API. Start the API server and check the database connection.');
    } finally { setLoading(false); }
  }

  useEffect(() => { loadLibrary(); }, []);

  async function openSetlist(setlist) {
    setError('');
    try {
      const details = await api.getSetlist(setlist.id);
      setSelectedSetlist(details); setSelectedSong(details.songs[0] ?? null); setPage('Setlist Details');
    } catch (loadError) { setError(loadError.message); }
  }

  async function saveSong(song) {
    setSaving(true); setError('');
    try {
      const saved = editingSong ? await api.updateSong(editingSong.id, song) : await api.createSong(song);
      setSongs((current) => (editingSong ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved]).sort((a, b) => a.title.localeCompare(b.title)));
      setSelectedSong(saved); setShowSongForm(false); setEditingSong(null);
      if (selectedSetlist?.songs.some((item) => item.id === saved.id)) {
        setSelectedSetlist((current) => ({ ...current, songs: current.songs.map((item) => item.id === saved.id ? { ...item, ...saved } : item) }));
      }
    }
    catch (saveError) { setError(saveError.message); } finally { setSaving(false); }
  }

  function beginSongEdit(song) { setEditingSong(song); setShowSongForm(true); }

  async function deleteSong(song) {
    if (!window.confirm(`Delete “${song.title}”? It will also be removed from every setlist.`)) return;
    setSaving(true); setError('');
    try {
      await api.deleteSong(song.id);
      setSongs((current) => current.filter((item) => item.id !== song.id));
      if (selectedSong?.id === song.id) setSelectedSong(null);
      const nextSetlists = await api.listSetlists(); setSetlists(nextSetlists);
      if (selectedSetlist?.songs.some((item) => item.id === song.id)) {
        const refreshed = await api.getSetlist(selectedSetlist.id);
        setSelectedSetlist(refreshed);
      }
    } catch (deleteError) { setError(deleteError.message); } finally { setSaving(false); }
  }

  async function saveSetlist(setlist) {
    setSaving(true); setError('');
    try {
      const saved = editingSetlist ? await api.updateSetlist(editingSetlist.id, setlist) : await api.createSetlist(setlist);
      setSetlists((current) => (editingSetlist ? current.map((item) => item.id === saved.id ? { ...item, ...saved } : item) : [...current, saved]).sort((a, b) => a.title.localeCompare(b.title)));
      if (editingSetlist) {
        setSelectedSetlist((current) => current?.id === saved.id ? { ...current, ...saved } : current);
        setShowSetlistForm(false); setEditingSetlist(null);
      } else {
        setShowSetlistForm(false); await openSetlist(saved);
      }
    }
    catch (saveError) { setError(saveError.message); } finally { setSaving(false); }
  }

  function beginSetlistEdit(setlist) { setEditingSetlist(setlist); setShowSetlistForm(true); }

  async function deleteSetlist(setlist) {
    if (!window.confirm(`Delete “${setlist.title}” and its song list?`)) return;
    setSaving(true); setError('');
    try {
      await api.deleteSetlist(setlist.id);
      setSetlists((current) => current.filter((item) => item.id !== setlist.id));
      if (selectedSetlist?.id === setlist.id) { setSelectedSetlist(null); setSelectedSong(null); setPage('Setlists'); }
    } catch (deleteError) { setError(deleteError.message); } finally { setSaving(false); }
  }

  async function addSongToCurrentSetlist(event) {
    event.preventDefault();
    const songId = Number(new FormData(event.currentTarget).get('songId'));
    if (!songId || !selectedSetlist) return;
    setSaving(true); setError('');
    try {
      await api.addSongToSetlist(selectedSetlist.id, songId);
      const refreshed = await api.getSetlist(selectedSetlist.id);
      setSelectedSetlist(refreshed); setSelectedSong(refreshed.songs.at(-1) ?? null);
      const nextSetlists = await api.listSetlists(); setSetlists(nextSetlists);
      event.currentTarget.reset();
    } catch (saveError) { setError(saveError.message); } finally { setSaving(false); }
  }

  async function removeSongFromCurrentSetlist(song) {
    if (!selectedSetlist || !window.confirm(`Remove “${song.title}” from this setlist?`)) return;
    setSaving(true); setError('');
    try {
      await api.removeSongFromSetlist(selectedSetlist.id, song.id);
      const [refreshed, nextSetlists] = await Promise.all([api.getSetlist(selectedSetlist.id), api.listSetlists()]);
      setSelectedSetlist(refreshed); setSetlists(nextSetlists);
      setSelectedSong((current) => current?.id === song.id ? refreshed.songs[0] ?? null : current);
    } catch (removeError) { setError(removeError.message); } finally { setSaving(false); }
  }

  const availableSongs = selectedSetlist ? songs.filter((song) => !selectedSetlist.songs.some((setlistSong) => setlistSong.id === song.id)) : [];

  return <div className="app-shell">
    <Header page={page} onNavigate={setPage} />
    <main className="content">
      {error && <div className="error-banner" role="alert">{error}<button onClick={loadLibrary}>Try again</button></div>}
      {loading ? <p className="loading">Loading BandSet library…</p> : <>
        {page === 'Home' && <section className="page-section">
          <p className="eyebrow">Your music library</p><h1>Home</h1><p className="intro">Keep your songs organized and your next set ready to play.</p>
          <div className="summary-grid"><article className="summary-card"><span>Total songs</span><strong>{songs.length}</strong></article><article className="summary-card"><span>Setlists</span><strong>{setlists.length}</strong></article></div>
          <div className="section-heading"><h2>Recent setlists</h2><button className="text-button" onClick={() => setPage('Setlists')}>View all</button></div>
          <div className="setlist-grid">{setlists.slice(0, 2).map((setlist) => <SetlistCard key={setlist.id} setlist={setlist} onOpen={() => openSetlist(setlist)} />)}</div>
        </section>}

        {page === 'Songs' && <section className="page-section">
          <div className="page-title-row"><div><p className="eyebrow">Your music library</p><h1>Songs</h1></div><button className="primary-button" onClick={() => { setEditingSong(null); setShowSongForm(true); }}>+ Add song</button></div>
          {showSongForm && <SongForm key={editingSong?.id ?? 'new'} song={editingSong} onSave={saveSong} onCancel={() => { setShowSongForm(false); setEditingSong(null); }} saving={saving} />}
          <label className="search-label" htmlFor="song-search">Search songs</label><input id="song-search" className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search songs..." />
          <div className="song-list" aria-label="Song library"><div className="song-list-head"><span>Song</span><span>Key</span><span>BPM</span><span>Status</span></div>
            {visibleSongs.length ? visibleSongs.map((song) => <SongRow key={song.id} song={song} selected={song.id === selectedSong?.id} onSelect={setSelectedSong} onEdit={beginSongEdit} onDelete={deleteSong} />) : <p className="empty-state">No songs match that search.</p>}
          </div>
        </section>}

        {page === 'Setlists' && <section className="page-section">
          <div className="page-title-row"><div><p className="eyebrow">Plan your performance</p><h1>Setlists</h1></div><button className="primary-button" onClick={() => { setEditingSetlist(null); setShowSetlistForm(true); }}>+ New setlist</button></div>
          {showSetlistForm && <SetlistForm key={editingSetlist?.id ?? 'new'} setlist={editingSetlist} onSave={saveSetlist} onCancel={() => { setShowSetlistForm(false); setEditingSetlist(null); }} saving={saving} />}
          <div className="setlist-grid all-setlists">{setlists.map((setlist) => <SetlistCard key={setlist.id} setlist={setlist} onOpen={() => openSetlist(setlist)} onEdit={beginSetlistEdit} onDelete={deleteSetlist} />)}</div>
        </section>}

        {page === 'Setlist Details' && selectedSetlist && <section className="page-section">
          <button className="back-button" onClick={() => setPage('Setlists')}>← All setlists</button>
          <div className="page-title-row"><div><p className="eyebrow">Setlist details</p><h1>{selectedSetlist.title}</h1><p className="intro">{selectedSetlist.songs.length} songs · Approx. {Math.floor(selectedSetlist.songs.reduce((total, song) => total + (song.durationSeconds ?? 0), 0) / 60)} min</p>{selectedSetlist.description && <p className="setlist-description">{selectedSetlist.description}</p>}</div></div>
          {availableSongs.length > 0 && <form className="add-to-setlist" onSubmit={addSongToCurrentSetlist}><label>Add existing song<select required name="songId" defaultValue=""><option value="" disabled>Select a song</option>{availableSongs.map((song) => <option key={song.id} value={song.id}>{song.title}</option>)}</select></label><button className="primary-button" disabled={saving}>{saving ? 'Adding…' : 'Add song'}</button></form>}
          <div className="details-layout"><div className="song-list setlist-songs"><div className="song-list-head"><span>Song</span><span>Key</span><span>BPM</span><span>Status</span><span>Order</span></div>
            {selectedSetlist.songs.length ? selectedSetlist.songs.map((song) => <SongRow key={song.id} song={song} position={song.position} selected={song.id === selectedSong?.id} onSelect={setSelectedSong} onRemove={removeSongFromCurrentSetlist} />) : <p className="empty-state">This setlist has no songs yet.</p>}
          </div>
          <aside className="song-detail" aria-label="Selected song details">{selectedSong ? <><p className="eyebrow">Selected song</p><h2>{selectedSong.title}</h2><dl><div><dt>Key</dt><dd>{selectedSong.key ?? '—'}</dd></div><div><dt>BPM</dt><dd>{selectedSong.bpm ?? '—'}</dd></div><div><dt>Duration</dt><dd>{formatDuration(selectedSong.durationSeconds)}</dd></div><div><dt>Status</dt><dd>{selectedSong.status}</dd></div><div><dt>Notes</dt><dd>{selectedSong.notes || 'No notes yet.'}</dd></div></dl></> : <p className="empty-state">Select a song to see details.</p>}</aside></div>
        </section>}
      </>}
    </main>
  </div>;
}
