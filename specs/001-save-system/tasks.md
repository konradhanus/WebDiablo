# Tasks: Save System

- [ ] T1: Add SaveManager (SAVE_KEY, saveGame, loadGame, hasSave, clearSave) with try/catch validation.
- [ ] T2: Expose `window.__TEST__` with SaveManager fns for tests.
- [ ] T3: Wire saveGame on floor change, level up, and 15s interval.
- [ ] T4: Add game.continue() to restore state and enter 'playing'.
- [ ] T5: Inject CONTINUE button into #startScreen when hasSave().
- [ ] T6: clearSave() on death.
- [ ] T7: Unit tests: save round-trip, invalid save → null, version mismatch → null.
- [ ] T8: E2E: start → set state → save → reload → CONTINUE restores floor/level.
- [ ] T9: build-check + full test suite green.
- [ ] T10: release (bump 1.0.0→1.1.0, commit, push, deploy verify).
