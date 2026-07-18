# WebDiablo — Shadows of the Forgotten

A dark-fantasy, single-file browser dungeon crawler. Survive the depths,
slay bosses, command a squad, and bathe in the blood of your enemies —
**Cannon-Fodder meets Diablo**.

**Zero dependencies.** Pure vanilla JavaScript + Canvas2D. No build step, no
network, no assets to download. Just open `index.html`.

▶ **Play now:** https://konradhanus.github.io/WebDiablo/

## Run locally
```bash
cd diablo
python3 server.py      # serves on http://localhost:8000
# or just open index.html in a browser
```

## Controls
| Key | Action |
|-----|--------|
| WASD / Arrows | Move |
| Left Click (hold) | Melee attack |
| Right Click / F | Cast Fireball (costs mana) |
| 1–5 | Quaff potion |
| Q | Recruit mercenary (squad) |
| R | Toggle squad hold-position |
| V | Achievements panel |
| O | Settings (volume mixer) |
| F4 | Toggle FPS counter |
| E / Space | Interact (stairs, doors) |

## Features
- **Procedural dungeons** — rooms, corridors, caverns, fog of war.
- **Classes** — Warrior, Mage, Rogue, Cleric with distinct stats.
- **Combat** — melee + fireball, crits, lifesteal, bloodlust streak.
- **Loot** — common→mythic rarity, 11 equip slots, auto-equip best.
- **Squad Command** — recruit up to 3 mercenaries (Cannon-Fodder style).
- **Horde Waves** — survive escalating waves for bonus XP.
- **Boss Arena** — phased bosses every 5 floors with telegraphed attacks.
- **Blood & Gore** — gibs, spray, decals, screen shake.
- **Atmospheric lighting** — torch point-lights, braziers.
- **Sound & Music** — procedural WebAudio drone + 14 SFX, volume mixer.
- **Achievements** — 7 unlockables, persistent meta HP progression.
- **Polish** — hit-stop, smoothed camera, level-up flash, FPS counter,
  game-over stats.

## Tests
```bash
npm test               # unit + e2e (Playwright headless)
npm run build          # syntax/build gate
node scripts/release.mjs minor "msg"   # green-to-ship deploy
```

## Tech
- Vanilla ES2022, Canvas2D, WebAudio, localStorage.
- Single `index.html` (~2500 lines), `tests/` with `node:test` + Playwright.
- Deployed via GitHub Pages from `master`.

## Credits
Created by **Konrad Hanus** — July 2026.
