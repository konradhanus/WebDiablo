# Feature Spec: Pause & Menu (1.4.0)
No way to pause. Add ESC pause that freezes the game loop and shows a pause overlay with
Resume / Settings / Quit-to-menu. Expose `game.pause()`/`game.resume()` and `isPaused()` on __TEST__.

## FR
- FR1: ESC toggles pause during play.
- FR2: Pause overlay with Resume/Settings/Quit.
- FR3: Game update loop no-ops while paused (enemies/player frozen).
- FR4: isPaused() reflects state.

## Success
- SC1: Enemies/player do not move while paused.
- SC2: Resume continues exactly.
