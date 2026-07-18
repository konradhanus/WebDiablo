#!/usr/bin/env python3
import http.server
import socketserver
import os

os.chdir('/home/korad/Desktop/diablo')

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

PORT = 6660
with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
    print(f"Serving on port {PORT}...")
    httpd.serve_forever()
