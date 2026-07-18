# Feature Spec: More Potion Types (1.8.0)
Expand consumables beyond health. Add Mana, Shield (temp absorb), and Speed (temp haste)
potions, each usable via keys 4/5 (and 1-3 for health variants). Expose `usePotion(type)` on __TEST__.

## FR
- FR1: Potion kinds: health, mana, shield, speed (data table POTION_TYPES).
- FR2: Keys 1-4 use health/mana/shield/speed respectively (keep 1-3 health, add 4/5).
- FR3: Effects: mana restores MP; shield adds tempHP; speed adds temp moveBoost (timed).
- FR4: usePotion(type) applies effect; returns success bool.
- FR5: getPotions() returns counts per type.

## Success
- SC1: Using mana potion restores MP.
- SC2: Shield grants temporary absorb.
