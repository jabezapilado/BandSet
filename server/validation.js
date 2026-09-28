const allowedStatuses = new Set(['Draft', 'Learning', 'Rehearsing', 'Ready']);

function optionalString(value, field, maxLength = 500) {
  if (value === undefined || value === null || value === '') return { value: null };
  if (typeof value !== 'string' || value.trim().length > maxLength) {
    return { error: `${field} must be text with at most ${maxLength} characters.` };
  }
  return { value: value.trim() };
}

export function validateSong(input) {
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  if (!title || title.length > 120) return { error: 'title is required and must be 120 characters or fewer.' };

  const key = optionalString(input.key, 'key', 8);
  const notes = optionalString(input.notes, 'notes', 1000);
  if (key.error) return { error: key.error };
  if (notes.error) return { error: notes.error };

  const bpm = input.bpm === undefined || input.bpm === null || input.bpm === '' ? null : Number(input.bpm);
  if (bpm !== null && (!Number.isInteger(bpm) || bpm < 30 || bpm > 300)) return { error: 'bpm must be a whole number from 30 to 300.' };

  const durationSeconds = input.durationSeconds === undefined || input.durationSeconds === null || input.durationSeconds === '' ? null : Number(input.durationSeconds);
  if (durationSeconds !== null && (!Number.isInteger(durationSeconds) || durationSeconds < 0 || durationSeconds > 3600)) return { error: 'durationSeconds must be a whole number from 0 to 3600.' };

  const status = input.status ?? 'Draft';
  if (!allowedStatuses.has(status)) return { error: 'status must be Draft, Learning, Rehearsing, or Ready.' };

  return { value: { title, key: key.value, bpm, durationSeconds, status, notes: notes.value } };
}

export function validateSetlist(input) {
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  if (!title || title.length > 120) return { error: 'title is required and must be 120 characters or fewer.' };
  return { value: { title } };
}
