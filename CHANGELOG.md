# CHANGELOG — WebDiablo: Shadows of the Forgotten

Single-file browser dungeon crawler. Zero dependencies, vanilla JS + Canvas2D.
Deployed on GitHub Pages: https://konradhanus.github.io/WebDiablo/

## v2.0.0 — Final Polish & Juice (2026-07-18)
Feature 020: hit-stop on kills, smoothed camera follow, level-up flash +
particle ring, FPS counter (F4), game-over stats screen, balance pass,
CHANGELOG + README.

## v1.11.0 — Achievements & Progression (2026-07-18)
Feature 019: 7 achievements (First Blood, Boss Slayer, Carnage King, Wave
Survivor, Squad Commander, Floor Diver, Untouched), toast notifications,
persistent meta HP bonus (+2%/boss, cap +20%), achievements panel (V).

## v1.10.0 — Sound & Music (2026-07-18)
Feature 018: procedural WebAudio — ambient drone + 14 SFX (hit/kill/scream/
fireball/hurt/ui/wave/pickup/boss/levelup/death/victory). Volume mixer
(master/music/sfx/mute). Fixed missing `damagePlayer` that crashed on boss
attacks.

## v1.9.0 — Boss Arena (2026-07-18)
Feature 017: boss every 5th floor, 3-phase boss with telegraphed abilities
(shockwave / summon / charge / fire-rain), enrage <33% HP, guaranteed
rare+ loot, boss HP bar.

## v1.8.0 — HUD Rework (2026-07-18)
Feature 016: HP/MP orbs, skill bar with cooldown sweeps, restyled parchment
minimap, serif headers. Fixed XP-bar element regression.

## v1.7.0 — Horde Waves (2026-07-18)
Feature 015: periodic enemy waves, WAVE banner, scaling difficulty, survival
XP bonus.

## v1.6.0 — Blood & Gore (2026-07-18)
Feature 014: gibs, directional blood spray, bloodlust streak (+5%/kill, cap
+50%), carnage HUD, size-scaled screen shake.

## v1.5.0 — Squad Command (2026-07-18)
Feature 013: recruit up to 3 mercenaries (Cannon-Fodder style), auto-attack,
KIA memorial, hold-position toggle.

## v1.4.0 — Atmospheric Rework (2026-07-18)
Feature 012: tile bevel/cracks, torch point-lights, braziers, persistent
blood decals.

## v1.3.0 — Landing Page + XP Fix (2026-07-18)
Feature 011: landing screen with credits. Fixed duplicate kill path + missing
`game.xpGain` so click-kills award XP correctly.

## v1.2.0 — Baseline
Original game: dungeon generation, combat, loot, classes, settings, fog of
war, autosave.
