CREATE TABLE IF NOT EXISTS songs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  song_key VARCHAR(8),
  bpm INTEGER CHECK (bpm BETWEEN 30 AND 300),
  duration_seconds INTEGER CHECK (duration_seconds BETWEEN 0 AND 3600),
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Learning', 'Rehearsing', 'Ready')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS setlists (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS setlist_songs (
  setlist_id BIGINT NOT NULL REFERENCES setlists(id) ON DELETE CASCADE,
  song_id BIGINT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position > 0),
  PRIMARY KEY (setlist_id, song_id),
  UNIQUE (setlist_id, position)
);
