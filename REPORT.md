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
- Added the full song management flow: create, edit, and delete songs. Deleting a song also removes its setlist entries.
- Added the full setlist management flow: create, rename, and delete setlists, plus adding and removing individual songs.
- Verified the song and setlist CRUD flows against Supabase PostgreSQL.
- Added HTTP Basic Authentication to protect the deployed frontend and API before the repository becomes public.
- Added an `.env.example`, backend setup instructions, API documentation, and a security checklist.
- Added automated tests for backend input validation.

## Why

Week 1 created the React prototype and temporary in-browser data. This week makes it persistent: the API connects the interface to the PostgreSQL design for songs, setlists, and song order within a setlist.

## What broke or what I got stuck on

I first used Supabase's direct database connection, but my laptop could not resolve that host. I fixed it by using the Supabase session pooler connection string in my local `.env`. I also needed help understanding the Express route syntax and API structure. The database password stays only in `.env` and is not committed to Git.

## What is left

- Take final screenshots and test the whole workflow in the browser.
- Confirm the deployed Basic Auth prompt works and store grading credentials only in the private workspace README.
- Review deployment settings and create a limited production database role.
