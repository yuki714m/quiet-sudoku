# AGENTS.md

## Project

quiet-sudoku is a small, static Web/PWA-oriented Sudoku app.

## Principles

- Keep the app quiet and focused.
- Do not add forced ads, interstitials, video ads, deceptive ad placement, payment, login, server integration, or ad network SDKs.
- Prefer plain HTML, CSS, and JavaScript.
- Keep the structure easy to publish on GitHub Pages.
- Preserve LocalStorage save and restore behavior.

## Files

- `index.html`: app shell
- `src/style.css`: visual design and responsive layout
- `src/app.js`: game state, input, timer, save/restore, history
- `src/puzzles.js`: bundled puzzles and sponsor object
- `docs/`: product notes, QA checklist, roadmap

## QA

Before handing off changes, run through `docs/qa-checklist.md` manually in a browser when possible.
