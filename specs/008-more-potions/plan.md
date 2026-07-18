# Plan: More Potions (→1.8.0)
- POTION_TYPES data table (data-driven).
- Extend player.potions to per-type counts map.
- usePotion(type): health→hp, mana→mp, shield→tempShield, speed→speedTimer.
- Key bindings 1-4 (keep 1-3 health, add 4 shield, 5 speed).
- #potionHud shows counts.
- getPotions()/usePotion() + __TEST__.
- Tests: unit (each effect), e2e (use mana restores mp).
