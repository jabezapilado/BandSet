# BandSet

> **AI-assisted project:** This project was planned and developed with assistance from OpenAI Codex. See [AI-USAGE.md](AI-USAGE.md) for details.

BandSet is a responsive web app for musicians who want to keep a small song library and organize songs into setlists. It gives a band member a simple home view, searchable song list, setlist planner, and a focused screen for reviewing the details of a selected song.

## Setup and installation

You will need Node.js 18 or later, npm, and Git.

```bash
git clone <your-repository-url>
cd BandSet
npm install
```

This first prototype does not use a database or environment variables. Its data is stored in React state, so refreshing the browser resets any songs or setlists added during a session.

## Run the app

```bash
npm run dev
```

Open the local address Vite prints in the terminal (normally `http://localhost:5173`). You should see the BandSet home screen with song and setlist totals.

## Features and usage

- **Home:** See the current number of songs and setlists, plus quick links to recent setlists.
- **Songs:** Search the song library and use **Add song** to create a local placeholder song.
- **Setlists:** View all setlists, create a local placeholder setlist, or select one to open it.
- **Setlist details:** Review the songs in a setlist, select a song, and read its key, tempo, duration, status, and notes.
- **Responsive layout:** At phone width, cards and song rows stack vertically and navigation becomes a simple menu.

## Project structure

```text
BandSet/
├── src/
│   ├── App.jsx          # Screens, components, and local interaction state
│   ├── main.jsx         # React entry point
│   └── styles.css       # Design tokens and responsive styles
├── index.html
├── package.json
├── README.md
├── REPORT.md
└── AI-USAGE.md
```

## Screenshots

Add a screenshot of the running app here before final submission.

## Known issues and next steps

- Added songs and setlists are temporary and reset after a page refresh.
- The add controls create placeholders; full edit forms and setlist song assignment are not built yet.
- Next steps are persistent storage, validated create/edit forms, automated tests, and final screenshots.
