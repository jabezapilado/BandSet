# BandSet

> **AI-assisted project:** This project was planned and developed with assistance from OpenAI Codex. See [AI-USAGE.md](AI-USAGE.md) for details.

BandSet is a responsive web app for musicians who want to keep a small song library and organize songs into setlists. It gives a band member a simple home view, searchable song list, setlist planner, and a focused screen for reviewing the details of a selected song.

## Setup and installation

You will need Node.js 18 or later, npm, Git, and PostgreSQL access. BandSet is prepared to use a Supabase-hosted PostgreSQL database.

```bash
git clone https://github.com/jabezapilado/BandSet.git
cd BandSet
npm install
```

### Environment and database setup

Copy the environment example and replace the placeholder database connection string with your own Supabase PostgreSQL connection string. Do not commit the completed `.env` file.

```bash
cp .env.example .env
```

```env
PORT=3001
DATABASE_URL=postgresql://postgres:<password>@<host>:5432/postgres
```

After PostgreSQL is connected, create the BandSet tables and sample data:

```bash
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -f db/seed.sql
```

The frontend currently still uses temporary React state. The Week 2 API and database schema are ready, but connecting the frontend to the live API is the next increment.

## Run the app

```bash
npm run dev
```

Open the local address Vite prints in the terminal (normally `http://localhost:5173`). You should see the BandSet home screen with song and setlist totals.

To start the backend API in a second terminal:

```bash
npm run server
```

The API starts at `http://localhost:3001`. You can confirm it is running by opening `http://localhost:3001/api/health`, which returns `{"status":"ok"}`.

## Features and usage

- **Home:** See the current number of songs and setlists, plus quick links to recent setlists.
- **Songs:** Search the song library and use **Add song** to create a local placeholder song.
- **Setlists:** View all setlists, create a local placeholder setlist, or select one to open it.
- **Setlist details:** Review the songs in a setlist, select a song, and read its key, tempo, duration, status, and notes.
- **Responsive layout:** At phone width, cards and song rows stack vertically and navigation becomes a simple menu.
- **REST API foundation:** The Express server exposes validated song and setlist routes. Once the database connection is configured, the routes read and write PostgreSQL data.

### API routes

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Confirms that the API server is running. |
| `GET` | `/api/songs` | Returns all songs. |
| `POST` | `/api/songs` | Creates a validated song. |
| `GET` | `/api/setlists` | Returns all setlists and song counts. |
| `POST` | `/api/setlists` | Creates a validated setlist. |
| `GET` | `/api/setlists/:id` | Returns one setlist with its ordered songs. |

## Project structure

```text
BandSet/
├── src/
│   ├── App.jsx          # Screens, components, and local interaction state
│   ├── main.jsx         # React entry point
│   └── styles.css       # Design tokens and responsive styles
├── server/
│   ├── app.js           # Express routes and error handling
│   ├── db.js            # PostgreSQL connection pool
│   ├── index.js         # API server entry point
│   └── validation.js    # Server-side input validation
├── db/
│   ├── schema.sql       # Songs, setlists, and setlist_songs tables
│   └── seed.sql         # Invented development data
├── test/
│   └── validation.test.js
├── .env.example
├── index.html
├── package.json
├── README.md
├── REPORT.md
└── AI-USAGE.md
```

## Screenshots

### Home screen

![BandSet home screen](docs/screenshots/home.png)

## Known issues and next steps

- The frontend still uses temporary React state, so added songs and setlists reset after a page refresh.
- A Supabase PostgreSQL project and `DATABASE_URL` still need to be configured before the API can query live data.
- The UI is not connected to the API yet, and full edit/delete forms plus setlist song assignment are not built.
- Authentication and access control are not implemented yet.
