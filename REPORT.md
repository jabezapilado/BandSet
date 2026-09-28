# Weekly Increment Report

## Week of: September 28, 2026

## What changed this week

- Added an Express server with a tested `/api/health` route.
- Added REST API routes for listing and creating songs, listing and creating setlists, and viewing one setlist with its ordered songs.
- Added server-side validation for song and setlist input, including title, tempo, duration, and status checks.
- Added PostgreSQL schema and seed files for `songs`, `setlists`, and `setlist_songs`.
- Added an `.env.example`, backend setup instructions, API documentation, and a security checklist.
- Added automated tests for backend input validation.

## Why

Week 1 created the React prototype and temporary in-browser data. This week begins the backend needed to make BandSet persistent: the API defines how the frontend will request data, and the database schema models songs, setlists, and the order of songs in each setlist.

## What broke or what I got stuck on

The API starts and its health route works, but it is not connected to a hosted PostgreSQL database yet because the Supabase project and database connection string still need to be configured. The frontend also still reads from temporary React state, so it does not call the API yet.

## What is left

- Create and connect the Supabase PostgreSQL project.
- Run the schema and seed data against the hosted database.
- Replace the temporary frontend data with API requests.
- Add full create, edit, delete, and setlist-song assignment flows.
- Add authentication and access control before deployment.
