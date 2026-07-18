# Plan: Achievements (→1.9.0)
- ACHIEVEMENTS data table; `evaluateAchievements()` called post-kill/level/floor.
- `unlock(id)` → toast + persist.
- `#achievementsPanel` (key A), `#toast` element.
- getAchievements() + __TEST__ (incl. unlock(id) for tests).
- Tests: unit (first-kill unlocks, persistence), e2e (unlock via __TEST__, toast shows).
