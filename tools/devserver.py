#!/usr/bin/env python3
"""Ontwikkelserver voor het Londen Budget-ontwerp.

Waarom niet `python3 -m http.server`? Die stuurt geen cache-headers mee, dus de
browser schat zelf hoe lang een bestand vers blijft. Gevolg: je past het ontwerp
aan, het voorbeeldvenster herlaadt, en je krijgt gewoon de oude pagina terug.
Deze variant zegt bij elk bestand expliciet: niet bewaren.
"""

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    # Een 304 "niet gewijzigd" stuurt de browser terug naar zijn eigen kopie,
    # en dat is precies wat we hier niet willen.
    def send_head(self):
        for kop in ("If-Modified-Since", "If-None-Match"):
            while kop in self.headers:
                del self.headers[kop]
        return super().send_head()


def main():
    # Tweede argument is de map: "design" voor het ontwerp, "app" voor de
    # werkende app. Zo hoeft er maar één server te bestaan.
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8124
    map_naam = sys.argv[2] if len(sys.argv) > 2 else "design"

    # Derde argument is het adres waarop we luisteren. Standaard 127.0.0.1:
    # dan kan alleen deze laptop erbij. Geef "0.0.0.0" mee om de app ook op je
    # telefoon te kunnen openen — maar besef dat dan iedereen op hetzelfde
    # wifi-netwerk bij deze map kan. Dus wel thuis, niet op de universiteit.
    host = sys.argv[3] if len(sys.argv) > 3 else "127.0.0.1"

    root = Path(__file__).resolve().parent.parent / map_naam
    handler = partial(NoCacheHandler, directory=str(root))
    with ThreadingHTTPServer((host, port), handler) as httpd:
        waar = f"http://localhost:{port}/" if host == "127.0.0.1" else f"http://<dit-ip>:{port}/"
        print(f"Londen Budget op {waar} (zonder cache), map: {root}")
        httpd.serve_forever()


if __name__ == "__main__":
    main()
