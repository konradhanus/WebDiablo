# Plan: Skill Tree (→2.0.0)
- SKILLS table; `this.skillPoints`, `this.learned={}`.
- learnSkill(id): if points>0 & not learned → apply effect, points--, learned[id]=true.
- applySkills(): recompute derived stats (called after learn + on continue()).
- `#skillPanel` (key K), #skillPoints display.
- Persist learned in save payload.
- getSkills()/learnSkill() + __TEST__.
- Tests: unit (learn raises stat, no overspend), e2e (learn + persists via save).
