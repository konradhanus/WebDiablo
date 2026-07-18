# Feature Spec: Combo & Critical Hits (1.7.0)
Add combat depth: critical hits (based on critChance) deal 2x damage with a golden pop-up,
and a combo counter that grows with rapid consecutive hits (boosting damage) and decays.
Expose `getCombat()` on __TEST__.

## FR
- FR1: critChance% chance per hit → 2x dmg + "CRIT" floating text.
- FR2: combo increments per hit; resets if >2s since last hit; +5% dmg per combo level (cap 10).
- FR3: HUD shows combo count when >1.
- FR4: getCombat() returns {critChance,combo,lastHit}.

## Success
- SC1: Crit occurs ~critChance% over many hits (statistical, tested via seeded sim in unit).
- SC2: Combo resets after timeout.
