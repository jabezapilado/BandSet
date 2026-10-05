import assert from 'node:assert/strict';
import test from 'node:test';
import { validateSetlist, validateSong } from '../server/validation.js';

test('accepts a complete valid song', () => {
  const result = validateSong({ title: 'Fownkol', key: 'E', bpm: 120, durationSeconds: 220, status: 'Ready', notes: 'Intro click' });
  assert.deepEqual(result, { value: { title: 'Fownkol', key: 'E', bpm: 120, durationSeconds: 220, status: 'Ready', notes: 'Intro click' } });
});

test('rejects an invalid song tempo', () => {
  assert.equal(validateSong({ title: 'Too Fast', bpm: 999 }).error, 'bpm must be a whole number from 30 to 300.');
});

test('rejects an unknown song status', () => {
  assert.equal(validateSong({ title: 'Unknown Status', status: 'Done' }).error, 'status must be Draft, Learning, Rehearsing, or Ready.');
});

test('requires a setlist title', () => {
  assert.equal(validateSetlist({ title: '   ' }).error, 'title is required and must be 120 characters or fewer.');
});

test('accepts an optional setlist description', () => {
  assert.deepEqual(
    validateSetlist({ title: 'Friday Night Set', description: '  Outdoor stage; plan an encore.  ' }),
    { value: { title: 'Friday Night Set', description: 'Outdoor stage; plan an encore.' } },
  );
});

test('rejects a setlist description longer than 1000 characters', () => {
  assert.equal(validateSetlist({ title: 'Friday Night Set', description: 'a'.repeat(1001) }).error, 'description must be text with at most 1000 characters.');
});
