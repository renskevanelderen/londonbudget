#!/usr/bin/env python3
"""Zet de losse onderdelen samen tot app/index.html.

De app is met opzet één bestand: geen build-stap nodig om hem te gebruiken,
gewoon openen en klaar. Maar één bestand van 1600 regels is lastig bewerken,
dus schrijven we in vier stukken en plakken die hier aan elkaar.

    style.part.html   de opmaak, letterlijk overgenomen uit het ontwerp
    sprite.part.html  de iconen (inline SVG, anders geen kleur van currentColor)
    shell.part.html   de HTML-schil met drie plaatshouders
    script.part.js    alle werking

Belangrijk: bewerk nooit app/index.html zelf. Die wordt hier overschreven.
Draai na elke wijziging:  python3 tools/bouw.py
"""

from pathlib import Path

APP = Path(__file__).resolve().parent.parent / "app"

# Per plaatshouder: welk bestand erin komt, en of het nog ingepakt moet worden.
# style en sprite brengen hun eigen <style>/<svg> mee; het script is kale JS.
VULLING = {
    "<!--STYLE-->": ("style.part.html", "", ""),
    "<!--SPRITE-->": ("sprite.part.html", "", ""),
    "<!--SCRIPT-->": ("script.part.js", "<script>\n", "\n</script>"),
}


def main():
    pagina = (APP / "shell.part.html").read_text(encoding="utf-8")

    for plaatshouder, (bestand, voor, na) in VULLING.items():
        if pagina.count(plaatshouder) != 1:
            raise SystemExit(
                f"{plaatshouder} komt {pagina.count(plaatshouder)}x voor in "
                "shell.part.html, verwacht precies 1x."
            )
        pagina = pagina.replace(
            plaatshouder, voor + (APP / bestand).read_text(encoding="utf-8") + na
        )

    # Vangnet: als de plakkerij misgaat, moet dat hier stuklopen en niet pas in
    # de browser. Een pagina zonder <script> is een dode app.
    for verplicht in ("<script>", "</script>", "<style>", "<symbol id="):
        if verplicht not in pagina:
            raise SystemExit(f"Samengestelde pagina mist {verplicht!r} — niet geschreven.")

    # Een waarschuwing bovenaan, voor als iemand (ik, over een maand) toch in
    # het samengestelde bestand begint te typen.
    kop = "<!-- Samengesteld door tools/bouw.py - bewerk de .part-bestanden. -->\n"
    doel = APP / "index.html"
    doel.write_text(kop + pagina, encoding="utf-8")
    print(f"{doel} geschreven ({len(kop + pagina):,} tekens)")


if __name__ == "__main__":
    main()
