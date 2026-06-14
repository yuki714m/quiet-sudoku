# quiet-sudoku Product Spec

## Purpose

quiet-sudoku is a Web/PWA Sudoku app for people who want to play without forced ads interrupting the start, end, hints, clear moment, or moment-to-moment flow.

## Product Direction

- Release target for now: URL-shareable Web/PWA
- No App Store / Google Play build yet
- No tester workflow or store review work yet
- Improve Sudoku play quality, continuity, mobile layout, and offline foundation first
- Preserve LocalStorage save and restore

## Concept

- No forced ads that break concentration
- Do not interrupt the clear moment with video ads or strong sponsor prompts
- A calm place for Sudoku fans
- A reason to continue one puzzle a day
- Future sponsor placements for Japanese companies and local businesses
- No real advertising SDKs in the MVP

## MVP Scope

- 9x9 Sudoku board
- Easy / Normal / Hard bundled puzzles
- Digit input
- Note input
- Given cells are read-only
- Highlight the same digit
- Highlight selected row, column, and 3x3 block
- Judge mistakes by comparing input with `solution`
- Clear only when `board` exactly matches `solution`
- Timer
- Pause
- Undo
- Erase
- LocalStorage save and restore
- Today's puzzle foundation
- Today's puzzle completion state
- Clear history
- Clear result dialog with time, mistakes, hints, difficulty, and badges
- Quiet sponsor placeholder at the bottom
- PWA manifest
- Service worker static file cache

## Today's Puzzle Behavior

Today's puzzle is selected from the current date in `YYYY-MM-DD` format. The app maps the compact date number to the bundled difficulty list and reuses the existing puzzle for that difficulty.

When the date changes:

- `ensureTodayEntry()` compares the saved daily entry with the current date and selected puzzle
- If the saved date or puzzle differs, the app creates a new daily entry
- The new entry starts as `completed: false`
- Previous clear history remains in `quiet-sudoku-history-v1`
- The daily status shown in the UI changes to the new date

Because the current puzzle count is small, it is acceptable that multiple days reuse the same bundled puzzles.

## LocalStorage

- `quiet-sudoku-state-v1`: current puzzle state, notes, mistakes, elapsed time, source, and daily date
- `quiet-sudoku-history-v1`: latest clear results
- `quiet-sudoku-daily-v1`: today's puzzle date, difficulty, puzzle id, completed flag, and clear result summary

## PWA Behavior

- `manifest.webmanifest` defines app name, theme color, display mode, start URL, and icons
- `service-worker.js` caches the app shell for offline reload
- Service workers require HTTPS or localhost; direct `file://` opening still works as a basic web app but cannot register the service worker
- The app should remain publishable as a static site on GitHub Pages, Cloudflare Pages, or Vercel

## Sponsor Object

The sponsor placement is controlled by an object with:

- `name`
- `description`
- `image`
- `url`

The initial sponsor note is:

`このアプリは、集中を邪魔しない広告掲載を目指しています。`

The MVP displays `スポンサー募集中`. If `url` is empty, the sponsor area does not open anything. If `url` exists, it opens in a new tab with `noopener`.

## Out Of Scope

- App Store / Google Play build
- AdMob
- Forced video ads
- Misleading ad placement
- Payments
- Login
- Server integration
- Complex automatic puzzle generation
