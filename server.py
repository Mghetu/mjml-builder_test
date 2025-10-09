import os
import socket
from contextlib import closing
from http.server import SimpleHTTPRequestHandler, HTTPServer

class Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "application/javascript",
        ".mjs": "application/javascript",
        ".json": "application/json",
        ".css": "text/css",
        ".wasm": "application/wasm",
    }

def find_free_port(start=8000, limit=50):
    for p in range(start, start+limit):
        with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            if s.connect_ex(("0.0.0.0", p)) != 0:
                return p
    raise RuntimeError("No free port found")

if __name__ == "__main__":
    port = int(os.getenv("PORT", "0")) or find_free_port(8000)
    print(f"Serving at http://0.0.0.0:{port}")
    HTTPServer(("0.0.0.0", port), Handler).serve_forever()
