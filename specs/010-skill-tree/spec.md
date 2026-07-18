# Feature Spec: Skill Tree (2.0.0)
Add a skill tree: spend level-up points on perks (e.g. +Max HP, +Crit, +Fireball Dmg,
+Move Speed, +Lifesteal). Panel toggled by key K. Points = level-1. Persist with save.
Expose `getSkills()`/`learnSkill(id)` on __TEST__.

## FR
- FR1: SKILLS data table (id, name, desc, cost, effect).
- FR2: Earn 1 point per level; spend in panel (key K).
- FR3: Learned skills applied to player stats/effects.
- FR4: Learned set persisted in save (Feature 001).
- FR5: getSkills() returns learned + available; learnSkill(id) spends point.

## Success
- SC1: Learning +Max HP raises maxHp.
- SC2: Cannot overspend points.
