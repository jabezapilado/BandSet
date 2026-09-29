# Changelog

All notable changes to BandSet are documented here. Dates reflect project work completed during the final-project period.

## [Unreleased]

### Next

- Add edit and delete flows for setlists.
- Allow removing an individual song from a setlist.
- Add authentication and access control before deployment.
- Test the complete workflow and prepare final screenshots.

### Added

- Added edit and delete controls for songs.
- Added validated `PUT /api/songs/:id` and `DELETE /api/songs/:id` routes.
- Verified the song create, update, and delete flow against Supabase.

## [2026-09-30] - Supabase integration

### Added

- Created the Supabase PostgreSQL project and the `songs`, `setlists`, and `setlist_songs` tables.
- Added fictional starter songs and setlists.
- Enabled Row Level Security on database tables and kept the Supabase Data API disabled.
- Connected the React client to the Express API for loading songs and setlists.
- Added forms to create songs and setlists through the API.
- Added the ability to assign an existing song to a setlist; the API gives it the next position.
- Added `src/api.js` as the browser API client.

### Changed

- Replaced temporary in-browser data with persistent PostgreSQL data.
- Updated setup instructions, the weekly report, and the security checklist for the live database workflow.
- Added SSL configuration support for the Supabase connection.

### Verified

- `npm run build` succeeds.
- `npm test` succeeds.
- The health, songs, and setlists API routes return successful responses against Supabase.

## [2026-09-28 to 2026-09-29] - Backend foundation

### Added

- Express API server with a health route.
- PostgreSQL schema and seed scripts for songs, setlists, and setlist song ordering.
- Validated REST routes for creating and listing songs and setlists, and reading a setlist with its songs.
- Server-side validation tests, `.env.example`, and a security checklist.

## [2026-09-21] - React prototype and planning

### Added

- Responsive React screens for Home, Songs, Setlists, and Setlist Details.
- Low-fidelity desktop and phone wireframes, user flow, Atomic Design component breakdown, and a visual design system in Figma.
- Initial README, weekly report, AI usage disclosure, and project documentation.
