import cors from 'cors';
import express from 'express';
import { query } from './db.js';
import { validateSetlist, validateSong } from './validation.js';

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.get('/api/songs', async (_request, response, next) => {
  try {
    const result = await query(
      'SELECT id, title, song_key AS key, bpm, duration_seconds AS "durationSeconds", status, notes FROM songs ORDER BY title ASC',
    );
    response.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.post('/api/songs', async (request, response, next) => {
  const validated = validateSong(request.body);
  if (validated.error) return response.status(400).json({ error: validated.error });

  try {
    const song = validated.value;
    const result = await query(
      `INSERT INTO songs (title, song_key, bpm, duration_seconds, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, song_key AS key, bpm, duration_seconds AS "durationSeconds", status, notes`,
      [song.title, song.key, song.bpm, song.durationSeconds, song.status, song.notes],
    );
    return response.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

app.put('/api/songs/:id', async (request, response, next) => {
  const songId = Number(request.params.id);
  if (!Number.isInteger(songId) || songId < 1) return response.status(400).json({ error: 'song id must be a positive integer.' });

  const validated = validateSong(request.body);
  if (validated.error) return response.status(400).json({ error: validated.error });

  try {
    const song = validated.value;
    const result = await query(
      `UPDATE songs
       SET title = $1, song_key = $2, bpm = $3, duration_seconds = $4, status = $5, notes = $6
       WHERE id = $7
       RETURNING id, title, song_key AS key, bpm, duration_seconds AS "durationSeconds", status, notes`,
      [song.title, song.key, song.bpm, song.durationSeconds, song.status, song.notes, songId],
    );
    if (!result.rowCount) return response.status(404).json({ error: 'Song not found.' });
    return response.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

app.delete('/api/songs/:id', async (request, response, next) => {
  const songId = Number(request.params.id);
  if (!Number.isInteger(songId) || songId < 1) return response.status(400).json({ error: 'song id must be a positive integer.' });

  try {
    const result = await query('DELETE FROM songs WHERE id = $1 RETURNING id', [songId]);
    if (!result.rowCount) return response.status(404).json({ error: 'Song not found.' });
    return response.status(204).end();
  } catch (error) {
    return next(error);
  }
});

app.get('/api/setlists', async (_request, response, next) => {
  try {
    const result = await query(
      `SELECT setlists.id, setlists.title, COUNT(setlist_songs.song_id)::int AS "songCount"
       FROM setlists
       LEFT JOIN setlist_songs ON setlist_songs.setlist_id = setlists.id
       GROUP BY setlists.id
       ORDER BY setlists.title ASC`,
    );
    response.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.post('/api/setlists', async (request, response, next) => {
  const validated = validateSetlist(request.body);
  if (validated.error) return response.status(400).json({ error: validated.error });

  try {
    const result = await query('INSERT INTO setlists (title) VALUES ($1) RETURNING id, title', [validated.value.title]);
    return response.status(201).json({ ...result.rows[0], songCount: 0 });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/setlists/:id/songs', async (request, response, next) => {
  const setlistId = Number(request.params.id);
  const songId = Number(request.body.songId);
  if (!Number.isInteger(setlistId) || setlistId < 1 || !Number.isInteger(songId) || songId < 1) {
    return response.status(400).json({ error: 'setlist id and songId must be positive integers.' });
  }

  try {
    const setlistResult = await query('SELECT id FROM setlists WHERE id = $1', [setlistId]);
    const songResult = await query('SELECT id FROM songs WHERE id = $1', [songId]);
    if (!setlistResult.rowCount || !songResult.rowCount) return response.status(404).json({ error: 'Song or setlist not found.' });

    const positionResult = await query(
      'SELECT COALESCE(MAX(position), 0) + 1 AS position FROM setlist_songs WHERE setlist_id = $1',
      [setlistId],
    );
    const position = positionResult.rows[0].position;
    const result = await query(
      `INSERT INTO setlist_songs (setlist_id, song_id, position)
       VALUES ($1, $2, $3)
       RETURNING setlist_id AS "setlistId", song_id AS "songId", position`,
      [setlistId, songId, position],
    );
    return response.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') return response.status(409).json({ error: 'This song is already in the setlist.' });
    return next(error);
  }
});

app.get('/api/setlists/:id', async (request, response, next) => {
  const setlistId = Number(request.params.id);
  if (!Number.isInteger(setlistId) || setlistId < 1) return response.status(400).json({ error: 'setlist id must be a positive integer.' });

  try {
    const setlistResult = await query('SELECT id, title FROM setlists WHERE id = $1', [setlistId]);
    if (!setlistResult.rowCount) return response.status(404).json({ error: 'Setlist not found.' });

    const songsResult = await query(
      `SELECT songs.id, songs.title, songs.song_key AS key, songs.bpm,
              songs.duration_seconds AS "durationSeconds", songs.status, songs.notes, setlist_songs.position
       FROM setlist_songs
       JOIN songs ON songs.id = setlist_songs.song_id
       WHERE setlist_songs.setlist_id = $1
       ORDER BY setlist_songs.position ASC`,
      [setlistId],
    );
    return response.json({ ...setlistResult.rows[0], songs: songsResult.rows });
  } catch (error) {
    return next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: 'An unexpected server error occurred.' });
});

export default app;
