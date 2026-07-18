# Feature Spec: Kill Counter & Floor Stats (1.5.0)
Player lacks feedback on performance. Add a HUD readout: kills this run, kills this floor,
floor time, and total gold. Expose `getRunStats()` on __TEST__.

## FR
- FR1: Track kills (total + per-floor) and floor entry time.
- FR2: HUD shows "Kills: N | Floor Kills: M | Gold: G | Time: mm:ss".
- FR3: Reset per-floor counter on floor change; reset run stats on new game.
- FR4: getRunStats() returns {kills, floorKills, gold, floorTimeMs}.

## Success
- SC1: Counter increments on kill.
- SC2: Floor kills reset on descend.
