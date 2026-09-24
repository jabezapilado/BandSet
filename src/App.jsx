import { useMemo, useState } from 'react';

const initialSongs = [
  { id: 1, title: 'Fownkol', key: 'E', bpm: 120, status: 'Ready', duration: '3:40', notes: 'Intro click, backing track, synth patch 03' },
  { id: 2, title: 'Song Two', key: 'G', bpm: 105, status: 'Rehearsing', duration: '4:10', notes: 'Practice the final transition.' },
  { id: 3, title: 'Midnight Drive', key: 'A', bpm: 98, status: 'Learning', duration: '3:55', notes: 'Work on the guitar lead.' },
];

const initialSetlists = [
  { id: 1, title: 'Friday Night Set', songIds: [1, 2] },
  { id: 2, title: 'Studio Session', songIds: [3] },
];

function Header({ page, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pages = ['Home', 'Songs', 'Setlists'];

  function navigate(nextPage) {
    onNavigate(nextPage);
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <button className="brand" onClick={() => navigate('Home')} aria-label="Go to BandSet home">BandSet</button>
        <button className="menu-button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen}>
          ☰ <span>Menu</span>
        </button>
        <nav className={menuOpen ? 'nav-links open' : 'nav-links'} aria-label="Main navigation">
          {pages.map((item) => (
            <button key={item} className={page === item ? 'active' : ''} onClick={() => navigate(item)}>{item}</button>
          ))}
        </nav>
      </div>
    </header>
  );
}

function SummaryCard({ label, value }) {
  return <article className="summary-card"><span>{label}</span><strong>{value}</strong></article>;
}

function SetlistCard({ setlist, songCount, onOpen }) {
  return (
    <button className="setlist-card" onClick={onOpen}>
      <strong>{setlist.title}</strong>
      <span>{songCount} {songCount === 1 ? 'song' : 'songs'}</span>
      <small>Open setlist →</small>
    </button>
  );
}

function SongRow({ song, selected, onSelect, position, controls = false }) {
  return (
    <button className={selected ? 'song-row selected' : 'song-row'} onClick={() => onSelect(song)}>
      <span className="song-title">{position ? `${position}. ${song.title}` : song.title}<small>Key: {song.key}</small></span>
      <span className="song-meta">{song.key}</span>
      <span className="song-meta">{song.bpm} BPM</span>
      <span className="song-status">{song.status}</span>
      {controls && <span className="song-controls">↑ ↓</span>}
    </button>
  );
}

export default function App() {
  const [page, setPage] = useState('Home');
  const [songs, setSongs] = useState(initialSongs);
  const [setlists, setSetlists] = useState(initialSetlists);
  const [selectedSetlistId, setSelectedSetlistId] = useState(1);
  const [selectedSongId, setSelectedSongId] = useState(1);
  const [query, setQuery] = useState('');

  const selectedSetlist = setlists.find((setlist) => setlist.id === selectedSetlistId) ?? setlists[0];
  const selectedSong = songs.find((song) => song.id === selectedSongId) ?? songs[0];
  const visibleSongs = useMemo(() => songs.filter((song) => song.title.toLowerCase().includes(query.toLowerCase())), [songs, query]);
  const currentSetlistSongs = songs.filter((song) => selectedSetlist.songIds.includes(song.id));

  function openSetlist(setlist) {
    setSelectedSetlistId(setlist.id);
    if (setlist.songIds[0]) setSelectedSongId(setlist.songIds[0]);
    setPage('Setlist Details');
  }

  function addSong() {
    const id = Math.max(...songs.map((song) => song.id), 0) + 1;
    setSongs((current) => [...current, { id, title: `New Song ${id}`, key: 'C', bpm: 100, status: 'Draft', duration: '0:00', notes: 'Add song notes here.' }]);
  }

  function addSetlist() {
    const id = Math.max(...setlists.map((setlist) => setlist.id), 0) + 1;
    const setlist = { id, title: `New Setlist ${id}`, songIds: [] };
    setSetlists((current) => [...current, setlist]);
    openSetlist(setlist);
  }

  return (
    <div className="app-shell">
      <Header page={page} onNavigate={setPage} />
      <main className="content">
        {page === 'Home' && (
          <section className="page-section">
            <p className="eyebrow">Your music library</p>
            <h1>Home</h1>
            <p className="intro">Keep your songs organized and your next set ready to play.</p>
            <div className="summary-grid">
              <SummaryCard label="Total songs" value={songs.length} />
              <SummaryCard label="Setlists" value={setlists.length} />
            </div>
            <div className="section-heading"><h2>Recent setlists</h2><button className="text-button" onClick={() => setPage('Setlists')}>View all</button></div>
            <div className="setlist-grid">
              {setlists.slice(0, 2).map((setlist) => <SetlistCard key={setlist.id} setlist={setlist} songCount={setlist.songIds.length} onOpen={() => openSetlist(setlist)} />)}
            </div>
          </section>
        )}

        {page === 'Songs' && (
          <section className="page-section">
            <div className="page-title-row"><div><p className="eyebrow">Your music library</p><h1>Songs</h1></div><button className="primary-button" onClick={addSong}>+ Add song</button></div>
            <label className="search-label" htmlFor="song-search">Search songs</label>
            <input id="song-search" className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search songs..." />
            <div className="song-list" aria-label="Song library">
              <div className="song-list-head"><span>Song</span><span>Key</span><span>BPM</span><span>Status</span></div>
              {visibleSongs.length ? visibleSongs.map((song) => <SongRow key={song.id} song={song} selected={song.id === selectedSongId} onSelect={setSelectedSongId} />) : <p className="empty-state">No songs match that search.</p>}
            </div>
          </section>
        )}

        {page === 'Setlists' && (
          <section className="page-section">
            <div className="page-title-row"><div><p className="eyebrow">Plan your performance</p><h1>Setlists</h1></div><button className="primary-button" onClick={addSetlist}>+ New setlist</button></div>
            <div className="setlist-grid all-setlists">
              {setlists.map((setlist) => <SetlistCard key={setlist.id} setlist={setlist} songCount={setlist.songIds.length} onOpen={() => openSetlist(setlist)} />)}
            </div>
          </section>
        )}

        {page === 'Setlist Details' && (
          <section className="page-section">
            <button className="back-button" onClick={() => setPage('Setlists')}>← All setlists</button>
            <div className="page-title-row"><div><p className="eyebrow">Setlist details</p><h1>{selectedSetlist.title}</h1><p className="intro">{currentSetlistSongs.length} songs · Approx. {currentSetlistSongs.reduce((total, song) => total + Number(song.duration.split(':')[0]), 0) || 0} min</p></div><button className="primary-button" onClick={addSong}>+ Add song</button></div>
            <div className="details-layout">
              <div className="song-list setlist-songs">
                <div className="song-list-head"><span>Song</span><span>Key</span><span>BPM</span><span>Status</span><span>Order</span></div>
                {currentSetlistSongs.length ? currentSetlistSongs.map((song, index) => <SongRow key={song.id} song={song} position={index + 1} selected={song.id === selectedSongId} onSelect={setSelectedSongId} controls />) : <p className="empty-state">This setlist has no songs yet.</p>}
              </div>
              <aside className="song-detail" aria-label="Selected song details">
                <p className="eyebrow">Selected song</p><h2>{selectedSong.title}</h2>
                <dl><div><dt>Key</dt><dd>{selectedSong.key}</dd></div><div><dt>BPM</dt><dd>{selectedSong.bpm}</dd></div><div><dt>Duration</dt><dd>{selectedSong.duration}</dd></div><div><dt>Status</dt><dd>{selectedSong.status}</dd></div><div><dt>Notes</dt><dd>{selectedSong.notes}</dd></div></dl>
              </aside>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
