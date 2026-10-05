INSERT INTO songs (title, song_key, bpm, duration_seconds, status, notes)
VALUES
  ('Fownkol', 'E', 120, 220, 'Ready', 'Intro click, backing track, synth patch 03'),
  ('Song Two', 'G', 105, 250, 'Rehearsing', 'Practice the final transition.'),
  ('Midnight Drive', 'A', 98, 235, 'Learning', 'Work on the guitar lead.')
ON CONFLICT (title) DO NOTHING;

INSERT INTO setlists (title, description)
VALUES
  ('Friday Night Set', 'Main performance set. Start with the full-band intro and leave time for the encore.'),
  ('Studio Session', 'Songs to rehearse before the next recording session.')
ON CONFLICT (title) DO NOTHING;

INSERT INTO setlist_songs (setlist_id, song_id, position)
SELECT setlists.id, songs.id, entries.position
FROM (
  VALUES
    ('Friday Night Set', 'Fownkol', 1),
    ('Friday Night Set', 'Song Two', 2),
    ('Studio Session', 'Midnight Drive', 1)
) AS entries(setlist_title, song_title, position)
JOIN setlists ON setlists.title = entries.setlist_title
JOIN songs ON songs.title = entries.song_title
ON CONFLICT (setlist_id, song_id) DO NOTHING;
