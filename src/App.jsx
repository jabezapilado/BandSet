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

function SetlistCard({ setlist, onOpen }) {
  return <button className="setlist-card" onClick={onOpen}>
    <strong>{setlist.title}</strong><span>{setlist.songCount} {setlist.songCount === 1 ? 'song' : 'songs'}</span><small>Open setlist →</small>
  </button>;
}

function SongRow({ song, onSelect, selected, position, controls }) {
  return <button className={selected ? 'song-row selected' : 'song-row'} onClick={() => onSelect(song)}>
    <span className="song-title">{position ? `${position}. ${song.title}` : song.title}<small>Key: {song.key ?? '—'} · {formatDuration(song.durationSeconds)}</small></span>
    <span className="song-meta">{song.key ?? '—'}</span><span className="song-meta">{song.bpm ? `${song.bpm} BPM` : '—'}</span>
    <span className="song-status">{song.status}</span>{controls && <span className="song-controls">{position}</span>}
  </button>;
}

function SongForm({ onSave, onCancel, saving }) {
  const [form, setForm] = useState({ title: '', key: '', bpm: '', durationSeconds: '', status: 'Draft', notes: '' });
  function update(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  function submit(event) {
    event.preventDefault();
    onSave({ ...form, bpm: form.bpm === '' ? null : Number(form.bpm), durationSeconds: form.durationSeconds === '' ? null : Number(form.durationSeconds) });
  }
  return <form className="entry-form" onSubmit={submit}>
    <h2>Add a song</h2>
    <label>Song title<input required name="title" value={form.title} onChange={update} maxLength="120" /></label>
    <div className="form-grid">
      <label>Key<input name="key" value={form.key} onChange={update} maxLength="8" placeholder="E" /></label>
      <label>BPM<input name="bpm" value={form.bpm} onChange={update} type="number" min="30" max="300" placeholder="120" /></label>
      <label>Duration (seconds)<input name="durationSeconds" value={form.durationSeconds} onChange={update} type="number" min="0" max="3600" placeholder="220" /></label>
      <label>Status<select name="status" value={form.status} onChange={update}><option>Draft</option><option>Learning</option><option>Rehearsing</option><option>Ready</option></select></label>
    </div>
    <label>Notes<textarea name="notes" value={form.notes} onChange={update} maxLength="1000" placeholder="Optional rehearsal notes" /></label>
    <div className="form-actions"><button type="button" className="secondary-button" onClick={onCancel}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? 'Saving…' : 'Save song'}</button></div>
  </form>;
}

function SetlistForm({ onSave, onCancel, saving }) {
  const [title, setTitle] = useState('');
  return <form className="entry-form compact-form" onSubmit={(event) => { event.preventDefault(); onSave({ title }); }}>
    <h2>New setlist</h2><label>Setlist title<input required value={title} onChange={(event) => setTitle(event.target.value)} maxLength="120" /></label>
    <div className="form-actions"><button type="button" className="secondary-button" onClick={onCancel}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? 'Saving…' : 'Save setlist'}</button></div>
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
  const [showSetlistForm, setShowSetlistForm] = useState(false);
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

  async function createSong(song) {
    setSaving(true); setError('');
    try { const created = await api.createSong(song); setSongs((current) => [...current, created].sort((a, b) => a.title.localeCompare(b.title))); setShowSongForm(false); setSelectedSong(created); }
    catch (saveError) { setError(saveError.message); } finally { setSaving(false); }
  }

  async function createSetlist(setlist) {
    setSaving(true); setError('');
    try { const created = await api.createSetlist(setlist); setSetlists((current) => [...current, created].sort((a, b) => a.title.localeCompare(b.title))); setShowSetlistForm(false); await openSetlist(created); }
    catch (saveError) { setError(saveError.message); } finally { setSaving(false); }
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
          <div className="page-title-row"><div><p className="eyebrow">Your music library</p><h1>Songs</h1></div><button className="primary-button" onClick={() => setShowSongForm(true)}>+ Add song</button></div>
          {showSongForm && <SongForm onSave={createSong} onCancel={() => setShowSongForm(false)} saving={saving} />}
          <label className="search-label" htmlFor="song-search">Search songs</label><input id="song-search" className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search songs..." />
          <div className="song-list" aria-label="Song library"><div className="song-list-head"><span>Song</span><span>Key</span><span>BPM</span><span>Status</span></div>
            {visibleSongs.length ? visibleSongs.map((song) => <SongRow key={song.id} song={song} selected={song.id === selectedSong?.id} onSelect={setSelectedSong} />) : <p className="empty-state">No songs match that search.</p>}
          </div>
        </section>}

        {page === 'Setlists' && <section className="page-section">
          <div className="page-title-row"><div><p className="eyebrow">Plan your performance</p><h1>Setlists</h1></div><button className="primary-button" onClick={() => setShowSetlistForm(true)}>+ New setlist</button></div>
          {showSetlistForm && <SetlistForm onSave={createSetlist} onCancel={() => setShowSetlistForm(false)} saving={saving} />}
          <div className="setlist-grid all-setlists">{setlists.map((setlist) => <SetlistCard key={setlist.id} setlist={setlist} onOpen={() => openSetlist(setlist)} />)}</div>
        </section>}

        {page === 'Setlist Details' && selectedSetlist && <section className="page-section">
          <button className="back-button" onClick={() => setPage('Setlists')}>← All setlists</button>
          <div className="page-title-row"><div><p className="eyebrow">Setlist details</p><h1>{selectedSetlist.title}</h1><p className="intro">{selectedSetlist.songs.length} songs · Approx. {Math.floor(selectedSetlist.songs.reduce((total, song) => total + (song.durationSeconds ?? 0), 0) / 60)} min</p></div></div>
          {availableSongs.length > 0 && <form className="add-to-setlist" onSubmit={addSongToCurrentSetlist}><label>Add existing song<select required name="songId" defaultValue=""><option value="" disabled>Select a song</option>{availableSongs.map((song) => <option key={song.id} value={song.id}>{song.title}</option>)}</select></label><button className="primary-button" disabled={saving}>{saving ? 'Adding…' : 'Add song'}</button></form>}
          <div className="details-layout"><div className="song-list setlist-songs"><div className="song-list-head"><span>Song</span><span>Key</span><span>BPM</span><span>Status</span><span>Order</span></div>
            {selectedSetlist.songs.length ? selectedSetlist.songs.map((song) => <SongRow key={song.id} song={song} position={song.position} selected={song.id === selectedSong?.id} onSelect={setSelectedSong} controls />) : <p className="empty-state">This setlist has no songs yet.</p>}
          </div>
          <aside className="song-detail" aria-label="Selected song details">{selectedSong ? <><p className="eyebrow">Selected song</p><h2>{selectedSong.title}</h2><dl><div><dt>Key</dt><dd>{selectedSong.key ?? '—'}</dd></div><div><dt>BPM</dt><dd>{selectedSong.bpm ?? '—'}</dd></div><div><dt>Duration</dt><dd>{formatDuration(selectedSong.durationSeconds)}</dd></div><div><dt>Status</dt><dd>{selectedSong.status}</dd></div><div><dt>Notes</dt><dd>{selectedSong.notes || 'No notes yet.'}</dd></div></dl></> : <p className="empty-state">Select a song to see details.</p>}</aside></div>
        </section>}
      </>}
    </main>
  </div>;
}
