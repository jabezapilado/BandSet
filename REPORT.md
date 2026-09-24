# Weekly Increment Report

## Week of: September 21, 2026

## What changed this week

- Converted the initial static BandSet wireframe pages into a React and Vite project.
- Built functional Home, Songs, Setlists, and Setlist Details screens with reusable React components.
- Added a responsive navigation menu and layouts that stack cards and song information on phone-width screens.
- Applied the approved BandSet design-system colours, type scale, spacing tokens, and component patterns in the prototype.
- Added project documentation in `README.md` and an `AI-USAGE.md` record.

## Why

These changes turn the approved planning work into an interactive first increment. The goal is to make the main BandSet user flow testable before adding data storage and complete forms.

## What broke or what I got stuck on

The original project only contained static HTML and CSS, so it had to be converted before React components and interactive state could be used. The current app deliberately uses temporary in-browser state, which means newly added items disappear after refresh.

## What is left

- Add complete song and setlist create/edit forms.
- Allow songs to be added to and reordered inside a setlist.
- Connect persistent storage.
- Test the final experience at desktop and phone widths.
- Add screenshots of the running app and keep the documentation current.
