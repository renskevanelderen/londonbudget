/* =====================================================================
   London Budget — de werkende app.

   Alles staat in dit ene bestand: geen server, geen account, geen build.
   Je gegevens blijven in localStorage op dit toestel staan.

   De opzet is bewust saai: er is één `st` met alles erin, elke wijziging
   gaat via `bewaar()`, en daarna tekent `tekenAlles()` het scherm opnieuw
   uit die ene bron. Zo kunnen dashboard, lijst en kalender niet uit elkaar
   gaan lopen, want ze lezen alle drie hetzelfde.
   ===================================================================== */

/* ---------------------------------------------------------------
   1. Vaste gegevens: de categorieën en de inkomstenbronnen.
   Elke categorie draagt haar eigen kleuren mee, zodat het icoon, het
   balkje en de kalender vanzelf bij elkaar passen.
   --------------------------------------------------------------- */
var CATEGORIEEN = [
  {id:'huur',  naam:'Rent',                      icoon:'i-huur',  zacht:'#FCE3DA', icoonkleur:'var(--huur)', balk:'var(--huur)', bedrag:750},
  {id:'bood',  naam:'Groceries',                 icoon:'i-bood',  zacht:'#D6F0EE', icoonkleur:'var(--bood)', balk:'var(--bood)', bedrag:250},
  {id:'leuk',  naam:'Fun & going out',           icoon:'i-leuk',  zacht:'#FFD9E7', icoonkleur:'var(--leuk)', balk:'var(--leuk)', bedrag:300},
  {id:'kled',  naam:'Clothes',                   icoon:'i-kled',  zacht:'#EBDCFB', icoonkleur:'var(--kled)', balk:'var(--kled)', bedrag:100},
  {id:'gwl',   naam:'Gas / water / electricity', icoon:'i-gwl',   zacht:'#FCEBCB', icoonkleur:'#C98600',     balk:'var(--gwl)',  bedrag:75},
  {id:'gym',   naam:'Gym',                       icoon:'i-gym',   zacht:'#E6F0C4', icoonkleur:'#6F8C00',     balk:'var(--gym)',  bedrag:24},
  {id:'fiets', naam:'Bike & transport',          icoon:'i-swap',  zacht:'#FBEEC0', icoonkleur:'#B08A00',     balk:'var(--swap)', bedrag:16.90},
  {id:'wifi',  naam:'Wifi',                      icoon:'i-wifi',  zacht:'#DCF2DE', icoonkleur:'#3E9E4A',     balk:'var(--wifi)', bedrag:10},
  {id:'rnd',   naam:'Odds & ends',               icoon:'i-rnd',   zacht:'#E7DCE8', icoonkleur:'var(--rnd)',  balk:'var(--rnd)',  bedrag:100},
  {id:'ihs',   naam:'IHS health surcharge',      icoon:'i-ihs',   zacht:'#FBDFE4', icoonkleur:'#D25A72',     balk:'var(--ihs)',  bedrag:64.67}
];

/* `van` en `tot` zijn maandsleutels. Een bron telt alleen mee in de maanden
   binnen haar looptijd; daarbuiten staat ze vanzelf uit. Zo hoef je in
   september niets te doen om de OV-vergoeding weg te houden.

   De bedragen staan hier met opzet op 0. Deze code staat openbaar op GitHub,
   en wat iemand aan beurs of spaargeld heeft hoort niet in een publiek
   bestand. Je vult ze één keer in op je eigen telefoon (tik op Income op het
   dashboard); vanaf dan staan ze in localStorage en komen ze nergens anders.
   Voor een medestudent die de app opent is dit trouwens ook het juiste
   beginpunt: die wil zijn eigen bedragen zien, niet die van mij. */
var BRONNEN = [
  {id:'beurs', naam:'Student grant',   icoon:'i-beurs', zacht:'#EBDCFB', icoonkleur:'var(--kled)', valuta:'EUR', bedrag:0, van:null,      tot:null},
  {id:'spaar', naam:'Savings',         icoon:'i-spaar', zacht:'#D6F0EE', icoonkleur:'var(--bood)', valuta:'EUR', bedrag:0, van:null,      tot:null},
  {id:'ov',    naam:'Travel allowance',icoon:'i-ov',    zacht:'#FCEBCB', icoonkleur:'#C98600',     valuta:'EUR', bedrag:0, van:'2026-10', tot:'2027-03'},
  {id:'extra', naam:'One-off grant',   icoon:'i-extra', zacht:'#FFD9E7', icoonkleur:'var(--leuk)', valuta:'EUR', bedrag:0, van:'2027-01', tot:'2027-08'},
  {id:'werk',  naam:'Work',            icoon:'i-werk',  zacht:'#E7DCE8', icoonkleur:'var(--rnd)',  valuta:'GBP', bedrag:0, van:null,      tot:null, afgeleid:true}
];

/* Nieuwe posten die jij zelf verzint krijgen om de beurt een kleur, zodat
   ze niet allemaal grijs worden. Dit is óók de kleurkiezer in het bewerkvak.

   Elke regel is één samenhangend setje: het zachte vlak achter het icoon, de
   kleur van het icoon zelf en de kleur van het balkje op het dashboard. Ze
   staan bij elkaar omdat ze bij elkaar horen — kon je ze los kiezen, dan was
   een lichtroze balk bij een dieppaars icoon een kwestie van tijd.

   De tien kleuren zijn precies die van de standaardposten hierboven, zodat een
   bestaande post altijd een bolletje in deze rij heeft dat aan staat. */
var PALET = [
  {naam:'Coral',  zacht:'#FCE3DA', icoonkleur:'var(--huur)', balk:'var(--huur)'},
  {naam:'Teal',   zacht:'#D6F0EE', icoonkleur:'var(--bood)', balk:'var(--bood)'},
  {naam:'Pink',   zacht:'#FFD9E7', icoonkleur:'var(--leuk)', balk:'var(--leuk)'},
  {naam:'Purple', zacht:'#EBDCFB', icoonkleur:'var(--kled)', balk:'var(--kled)'},
  {naam:'Amber',  zacht:'#FCEBCB', icoonkleur:'#C98600',     balk:'var(--gwl)'},
  {naam:'Olive',  zacht:'#E6F0C4', icoonkleur:'#6F8C00',     balk:'var(--gym)'},
  {naam:'Yellow', zacht:'#FBEEC0', icoonkleur:'#B08A00',     balk:'var(--swap)'},
  {naam:'Green',  zacht:'#DCF2DE', icoonkleur:'#3E9E4A',     balk:'var(--wifi)'},
  {naam:'Mauve',  zacht:'#E7DCE8', icoonkleur:'var(--rnd)',  balk:'var(--rnd)'},
  {naam:'Rose',   zacht:'#FBDFE4', icoonkleur:'#D25A72',     balk:'var(--ihs)'}
];

/* Een nieuwe post krijgt een neutraal icoon en geen gok. Eerder hing het icoon
   aan de kleur die hij toevallig kreeg, en dan staat er een huisje bij "Books".
   Fout raden is hier erger dan niets zeggen, en je kunt het icoon nu zelf
   kiezen in het bewerkvak. */
var STANDAARDICOON = 'i-rnd';

/* De eerste kleur die nog niemand heeft. Simpelweg doortellen ging mis zodra
   er evenveel posten als kleuren waren: de nieuwe kreeg dan dezelfde kleur als
   de eerste in de lijst. Zijn ze allemaal bezet, dan telt hij alsnog door —
   dan is dubbel onvermijdelijk. */
function vrijeKleur(lijst){
  for(var i = 0; i < PALET.length; i++){
    var bezet = lijst.some(function(x){ return x.zacht === PALET[i].zacht; });
    if(!bezet) return PALET[i];
  }
  return PALET[lijst.length % PALET.length];
}

/* De iconen die je aan een post kunt hangen. Alleen de inhoudelijke: de
   pijltjes, tabbladen en het prullenbakje uit de sprite horen bij de app zelf
   en zeggen niets over een kostenpost. */
var ICONEN = ['i-huur','i-bood','i-leuk','i-swap','i-ov','i-gwl','i-gym','i-wifi',
              'i-kled','i-ihs','i-beurs','i-spaar','i-extra','i-werk','i-rnd'];

/* Welk bolletje in de kleurkiezer staat aan? Een post bewaart geen index maar
   de kleuren zelf — dat was al zo voordat er een kiezer was, en het omzetten
   zou de opslag van iedereen die de app al gebruikt moeten verbouwen. We
   zoeken de kleur dus terug op het zachte vlak, dat per palet-regel uniek is. */
function paletIndexVan(item){
  for(var i = 0; i < PALET.length; i++) if(PALET[i].zacht === item.zacht) return i;
  return -1;
}

var MAANDEN = ['January','February','March','April','May','June',
               'July','August','September','October','November','December'];
var DAGEN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

/* ---------------------------------------------------------------
   2. Opslag
   --------------------------------------------------------------- */
var SLEUTEL = 'londonbudget.v1';
var st, gekozenMaand, gekozenDag = null, bewerktId = null;

/* Welk bewerkvak onder een rij openstaat: {soort, id}, of null.

   Eén variabele voor de hele app, dus er kan er maar één tegelijk open zijn.
   Dat is expres: twee opengeklapte vakken maken de lijst onleesbaar, en je
   bent toch met één post tegelijk bezig. Open je een tweede, dan klapt de
   eerste vanzelf dicht. */
var openBewerk = null;

function zoekOp(lijst, id){
  return lijst.filter(function(x){ return x.id === id; })[0] || null;
}

function verseStaat(){
  return {
    versie: 1,
    koers: 0.85,
    categorieen: CATEGORIEEN.map(function(c){ return kopie(c); }),
    bronnen: BRONNEN.map(function(b){ return kopie(b); }),
    maanden: {},          /* "2026-09": {budget:{bedrag:{},stand:{}}, inkomen:{...}} */
    uitgaven: [],
    klussen: [],
    notities: {}
  };
}

function kopie(o){ return JSON.parse(JSON.stringify(o)); }

function laad(){
  try{
    var rauw = localStorage.getItem(SLEUTEL);
    if(!rauw) return verseStaat();
    var g = JSON.parse(rauw);
    if(!g || g.versie !== 1) return verseStaat();

    /* Nieuwe vaste categorieën of bronnen uit een latere versie van de app
       voegen we toe zonder jouw bedragen aan te raken. */
    CATEGORIEEN.forEach(function(c){
      if(!g.categorieen.some(function(x){ return x.id === c.id; })) g.categorieen.push(kopie(c));
    });
    BRONNEN.forEach(function(b){
      if(!g.bronnen.some(function(x){ return x.id === b.id; })) g.bronnen.push(kopie(b));
    });
    return g;
  }catch(e){
    /* Liever opnieuw beginnen dan vastlopen op kapotte opslag. */
    return verseStaat();
  }
}

function bewaar(){
  try{ localStorage.setItem(SLEUTEL, JSON.stringify(st)); }
  catch(e){ meld('Could not save — your phone storage may be full'); }
}

/* ---------------------------------------------------------------
   3. Kleine hulpjes: geld en datums
   --------------------------------------------------------------- */
function naarGetal(t){
  var n = parseFloat(String(t).replace(/,/g,'').replace(/[^0-9.-]/g,''));
  return isFinite(n) ? n : 0;
}
function pond(n){
  return '£' + (n<0?-n:n).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2});
}
function pondMin(n){ return (n<0?'-':'') + pond(n); }
function euro(n){
  return '€' + n.toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2});
}
function tweeCijfers(n){ return (n<10?'0':'') + n; }

function maandSleutel(d){ return d.getFullYear() + '-' + tweeCijfers(d.getMonth()+1); }
function sleutelNaarDelen(s){ return {jaar:+s.slice(0,4), maand:+s.slice(5,7)}; }
function maandNaam(s){ var d = sleutelNaarDelen(s); return MAANDEN[d.maand-1]; }
function maandVol(s){ var d = sleutelNaarDelen(s); return MAANDEN[d.maand-1] + ' ' + d.jaar; }
function maandOpschuiven(s, stappen){
  var d = sleutelNaarDelen(s);
  var m = d.maand - 1 + stappen;
  var jaar = d.jaar + Math.floor(m/12);
  var maand = ((m % 12) + 12) % 12;
  return jaar + '-' + tweeCijfers(maand+1);
}
function dagSleutel(jaar, maand, dag){ return jaar + '-' + tweeCijfers(maand) + '-' + tweeCijfers(dag); }
function dagenInMaand(s){ var d = sleutelNaarDelen(s); return new Date(d.jaar, d.maand, 0).getDate(); }

/* Invoer is dd/mm/jjjj (Brits), opslag is jjjj-mm-dd (sorteerbaar). */
function leesDatum(t){
  var m = String(t).trim().match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if(!m) return null;
  var dag = +m[1], maand = +m[2], jaar = +m[3];
  if(maand < 1 || maand > 12) return null;
  if(dag < 1 || dag > new Date(jaar, maand, 0).getDate()) return null;
  return dagSleutel(jaar, maand, dag);
}
function toonDatum(s){
  return s.slice(8,10) + '/' + s.slice(5,7) + '/' + s.slice(0,4);
}
function kortDatum(s){
  return (+s.slice(8,10)) + ' ' + MAANDEN[+s.slice(5,7)-1].slice(0,3);
}
function vandaagSleutel(){
  var d = new Date();
  return dagSleutel(d.getFullYear(), d.getMonth()+1, d.getDate());
}
function ontsnap(t){
  return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function nieuwId(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

/* ---------------------------------------------------------------
   4. Afgeleide cijfers — alles rekent uit `st`, niets staat dubbel
   --------------------------------------------------------------- */
function maandVak(sleutel, soort){
  if(!st.maanden[sleutel]) st.maanden[sleutel] = {};
  if(!st.maanden[sleutel][soort]) st.maanden[sleutel][soort] = {bedrag:{}, stand:{}};
  var v = st.maanden[sleutel][soort];
  if(!v.bedrag) v.bedrag = {};
  if(!v.stand)  v.stand  = {};
  return v;
}

function binnenLooptijd(b, sleutel){
  if(b.van && sleutel < b.van) return false;
  if(b.tot && sleutel > b.tot) return false;
  return true;
}

/* Het budget van een maand: standaardbedrag, tenzij je het voor die maand
   hebt overschreven; aan, tenzij je het voor die maand hebt uitgezet. */
function budgetVanMaand(sleutel){
  var vak = maandVak(sleutel, 'budget');
  return st.categorieen.map(function(c){
    var aan = vak.stand[c.id] !== undefined ? vak.stand[c.id] : true;
    return {
      cat: c,
      standaard: c.bedrag,
      bedrag: vak.bedrag[c.id] !== undefined ? vak.bedrag[c.id] : c.bedrag,
      aan: aan
    };
  });
}

function inkomstenVanMaand(sleutel){
  var vak = maandVak(sleutel, 'inkomen');
  return st.bronnen.map(function(b){
    var standaardAan = b.afgeleid ? true : binnenLooptijd(b, sleutel);
    var aan = vak.stand[b.id] !== undefined ? vak.stand[b.id] : standaardAan;
    var bedrag = b.afgeleid ? werkVanMaand(sleutel) : (vak.bedrag[b.id] !== undefined ? vak.bedrag[b.id] : b.bedrag);
    return {
      bron: b,
      standaard: b.bedrag,
      standaardAan: standaardAan,
      bedrag: bedrag,
      inPond: b.valuta === 'EUR' ? bedrag * st.koers : bedrag,
      aan: aan
    };
  });
}

function uitgavenVanMaand(sleutel){
  return st.uitgaven.filter(function(u){ return u.datum.slice(0,7) === sleutel; })
                    .sort(function(a,b){ return a.datum < b.datum ? 1 : a.datum > b.datum ? -1 : 0; });
}
function klussenVanMaand(sleutel){
  return st.klussen.filter(function(k){ return k.datum.slice(0,7) === sleutel; })
                   .sort(function(a,b){ return a.datum < b.datum ? 1 : -1; });
}
function werkVanMaand(sleutel){
  return klussenVanMaand(sleutel).reduce(function(t,k){ return t + k.bedrag; }, 0);
}

/* Een uitgave mag in euro's of in ponden ingevoerd zijn. Overal waar met een
   uitgave gerékend wordt, gaat het door deze ene functie heen — dan kan er
   nergens per ongeluk een euro als pond meegeteld worden. Uitgaven zonder
   valuta komen uit een oudere versie en waren altijd in ponden. */
function uitInPond(u){
  return u.valuta === 'EUR' ? u.bedrag * st.koers : u.bedrag;
}

function cijfersVanMaand(sleutel){
  var budget = budgetVanMaand(sleutel);
  var inkomen = inkomstenVanMaand(sleutel);
  var uitgaven = uitgavenVanMaand(sleutel);

  var perCat = {};
  uitgaven.forEach(function(u){ perCat[u.cat] = (perCat[u.cat] || 0) + uitInPond(u); });

  var budgetSom  = budget.filter(function(r){ return r.aan; })
                         .reduce(function(t,r){ return t + r.bedrag; }, 0);
  var inkomenSom = inkomen.filter(function(r){ return r.aan; })
                          .reduce(function(t,r){ return t + r.inPond; }, 0);
  var uitSom     = uitgaven.reduce(function(t,u){ return t + uitInPond(u); }, 0);

  return {
    sleutel: sleutel, budget: budget, inkomen: inkomen, uitgaven: uitgaven, perCat: perCat,
    budgetSom: budgetSom, inkomenSom: inkomenSom, uitSom: uitSom,
    teBesteden: budgetSom - uitSom,
    overAanEind: inkomenSom - uitSom
  };
}

/* ---------------------------------------------------------------
   5. Tekenen
   --------------------------------------------------------------- */
function $(id){ return document.getElementById(id); }

function tekenAlles(){
  var c = cijfersVanMaand(gekozenMaand);
  document.querySelectorAll('.dezemaand').forEach(function(el){
    el.textContent = el.tagName === 'H2' ? maandVol(gekozenMaand) : maandNaam(gekozenMaand);
  });
  $('maandlabel').textContent = maandVol(gekozenMaand);
  tekenHero(c);
  tekenBalken(c);
  tekenBudgetrijen(c);
  tekenBronnen(c);
  tekenKlussen(c);
  tekenInkomstenrijen(c);
  tekenPosten(c);
  tekenKalender(c);
  vulCategorieKeuze();
  toonMuntUitleg();
  $('koers').value = st.koers.toFixed(2);
}

function tekenHero(c){
  $('heroBedrag').textContent = pondMin(c.teBesteden);

  var deel = c.budgetSom > 0 ? c.uitSom / c.budgetSom : 0;
  var procent = Math.round(deel * 100);
  var omtrek = 2 * Math.PI * 48;
  var vol = Math.min(deel, 1) * omtrek;
  $('ringBoog').setAttribute('stroke-dasharray', vol.toFixed(1) + ' ' + omtrek.toFixed(1));
  $('ringBoog').setAttribute('stroke', deel > 1 ? '#FF6685' : '#D8F34B');
  $('ringTekst').textContent = procent + '%';

  /* "Nog x dagen" slaat alleen ergens op in de maand waar je nú in zit. */
  var vandaag = vandaagSleutel();
  var staart;
  if(vandaag.slice(0,7) === c.sleutel){
    var over = dagenInMaand(c.sleutel) - (+vandaag.slice(8,10));
    staart = over === 0 ? 'last day of the month' : over + ' day' + (over===1?'':'s') + ' left';
  } else {
    staart = '';
  }
  /* Het staartje krijgt zijn eigen regel-eenheid, anders zakt bij een lang
     budgetbedrag alleen het woord "left" naar de volgende regel. */
  $('heroKlein').innerHTML = 'of your ' + pond(c.budgetSom) + ' budget' +
    (staart ? ' <span class="nowrap">&middot; ' + staart + '</span>' : '');

  $('statInkomen').textContent = pond(c.inkomenSom);
  $('statBudget').textContent  = pond(c.budgetSom);
  $('statUit').textContent     = pond(c.uitSom);
  $('statOver').textContent    = pondMin(c.overAanEind);
}

function tekenBalken(c){
  var doel = $('balken');
  /* Een categorie hoort in de lijst als je er budget voor hebt óf geld aan
     hebt uitgegeven — een uitgezette post waar je tóch iets aan uitgaf mag
     je niet stilletjes verstoppen. */
  var rijen = c.budget.filter(function(r){
    return (r.aan && r.bedrag > 0) || (c.perCat[r.cat.id] > 0);
  });

  if(!rijen.length){
    doel.innerHTML = '<div class="legekaart"><div class="groot">No budget set yet</div>' +
      '<div class="klein">Open <b>Change your budget</b> below to fill in what you want to spend each month.</div></div>';
    $('balkenTotaal').textContent = pond(c.uitSom);
    return;
  }

  doel.innerHTML = rijen.map(function(r){
    var uit = c.perCat[r.cat.id] || 0;
    var budget = r.aan ? r.bedrag : 0;
    var over = uit - budget;
    var breedte = budget > 0 ? Math.min(uit / budget * 100, 100) : (uit > 0 ? 100 : 0);
    var teVeel = over > 0.005;

    var kopCijfers = '<b>' + pond(uit) + '</b> / ' + (r.aan ? pond(budget).replace('£','') : 'off');
    var baan = teVeel
      ? '<div class="baan overschreden"><i style="width:100%"></i></div>' +
        '<span class="badge-over">' + pond(over) + ' over budget</span>'
      : '<div class="baan" style="background:' + r.cat.zacht + '"><i style="width:' +
        breedte.toFixed(1) + '%;background:' + r.cat.balk + '"></i></div>';

    return '<div class="cat' + (teVeel ? ' rood' : '') + '">' +
      '<div class="catkop"><span class="ic" style="background:' + r.cat.zacht + ';color:' + r.cat.icoonkleur + '">' +
        '<svg><use href="#' + r.cat.icoon + '"/></svg></span>' +
      '<span class="naam">' + ontsnap(r.cat.naam) + '</span>' +
      '<span class="cijfers">' + kopCijfers + '</span></div>' + baan + '</div>';
  }).join('');

  $('balkenTotaal').textContent = pond(c.uitSom);
}

/* Het uitklapvak onder een rij: naam, kleur, icoon, looptijd en weghalen.
   Het staat als broertje ná de rij in dezelfde houder, zodat het meeschuift
   als de lijst opnieuw wordt opgebouwd. */
function bewerkHtml(item, soort){
  if(!openBewerk || openBewerk.soort !== soort || openBewerk.id !== item.id) return '';
  var gekozen = paletIndexVan(item);

  var h = '<div class="rijbewerk" data-bewerk="' + item.id + '">' +
    '<label class="veld"><span>Name</span>' +
      '<input class="hernoem" value="' + ontsnap(item.naam) + '" placeholder="Name"></label>' +
    '<div class="veld"><span>Colour</span><div class="kleurkeuze">' +
      PALET.map(function(k, i){
        return '<button type="button" class="kleurknop' + (i === gekozen ? ' aan' : '') +
          '" data-kleur="' + i + '" style="background:' + k.balk + '" aria-label="' + k.naam + '"></button>';
      }).join('') +
    '</div></div>' +
    '<div class="veld"><span>Icon</span><div class="icoonkeuze">' +
      ICONEN.map(function(ic){
        return '<button type="button" class="icoonknop' + (ic === item.icoon ? ' aan' : '') +
          '" data-icoon="' + ic + '" aria-label="Icon"><svg><use href="#' + ic + '"/></svg></button>';
      }).join('') +
    '</div></div>';

  /* Alleen inkomsten hebben een looptijd. De bijbaan valt erbuiten: die telt
     mee zodra je diensten invult, dus een periode zou daar niets sturen. */
  if(soort === 'inkomen' && !item.afgeleid){
    h += '<div class="veld"><span>Period &mdash; leave empty for every month</span>' +
      '<div class="tweekolom">' +
        '<input type="month" class="vanaf" value="' + (item.van || '') + '" aria-label="From which month">' +
        '<input type="month" class="totmet" value="' + (item.tot || '') + '" aria-label="Up to and including which month">' +
      '</div>' +
      '<p class="uitleg">Outside these months the source simply does not count.</p></div>';
  }

  h += '<div class="knoprij"><button type="button" class="knop klein rijklaar">Done</button>' +
    (item.afgeleid ? '' : '<button type="button" class="knop gevaar klein rijweg">Delete</button>') +
    '</div></div>';
  return h;
}

function tekenBudgetrijen(c){
  $('budgetrijen').innerHTML = c.budget.map(function(r){
    var afwijkend = r.aan && Math.abs(r.bedrag - r.standaard) > 0.005;
    var onder = !r.aan ? 'not counted in ' + maandNaam(c.sleutel)
              : afwijkend ? 'normally ' + pond(r.standaard) : '';
    var open = openBewerk && openBewerk.soort === 'budget' && openBewerk.id === r.cat.id;
    return '<div class="budgetrij' + (r.aan ? '' : ' uitgezet') + (afwijkend ? ' gewijzigd' : '') +
             (open ? ' openbewerk' : '') + '" data-id="' + r.cat.id + '">' +
      '<button type="button" class="ic" style="background:' + r.cat.zacht + ';color:' + r.cat.icoonkleur +
        '" aria-label="Rename or delete ' + ontsnap(r.cat.naam) + '">' +
        '<svg><use href="#' + r.cat.icoon + '"/></svg></button>' +
      '<span class="tekst"><button type="button" class="naam">' + ontsnap(r.cat.naam) + '</button>' +
        '<div class="standaard">' + onder + '</div></span>' +
      '<input inputmode="decimal" value="' + r.bedrag.toFixed(2) + '" aria-label="' + ontsnap(r.cat.naam) + ' budget">' +
      '<button class="schakel' + (r.aan ? ' aan' : '') + '" aria-label="' + ontsnap(r.cat.naam) + ' on or off"></button>' +
    '</div>' + bewerkHtml(r.cat, 'budget');
  }).join('');
  $('budgetsom').textContent = pond(c.budgetSom);
}

function tekenBronnen(c){
  $('bronnen').innerHTML = c.inkomen.filter(function(r){ return !r.bron.afgeleid; }).map(function(r){
    var b = r.bron;
    var looptijd = b.van || b.tot
      ? (b.van ? maandNaam(b.van).slice(0,3) + ' ' + b.van.slice(0,4) : 'until') +
        (b.tot ? ' – ' + maandNaam(b.tot).slice(0,3) + ' ' + b.tot.slice(0,4) : ' onwards') +
        ' · ' + (b.valuta === 'EUR' ? euro(r.bedrag) : pond(r.bedrag)) + ' p/m'
      : 'every month';
    var rechts = r.aan
      ? '<div class="pond">' + pond(r.inPond) + '</div>' +
        (b.valuta === 'EUR' ? '<div class="euro">' + euro(r.bedrag) + '</div>' : '')
      : '<div class="pond">' + (b.van && c.sleutel < b.van ? 'from ' + maandNaam(b.van).slice(0,3) : 'not this month') + '</div>';

    return '<div class="bron' + (r.aan ? '' : ' uit') + '">' +
      '<span class="ic" style="background:' + b.zacht + ';color:' + b.icoonkleur + '">' +
        '<svg><use href="#' + b.icoon + '"/></svg></span>' +
      '<span class="tekst"><span class="naam">' + ontsnap(b.naam) + '</span>' +
        '<span class="looptijd">' + looptijd + '</span></span>' +
      '<span class="geld">' + rechts + '</span></div>';
  }).join('');

  var werk = c.inkomen.filter(function(r){ return r.bron.afgeleid; })[0];
  $('werkKop').textContent = pond(werk ? werk.inPond : 0);
  $('inkomenTotaal').textContent = pond(c.inkomenSom);

  /* Alleen bij écht nul, niet bij een lege maand: staat je beurs ingevuld maar
     valt deze maand buiten elke looptijd, dan is 0 een juist antwoord en heb
     je geen aanwijzing nodig. Daarom kijken we naar de ingevulde bedragen en
     niet naar het maandtotaal. */
  var nooitIetsIngevuld = st.bronnen.every(function(b){
    return b.afgeleid || !b.bedrag;
  });
  $('inkomenLeeg').hidden = !nooitIetsIngevuld;

  /* De voetnoot legt uit waaróm dit maandbedrag zo is; dat verschilt per
     maand, dus schrijven we hem hier op maat. */
  var stukjes = [];
  c.inkomen.forEach(function(r){
    var b = r.bron;
    if(b.afgeleid || r.aan) return;
    if(b.van && c.sleutel < b.van)
      stukjes.push(ontsnap(b.naam) + ' only starts in ' + maandNaam(b.van) + ' ' + b.van.slice(0,4));
    else if(b.tot && c.sleutel > b.tot)
      stukjes.push(ontsnap(b.naam) + ' stopped after ' + maandNaam(b.tot) + ' ' + b.tot.slice(0,4));
  });
  $('inkomenVoetnoot').innerHTML =
    'Work counts per month: whatever you earn in ' + maandNaam(c.sleutel) +
    ' is added to this month&rsquo;s income, and so to your &lsquo;left to spend&rsquo;.' +
    (stukjes.length ? ' This month is leaner because ' + stukjes.join(', and ') + '.' : '');
}

function tekenKlussen(c){
  var lijst = klussenVanMaand(c.sleutel);
  var doel = $('klussen');
  if(!lijst.length){
    doel.innerHTML = '<div class="werkleeg"><div class="groot">Nothing earned in ' +
      maandNaam(c.sleutel) + ' yet</div>' +
      '<div class="klein">Add a job as soon as you get paid.</div></div>';
  } else {
    doel.innerHTML = lijst.map(function(k){
      return '<div class="klus" data-id="' + k.id + '">' +
        '<span class="tekst"><div class="wie">' + ontsnap(k.oms) + '</div>' +
          '<div class="wanneer">' + kortDatum(k.datum) + '</div></span>' +
        '<span class="op">' + pond(k.bedrag) + '</span>' +
        '<button class="klusweg" aria-label="Delete this job"><svg><use href="#i-prullenbak"/></svg></button>' +
      '</div>';
    }).join('');
  }
  $('werkTotaal').textContent = pond(werkVanMaand(c.sleutel));
}

function tekenInkomstenrijen(c){
  $('inkomstenrijen').innerHTML = c.inkomen.map(function(r){
    var b = r.bron;
    var afwijkend = r.aan && !b.afgeleid && Math.abs(r.bedrag - r.standaard) > 0.005;
    var regel;
    if(!r.aan)          regel = 'not counted in ' + maandNaam(c.sleutel);
    else if(b.afgeleid) regel = 'from the jobs you logged';
    else if(b.valuta === 'EUR') regel = '= ' + pond(r.inPond);
    else                regel = '';
    if(afwijkend) regel += (regel ? ' · ' : '') + 'normally ' +
      (b.valuta === 'EUR' ? euro(r.standaard) : pond(r.standaard));

    var open = openBewerk && openBewerk.soort === 'inkomen' && openBewerk.id === b.id;

    return '<div class="budgetrij inkomstenrij' + (r.aan ? '' : ' uitgezet') + (afwijkend ? ' gewijzigd' : '') +
             (open ? ' openbewerk' : '') + '" data-id="' + b.id + '">' +
      '<button type="button" class="ic" style="background:' + b.zacht + ';color:' + b.icoonkleur +
        '" aria-label="Rename or delete ' + ontsnap(b.naam) + '">' +
        '<svg><use href="#' + b.icoon + '"/></svg></button>' +
      '<span class="tekst"><button type="button" class="naam">' + ontsnap(b.naam) + '</button>' +
        '<div class="omgerekend">' + regel + '</div></span>' +
      '<span class="munt">' + (b.valuta === 'EUR' ? '€' : '£') + '</span>' +
      '<input inputmode="decimal" value="' + r.bedrag.toFixed(2) + '"' +
        (b.afgeleid ? ' readonly' : '') + ' aria-label="' + ontsnap(b.naam) + ' amount">' +
      '<button class="schakel' + (r.aan ? ' aan' : '') + '" aria-label="' + ontsnap(b.naam) + ' on or off"></button>' +
    '</div>' + bewerkHtml(b, 'inkomen');
  }).join('');
  $('inkomstensom').textContent = pond(c.inkomenSom);
}

function catVan(id){
  return st.categorieen.filter(function(c){ return c.id === id; })[0] ||
         {id:id, naam:'Unknown', icoon:'i-rnd', zacht:'#E7DCE8', icoonkleur:'var(--rnd)', balk:'var(--rnd)'};
}

function postHtml(u, metDatum){
  var cat = catVan(u.cat);
  var onder = (metDatum ? kortDatum(u.datum) + ' · ' : '') + ontsnap(cat.naam);
  /* Bij een euro-uitgave staat rechts het omgerekende pondbedrag; wat je
     werkelijk betaalde hoort er dan bij, anders herken je hem niet terug. */
  if(u.valuta === 'EUR') onder += ' · ' + euro(u.bedrag);
  return '<div class="post" data-id="' + u.id + '">' +
    '<button class="postrij" type="button" aria-expanded="false">' +
      '<span class="ic" style="background:' + cat.zacht + ';color:' + cat.icoonkleur + '">' +
        '<svg><use href="#' + cat.icoon + '"/></svg></span>' +
      '<span class="tekst"><div class="oms">' + ontsnap(u.oms) + '</div>' +
        '<div class="cat2">' + onder + '</div></span>' +
      '<span class="bedrag">' + pond(uitInPond(u)) + '</span>' +
      '<span class="pijl"><svg><use href="#i-chevron"/></svg></span></button>' +
    '<div class="postacties">' +
      '<button type="button" class="wijzig"><svg><use href="#i-potlood"/></svg>Edit</button>' +
      '<button type="button" class="weg"><svg><use href="#i-prullenbak"/></svg>Delete</button>' +
    '</div></div>';
}

function tekenPosten(c){
  var doel = $('postenlijst');
  if(!c.uitgaven.length){
    doel.innerHTML = '<div class="legekaart"><div class="groot">Nothing logged in ' +
      maandNaam(c.sleutel) + '</div>' +
      '<div class="klein">Add your first expense with the form above.</div></div>';
  } else {
    /* Deze week apart zetten helpt alleen als je in de huidige maand kijkt. */
    var vandaag = vandaagSleutel();
    var grens = null;
    if(vandaag.slice(0,7) === c.sleutel){
      var d = new Date(vandaag);
      d.setDate(d.getDate() - 6);
      grens = dagSleutel(d.getFullYear(), d.getMonth()+1, d.getDate());
    }
    var recent = grens ? c.uitgaven.filter(function(u){ return u.datum >= grens; }) : [];
    var ouder  = grens ? c.uitgaven.filter(function(u){ return u.datum <  grens; }) : c.uitgaven;

    var h = '';
    if(recent.length) h += '<div class="dagkop2">This week</div>' + recent.map(function(u){ return postHtml(u,true); }).join('');
    if(ouder.length)  h += '<div class="dagkop2">' + (recent.length ? 'Earlier this month' : 'This month') + '</div>' +
                           ouder.map(function(u){ return postHtml(u,true); }).join('');
    doel.innerHTML = h;
  }
  $('aantalposten').textContent = c.uitgaven.length;
  $('somposten').textContent = pond(c.uitSom);
  $('somtotaal').textContent = pond(c.uitSom);
}

function tekenKalender(c){
  var d = sleutelNaarDelen(c.sleutel);
  var eerste = new Date(d.jaar, d.maand-1, 1);
  var aantal = dagenInMaand(c.sleutel);
  /* Maandag als eerste kolom: JS geeft zondag=0, dus even omrekenen. */
  var start = (eerste.getDay() + 6) % 7;

  var perDag = {};
  c.uitgaven.forEach(function(u){ perDag[u.datum] = (perDag[u.datum] || 0) + uitInPond(u); });

  var h = ['M','T','W','T','F','S','S'].map(function(k){
    return '<div class="kalkop">' + k + '</div>';
  }).join('');

  var vorige = maandOpschuiven(c.sleutel, -1);
  var vorigeLengte = dagenInMaand(vorige);
  for(var i = start; i > 0; i--)
    h += '<div class="dag buiten"><div class="nr">' + (vorigeLengte - i + 1) + '</div><div class="bd">·</div><div class="stip geen"></div></div>';

  var vandaag = vandaagSleutel();
  for(var dag = 1; dag <= aantal; dag++){
    var sl = dagSleutel(d.jaar, d.maand, dag);
    var bedrag = perDag[sl] || 0;
    var weekdag = new Date(d.jaar, d.maand-1, dag).getDay();
    var klas = 'dag';
    if(bedrag >= 100) klas += ' vol';
    else if(bedrag > 0) klas += ' middel';
    else if(weekdag === 0 || weekdag === 6) klas += ' weekend';
    if(sl === vandaag) klas += ' vandaag';
    if(sl === gekozenDag) klas += ' gekozen';

    h += '<div class="' + klas + '" data-dag="' + sl + '">' +
      '<div class="nr">' + dag + '</div>' +
      '<div class="bd' + (bedrag ? '' : ' leeg') + '">' + (bedrag ? Math.round(bedrag) : '—') + '</div>' +
      '<div class="stip' + (st.notities[sl] ? '' : ' geen') + '"></div></div>';
  }

  var rest = (7 - ((start + aantal) % 7)) % 7;
  for(var j = 1; j <= rest; j++)
    h += '<div class="dag buiten"><div class="nr">' + j + '</div><div class="bd">·</div><div class="stip geen"></div></div>';

  $('kalender').innerHTML = h;

  var stille = aantal - Object.keys(perDag).filter(function(k){ return k.slice(0,7) === c.sleutel; }).length;
  $('kalSub').textContent = pond(c.uitSom) + ' spent · ' + c.uitgaven.length + ' expense' +
    (c.uitgaven.length === 1 ? '' : 's') + ' · ' + stille + ' day' + (stille === 1 ? '' : 's') + ' with nothing spent';

  tekenDagdetail(c);
}

function tekenDagdetail(c){
  var doel = $('dagdetail');
  if(!gekozenDag || gekozenDag.slice(0,7) !== c.sleutel){
    doel.innerHTML = '<div class="legekaart"><div class="groot">Tap a day</div>' +
      '<div class="klein">You will see what you spent that day, and you can leave yourself a note.</div></div>';
    return;
  }
  var opDag = c.uitgaven.filter(function(u){ return u.datum === gekozenDag; });
  var som = opDag.reduce(function(t,u){ return t + uitInPond(u); }, 0);
  var d = new Date(gekozenDag);

  doel.innerHTML =
    '<div class="datumkop"><span class="d">' + DAGEN[d.getDay()] + ' ' + (+gekozenDag.slice(8,10)) + ' ' +
      maandNaam(c.sleutel) + '</span><span class="t">' + pond(som) + '</span></div>' +
    (opDag.length
      ? opDag.map(function(u){ return postHtml(u, false); }).join('')
      : '<div class="legekaart" style="padding:10px 0 4px"><div class="klein">Nothing spent on this day.</div></div>') +
    '<textarea class="notitieveld" id="notitieveld" placeholder="Note to self — e.g. book train tickets before noon">' +
      ontsnap(st.notities[gekozenDag] || '') + '</textarea>';
}

/* ---------------------------------------------------------------
   6. De terugdraaibalk
   --------------------------------------------------------------- */
var terugActie = null, terugKlok = null;

function meld(tekst, actie){
  $('terugtekst').innerHTML = tekst;
  terugActie = actie || null;
  $('terugknop').style.display = actie ? '' : 'none';
  $('terugbalk').classList.add('zichtbaar');
  clearTimeout(terugKlok);
  terugKlok = setTimeout(function(){ $('terugbalk').classList.remove('zichtbaar'); }, 6000);
}

$('terugknop').addEventListener('click', function(){
  if(terugActie) terugActie();
  terugActie = null;
  $('terugbalk').classList.remove('zichtbaar');
  clearTimeout(terugKlok);
});

/* ---------------------------------------------------------------
   7. Bediening
   --------------------------------------------------------------- */
document.querySelectorAll('.tabbalk button').forEach(function(b){
  b.addEventListener('click', function(){
    document.querySelectorAll('.tabbalk button').forEach(function(x){ x.classList.remove('actief'); });
    document.querySelectorAll('.paneel').forEach(function(p){ p.classList.remove('actief'); });
    b.classList.add('actief');
    $(b.dataset.tab).classList.add('actief');
    window.scrollTo(0,0);
  });
});

$('vorigemaand').addEventListener('click', function(){ wisselMaand(-1); });
$('volgendemaand').addEventListener('click', function(){ wisselMaand(1); });
$('maandlabel').addEventListener('click', function(){
  gekozenMaand = maandSleutel(new Date());
  gekozenDag = null;
  zetDatumveld();
  tekenAlles();
});
function wisselMaand(stappen){
  gekozenMaand = maandOpschuiven(gekozenMaand, stappen);
  gekozenDag = null;
  stopBewerken();
  tekenAlles();
}

/* --- budget- en inkomstenrijen (gedelegeerd, want ze worden hertekend) --- */
function rijBediening(houderId, soort){
  var houder = $(houderId);
  function lijst(){ return soort === 'budget' ? st.categorieen : st.bronnen; }
  function itemVanVak(el){
    var vak = el.closest('.rijbewerk');
    return vak ? zoekOp(lijst(), vak.dataset.bewerk) : null;
  }

  houder.addEventListener('click', function(e){
    /* Het gekleurde blokje én de naam openen en sluiten het bewerkvak.

       De naam moet mee, want een gekleurd vierkantje met een icoontje leest
       als versiering en niet als knop — wie zijn huur wil hernoemen tikt op
       het woord "Rent". Deed die tik niets, dan is de conclusie al snel dat
       hernoemen niet kan.

       Het is met opzet een <button> en geen klikbare <div>: zo kom je er ook
       met de tab-toets en zegt een schermlezer dat het iets doet. */
    var blokje = e.target.closest('button.ic, button.naam');
    if(blokje && houder.contains(blokje)){
      var id = blokje.closest('[data-id]').dataset.id;
      openBewerk = (openBewerk && openBewerk.soort === soort && openBewerk.id === id)
        ? null : {soort:soort, id:id};
      tekenAlles();
      return;
    }

    var kleur = e.target.closest('.kleurknop');
    if(kleur){
      var kItem = itemVanVak(kleur);
      if(kItem){
        var k = PALET[+kleur.dataset.kleur];
        /* Alle drie tegelijk: icoonvlak, icoon en balkje horen bij elkaar. */
        kItem.zacht = k.zacht;
        kItem.icoonkleur = k.icoonkleur;
        if(soort === 'budget') kItem.balk = k.balk;
        bewaar();
        tekenAlles();
      }
      return;
    }

    var icoon = e.target.closest('.icoonknop');
    if(icoon){
      var iItem = itemVanVak(icoon);
      if(iItem){ iItem.icoon = icoon.dataset.icoon; bewaar(); tekenAlles(); }
      return;
    }

    if(e.target.closest('.rijklaar')){ openBewerk = null; tekenAlles(); return; }

    var weg = e.target.closest('.rijweg');
    if(weg){ verwijderRij(soort, weg.closest('.rijbewerk').dataset.bewerk); return; }

    var knop = e.target.closest('.schakel');
    if(!knop || !houder.contains(knop)) return;
    var rij = knop.closest('[data-id]');
    var vak = maandVak(gekozenMaand, soort);
    var nu = !knop.classList.contains('aan');
    vak.stand[rij.dataset.id] = nu;
    bewaar();
    tekenAlles();
  });

  /* Tijdens het typen alleen het totaal bijwerken; volledig hertekenen zou
     de cursor uit het veld gooien waar je in bezig bent. */
  houder.addEventListener('input', function(e){
    if(e.target.tagName !== 'INPUT' || e.target.readOnly) return;

    /* Hernoemen. De naam hoort bij de post zelf en niet bij deze maand, dus
       hij gaat naar `st` en niet naar het maandvak. De rij erboven werken we
       met de hand bij: hertekenen zou de cursor uit het naamveld gooien. */
    if(e.target.classList.contains('hernoem')){
      var hItem = itemVanVak(e.target);
      if(!hItem) return;
      hItem.naam = e.target.value;
      bewaar();
      var naamEl = houder.querySelector('[data-id="' + hItem.id + '"] .naam');
      if(naamEl) naamEl.textContent = hItem.naam;
      if(soort === 'budget') vulCategorieKeuze();
      werkTotalenBij();
      return;
    }
    if(e.target.closest('.rijbewerk')) return;   /* de maandbedragen hieronder */

    var rij = e.target.closest('[data-id]');
    var vak = maandVak(gekozenMaand, soort);
    vak.bedrag[rij.dataset.id] = naarGetal(e.target.value);
    bewaar();
    merkRijAan(rij, soort);
    werkTotalenBij();
  });

  /* De looptijd is een maandkiezer: die mag pas iets doen als je klaar bent,
     anders slaat hij halve jaartallen op terwijl je nog typt. */
  houder.addEventListener('change', function(e){
    if(!e.target.classList.contains('vanaf') && !e.target.classList.contains('totmet')) return;
    var item = itemVanVak(e.target);
    if(!item) return;
    item[e.target.classList.contains('vanaf') ? 'van' : 'tot'] = e.target.value || null;
    bewaar();
    tekenAlles();
  });
}

/* Een post weghalen. Het lastige zit niet in het verwijderen maar in wat
   eraan vastzit: de maandafwijkingen, en bij een categorie de uitgaven die
   erop geboekt staan. Die uitgaven gooien we niet weg — je hebt dat geld wel
   degelijk uitgegeven — maar verhuizen we naar de eerste post die overblijft.

   Alles wat we losmaken bewaren we eerst, zodat "Undo" het echt terugzet en
   niet een half hersteld budget oplevert. */
function verwijderRij(soort, id){
  var lijst = soort === 'budget' ? st.categorieen : st.bronnen;
  var idx = -1;
  lijst.forEach(function(x, i){ if(x.id === id) idx = i; });
  if(idx < 0) return;
  var item = lijst[idx];

  if(item.afgeleid){ meld('Work cannot be deleted — that amount comes from your shifts'); return; }
  var rest = lijst.filter(function(x){ return x.id !== id && !x.afgeleid; });
  if(soort === 'budget' && !rest.length){
    meld('At least one spending category has to stay');
    return;
  }

  var bewaardeMaanden = {};
  Object.keys(st.maanden).forEach(function(m){
    var vak = st.maanden[m][soort];
    if(!vak) return;
    var b = {};
    if(vak.bedrag && vak.bedrag[id] !== undefined){ b.bedrag = vak.bedrag[id]; delete vak.bedrag[id]; }
    if(vak.stand  && vak.stand[id]  !== undefined){ b.stand  = vak.stand[id];  delete vak.stand[id]; }
    if(b.bedrag !== undefined || b.stand !== undefined) bewaardeMaanden[m] = b;
  });

  var verhuisd = [];
  if(soort === 'budget'){
    st.uitgaven.forEach(function(u){
      if(u.cat === id){ verhuisd.push(u.id); u.cat = rest[0].id; }
    });
  }

  lijst.splice(idx, 1);
  openBewerk = null;
  bewaar();
  tekenAlles();

  var staart = verhuisd.length
    ? ' — ' + verhuisd.length + (verhuisd.length === 1 ? ' expense is' : ' expenses are') +
      ' now under ' + ontsnap(rest[0].naam)
    : '';
  meld('<b>' + ontsnap(item.naam) + '</b> deleted' + staart, function(){
    lijst.splice(idx, 0, item);
    Object.keys(bewaardeMaanden).forEach(function(m){
      var vak = maandVak(m, soort);
      if(bewaardeMaanden[m].bedrag !== undefined) vak.bedrag[id] = bewaardeMaanden[m].bedrag;
      if(bewaardeMaanden[m].stand  !== undefined) vak.stand[id]  = bewaardeMaanden[m].stand;
    });
    var terug = {};
    verhuisd.forEach(function(x){ terug[x] = true; });
    st.uitgaven.forEach(function(u){ if(terug[u.id]) u.cat = id; });
    bewaar();
    tekenAlles();
  });
}

/* Het "changed"-label hoort meteen te verschijnen, niet pas na een hertekening.
   Daarom zetten we het hier met de hand op de rij waarin getypt wordt. */
function merkRijAan(rij, soort){
  var lijst = soort === 'budget' ? st.categorieen : st.bronnen;
  var item = lijst.filter(function(x){ return x.id === rij.dataset.id; })[0];
  if(!item) return;
  var nu = naarGetal(rij.querySelector('input').value);
  var afwijkend = !rij.classList.contains('uitgezet') && Math.abs(nu - item.bedrag) > 0.005;
  rij.classList.toggle('gewijzigd', afwijkend);

  var euroBron = soort === 'inkomen' && item.valuta === 'EUR';
  var onder = rij.querySelector(soort === 'budget' ? '.standaard' : '.omgerekend');
  if(!onder) return;
  var normaal = 'normally ' + (euroBron ? euro(item.bedrag) : pond(item.bedrag));
  if(soort === 'budget'){
    onder.textContent = afwijkend ? normaal : '';
  } else {
    var links = euroBron ? '= ' + pond(nu * st.koers) : '';
    onder.textContent = afwijkend ? (links ? links + ' · ' : '') + normaal : links;
  }
}

/* Tijdens het typen mag alles meebewegen wat geen invoerveld is: het
   dashboard erboven zou anders een verouderd bedrag blijven tonen. */
function werkTotalenBij(){
  var c = cijfersVanMaand(gekozenMaand);
  $('budgetsom').textContent = pond(c.budgetSom);
  $('inkomstensom').textContent = pond(c.inkomenSom);
  tekenHero(c);
  tekenBalken(c);
  tekenBronnen(c);
}

rijBediening('budgetrijen', 'budget');
rijBediening('inkomstenrijen', 'inkomen');

/* "Maak dit mijn standaard": de bedragen van deze maand worden het nieuwe
   normaal, en de maandafwijking mag dan weg. */
function maakStandaard(soort, lijst){
  var vak = maandVak(gekozenMaand, soort);
  lijst.forEach(function(item){
    if(item.afgeleid) return;
    if(vak.bedrag[item.id] !== undefined){
      item.bedrag = vak.bedrag[item.id];
      delete vak.bedrag[item.id];
    }
  });
}

$('budgetopslaan').addEventListener('click', function(){
  if($('budgetstandaard').classList.contains('aan')){
    maakStandaard('budget', st.categorieen);
    $('budgetstandaard').classList.remove('aan');
    meld('Saved as your new monthly budget');
  } else {
    meld('Saved for ' + maandNaam(gekozenMaand));
  }
  /* Het blok klapt dicht, dus een openstaand bewerkvak moet mee: anders
     staat het straks weer open zonder dat je erom vroeg. */
  openBewerk = null;
  bewaar();
  $('budgetblok').open = false;
  tekenAlles();
});

$('inkomstenopslaan').addEventListener('click', function(){
  if($('inkomstenstandaard').classList.contains('aan')){
    maakStandaard('inkomen', st.bronnen);
    $('inkomstenstandaard').classList.remove('aan');
    meld('Saved as your new monthly income');
  } else {
    meld('Saved for ' + maandNaam(gekozenMaand));
  }
  openBewerk = null;
  bewaar();
  $('inkomstenblok').open = false;
  tekenAlles();
});

document.querySelectorAll('.standaardrij .schakel').forEach(function(s){
  s.addEventListener('click', function(){ this.classList.toggle('aan'); });
});

/* --- nieuwe categorie of bron erbij ---
   Het invulrijtje staat verstopt in de pagina en klapt open onder de
   +-knop. Zo blijft de vraag zichtbaar naast de lijst waar het antwoord
   in terechtkomt. */
function nieuwrijBediening(opties){
  var rij = $(opties.rij);

  function sluit(){
    rij.hidden = true;
    opties.velden.forEach(function(id){ $(id).value = ''; });
  }

  $(opties.knop).addEventListener('click', function(){
    rij.hidden = !rij.hidden;
    if(!rij.hidden) $(opties.velden[0]).focus();
  });

  $(opties.af).addEventListener('click', sluit);

  $(opties.klaar).addEventListener('click', function(){
    var naam = $(opties.velden[0]).value.trim();
    /* Zonder naam is de rij later niet terug te vinden; dat is het enige dat
       echt moet. Een bedrag mag je nu overslaan en later invullen. */
    if(!naam){ $(opties.velden[0]).focus(); return; }
    opties.maak(naam, naarGetal($(opties.velden[1]).value));
    bewaar();
    sluit();
    tekenAlles();
    $(opties.blok).open = true;
    meld(ontsnap(naam) + ' added');
  });

  /* Enter in een van de velden doet hetzelfde as de knop. */
  opties.velden.forEach(function(id){
    $(id).addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ e.preventDefault(); $(opties.klaar).click(); }
    });
  });
}

nieuwrijBediening({
  knop:'nieuwecategorie', rij:'nieuwecategorierij', blok:'budgetblok',
  klaar:'nieuwecategorieklaar', af:'nieuwecategorieaf',
  velden:['nieuwecategorienaam', 'nieuwecategoriebedrag'],
  maak:function(naam, bedrag){
    var kleur = vrijeKleur(st.categorieen);
    st.categorieen.push({id:'c' + nieuwId(), naam:naam, icoon:STANDAARDICOON, zacht:kleur.zacht,
                         icoonkleur:kleur.icoonkleur, balk:kleur.balk, bedrag:bedrag});
  }
});

/* De munt is een keuze tussen twee knoppen, niet tussen OK en Annuleren. */
var nieuweMunt = 'EUR';
['muntEUR', 'muntGBP'].forEach(function(id){
  $(id).addEventListener('click', function(){
    nieuweMunt = this.dataset.munt;
    $('muntEUR').classList.toggle('aan', nieuweMunt === 'EUR');
    $('muntGBP').classList.toggle('aan', nieuweMunt === 'GBP');
  });
});

nieuwrijBediening({
  knop:'nieuwebron', rij:'nieuwebronrij', blok:'inkomstenblok',
  klaar:'nieuwebronklaar', af:'nieuwebronaf',
  velden:['nieuwebronnaam', 'nieuwebronbedrag'],
  maak:function(naam, bedrag){
    var kleur = vrijeKleur(st.bronnen);
    st.bronnen.push({id:'b' + nieuwId(), naam:naam, icoon:STANDAARDICOON, zacht:kleur.zacht,
                     icoonkleur:kleur.icoonkleur, valuta:nieuweMunt,
                     bedrag:bedrag, van:null, tot:null});
  }
});

/* --- de wisselkoers --- */
$('koers').addEventListener('input', function(){
  var k = naarGetal(this.value);
  if(k > 0){ st.koers = k; bewaar(); tekenAlles(); }
});

/* --- uitgaven toevoegen en wijzigen --- */
function toonFout(rijId, veldId, tekst){
  $(rijId).classList.add('mis');
  $(veldId).textContent = tekst;
}
function wisFout(rijId){ $(rijId).classList.remove('mis'); }

/* De beste gok voor het datumveld, gegeven waar je nu naar kijkt. Heb je een
   dag in de kalender aangetikt, dan die dag. Sta je in de huidige maand, dan
   vandaag. Kijk je naar een andere maand, dan de eerste daarvan. */
function standaardDatum(){
  if(gekozenDag && gekozenDag.slice(0,7) === gekozenMaand) return gekozenDag;
  var nu = vandaagSleutel();
  return nu.slice(0,7) === gekozenMaand ? nu : gekozenMaand + '-01';
}

/* Blader je naar september terwijl hier 25/08 blijft staan, dan landt je
   uitgave in augustus terwijl je naar september kijkt — en dat zie je pas
   weken later. Daarom lopen deze velden mee met de maand.

   Beide formulieren hebben dezelfde valkuil, dus staan ze hier bij elkaar:
   raakt er ooit een derde datumveld bij, dan hoort het hier ook. */
function zetDatumveld(){
  var d = toonDatum(standaardDatum());
  /* Het werkformulier kent geen wijzig-stand, dat veld mag altijd mee. */
  $('klusDatum').value = d;
  /* Wijzig je een bestaande uitgave, dan houdt die haar eigen datum. */
  if(!bewerktId) $('uitDatum').value = d;
}

function stopBewerken(){
  bewerktId = null;
  $('bewerkbalk').classList.remove('aan');
  $('formulierkop').textContent = 'Add expense';
  $('uitOpslaan').textContent = 'Add';
  $('uitOms').value = '';
  $('uitBedrag').value = '';
  zetUitMunt('GBP');
  wisFout('uitFoutrij');
  zetDatumveld();
}

$('bewerkstop').addEventListener('click', function(){ stopBewerken(); });

/* --- pond of euro bij een uitgave ---
   Je betaalt niet alles in Londen: een treinkaartje naar huis of een
   webwinkel rekent in euro's af. Je vult in wat er van je rekening ging, de
   app rekent het om naar ponden voor de budgetten. */
var uitMunt = 'GBP';

function zetUitMunt(munt){
  uitMunt = munt;
  $('uitMuntGBP').classList.toggle('aan', munt === 'GBP');
  $('uitMuntEUR').classList.toggle('aan', munt === 'EUR');
  $('uitBedrag').placeholder = munt === 'EUR' ? '€0.00' : '£0.00';
  toonMuntUitleg();
}

function toonMuntUitleg(){
  var vak = $('uitMuntUitleg');
  var bedrag = naarGetal($('uitBedrag').value);
  if(uitMunt !== 'EUR' || bedrag <= 0){ vak.hidden = true; return; }
  vak.hidden = false;
  vak.textContent = euro(bedrag) + ' counts as ' + pond(bedrag * st.koers) +
                    ' at your rate of ' + st.koers.toFixed(2);
}

['uitMuntGBP', 'uitMuntEUR'].forEach(function(id){
  $(id).addEventListener('click', function(){ zetUitMunt(this.dataset.munt); });
});
$('uitBedrag').addEventListener('input', toonMuntUitleg);

$('uitOpslaan').addEventListener('click', function(){
  var datum = leesDatum($('uitDatum').value);
  var bedrag = naarGetal($('uitBedrag').value);
  var oms = $('uitOms').value.trim();
  var teken = uitMunt === 'EUR' ? '€' : '£';

  if(!datum)      return toonFout('uitFoutrij','uitFout','Use a date like 24/09/2026');
  if(bedrag <= 0) return toonFout('uitFoutrij','uitFout','Fill in an amount above ' + teken + '0');
  if(!oms)        return toonFout('uitFoutrij','uitFout','Give it a short description');
  wisFout('uitFoutrij');

  if(bewerktId){
    var u = st.uitgaven.filter(function(x){ return x.id === bewerktId; })[0];
    /* Zodra je een voorbeeldregel aanpast is hij van jou; het merkje mag weg,
       zodat "Load example month" hem later niet alsnog opruimt. */
    if(u){ u.datum = datum; u.bedrag = bedrag; u.oms = oms; u.cat = $('uitCat').value;
           u.valuta = uitMunt; delete u.voorbeeld; }
    meld('<b>' + ontsnap(oms) + '</b> updated');
    stopBewerken();
  } else {
    st.uitgaven.push({id:nieuwId(), datum:datum, bedrag:bedrag, oms:oms,
                      cat:$('uitCat').value, valuta:uitMunt});
    meld('<b>' + ontsnap(oms) + '</b> added');
    $('uitOms').value = '';
    $('uitBedrag').value = '';
    toonMuntUitleg();
  }

  /* Ging de uitgave over een andere maand, spring daar dan heen — anders
     lijkt het alsof je invoer nergens landde. */
  if(datum.slice(0,7) !== gekozenMaand) gekozenMaand = datum.slice(0,7);
  bewaar();
  tekenAlles();
});

/* Klikken op een post: openklappen, wijzigen of weggooien. Gedelegeerd op
   document, want posts staan in twee panelen en worden steeds hertekend. */
document.addEventListener('click', function(e){
  var rij = e.target.closest('.postrij');
  if(rij){
    var post = rij.closest('.post');
    var open = post.classList.toggle('open');
    rij.setAttribute('aria-expanded', open ? 'true' : 'false');
    return;
  }

  var wijzig = e.target.closest('.postacties .wijzig');
  if(wijzig){
    var p = wijzig.closest('.post');
    var u = st.uitgaven.filter(function(x){ return x.id === p.dataset.id; })[0];
    if(!u) return;
    bewerktId = u.id;
    $('uitDatum').value = toonDatum(u.datum);
    $('uitBedrag').value = u.bedrag.toFixed(2);
    $('uitOms').value = u.oms;
    $('uitCat').value = u.cat;
    zetUitMunt(u.valuta === 'EUR' ? 'EUR' : 'GBP');
    $('formulierkop').textContent = 'Edit expense';
    $('uitOpslaan').textContent = 'Save changes';
    $('bewerktekst').textContent = 'Editing “' + u.oms + '”';
    $('bewerkbalk').classList.add('aan');
    $('uitgaveblok').open = true;
    document.querySelector('[data-tab="trans"]').click();
    $('uitgaveblok').scrollIntoView({behavior:'smooth', block:'start'});
    return;
  }

  var weg = e.target.closest('.postacties .weg');
  if(weg){
    var pw = weg.closest('.post');
    var idx = -1;
    st.uitgaven.forEach(function(x,i){ if(x.id === pw.dataset.id) idx = i; });
    if(idx < 0) return;
    var eruit = st.uitgaven.splice(idx, 1)[0];
    if(bewerktId === eruit.id) stopBewerken();
    bewaar();
    tekenAlles();
    meld('<b>' + ontsnap(eruit.oms) + '</b> deleted', function(){
      st.uitgaven.push(eruit);
      bewaar();
      tekenAlles();
    });
    return;
  }

  var klusweg = e.target.closest('.klusweg');
  if(klusweg){
    var k = klusweg.closest('.klus');
    var ki = -1;
    st.klussen.forEach(function(x,i){ if(x.id === k.dataset.id) ki = i; });
    if(ki < 0) return;
    var kEruit = st.klussen.splice(ki, 1)[0];
    bewaar();
    tekenAlles();
    meld('Job deleted', function(){ st.klussen.push(kEruit); bewaar(); tekenAlles(); });
    return;
  }

  var dag = e.target.closest('.dag');
  if(dag && dag.dataset.dag){
    gekozenDag = gekozenDag === dag.dataset.dag ? null : dag.dataset.dag;
    /* Tik je 12 september aan en ga je daarna een uitgave invoeren, dan is dát
       de datum die je bedoelt — niet de eerste van de maand. */
    zetDatumveld();
    tekenAlles();
    if(gekozenDag) $('dagdetail').scrollIntoView({behavior:'smooth', block:'nearest'});
  }
});

/* --- werk bijhouden --- */
$('klusToevoegen').addEventListener('click', function(){
  var datum = leesDatum($('klusDatum').value);
  var bedrag = naarGetal($('klusBedrag').value);
  var oms = $('klusOms').value.trim() || 'Work';

  if(!datum)      return toonFout('klusFoutrij','klusFout','Use a date like 24/09/2026');
  if(bedrag <= 0) return toonFout('klusFoutrij','klusFout','Fill in an amount above £0');
  wisFout('klusFoutrij');

  st.klussen.push({id:nieuwId(), datum:datum, bedrag:bedrag, oms:oms});
  $('klusBedrag').value = '';
  $('klusOms').value = '';
  if(datum.slice(0,7) !== gekozenMaand) gekozenMaand = datum.slice(0,7);
  bewaar();
  tekenAlles();
  meld('Job added — ' + pond(bedrag));
});

/* --- notitie bij een dag --- */
$('dagdetail').addEventListener('input', function(e){
  if(e.target.id !== 'notitieveld' || !gekozenDag) return;
  var t = e.target.value.trim();
  if(t) st.notities[gekozenDag] = t;
  else  delete st.notities[gekozenDag];
  bewaar();
  /* Alleen het stipje in de kalender hoeft bij; niet hertekenen tijdens typen. */
  var cel = document.querySelector('.dag[data-dag="' + gekozenDag + '"] .stip');
  if(cel) cel.classList.toggle('geen', !t);
});

/* --- voorbeeldmaand en opnieuw beginnen --- */
$('voorbeeldknop').addEventListener('click', function(){
  var m = gekozenMaand;
  var v = [
    [1,750,'Rent','huur'], [2,48.20,'Tesco weekly shop','bood'],
    [3,24,'Gym membership','gym'],   [4,42.50,'Drinks in Shoreditch','leuk'],
    [5,16.90,'Bike hire — monthly','fiets'], [7,10,'Wifi — Community Fibre','wifi'],
    [9,61.35,"Sainsbury's groceries",'bood'], [11,119.99,'Winter coat, Zara','kled'],
    [12,35,'Roundhouse gig','leuk'], [14,72.40,'Octopus Energy','gwl'],
    [16,53.10,'Tesco groceries','bood'], [19,58.75,'Brunch + Tate Modern','leuk'],
    [22,64.67,'IHS health surcharge','ihs'], [24,30,'Oyster top-up','rnd']
  ];
  var d = sleutelNaarDelen(m);
  var lengte = dagenInMaand(m);

  /* Twee keer op de knop hoort niet twee keer dezelfde maand op te leveren.
     Voorbeelduitgaven dragen een merkje, en dat merkje ruimen we hier eerst
     op — je eigen uitgaven hebben het niet en blijven dus staan. */
  var oudeVoorbeelden = st.uitgaven.filter(function(u){ return u.voorbeeld; });
  st.uitgaven = st.uitgaven.filter(function(u){ return !u.voorbeeld; });

  var nieuw = [];
  v.forEach(function(r){
    if(r[0] > lengte) return;
    nieuw.push({id:nieuwId(), datum:dagSleutel(d.jaar, d.maand, r[0]), bedrag:r[1],
                oms:r[2], cat:r[3], voorbeeld:true});
  });
  st.uitgaven = st.uitgaven.concat(nieuw);
  st.notities[dagSleutel(d.jaar, d.maand, Math.min(24, lengte))] =
    'Book Brighton for Friday — train tickets are cheaper before noon.';
  bewaar();
  tekenAlles();
  meld(oudeVoorbeelden.length ? 'Example month reloaded' : 'Example month loaded', function(){
    var weg = {};
    nieuw.forEach(function(u){ weg[u.id] = true; });
    st.uitgaven = st.uitgaven.filter(function(u){ return !weg[u.id]; }).concat(oudeVoorbeelden);
    bewaar();
    tekenAlles();
  });
});

$('wisknop').addEventListener('click', function(){
  if(!confirm('This deletes every expense, job and note on this phone, and puts all budgets back to their starting amounts.\n\nThere is no undo. Are you sure?')) return;
  st = verseStaat();
  gekozenMaand = maandSleutel(new Date());
  gekozenDag = null;
  openBewerk = null;
  stopBewerken();
  bewaar();
  vulCategorieKeuze();
  tekenAlles();
});

/* ---------------------------------------------------------------
   8. Opstarten
   --------------------------------------------------------------- */
/* Deze keuzelijst wordt bij elke hertekening opnieuw gevuld, zodat een pas
   toegevoegde kostenpost er meteen in staat. De gekozen optie onthouden we,
   anders springt het formulier terug naar "Rent" terwijl je aan het invullen
   bent. */
function vulCategorieKeuze(){
  var keuze = $('uitCat').value;
  $('uitCat').innerHTML = st.categorieen.map(function(c){
    return '<option value="' + c.id + '">' + ontsnap(c.naam) + '</option>';
  }).join('');
  if(keuze && st.categorieen.some(function(c){ return c.id === keuze; })) $('uitCat').value = keuze;
}

st = laad();
gekozenMaand = maandSleutel(new Date());
zetDatumveld();
vulCategorieKeuze();
tekenAlles();
