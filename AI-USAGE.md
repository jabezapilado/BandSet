# AI Usage for BandSet

This is an honest record of how I used OpenAI Codex while building BandSet. I designed the application logic, database relationships, and feature behavior. I used AI to translate concepts I already know from Java and Python into JavaScript, Node, Express, and React syntax; to scaffold repetitive code; and to help debug deployment problems. I reviewed and tested the final behavior myself.

## 1. How I used AI

### 2026-09-24 — OpenAI Codex: React prototype and project setup

- **What I asked:** I asked Codex to help set up a React/Vite version of my BandSet plan with Home, Songs, Setlists, and Setlist Details screens.
- **What it gave back:** It provided an initial component structure, responsive CSS, and starter documentation.
- **What I kept or changed:** I used the structure as a base, then reviewed the page flow against my wireframes and adjusted the CSS and layout decisions to match the design I wanted.
- **Why:** I am less fluent with frontend UI code, so I used AI to help translate the screen plan into React and CSS while keeping the feature logic and flow mine.
- **Commit:** [6fae181 — Initial BandSet React app](https://github.com/jabezapilado/BandSet/commit/6fae181)

### 2026-09-28 — OpenAI Codex: Express and PostgreSQL syntax support

- **What I asked:** I asked for help expressing my backend plan in JavaScript/Express syntax: API routes, validation, a PostgreSQL connection, and SQL table definitions.
- **What it gave back:** It suggested Express route structure, validation helpers, and SQL syntax for the tables.
- **What I kept or changed:** I kept the syntax pattern after reviewing it, but the data logic came from my design: songs are reusable, setlists contain songs, and a join table must store song order.
- **Why:** I understand backend logic and database relationships from Java and Python work, but I needed help with the Node/Express syntax and project structure.
- **Commit:** [1763547 — Add Week 2 API foundation](https://github.com/jabezapilado/BandSet/commit/1763547)

### 2026-09-30 — OpenAI Codex: Connect the React client to the API

- **What I asked:** I asked how to replace temporary React data with calls to my Express API and Supabase database.
- **What it gave back:** It added an API client module, loading/error states, and example request flow.
- **What I kept or changed:** I kept the separation between UI code and API calls, then tested that the app loaded real data and persisted changes after refresh.
- **Why:** The project needed to become a real full-stack application rather than a frontend prototype.
- **Commit:** [7e16ce9 — Connect BandSet UI to API](https://github.com/jabezapilado/BandSet/commit/7e16ce9)

### 2026-09-30 — OpenAI Codex: Song CRUD syntax

- **What I asked:** I asked for help implementing edit/delete requests and forms for songs in the JavaScript codebase.
- **What it gave back:** It provided `PUT` and `DELETE` route syntax, form-state updates, and controls for the Songs screen.
- **What I kept or changed:** I kept the CRUD pattern and verified the actual behavior against Supabase. The intended logic was mine: deleting a song also removes its references from setlists through the database relationship.
- **Why:** The feature follows normal CRUD logic I understand; AI helped with the Express and React syntax.
- **Commit:** [4f13ac4 — Add song edit and delete flows](https://github.com/jabezapilado/BandSet/commit/4f13ac4)

### 2026-09-30 — OpenAI Codex: Setlist ordering behavior

- **What I asked:** I asked for help implementing the setlist CRUD routes and the remove-song behavior.
- **What it gave back:** It provided the SQL/Express syntax for updating a setlist and shifting positions after a song is removed.
- **What I kept or changed:** I kept the position-shifting approach because it matches the application logic I designed: a performance setlist cannot have missing order numbers after a song is removed.
- **Why:** The order of songs is central to the project, so I checked the logic instead of treating it as only a UI change.
- **Commit:** [66cec58 — Complete setlist management flows](https://github.com/jabezapilado/BandSet/commit/66cec58)

### 2026-09-30 — OpenAI Codex: Vercel deployment preparation

- **What I asked:** I asked how to deploy the Vite frontend and Express API together on Vercel without exposing database credentials.
- **What it gave back:** It changed the production API path to `/api`, added a Vercel Function entry point, and documented server-side environment variables.
- **What I kept or changed:** I kept the same-origin API approach and added the private database URL only in Vercel, never in Git.
- **Why:** The deployment needed to keep the Supabase connection string off the client and out of the public repository.
- **Commit:** [77a7c88 — Prepare BandSet for Vercel deployment](https://github.com/jabezapilado/BandSet/commit/77a7c88)

### 2026-10-05 — OpenAI Codex: Security and live debugging

- **What I asked:** I asked for help responding to the access-control requirement and debugging the live setlist detail request after deployment.
- **What it gave back:** It added HTTP Basic Auth through Vercel middleware and identified the Vercel routing issue.
- **What I kept or changed:** I tested the browser login and live API behavior myself. I kept the access gate and the explicit nested function files after confirming that opening a setlist worked again.
- **Why:** A public URL with write/delete routes needs a gate, and local success is not enough when the deployed version fails.
- **Commits:** [1b0c1d3 — Protect deployed app with basic authentication](https://github.com/jabezapilado/BandSet/commit/1b0c1d3), [3e2561b — Fix authenticated setlist detail requests](https://github.com/jabezapilado/BandSet/commit/3e2561b), [4e6ac6d — Fix nested Vercel API routes](https://github.com/jabezapilado/BandSet/commit/4e6ac6d)

## 2. Where AI got it wrong

### Direct Supabase connection did not work on my network

- **What AI suggested:** The first setup used Supabase's direct PostgreSQL connection format.
- **What was wrong:** My laptop could not resolve the direct database host because that route needs IPv6 by default.
- **What I did instead:** I switched my private local configuration to the Supabase session pooler connection string and kept SSL enabled. The connection string is deliberately not committed because it contains a password.
- **Commit evidence:** [7e16ce9 — Connect BandSet UI to API](https://github.com/jabezapilado/BandSet/commit/7e16ce9) contains the SSL-ready database setup.

### The first Vercel authentication setup challenged the API twice

- **What AI suggested:** It added both Vercel middleware and an Express Basic Auth check for production requests.
- **What was wrong:** After the browser authenticated through Vercel, opening a setlist still failed because the API was challenged again.
- **What I did instead:** I tested the live detail request and removed the duplicate production Express check. Vercel middleware remains the single deployed gate, while the Express check remains useful for local API protection.
- **Commit evidence:** [3e2561b — Fix authenticated setlist detail requests](https://github.com/jabezapilado/BandSet/commit/3e2561b)

### The first Vercel API catch-all did not serve nested routes

- **What AI suggested:** One `api/[...path].js` catch-all function would cover all Express routes.
- **What was wrong:** It served one-segment paths such as `/api/setlists`, but the deployed `/api/setlists/1` path returned a Vercel 404.
- **What I did instead:** I tested the live endpoint and added explicit Vercel Function entry points for song IDs, setlist IDs, and nested setlist-song paths.
- **Commit evidence:** [4e6ac6d — Fix nested Vercel API routes](https://github.com/jabezapilado/BandSet/commit/4e6ac6d)

## 3. Who wrote what

### My application and database logic

- **Files:** [`db/schema.sql`](db/schema.sql), [`db/seed.sql`](db/seed.sql), and [`server/app.js`](server/app.js)
- **Commit:** [1763547 — Add Week 2 API foundation](https://github.com/jabezapilado/BandSet/commit/1763547)
- **What I contributed:** I designed the application behavior and data relationships. A song is reusable, a setlist is a performance plan, and `setlist_songs` connects the two because one song can belong to multiple setlists. I chose the `position` field because the order of performance songs matters. The API checks input before queries and uses the relationship so deletes do not leave broken references.

### My CSS and responsive decisions

- **File:** [`src/styles.css`](src/styles.css)
- **Commits:** [6fae181 — Initial BandSet React app](https://github.com/jabezapilado/BandSet/commit/6fae181), [7e16ce9 — Connect BandSet UI to API](https://github.com/jabezapilado/BandSet/commit/7e16ce9), and [4f13ac4 — Add song edit and delete flows](https://github.com/jabezapilado/BandSet/commit/4f13ac4)
- **What I contributed:** I made CSS adjustments after reviewing the prototype so the cards, spacing, controls, and responsive behavior matched the BandSet wireframes and design system. I understand that the phone media query changes a desktop grid into a compact readable layout, and that the menu is needed when the desktop navigation no longer fits.

### AI-written code I understand best: setlist song ordering

- **Files:** [`server/app.js`](server/app.js) and [`db/schema.sql`](db/schema.sql)
- **Commit:** [66cec58 — Complete setlist management flows](https://github.com/jabezapilado/BandSet/commit/66cec58)
- **What it does:** When a song is added, the API finds the highest `position` for that setlist and inserts the new song after it. When a song is removed, the API deletes the join-table row and subtracts one from later positions.
- **Why it is built this way:** The user sees songs in performance order. Updating positions after removal prevents gaps such as 1, 2, 4 in the setlist.
