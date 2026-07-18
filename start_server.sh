#!/usr/bin/env bash
# Start WebDiablo server detached from any terminal session (survives TTY close).
cd /home/korad/Desktop/diablo || exit 1
exec setsid python3 server.py >> server.log 2>&1 < /dev/null
