# Security Checklist

This checklist reflects the current BandSet deployment. Items that depend on GitHub Actions or future production hardening are marked N/A or No with their reason.

## Secrets and credentials

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 1 | `.env` is gitignored and is not in the repository | Yes | `.gitignore` includes `.env` and `.env.local`; the project has no tracked `.env` file. |
| 2 | A `.env.example` with placeholder values only is committed | Yes | `.env.example` contains a placeholder `DATABASE_URL`, not a real connection string. |
| 3 | No connection string, key, token, or password is hardcoded | Yes | `server/db.js` reads `DATABASE_URL` from the environment; source files contain no live credentials. |
| 4 | Git history is clean | Yes | The existing Git history was checked for credential-related terms; only placeholder setup values are used. |
| 5 | Any credential ever committed has been rotated | N/A | No real database credential has been created or committed. |
| 6 | Production credentials live only in hosting settings | N/A | The app is not deployed yet. |

## GitHub Actions

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 7 | No secret is written literally in workflow YAML | N/A | This repository has no GitHub Actions workflows. |
| 8 | Workflow secrets use Actions secrets | N/A | This repository has no GitHub Actions workflows. |
| 9 | Workflow logs do not print secrets | N/A | This repository has no GitHub Actions workflows. |
| 10 | Uploaded artifacts contain no secrets | N/A | This repository has no GitHub Actions workflows. |
| 11 | Third-party actions are pinned to commit SHAs | N/A | This repository has no GitHub Actions workflows. |
| 12 | Secret scanning and push protection are enabled | No | I still need to verify and enable these GitHub repository settings before final deployment. |

## Database

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 13 | Queries that take user input use parameters | Yes | Every song and setlist create, update, delete, and relationship query in `server/app.js` uses `$1`, `$2`, and later placeholders instead of string concatenation. |
| 14 | The database is not open to the whole internet | Yes | The Supabase Data API is disabled. Database access requires the private connection string, which is kept only in local environment settings. |
| 15 | The database user has only needed permissions | No | The development backend currently uses the Supabase `postgres` role. Create a limited application role before a public deployment. |
| 16 | Seed data is invented | Yes | `db/seed.sql` contains only fictional song titles and notes for development. |
| 17 | Debug, seed, and reset routes are removed before public release | Yes | The API has no debug, seed, or reset HTTP routes. |

## Access control

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 18 | The app has an access layer | Yes | `middleware.js` requires HTTP Basic Authentication before Vercel serves the frontend or API; `server/access.js` applies the same check to API routes. |
| 19 | Supabase Row Level Security or Firebase rules are enabled and tested signed out | Yes | RLS was enabled on `songs`, `setlists`, and `setlist_songs`; the Data API is disabled, so direct unsigned client access is unavailable. |
| 20 | The required access policy is configured | Yes | Vercel Production variables `ACCESS_USERNAME` and `ACCESS_PASSWORD` configure the Basic Auth login. |
| 21 | The gate covers every route | Yes | The root-level Vercel middleware matches `/:path*`, covering static frontend files and `/api/*`; Express also protects its routes. |
| 22 | Gate credentials are environment variables | Yes | Credentials are read from environment variables and are not present in source code, `.env.example`, or Git history. |

## Input and output

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 23 | User input is validated on the server | Yes | `server/validation.js` validates song and setlist fields before database queries run. |
| 24 | User text is escaped when rendered | Yes | The React UI renders text values normally and does not use raw HTML injection. |
| 25 | Error responses do not expose internals | Yes | `server/app.js` returns a generic 500 error message instead of a stack trace or connection details. |
| 26 | CORS is not a wildcard on changing routes | Yes | The Express server allows only `http://localhost:5173` during development. |

## Repository and privacy

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 27 | No sensitive personal details are in the repository | Yes | The project files were checked for student number, personal email, phone number, and home address. |
| 28 | No classmate personal data is in the repository | Yes | Seed data and documentation use only project content and fictional sample songs. |
| 29 | Dependencies come from official registries and `node_modules` is gitignored | Yes | Dependencies are installed through npm and `.gitignore` includes `node_modules/`. |
| 30 | Images, fonts, and assets are mine, licensed, or credited | Yes | The app uses system fonts and a self-captured application screenshot; no third-party visual assets are included. |
| 31 | Repository visibility is deliberate | No | I need to do a final visibility review before making the final deployment public. |

## Anything I found and fixed

The checklist confirmed that database and access credentials need to stay out of the repository. I committed only `.env.example` with placeholders, enabled RLS on the Supabase tables, left the Data API disabled, and added an environment-variable-based HTTP Basic Auth gate for Vercel. I also use server-side validation, parameterized SQL queries, a generic error response, and a restricted development CORS origin.
