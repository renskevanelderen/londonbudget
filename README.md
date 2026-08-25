# London Budget

Een budget-app voor mijn jaar in Londen: dashboard, uitgaven en kalender, in
één bestand, zonder account. Alles wat je invult blijft op je eigen telefoon
staan (`localStorage`) — er gaat niets naar een server.

De app zelf is Engelstalig, zodat ik hem met medestudenten kan delen. De
commentaren in de code zijn Nederlands, die zijn voor mezelf.

## Op je telefoon zetten

Open het adres in **Safari**, tik op het deel-icoon en kies **Add to Home
Screen**. Je krijgt dan het app-icoon op je beginscherm en de app opent
zonder browserbalk.

## Zelf aanpassen

De app is met opzet één bestand: gewoon `app/index.html` openen en klaar, geen
build-stap nodig om hem te *gebruiken*. Maar één bestand van 1600 regels is
lastig bewerken, dus het is opgesplitst:

    app/style.part.html    de opmaak
    app/sprite.part.html   de iconen (inline SVG)
    app/shell.part.html    de HTML-schil met drie plaatshouders
    app/script.part.js     alle werking

**Bewerk `app/index.html` nooit rechtstreeks** — die wordt overschreven.
Wijzig een `.part`-bestand en draai daarna:

    python3 tools/bouw.py

GitHub Actions doet dit bij elke push nog een keer over, zodat wat er online
staat niet stiekem kan afwijken van de bronbestanden.

## Het icoon

`app/icoon.svg` is de bron. De PNG's ernaast zijn daaruit gerenderd:

    qlmanage -t -s 180 -o /tmp/uit app/icoon.svg   # en 192, en 512

Het pondteken is een `<path>` en geen `<text>`: welk lettertype een systeem
kiest verschilt per apparaat, en een icoon dat er elders anders uitziet is
geen icoon.

## Lettertypen

Bricolage Grotesque en Fraunces, allebei onder de SIL Open Font License.
