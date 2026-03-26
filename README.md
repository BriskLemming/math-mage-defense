# Math Mage Defense (Prototype)

A local browser prototype of a lane-based math tower defense game.

## Run locally

Option 1 (quick):
- Open `index.html` directly in Chrome.

Option 2 (recommended):
- In PowerShell:
  - `cd D:\Projects\math-mage-defense`
  - `python -m http.server 8080 --bind 0.0.0.0'
- Open `http://localhost:8080` in Chrome.

## Controls

- Pick a lane.
- Choose `Gem A`, `Operator`, and `Gem B`.
- Press **Cast Spell** (or spacebar).
- If your result matches the front enemy in that lane, it takes damage.

## Current MVP systems

- 3 lanes
- 3 waves from your design brief
- Enemy target values by enemy type
- Castle HP and win/lose conditions

