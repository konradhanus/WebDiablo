# Plan: Combo & Crit (→1.7.0)
- Extract damage calc into `computeHit(attacker, defender)` returning {dmg,crit,combo}.
- Wrap Math.random for tests: allow injecting rng via `window.__TEST__.setRng(fn)`.
- Floating "CRIT" text via existing particle/floatText system.
- `#comboHud` shows combo.
- getCombat() + __TEST__.
- Tests: unit (deterministic crit with rng=()=>0 / ()=>1; combo decay), e2e (no errors, combo shows).
