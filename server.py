import http.server
import socketserver
import webbrowser
import os

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        super().end_headers()

if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    httpd = None
    port = PORT
    # v4.5.0: bind to this PC only (127.0.0.1, not the whole network) and try the next
    # ports if 8000 is busy. The extension bridge works on any localhost port.
    for p in range(PORT, PORT + 10):
        try:
            httpd = socketserver.TCPServer(("127.0.0.1", p), Handler)
            port = p
            break
        except OSError:
            print(f"Port {p} is busy, trying next...")
    if httpd is None:
        print("Could not find a free port between 8000-8009. Close the old dashboard window and try again.")
        raise SystemExit(1)
    with httpd:
        url = f"http://localhost:{port}"
        print(f"====================================================")
        print(f" NotebookLM Studio Dashboard running at: {url}")
        print(f" NOTE: use the SAME address every time - your prompts are saved per address")
        print(f"       (they are also backed up inside the extension).")
        print(f"====================================================")
        try:
            webbrowser.open(url)
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            httpd.server_close()
