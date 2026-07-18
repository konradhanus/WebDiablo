# Feature Spec: Floor Quests (1.6.0)
Add optional per-floor quests: "Slay N enemies" / "Collect N gold" with a reward (xp/gold/item)
on completion. Quest shown in HUD; auto-assigned on floor entry. Expose `getQuest()` on __TEST__.

## FR
- FR1: On floor entry, assign a random quest from a data table (FLOOR_QUESTS).
- FR2: HUD shows objective + progress.
- FR3: On completion, grant reward + logMsg; mark done (not repeated this floor).
- FR4: getQuest() returns {type,target,progress,done,reward}.

## Success
- SC1: Completion grants reward and marks done.
- SC2: Quest resets on new floor.
