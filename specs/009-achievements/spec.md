# Feature Spec: Achievements (1.9.0)
Add an achievement system: unlock badges for milestones (first kill, floor 5, level 10,
boss slain, 100 kills). Toast on unlock; list in a panel (key A). Persist unlocked set.
Expose `getAchievements()` on __TEST__.

## FR
- FR1: ACHIEVEMENTS data table (id, name, desc, check(stats)).
- FR2: After relevant events, evaluate; on newly met → unlock + toast.
- FR3: Achievements panel (key A) lists locked/unlocked.
- FR4: Unlocked ids persisted to localStorage.
- FR5: getAchievements() returns [{id,name,desc,unlocked}].

## Success
- SC1: First-kill achievement unlocks on first kill.
- SC2: Unlocked set survives reload.
