(function () {
  "use strict";

  var ENDPOINT = window.CATERING_FORMSPREE || "";

  // [emoji, name, flagCode, description]
  // flagCode: ISO 3166-1 alpha-2 for flagcdn.com, "vegan"/"intl" for special icons
  var ITEMS = {
    vorspeise: [
      ["🥟", "Samosas mit Minz-Chutney", "in", "Knusprige Teigtaschen gefüllt mit gewürzten Kartoffeln & Erbsen, serviert mit frischem Minz-Koriander-Chutney"],
      ["🍅", "Bruschetta al Pomodoro", "it", "Geröstetes Baguette mit frischen Tomaten, Knoblauch und Basilikum, beträufelt mit nativem Olivenöl extra"],
      ["🫙", "Hummus mit Fladenbrot & Oliven", "intl", "Cremig gemahlene Kichererbsen mit Tahini, Zitronensaft und Olivenöl, dazu warmes Fladenbrot und eingelegte Oliven"],
      ["🫒", "Gemischte Antipasti", "it", "Auswahl aus gegrilltem Gemüse, eingelegten Artischocken, Parmaschinken, Oliven und Büffelmozzarella"],
      ["🍜", "Miso-Suppe", "jp", "Traditionelle japanische Suppe aus fermentierter Sojabohnenpaste mit Tofu, Wakame-Algen und Frühlingszwiebeln"],
      ["🥗", "Caprese-Salat", "it", "Frischer Büffelmozzarella mit sonnengereiften Tomaten und Basilikum, verfeinert mit Balsamico-Reduktion und Olivenöl"]
    ],
    hauptgericht: [
      ["🍛", "Butter Chicken", "in", "Zartes Hähnchenfleisch langsam geschmort in einer samtigen Tomatensauce mit Garam Masala, Kreuzkümmel und einem Hauch Sahne"],
      ["🐑", "Lamm Rogan Josh", "in", "Langsam geschmortes Lammfleisch in einer intensiven Sauce aus Kashmiri-Chili, Kardamom und Joghurt – aromatisch und zart"],
      ["🍗", "Hähnchen Tikka Masala", "in", "Im Tandoor-Ofen gegrillte Hähnchenspieße in einer würzigen Tomatencreme-Sauce mit Bockshornklee und frischem Ingwer"],
      ["🫕", "Lasagne al Forno", "it", "Hausgemachte Lasagne mit herzhafter Hackfleisch-Bolognese und klassischer Béchamelsauce, überbacken mit Parmesan und Mozzarella"],
      ["🍝", "Pollo alla Parmigiana", "it", "Paniertes Hähnchenschnitzel auf Tomaten-Basilikum-Sugo, überbacken mit reichlich Mozzarella und frisch geriebenem Parmesan"],
      ["🐟", "Teriyaki-Lachs", "jp", "Frisches Lachsfilet, mariniert in einer süß-salzigen Teriyaki-Glasur aus Sojasoße und Mirin, schonend gegrillt"],
      ["🍣", "Sushi-Variation", "jp", "Sorgfältig ausgewählte Auswahl aus Nigiri, Maki-Rollen und Inside-Out-Rolls mit frischem Fisch, Lachs und Avocado"],
      ["🥦", "Vegetarisches Gemüse-Curry", "vegan", "Saisonales Gemüse in einer aromatischen Kokosmilch-Currysauce mit frischem Ingwer, Kurkuma und Koriander – vollständig vegan"],
      ["🍖", "Gegrillte Hähnchenbrust", "de", "Saftige Hähnchenbrust vom Holzkohlegrill mit hausgemachter Kräuterbutter aus frischen Gartenkräutern, Zitrone und Knoblauch"]
    ],
    beilage: [
      ["🍚", "Basmati-Reis", "in", "Locker gedämpfter Langkornreis mit einem Hauch Kardamom und Butter – ideale Begleitung zu Currys und Schmorgerichten"],
      ["🫓", "Knoblauch-Naan", "in", "Frisch im Tandoor gebackenes indisches Fladenbrot mit Knoblauchbutter und Koriander – fluffig und leicht verkohlt"],
      ["🥔", "Rosmarin-Kartoffeln", "de", "Ofenkartoffeln im Ganzen gegart mit frischem Rosmarin, Knoblauch und Olivenöl – außen knusprig, innen weich"],
      ["🥦", "Gemüse vom Grill", "intl", "Saisonales Gemüse auf dem Grill gegart mit Olivenöl, Meersalz und mediterranen Kräutern – bunt, knackig und aromatisch"],
      ["🥗", "Coleslaw hausgemacht", "de", "Knackiger Weißkohl- und Karottensalat in einer cremigen Senf-Mayonnaise – klassisch deutsch, frisch und bekömmlich"],
      ["🌿", "Taboulé", "intl", "Frischer Bulgursalat mit Unmengen Petersilie, Minze, Tomaten, Gurke und einem würzigen Zitronen-Olivenöl-Dressing"],
      ["🍞", "Focaccia mit Olivenöl", "it", "Fluffiges italienisches Fladenbrot mit nativem Olivenöl, grobem Meersalz und frischem Rosmarin – perfekt zum Dippen"],
      ["🫛", "Edamame", "jp", "Gedämpfte junge Sojabohnenschoten mit Meersalz bestreut – knackig, proteinreich und leicht"]
    ],
    nachtisch: [
      ["🍮", "Gulab Jamun", "in", "Zarte Milchpulver-Bällchen in Ghee goldbraun frittiert, getränkt in einem duftenden Rosenwasser-Zuckersirup mit Kardamom"],
      ["☕", "Tiramisu", "it", "Klassisches Dessert aus espresso-getränkten Löffelbiskuits und luftig-cremiger Mascarpone-Creme, abgeschlossen mit Kakaopulver"],
      ["🍡", "Mochi-Eis", "jp", "Japanische Reiskuchenbällchen aus klebrigem Mochiteig, gefüllt mit verschiedenen Eissorten – außen weich, innen angenehm kühl"],
      ["🍯", "Crème Brûlée", "fr", "Zarte Vanille-Sahne-Creme, sanft im Wasserbad gestockt und mit einer knusprig karamellisierten Zuckerkruste abgeflämmt"],
      ["🥐", "Baklava", "tr", "Feines Blätterteiggebäck, gefüllt mit gehackten Pistazien und Walnüssen, großzügig mit Honig und Rosenwasser-Sirup getränkt"],
      ["🍫", "Schokoladen-Mousse", "fr", "Luftig aufgeschlagene Mousse aus dunkler Zartbitterschokolade mit einem Hauch Vanille – intensiv im Geschmack, leicht in der Textur"]
    ]
  };

  // Additive per-item pricing (1V+2H+2B+1N = 3+12+4+3 = 22 €/p)
  var P = { vorspeise: 3, hauptgericht: 6, beilage: 2, nachtisch: 3 };
  var SHOW_MULT = 1.35;

  var sel = { vorspeise: [], hauptgericht: [], beilage: [], nachtisch: [] };

  // --- CSS ---
  var css = document.createElement("style");
  css.textContent = [
    ".mki{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border:2px solid var(--color-border,#ddd);border-radius:14px;cursor:pointer;transition:border-color .15s,background .15s,box-shadow .15s;user-select:none;background:var(--color-card-bg,#fff);}",
    ".mki:hover{border-color:var(--color-primary,#e63030);box-shadow:0 2px 8px rgba(230,48,48,.12);}",
    ".mki.on{border-color:var(--color-primary,#e63030);background:rgba(230,48,48,.07);}",
    ".mki__em{font-size:1.5rem;width:28px;text-align:center;flex-shrink:0;padding-top:2px;}",
    ".mki__body{flex:1;min-width:0;}",
    ".mki__row1{display:flex;align-items:center;gap:6px;margin-bottom:4px;}",
    ".mki__nm{font-size:0.88rem;font-weight:600;line-height:1.3;flex:1;}",
    ".mki__flag{flex-shrink:0;line-height:1;display:flex;align-items:center;}",
    ".mki__flag img{border-radius:2px;box-shadow:0 1px 3px rgba(0,0,0,.2);display:block;}",
    ".mki__flag-em{font-size:1rem;}",
    ".mki__desc{font-size:0.75rem;color:var(--color-text-soft,#888);line-height:1.45;}",
    ".mki__dot{width:20px;height:20px;border-radius:50%;border:2px solid var(--color-border,#ccc);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;transition:all .15s;margin-top:3px;}",
    ".mki.on .mki__dot{background:var(--color-primary,#e63030);border-color:var(--color-primary,#e63030);color:#fff;}",
    ".mki-cat{margin-bottom:32px;padding:18px 18px 16px;border-radius:16px;}",
    ".mki-cat-vorspeise{background:rgba(16,185,129,.06);}",
    ".mki-cat-vorspeise .mki{background:rgba(16,185,129,.05);border-color:rgba(16,185,129,.3);}",
    ".mki-cat-vorspeise .mki:hover{border-color:var(--color-primary,#e63030);}",
    ".mki-cat-hauptgericht{background:rgba(245,100,40,.06);}",
    ".mki-cat-hauptgericht .mki{background:rgba(245,100,40,.05);border-color:rgba(245,100,40,.28);}",
    ".mki-cat-hauptgericht .mki:hover{border-color:var(--color-primary,#e63030);}",
    ".mki-cat-beilage{background:rgba(234,179,8,.07);}",
    ".mki-cat-beilage .mki{background:rgba(234,179,8,.06);border-color:rgba(200,155,5,.3);}",
    ".mki-cat-beilage .mki:hover{border-color:var(--color-primary,#e63030);}",
    ".mki-cat-nachtisch{background:rgba(139,92,246,.06);}",
    ".mki-cat-nachtisch .mki{background:rgba(139,92,246,.05);border-color:rgba(139,92,246,.28);}",
    ".mki-cat-nachtisch .mki:hover{border-color:var(--color-primary,#e63030);}",
    ".mki-cat .mki.on{border-color:var(--color-primary,#e63030)!important;background:rgba(230,48,48,.09)!important;}",
    ".mki-hd{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:6px;}",
    ".mki-hd h3{margin:0;font-size:1.05rem;}",
    ".mki-cnt{font-size:0.78rem;padding:2px 10px;border-radius:100px;font-weight:600;}",
    ".mki-cnt.ok{background:rgba(230,48,48,.12);color:var(--color-primary,#e63030);}",
    ".mki-cnt.neutral{background:var(--color-bg-soft,#f4f4f4);color:var(--color-text-soft,#888);}",
    ".mki-hint{font-size:0.8rem;color:var(--color-text-soft,#888);margin:0 0 10px;}",
    ".mki-grid{display:flex;flex-direction:column;gap:8px;}",
    ".fi-wrap{display:flex;align-items:center;border:2px solid var(--color-border,#ddd);border-radius:12px;padding:0 14px;background:var(--color-bg,#fff);transition:border-color .2s,box-shadow .2s;}",
    ".fi-wrap:focus-within{border-color:var(--color-primary,#e63030);box-shadow:0 0 0 3px rgba(230,48,48,.1);}",
    ".fi-ico{font-size:1.05rem;flex-shrink:0;margin-right:10px;opacity:.65;pointer-events:none;}",
    ".fi-input{border:none!important;outline:none!important;box-shadow:none!important;padding:13px 0!important;background:transparent!important;width:100%;font-size:0.95rem;color:inherit;}",
    ".fi-input::-webkit-calendar-picker-indicator{opacity:.55;cursor:pointer;}",
    "@media(max-width:900px){#cateringLayout{grid-template-columns:1fr !important;display:flex !important;flex-direction:column;}#cateringMain{order:1;}#cateringSidebar{order:2;position:static !important;top:auto !important;}#cateringFormWrap{order:3;}body{padding-bottom:calc(72px + env(safe-area-inset-bottom,0px))!important;}}",
    "@media(max-width:600px){#cateringEvGrid{grid-template-columns:1fr !important;}.fi-wrap{border-radius:14px;}.fi-input{padding:15px 0 !important;}}",
    "#mkiBar{position:fixed;bottom:0;left:0;right:0;z-index:9999;background:var(--color-primary,#e63030);color:#fff;display:none;align-items:center;gap:10px;padding:12px 16px;padding-bottom:calc(12px + env(safe-area-inset-bottom,0px));box-shadow:0 -4px 24px rgba(0,0,0,.35);box-sizing:border-box;}",
    "@media(max-width:900px){#mkiBar{display:flex;}}",
    "@media(min-width:901px){#mkiBar{display:none!important;}}",
    ".mkiBar__info{flex:1;min-width:0;overflow:hidden;}",
    ".mkiBar__label{font-size:0.68rem;opacity:.8;margin-bottom:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
    ".mkiBar__price{font-size:1.55rem;font-weight:700;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
    ".mkiBar__sub{font-size:0.68rem;font-weight:400;opacity:.8;margin-left:3px;}",
    ".mkiBar__btn{background:rgba(255,255,255,.2);border:1.5px solid rgba(255,255,255,.5);color:#fff;border-radius:10px;padding:9px 14px;font-size:0.82rem;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;touch-action:manipulation;}"
  ].join("");
  document.head.appendChild(css);

  function formatEur(n) {
    return n.toFixed(2).replace(".", ",") + " €";
  }

  function getParams() {
    var r = {};
    (window.location.search.replace(/^\?/, "") || "").split("&").forEach(function (p) {
      var kv = p.split("=");
      if (kv[0]) r[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || "").replace(/\+/g, " "));
    });
    return r;
  }

  function getPrice() {
    return sel.vorspeise.length * P.vorspeise +
           sel.hauptgericht.length * P.hauptgericht +
           sel.beilage.length * P.beilage +
           sel.nachtisch.length * P.nachtisch;
  }

  var CAT_META = [
    { key: "vorspeise",    icon: "🥗",  label: "Vorspeise" },
    { key: "hauptgericht", icon: "🍽️", label: "Hauptgerichte" },
    { key: "beilage",      icon: "🥘",  label: "Beilagen" },
    { key: "nachtisch",    icon: "🍮",  label: "Nachtisch" }
  ];

  var MONTHS_DE = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
  var DAYS_DE   = ["So","Mo","Di","Mi","Do","Fr","Sa"];

  function formatDateDE(val) {
    if (!val) return null;
    var d = new Date(val + "T12:00:00");
    return DAYS_DE[d.getDay()] + ", " + d.getDate() + ". " + MONTHS_DE[d.getMonth()] + " " + d.getFullYear();
  }

  function updateSidebar() {
    // --- event info section ---
    var infoEl = document.getElementById("sidebarEventInfo");
    if (infoEl) {
      var dateVal = (document.getElementById("eventDate") || {}).value || "";
      var guests = parseInt((document.getElementById("guestCount") || {}).value) || 0;
      var infoHtml = "";
      if (dateVal) infoHtml += '<div style="display:flex;align-items:center;gap:8px;font-size:0.85rem;color:rgba(255,255,255,0.8);margin-bottom:5px;"><span>📅</span>' + formatDateDE(dateVal) + "</div>";
      if (guests)  infoHtml += '<div style="display:flex;align-items:center;gap:8px;font-size:0.85rem;color:rgba(255,255,255,0.8);"><span>👥</span>' + guests + " Personen</div>";
      infoEl.innerHTML = infoHtml;
      if (infoHtml) infoEl.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
      if (infoHtml) infoEl.style.paddingBottom = "14px";
    }

    // --- selection list ---
    var el = document.getElementById("sidebarSelection");
    if (!el) return;
    var hasAny = CAT_META.some(function (m) { return sel[m.key].length > 0; });
    if (!hasAny) {
      el.innerHTML = '<p style="color:rgba(255,255,255,0.3);font-size:0.82rem;margin:0;">Noch keine Gerichte gewählt …</p>';
      return;
    }
    var html = "";
    CAT_META.forEach(function (m) {
      if (!sel[m.key].length) return;
      html += '<div style="margin-bottom:13px;">';
      html += '<div style="font-size:0.67rem;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.07em;margin-bottom:5px;">' + m.icon + " " + m.label + "</div>";
      sel[m.key].forEach(function (item) {
        html += '<div style="font-size:0.8rem;color:rgba(255,255,255,0.85);padding:3px 0 3px 8px;border-left:2px solid var(--color-primary,#e63030);margin-bottom:3px;">' + item + "</div>";
      });
      html += "</div>";
    });
    el.innerHTML = html;
  }

  function hasSelection() {
    return CAT_META.some(function (m) { return sel[m.key].length > 0; });
  }

  function updateMobileBar(mk, guests) {
    var labelEl = document.getElementById("mkiBarLabel");
    var priceEl = document.getElementById("mkiBarPrice");
    if (!labelEl || !priceEl) return;
    if (!hasSelection()) {
      labelEl.textContent = "Noch nichts gewählt";
      priceEl.innerHTML = '0,00 €<span class="mkiBar__sub"> gesamt</span>';
      return;
    }
    var parts = [];
    CAT_META.forEach(function (m) { if (sel[m.key].length) parts.push(sel[m.key].length + "× " + m.label); });
    labelEl.textContent = parts.join(" · ") + (guests ? " · " + guests + " Pers. · " + formatEur(mk) + "/P" : " · " + formatEur(mk) + "/Person");
    if (guests && mk) {
      priceEl.innerHTML = formatEur(mk * guests) + '<span class="mkiBar__sub"> gesamt</span>';
    } else {
      priceEl.innerHTML = formatEur(mk) + '<span class="mkiBar__sub">/Person</span>';
    }
  }

  function updatePrice() {
    var guests = parseInt((document.getElementById("guestCount") || {}).value) || 0;
    var labelEl = document.getElementById("priceTotalLabel");
    if (labelEl) labelEl.textContent = guests ? "GESAMT FÜR " + guests + " PERSONEN" : "GESAMT";
    if (!hasSelection()) {
      document.getElementById("priceMK").textContent = "0,00 €";
      document.getElementById("priceRegular").textContent = "0,00 €";
      document.getElementById("priceTotal").textContent = "0,00 €";
      updateMobileBar(0, guests);
      updateSidebar();
      return;
    }
    var mk = getPrice();
    var regular = mk * SHOW_MULT;
    document.getElementById("priceMK").textContent = formatEur(mk);
    document.getElementById("priceRegular").textContent = formatEur(regular);
    document.getElementById("priceTotal").textContent = guests ? formatEur(mk * guests) : "—";
    updateMobileBar(mk, guests);
    updateSidebar();
  }

  function updateCounter(key, isRadio) {
    var el = document.getElementById("cnt-" + key);
    if (!el) return;
    var n = sel[key].length;
    if (isRadio) {
      el.className = "mki-cnt " + (n === 1 ? "ok" : "neutral");
      el.textContent = n === 1 ? "1 gewählt" : "bitte wählen";
    } else {
      el.className = "mki-cnt " + (n > 0 ? "ok" : "neutral");
      el.textContent = n + " gewählt";
    }
  }

  function renderFlag(code) {
    if (!code) return "";
    if (code === "vegan") return '<span class="mki__flag"><span class="mki__flag-em">🌱</span></span>';
    if (code === "intl")  return '<span class="mki__flag"><span class="mki__flag-em">🌍</span></span>';
    return '<span class="mki__flag"><img src="https://flagcdn.com/20x15/' + code + '.png" width="20" height="15" alt="' + code.toUpperCase() + '"></span>';
  }

  function renderCategory(key, title, icon, isRadio, hint) {
    var items = ITEMS[key];
    var countBadge = isRadio ? "bitte wählen" : "0 gewählt";
    var html =
      '<div class="mki-cat mki-cat-' + key + '">' +
      '<div class="mki-hd"><h3>' + icon + " " + title + "</h3>" +
      '<span class="mki-cnt neutral" id="cnt-' + key + '">' + countBadge + "</span></div>" +
      (hint ? '<p class="mki-hint">' + hint + "</p>" : "") +
      '<div class="mki-grid">';
    items.forEach(function (item) {
      var val = item[1];
      var flag = item[2] || "";
      var desc = item[3] || "";
      html +=
        '<div class="mki" data-key="' + key + '" data-val="' + val.replace(/"/g, "&quot;") + '" data-radio="' + (isRadio ? "1" : "0") + '">' +
        '<span class="mki__em">' + item[0] + "</span>" +
        '<div class="mki__body">' +
          '<div class="mki__row1">' +
            '<span class="mki__nm">' + val + "</span>" +
            renderFlag(flag) +
          "</div>" +
          (desc ? '<div class="mki__desc">' + desc + "</div>" : "") +
        "</div>" +
        '<span class="mki__dot"></span>' +
        "</div>";
    });
    html += "</div></div>";
    return html;
  }

  function initMenu() {
    var section = document.getElementById("menuSection");
    section.innerHTML =
      renderCategory("vorspeise", "Vorspeise", "🥗", false, "3 €/Person · jede Vorspeise zählt einzeln") +
      renderCategory("hauptgericht", "Hauptgerichte", "🍽️", false, "Basispaket: 2 Gerichte · jedes weitere +7 €/P · weniger = günstiger") +
      renderCategory("beilage", "Beilagen", "🥘", false, "Basispaket: 2 Beilagen · jede weitere +2 €/P · weniger = günstiger") +
      renderCategory("nachtisch", "Nachtisch", "🍮", false, "3 €/Person · jeder Nachtisch zählt einzeln");

    Array.prototype.forEach.call(section.querySelectorAll(".mki"), function (card) {
      card.addEventListener("click", function () {
        var key = card.getAttribute("data-key");
        var val = card.getAttribute("data-val");
        var isRadio = card.getAttribute("data-radio") === "1";

        if (isRadio) {
          Array.prototype.forEach.call(section.querySelectorAll('.mki[data-key="' + key + '"]'), function (c) {
            c.classList.remove("on");
            c.querySelector(".mki__dot").textContent = "";
          });
          sel[key] = [val];
          card.classList.add("on");
          card.querySelector(".mki__dot").textContent = "✓";
        } else {
          var idx = sel[key].indexOf(val);
          if (idx === -1) {
            sel[key].push(val);
            card.classList.add("on");
            card.querySelector(".mki__dot").textContent = "✓";
          } else {
            sel[key].splice(idx, 1);
            card.classList.remove("on");
            card.querySelector(".mki__dot").textContent = "";
          }
        }
        updateCounter(key, isRadio);
        updatePrice();
      });
    });

  }

  document.addEventListener("DOMContentLoaded", function () {
    var params = getParams();
    var firma = params.firma || "Ihre Firma";
    var person = params.person || "";
    var msg = params.msg || "";
    var code = params.code || "MK-XXXXXX";

    document.getElementById("cateringCardFirma").textContent = firma.toUpperCase();
    document.getElementById("cateringCardCode").textContent = code;
    document.getElementById("cateringGreeting").textContent =
      person ? "Exklusiv für " + firma + " · " + person : "Exklusiv für " + firma;
    if (msg) {
      document.getElementById("cateringMsg").textContent = msg;
      document.getElementById("cateringMsgCard").hidden = false;
    }

    // mobile sticky bottom bar
    var bar = document.createElement("div");
    bar.id = "mkiBar";
    bar.innerHTML =
      '<div class="mkiBar__info">' +
        '<div class="mkiBar__label" id="mkiBarLabel"></div>' +
        '<div class="mkiBar__price" id="mkiBarPrice"></div>' +
      '</div>' +
      '<button class="mkiBar__btn" onclick="document.getElementById(\'cateringFormCard\').scrollIntoView({behavior:\'smooth\'})">Zum Formular ↓</button>';
    document.body.appendChild(bar);

    initMenu();
    updatePrice();

    document.getElementById("guestCount").addEventListener("input", updatePrice);
    document.getElementById("eventDate").addEventListener("change", updatePrice);
    document.getElementById("eventDate").min = new Date().toISOString().slice(0, 10);

    document.getElementById("cateringSubmitBtn").addEventListener("click", function () {
      var date = document.getElementById("eventDate").value;
      var guests = document.getElementById("guestCount").value;
      var name = document.getElementById("contactName").value.trim();
      var phone = document.getElementById("contactPhone").value.trim();
      var statusEl = document.getElementById("cateringStatus");

      if (!date) { statusEl.textContent = "Bitte ein Veranstaltungsdatum wählen."; statusEl.className = "form-status form-status--error"; return; }
      if (!name) { statusEl.textContent = "Bitte Ihren Namen eingeben."; statusEl.className = "form-status form-status--error"; return; }
      if (!sel.hauptgericht.length) { statusEl.textContent = "Bitte mindestens ein Hauptgericht wählen."; statusEl.className = "form-status form-status--error"; return; }

      var mk = getPrice();
      var total = mk * (parseInt(guests) || 1);
      statusEl.textContent = "Wird gesendet …";
      statusEl.className = "form-status";
      document.getElementById("cateringSubmitBtn").disabled = true;

      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: "Catering-Anfrage von " + firma,
          Firma: firma,
          Ansprechpartner: person,
          Kontaktname: name,
          Telefon: phone || "—",
          Datum: date,
          "Anzahl Gäste": guests,
          "MK Preis / Person": mk.toFixed(2) + " €",
          Gesamtpreis: total.toFixed(2) + " €",
          Vorspeise: sel.vorspeise.join(", ") || "—",
          Hauptgerichte: sel.hauptgericht.join(", ") || "—",
          Beilagen: sel.beilage.join(", ") || "—",
          Nachtisch: sel.nachtisch.join(", ") || "—"
        })
      }).then(function (res) {
        if (res.ok) {
          document.getElementById("cateringFormCard").style.display = "none";
          document.getElementById("cateringThanks").style.display = "block";
        } else {
          statusEl.textContent = "Senden fehlgeschlagen. Bitte erneut versuchen.";
          statusEl.className = "form-status form-status--error";
          document.getElementById("cateringSubmitBtn").disabled = false;
        }
      }).catch(function () {
        statusEl.textContent = "Netzwerkfehler. Bitte erneut versuchen.";
        statusEl.className = "form-status form-status--error";
        document.getElementById("cateringSubmitBtn").disabled = false;
      });
    });
  });
})();
