# Plan: Floor Quests (→1.6.0)
- Add FLOOR_QUESTS data table (data-driven, Principle V).
- `assignQuest()` on floor gen picks random; `updateQuest()` checks progress.
- `#questHud` element. On done: apply reward, logMsg.
- getQuest() + __TEST__.
- Tests: unit (assign/complete/reward), e2e (HUD updates on kill).
