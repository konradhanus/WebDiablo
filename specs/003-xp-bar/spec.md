# Feature Spec: XP Bar & Progression Screen (1.3.0)
Player cannot see XP progress to next level. Add a visible XP bar (bottom, above version footer)
and a progression display (level + XP/Needed). Expose `getProgress()` on __TEST__.

## FR
- FR1: XP bar renders width = xp/xpNext.
- FR2: Shows "Lv N" + "xp/needed".
- FR3: Updates on xp gain/level up without layout shift.
- FR4: getProgress() returns {level,xp,xpNext,pct}.

## Success
- SC1: Bar fills proportionally to xp.
- SC2: Reaches 100% exactly at level up.
