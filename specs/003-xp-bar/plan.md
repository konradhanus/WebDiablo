# Plan: XP Bar & Progression (→1.3.0)
- Add `#xpBar` (outer) + `#xpFill` (inner, width%) + `#xpText` in HUD.
- Update in `updateUI()` and on xp gain.
- `getProgress()` computes pct = xp/xpNext*100.
- Expose `window.__TEST__.getProgress`.
- Tests: unit (pct math), e2e (bar width reflects xp after setting xp).
