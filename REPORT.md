# Weekly Increment Report

## Week of: September 28, 2026

## What changed this week

- Added an Express server with a tested `/api/health` route.
- Added REST API routes for listing and creating songs, listing and creating setlists, and viewing one setlist with its ordered songs.
- Added server-side validation for song and setlist input, including title, tempo, duration, and status checks.
- Added PostgreSQL schema and seed files for `songs`, `setlists`, and `setlist_songs`.
- Created the BandSet Supabase PostgreSQL project, ran the schema and seed data, and enabled Row Level Security on the tables.
- Replaced temporary React data with API requests for songs and setlists.
- Added the flow for adding an existing song to a setlist, with its position assigned by the API.
- Added an `.env.example`, backend setup instructions, API documentation, and a security checklist.
- Added automated tests for backend input validation.

## Why

Week 1 created the React prototype and temporary in-browser data. This week makes it persistent: the API connects the interface to the PostgreSQL design for songs, setlists, and song order within a setlist.

## What broke or what I got stuck on

The hosted database is created, but the local backend still needs my private Supabase connection string in `.env` before I can run the full app against it. I do not want to put that password in Git. I also needed help understanding the Express route syntax and API structure.

## What is left

- Add the private local database connection and verify the full frontend-to-API-to-database flow.
- Add edit and delete flows.
- Add authentication and access control before deployment.
