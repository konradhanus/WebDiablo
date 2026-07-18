# Plan — Feature 016: HUD Rework (Dark-Fantasy Diablo styling)

## Constitution Check
- I: ✅ CSS only; no external assets/fonts (system serif fallback, no @import
     network). Honors zero-dep.
- II: ✅ DOM/CSS.
- III: ✅ e2e checks HUD + cooldown state.
- IV/V/VI: ✅ data-driven; gate.

## Approach
1. **HP/MP Orbs**: Replace markup in `#ui`:
   - `<div id="hpOrb"><div class="orb-fill"></div><span class="orb-num">..</span></div>`
     similarly `#mpOrb`. CSS: fixed-size circle (e.g. 64px), radial-gradient
     base (dark), `.orb-fill` is an overlaid circle clipped via
     `clip-path: inset(...)` or simpler: a bottom-up fill using a child with
     height% and `border-radius` rounded — emulate orb by `border-radius:50%`
     and overflow hidden, fill from bottom. Add a subtle inner shadow + glow.
   - `updateUI`: set `hpOrbFill.style.height = pct%` and number text. Same MP.
2. **Skill Bar**: markup `#skillBar` with 4 buttons
   `#skill-0..3`, each:
   `<button class="skill" id="skill-0"><span class="skill-icon">🔥</span>
    <span class="skill-key">1</span><span class="skill-cd"></span></button>`
   CSS: 56px squares, stone gradient, gold border, icon centered, key badge
   bottom-right, `.skill-cd` absolute overlay with `background:rgba(0,0,0,.7)`
   height = cd%. `updateSkillBar()` (per frame) sets each `.skill-cd` height and
   `disabled`/greyed class when on cd. Wire keys 1-4 already call
   `castSpell(i)` — verify and add visual.
3. **Minimap restyle**: `#minimap` add parchment frame, rounded, shadow,
   label "MAP". Keep canvas logic. Slightly larger (140px).
4. **Equipment slots**: `.equip-slot` stone frame + hover glow; panel header
   serif. Keep existing layout.
5. **Global fonts**: add CSS `font-family` to headers (h1/h2/h3 in panels) →
   Georgia, 'Times New Roman', serif. Numbers (orbs, bars) → monospace.
6. **Reflow / z-index**: ensure no overlaps:
   - top: floorDisplay (top), waveBar (top-center 78px), minimap (top-right).
   - bottom-left: carnageBar (112), squadBar (92), hp/mp orbs (above squad? put
     orbs bottom-left at ~bottom:120px to the right of carnage). Simplify:
     orbs bottom-left at bottom:8px left:10px; squadBar/squadBtns move up to
     not collide. Recompute positions in CSS.
   - bottom-center: skillBar (bottom:10px center).
   - bottom-right: squadBtns currently bottom-right 92 — move to bottom:10px
     right:10px next to skill bar? Keep squadBtns bottom-right but raise to
     avoid skill bar overlap (skill bar center). Fine.
7. **JS hooks**:
   - In `updateUI`: drive orb fills + numbers; rebuild skill icons (icon+name)
     from `SPELLS` once; equipment slots as before.
   - New `updateSkillBar()` called each frame in `render()` (cheap DOM writes
     only when changed — compare cached values to avoid layout thrash).
8. **Tests**:
   - `tests/hud.test.mjs`: orb elements present, skill bar 4 slots, minimap
     styled, updateUI sets orb height, spell keys 1-4 wired to castSpell,
     updateSkillBar called in render.
   - `e2e.mjs`: start; assert orb + skillbar exist; simulate pressing '1' (set
     spell cd) then run a frame; assert skill-0 has cooldown state (cd overlay
     height>0 or class). Assert no errors.
9. **Perf**: `updateSkillBar` writes only on change (cache last cd per slot).

## Files
- `index.html` (HUD markup, CSS, updateUI orb/skill, updateSkillBar, render hook)
- `tests/hud.test.mjs` (new), `tests/e2e.mjs` (extend)

## Risks
- Orb fill via height% on a round element needs overflow hidden + border-radius
  to look like an orb; acceptable approximation.
- Skill cd overlay per frame: cache to avoid reflow. Fine.
