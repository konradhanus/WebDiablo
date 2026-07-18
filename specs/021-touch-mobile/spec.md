# Feature 021 — Touch & Mobile Controls

**Branch:** master | **Type:** MINOR (mobile support)

## Overview
Make WebDiablo fully playable on a touch-screen phone/tablet using **Spec-Driven
Development**. The game currently reads WASD + mouse only; on a phone there is
no keyboard or mouse. We add an on-screen control layer that maps touch gestures
onto the exact same input the desktop game already consumes (`this.keys`,
`this.mouse.{x,y,down}`, action methods), so the simulation code is untouched and
no behaviour diverges between platforms.

## Goals
1. **Virtual joystick** (left thumb) → movement + facing direction (`this.keys`
   + `player.dir`). Analog vector, 8-way clamp for `dir`.
2. **Tap-to-attack** (right side of screen) → melee swing toward nearest enemy,
   or facing direction if none. Feels like an action game, not a menu.
3. **On-screen action buttons** (right thumb): Fireball, Squad+, Hold, Potion,
   Settings, Achievements. Big, thumb-friendly hitboxes.
4. **Mobile hardening**: `viewport` meta (no user-scalable), `touch-action:none`
   on canvas/HUD to kill scroll/zoom/pull-to-refresh, full-viewport canvas,
   safe-area insets, disable text selection / callout.
5. **Auto-detect**: touch controls show on touch-capable devices (and can be
   forced via `?touch=1` for testing). Desktop keeps keyboard+mouse untouched.
6. **No regressions**: all existing keyboard/mouse paths keep working.

## Non-Goals
- No gamepad / bluetooth controller support.
- No portrait-mode re-layout (game is landscape-first; we support portrait by
  stacking controls but the dungeon renders best in landscape).
- No new combat mechanics — pure input mapping.

## Input Mapping (touch → internal)
| Touch action | Internal effect |
|--------------|-----------------|
| Joystick drag (vector v) | `keys.KeyW/A/S/D` set per v; `player.dir` = 8-way from v |
| Tap right zone (no joystick) | `mouse.down=true` for one swing; aim = nearest enemy dir |
| Hold right zone | continuous `mouse.down` (auto-repeat swings) |
| Fireball btn | `castFireball()` toward nearest enemy / facing |
| Squad+ btn | `recruitMerc()` |
| Hold btn | toggle `squadHold` |
| Potion btn | `usePotion(nextEmptyOrDefault)` |
| Settings btn | `toggleSettings()` |
| Ach btn | `toggleAchPanel()` |

## Acceptance Criteria
- [ ] On a touch device the game boots into PLAY with visible joystick + buttons.
- [ ] Dragging joystick moves the player smoothly; releasing stops.
- [ ] Tapping the right play area triggers a melee swing in a sensible direction.
- [ ] Fireball/Squad/Hold/Potion/Settings/Ach buttons work via tap.
- [ ] Page does not scroll, zoom, or pull-to-refresh while playing.
- [ ] Canvas fills the viewport; HUD does not overlap the joystick/buttons.
- [ ] All 93 unit + 84 e2e checks still pass (desktop paths intact).
- [ ] New e2e (mobile emulation) verifies joystick → movement and tap → attack.

## Constitution Check
- I Single-file, zero-dep: controls are vanilla DOM + pointer events. ✅
- II Vanilla platform: no frameworks. ✅
- III Playtest-first: e2e drives pointer events via Playwright mobile context. ✅
- IV Perf caps: joystick is a light rAF-less pointer handler; no GC churn. ✅
- V Data-driven: button config in one array. ✅
- VI Spec-driven: this file + plan.md + tests. ✅
