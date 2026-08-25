#!/usr/bin/env python3
"""Eenmalige vertaalslag van het ontwerp naar het Engels.

Waarom een script en niet met de hand? Dezelfde zin staat op meerdere plekken
(categorienamen komen terug in de balken, het budgetblok, de categoriekeuze en
de transacties). Met een geordende lijst vervangingen mis je er geen.
"""

import re
from pathlib import Path

pad = Path(__file__).resolve().parent.parent / "design" / "index.html"
t = pad.read_text(encoding="utf-8")

# Volgorde telt: langere zinnen eerst, anders vervangt een los woord een stuk
# van een langere zin en klopt de rest niet meer.
vervang = [
    ('<html lang="nl">', '<html lang="en">'),
    ("<title>Londen Budget — ontwerp</title>", "<title>London Budget — design</title>"),
    ("<h1>Londen Budget</h1>", "<h1>London Budget</h1>"),
    ("Ontwerp-mockup &middot; voorbeeldcijfers &middot; nog geen werkende app",
     "Design mockup &middot; sample figures &middot; not a working app yet"),
    (">september 2026 <", ">September 2026 <"),

    # --- transacties: eerst, want ze bevatten categorienamen ---
    ("PureGym abonnement", "Gym membership"),
    ("Swapfiets maandhuur", "Bike hire — monthly"),
    ("Tesco weekboodschappen", "Tesco weekly shop"),
    ("Sainsbury's boodschappen", "Sainsbury's groceries"),
    ("Tesco boodschappen", "Tesco groceries"),
    ("Winterjas Zara", "Winter coat, Zara"),
    ("Borrel Shoreditch", "Drinks in Shoreditch"),
    ("Concert Roundhouse", "Roundhouse gig"),
    ("Huur — Hackney", "Rent — Hackney"),
    ("&middot; maanddeel", "&middot; monthly share"),

    # Deze lange voetnoot noemt woorden die verderop los vervangen worden
    # ("OV-vergoeding"), dus hij moet er eerder uit.
    ("De extra toelage is € 2.250 in één keer. In plaats van één piek in januari verdeelt de app\n      het over acht maanden, zodat je maandbudget realistisch blijft. De OV-vergoeding begint pas in oktober,\n      dus september is £ 93,50 magerder dan de maanden daarna. Werk telt per maand apart: wat je in september\n      verdient, komt bij de inkomsten van september en dus bij je &lsquo;nog te besteden&rsquo;.",
     "The one-off grant is € 2.250 paid in a single go. Instead of one spike in January, the app spreads it\n      over eight months so your monthly budget stays realistic. The travel allowance only starts in October,\n      so September is £ 93,50 leaner than the months after it. Work counts per month: whatever you earn in\n      September is added to September&rsquo;s income, and so to your &lsquo;left to spend&rsquo;."),

    # --- categorieën ---
    ("Leuke activiteiten", "Fun &amp; going out"),
    ("Gas / water / licht", "Gas / water / electricity"),
    ("Gas water licht", "gas water electricity"),
    ("IHS-zorgkosten", "IHS health surcharge"),
    ("Random kosten", "Odds &amp; ends"),
    ("Boodschappen", "Groceries"),
    ("PureGym", "Gym"),
    ("Swapfiets", "Bike &amp; transport"),
    ("Kleding", "Clothes"),
    (">Huur<", ">Rent<"),
    ('"Huur aan of uit"', '"Rent on or off"'),

    # --- hero en statkaartjes ---
    ("Nog te besteden", "Left to spend"),
    ("van je £ 1.690,57 budget &middot; nog 6 dagen", "of your £ 1.690,57 budget &middot; 6 days left"),
    (">besteed<", ">spent<"),
    ('"k">Inkomsten<', '"k">Income<'),
    ('"k">Uitgegeven<', '"k">Spent<'),
    ("Over aan eind", "Left at month end"),

    # --- balkenkaart ---
    ("Hoeveel heb je nog?", "How much is left?"),
    ("De hele balk is je maandbudget. Ingekleurd is wat je al uitgaf.",
     "The whole bar is your monthly budget. The coloured part is what you already spent."),
    ("></i>Uitgegeven<", "></i>Spent<"),
    ("></i>Nog over<", "></i>Left<"),
    ("over budget</span>", "over budget</span>"),
    ("Totaal besteed", "Total spent"),

    # --- budgetblok ---
    ("Budget van september aanpassen", "Adjust September's budget"),
    ("Elke maand staat op zichzelf. Verander je hier een bedrag, dan geldt dat\n        alleen voor september &mdash; tenzij je hem hieronder standaard maakt. Valt een kostenpost een maand weg?\n        Zet hem uit met de schakelaar; volgende maand staat hij er gewoon weer.",
     "Every month stands on its own. Change an amount here and it only applies to September &mdash;\n        unless you make it your new default below. Does a cost disappear for one month? Switch it off;\n        next month it is simply back."),
    ("+ Nieuwe kostenpost", "+ New cost"),
    ("Budget voor september", "Budget for September"),
    ("Ook standaard vanaf nu", "Make this my new default"),
    ("Aan: alle volgende maanden nemen deze bedragen over. Uit: alleen september verandert.",
     "On: every month from now on uses these amounts. Off: only September changes."),
    ('"Standaard maken aan of uit"', '"Default on or off"'),
    (">Opslaan<", ">Save<"),
    ("Al ingevoerde uitgaven blijven gewoon staan; alleen de lengte van de balken verandert mee.",
     "Expenses you already logged stay exactly where they are; only the length of the bars changes."),
    (" aan of uit\"", " on or off\""),

    # --- inkomsten ---
    ("Waar komt je geld vandaan?", "Where your money comes from"),
    ("Bedragen in euro's worden met je wisselkoers omgerekend. Elke bron heeft een eigen looptijd,\n      dus de app telt per maand alleen op wat dan binnenkomt.",
     "Euro amounts are converted using your exchange rate. Every source has its own run time, so each\n      month only counts what actually arrives."),
    ("Beursgeld", "Student grant"),
    ("Spaargeld", "Savings"),
    ("OV-vergoeding", "Travel allowance"),
    ("okt 2026 t/m maart 2027", "Oct 2026 – Mar 2027"),
    ("jan t/m aug 2027", "Jan – Aug 2027"),
    ("Extra toelage", "One-off grant"),
    (">vanaf okt<", ">from Oct<"),
    (">vanaf jan<", ">from Jan<"),
    ("elke maand", "every month"),
    (">Werk <", ">Work <"),
    ("wisselt per maand", "varies per month"),
    ("losse klussen bijhouden", "log individual jobs"),
    ("Nog niks verdiend in september", "Nothing earned in September yet"),
    ("Voeg een klus toe zodra je betaald krijgt.", "Add a job as soon as you get paid."),
    ("Zo ziet een klus eruit", "This is what a job looks like"),
    ("&middot; bijbaan café", "&middot; café shift"),
    (">Waarvoor<", ">What for<"),
    ('"Bijv. drie diensten"', '"E.g. three shifts"'),
    ("Klus toevoegen", "Add job"),
    ("Verdiend in september", "Earned in September"),
    ("Inkomsten september", "September income"),
    # --- instellingen ---
    (">Instellingen<", ">Settings<"),
    ("Pas dit aan en het hele dashboard rekent mee.", "Change these and the whole dashboard follows."),
    (">Jaar<", ">Year<"),
    (">Maand<", ">Month<"),
    ("<option>september</option>", "<option>September</option>"),
    ("Wisselkoers &mdash; € 1 =", "Exchange rate &mdash; € 1 ="),

    # --- uitgaven-tab ---
    ("<b>Eén keer invoeren.</b> Dashboard, balken en kalender werken meteen bij.",
     "<b>Enter it once.</b> Dashboard, bars and calendar all update straight away."),
    ("Uitgave toevoegen", "Add expense"),
    (">Datum<", ">Date<"),
    (">Bedrag<", ">Amount<"),
    (">Omschrijving<", ">Description<"),
    ('"Bijv. koffie bij Monmouth"', '"E.g. coffee at Monmouth"'),
    (">Categorie<", ">Category<"),
    ('class="knop">Toevoegen<', 'class="knop">Add<'),
    ("14 uitgaven &middot; £ 1.386,86 in totaal", "14 expenses &middot; £ 1.386,86 in total"),
    (">Deze week<", ">This week<"),
    (">Eerder deze maand<", ">Earlier this month<"),
    ("Totaal september", "September total"),

    # --- kalender ---
    ("<b>Je maand in één oogopslag.</b> Hoe voller de kleur, hoe meer je die dag uitgaf. Tik een dag voor de details.",
     "<b>Your month at a glance.</b> The fuller the colour, the more you spent that day. Tap a day for the details."),
    ("£ 1.386,86 uitgegeven &middot; 14 uitgaven &middot; 17 dagen zonder uitgaven",
     "£ 1.386,86 spent &middot; 14 expenses &middot; 17 days with nothing spent"),
    ("></i>Weinig<", "></i>Little<"),
    ("></i>Middel<", "></i>Some<"),
    ("></i>Veel<", "></i>A lot<"),
    ("></i>Notitie<", "></i>Note<"),
    ("Donderdag 24 september", "Thursday 24 September"),
    ('<div class="kop">Notitie</div>', '<div class="kop">Note</div>'),
    ("Vrijdag Brighton boeken — treinkaartje voor 12u koopt goedkoper.",
     "Book Brighton for Friday — train tickets are cheaper before noon."),

    # --- tabbalk en sectiecommentaar ---
    ('#i-tablijst"/></svg></span>Uitgaven<', '#i-tablijst"/></svg></span>Expenses<'),
    ('#i-tabkal"/></svg></span>Kalender<', '#i-tabkal"/></svg></span>Calendar<'),
    ("<!-- ================= UITGAVEN =================", "<!-- ================= EXPENSES ================="),
    ("<!-- ================= KALENDER =================", "<!-- ================= CALENDAR ================="),

    # --- javascript ---
    ("'nl-NL'", "'en-GB'"),
    ("return '£ ' + n.toLocaleString", "return '£' + n.toLocaleString"),
    ("parseFloat(String(t).replace(/[^0-9,.-]/g,'').replace(',', '.'))",
     "parseFloat(String(t).replace(/,/g,'').replace(/[^0-9.-]/g,''))"),
    ("'normaal ' + naarTekst(naarGetal(standaard))", "'normally ' + naarTekst(naarGetal(standaard))"),
    ("'valt weg in september'", "'not counted in September'"),
]

for oud, nieuw in vervang:
    if oud not in t:
        raise SystemExit(f"niet gevonden, script stopt: {oud[:70]!r}")
    t = t.replace(oud, nieuw)


# --- getalnotatie: Nederlands 1.690,57 wordt Brits 1,690.57 ---
def britse_bedragen(m):
    teken, heel, decimalen = m.group(1), m.group(2).replace(".", ""), m.group(3)
    heel = f"{int(heel):,}"
    return f"{teken}{heel}.{decimalen}" if decimalen else f"{teken}{heel}"


t = re.sub(r"([£€])\s?(\d[\d.]*?)(?:,(\d{2}))?(?![\d.,])", britse_bedragen, t)
# Losse bedragen achter een schuine streep ("£ 162,65 / 250") en in invoervelden.
t = re.sub(r"/ (\d+),(\d{2})", r"/ \1.\2", t)
t = re.sub(r'(value|data-standaard)="(\d+),(\d{2})"', r'\1="\2.\3"', t)

# --- datums ---
t = t.replace("25-09-2026", "25/09/2026")
t = re.sub(r"\b(\d{1,2}) sep\b", r"\1 Sep", t)

# --- kalenderkoppen: maandag t/m zondag wordt Monday t/m Sunday ---
oude_kop = ('<div class="kalkop">M</div><div class="kalkop">D</div><div class="kalkop">W</div>\n'
            '      <div class="kalkop">D</div><div class="kalkop">V</div><div class="kalkop">Z</div>'
            '<div class="kalkop">Z</div>')
nieuwe_kop = ('<div class="kalkop">M</div><div class="kalkop">T</div><div class="kalkop">W</div>\n'
              '      <div class="kalkop">T</div><div class="kalkop">F</div><div class="kalkop">S</div>'
              '<div class="kalkop">S</div>')
if oude_kop not in t:
    raise SystemExit("kalenderkoppen niet gevonden")
t = t.replace(oude_kop, nieuwe_kop)

pad.write_text(t, encoding="utf-8")
print("vertaald:", pad)
