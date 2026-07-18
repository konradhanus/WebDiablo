# Feature 016 — HUD Rework (Dark-Fantasy Diablo styling)

**Branch:** master | **Type:** MINOR (UI overhaul)

## Overview
Overhaul the entire HUD into a cohesive dark-fantasy Diablo-style interface:
- **Orb-based HP/MP** (red/blue gradient orbs with arcs) instead of plain bars.
- **Skill bar** with large icon buttons + radial cooldown sweep, hotkeys 1-4.
- **Redesigned minimap** with a parchment/fog frame, player arrow, exit glow.
- **Compact equipment slots** restyled to match.
- **Unified palette**: dark stone, gold accents, serif headers (Cinzel-like).
- Consistent z-layering and readability over the canvas.

## User Scenarios
1. Player sees HP/MP as glowing orbs bottom-left; numbers overlay.
2. Skill bar (4 slots) bottom-center; used skills show a darkening sweep +
   numeric cooldown; pressing 1-4 triggers & greys the slot.
3. Minimap top-right with fog reveal, player heading, stairs marker.
4. Equipment panel opens with stone-framed slots; hover shows tooltip.
5. Everything readable during heavy combat (contrast, shadows).

## Requirements
- R1. Replace `#hpBar`/`#mpBar` plain bars with orb elements `#hpOrb`/`#mpOrb`
     (CSS radial gradient + inner fill via conic/linear clip or overlay
     height). Keep `updateUI` updating widths — adapt to orb fill.
- R2. `#skillBar` with 4 `#skill-0..3` buttons; each shows icon (emoji or
     glyph), name, hotkey. Cooldown overlay = absolutely-positioned div whose
     height scales with remaining cd; or a conic-gradient mask. Update each
     frame in a new `updateSkillBar()` called from render.
- R3. Minimap container `#minimap` restyled: parchment border, rounded, drop
     shadow; canvas inside unchanged logic.
- R4. Equipment slots `#equipSlots .equip-slot` stone-frame style; tooltip via
     `title` already present, add CSS hover glow.
- R5. Global HUD font: import 'Cinzel' fallback Georgia serif for headers; body
     monospace for numbers. Add `@import` or `<link>`? Keep zero external deps →
     use system serif fallback (Georgia) to honor Constitution I. No network.
- R6. All elements positioned to not overlap (wave bar top-center, squad/carnage
     bottom-left, skill bar bottom-center, minimap top-right, hp/mp orbs
     bottom-left above squad). Reflow via CSS.
- R7. `updateUI()` updates orb fills + skill icons + equipment; `updateSkillBar()`
     (per-frame) updates cooldown sweeps. Green.

## Out of Scope
- New skills (reuse existing fireball/heal/lightning/frost).
- Touch controls (later iteration).

## Success Metrics
- `npm test` green. E2E: HUD elements present (orb, skill bar 4 slots, styled
  minimap), using a skill (key 1) sets cooldown state on the slot, no errors.
- Live Pages updated.
