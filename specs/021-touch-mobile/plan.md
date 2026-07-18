# Plan — Feature 021: Touch & Mobile Controls

## Constitution Check
All six principles satisfied (see spec.md). Pure input-mapping layer; the game
simulation (`updatePlayer`, `meleeAttack`, etc.) is NOT modified — we only feed
it the same `this.keys` / `this.mouse` / action methods it already reads.

## Approach
1. **HTML**: add `#touchUI` container with `#joystick` (base+knob) and a row of
   `#touchBtns` (Fireball, Squad, Hold, Potion, Settings, Ach). Hidden by default
   (`display:none`); shown when touch mode active.
2. **CSS**: 
   - `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">`
   - `html,body{touch-action:none;overscroll-behavior:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}`
   - `#joystick` fixed bottom-left, 120px, semi-transparent; knob draggable.
   - `#touchBtns` fixed bottom-right, grid of 64px round buttons, safe-area padded.
   - Show only when `body.touch` class present.
3. **JS — detection**: `const IS_TOUCH = matchMedia('(pointer:coarse)').matches || location.search.includes('touch=1')`. Add `document.body.classList.toggle('touch', IS_TOUCH)`.
4. **JS — joystick** (Pointer Events, works for touch + mouse-drag test):
   - `pointerdown` on `#joystick` base → capture start; `pointermove` → vector
     from center, clamp to radius, set knob transform, write `game.keys`
     (KeyW/A/S/D per sign) and `game.player.dir` (8-way). `pointerup` → reset.
   - Use a module-level `joyVec={x,y}` + helper `applyJoy()` that maps to keys.
5. **JS — tap attack**: `pointerdown` on the game canvas (when touch mode) in the
   RIGHT half → set `game.mouse.down=true` and aim: pick nearest enemy, compute
   `player.dir` toward it; on `pointerup` set `mouse.down=false`. A tap = one
   swing (handled by existing attackCooldown).
   - Left half taps are ignored for attack (joystick zone handles movement); if
     user taps left half without joystick, also move toward tap? Keep simple:
     joystick zone is its own element; canvas taps anywhere = attack. Joystick
     sits above canvas via z-index so it captures its own touches.
6. **JS — buttons**: each `#touchBtns button` gets `pointerdown` → call mapped
   action. Fireball: `game.castFireball()` toward nearest enemy or facing. Potion:
   cycle `game.usePotion(slot)` where slot = first non-full HP potion or 0.
7. **Desktop safety**: when NOT touch, `#touchUI` stays hidden, existing listeners
   unchanged. `pointerdown` on canvas only activates tap-attack in touch mode.
8. **Tests**:
   - `tests/touch.test.mjs`: parse checks — joystick element, viewport meta,
     touch-action CSS, IS_TOUCH gating, button→action wiring strings.
   - `tests/e2e.mjs`: add a mobile-emulation block (Playwright `hasTouch:true`,
     `isMobile:true`, viewport 390x844). Boot, assert `#touchUI` visible, simulate
     joystick drag via `dispatchEvent`/CDP touch, assert `game.player` moved;
     simulate tap on canvas, assert `game.mouse.down` flipped / a swing happened
     (enemy hp dropped). Keep desktop checks intact.

## Files
- `index.html`: meta, `#touchUI` markup, CSS, control JS (new IIFE after game init).
- `tests/touch.test.mjs`: new unit-ish parse tests.
- `tests/e2e.mjs`: new mobile block.

## Verification
- `npm run build` (syntax) → `npm test` (93 unit + 84 e2e + new) → all green.
- `node scripts/release.mjs minor "..."` → push → verify Pages serves new version.
- Manual: open on phone (or Chrome devtools device mode) and confirm no scroll,
  joystick moves, tap attacks.

## Risks
- Pointer-event coordinate math for joystick knob vs game coords — keep separate
  (joystick is pure screen-space; game reads only `keys`/`dir`).
- iOS Safari quirk: `touch-action:none` + `position:fixed` needed to stop bounce;
  add `height:100%` + `overflow:hidden` on body.
- Buttons overlapping HUD skill bar — place touch buttons BELOW the HUD row.
