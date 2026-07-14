(function () {
  "use strict";

  var ENDPOINT = window.CATERING_FORMSPREE || "";

  // [emoji, name, flagCode, description]
  // flagCode: ISO 3166-1 alpha-2 for flagcdn.com, "vegan"/"intl" for special icons
  var ITEMS = {
    vorspeise: [
      ["ğŸ¥Ÿ", "Gemüse-Samosas mit Minz-Chutney", "in", "Knusprig frittierte Teigtaschen gefüllt mit gewürzten Kartoffeln und Erbsen, serviert mit frischem Minz-Koriander-Chutney. ğŸŒ± Vegan"],
      ["ğŸ§…", "Pakora", "in", "Knusprig ausgebackene Gemüse-Happen im würzigen Kichererbsenteig mit Zwiebeln, Spinat und Chili – ein beliebter indischer Straßensnack. ğŸŒ± Vegan"],
      ["ğŸ…", "Bruschetta al Pomodoro", "it", "Geröstetes Ciabatta mit frischen Tomaten, Knoblauch und Basilikum, beträufelt mit nativem Olivenöl extra. ğŸŒ± Vegan"],
      ["ğŸ¥—", "Caprese mit Tomaten & Mozzarella", "it", "Frischer Büffelmozzarella mit sonnengereiften Tomaten und Basilikum, verfeinert mit Balsamico-Reduktion und Olivenöl. ğŸ¥š Vegetarisch"],
      ["ğŸ¥”", "Kartoffelsalat", "de", "Klassischer hausgemachter Kartoffelsalat mit feiner Senf-Vinaigrette, roten Zwiebeln und frischem Schnittlauch. ğŸ¥š Vegetarisch"],
      ["ğŸ¥’", "Gurkensalat mit Dill", "de", "Frisch geschnittene Gurken in einem leichten Essig-Dressing mit Dill und Zwiebeln – kühl, knackig und erfrischend. ğŸ¥š Vegetarisch"]
    ],
    hauptgericht: [
      ["ğŸ›", "Butter Chicken", "in", "Zartes Hähnchenfleisch langsam geschmort in einer samtigen Tomatensauce mit Garam Masala, Kreuzkümmel und einem Hauch Sahne – mild-aromatisch und cremig"],
      ["ğŸ—", "Chicken Tikka Masala", "in", "Im Tandoor-Ofen gegrillte Hähnchenspieße in einer würzigen Tomatencreme-Sauce mit Bockshornklee, Ingwer und Koriander"],
      ["ğŸ‘", "Lamm Rogan Josh", "in", "Langsam geschmortes Lammfleisch in einer intensiven Sauce aus Kashmiri-Chili, Kardamom und Joghurt – aromatisch und butterweich"],
      ["ğŸ¥¬", "Chana Masala", "in", "Herzhafte Kichererbsen in einer würzigen Tomatensauce mit Kreuzkümmel, Koriander und frischem Ingwer – proteinreich und vollständig vegan. ğŸŒ± Vegan"],
      ["ğŸ¥¦", "Gemüse-Curry", "in", "Saisonales Gemüse in einer aromatischen Kokosmilch-Currysauce mit Ingwer, Kurkuma und frischem Koriander. ğŸŒ± Vegan"],
      ["ğŸ§€", "Palak Paneer", "in", "Frischer Hüttenkäse in einer cremigen Spinatsauce, gewürzt mit Kreuzkümmel, Knoblauch und Ingwer – ein indischer Klassiker. ğŸ¥š Vegetarisch"],
      ["ğŸ«•", "Lasagne al Forno", "it", "Hausgemachte Lasagne mit herzhafter Rind-Bolognese und klassischer Béchamelsauce, überbacken mit Parmesan und Mozzarella"],
      ["ğŸ", "Penne Arrabbiata", "it", "Al dente Penne in einer feurigen Tomaten-Chili-Sauce mit Knoblauch und Basilikum – würzig und vollständig vegan. ğŸŒ± Vegan"],
      ["ğŸ", "Penne al Pesto", "it", "Penne mit hausgemachtem Basilikum-Pesto aus frischen Kräutern, Pinienkernen und Olivenöl – mediterran und aromatisch. ğŸ¥š Vegetarisch"],
      ["ğŸ†", "Melanzane alla Parmigiana", "it", "Geschichtete Auberginen mit Tomaten-Sugo, Basilikum und geschmolzenem Mozzarella – ein italienischer Klassiker ohne Fleisch. ğŸ¥š Vegetarisch"],
      ["ğŸ—", "Pollo alla Parmigiana", "it", "Paniertes Hähnchenschnitzel auf Tomaten-Basilikum-Sugo, überbacken mit reichlich Mozzarella und frisch geriebenem Parmesan"],
      ["ğŸ—", "Gegrillte Hähnchenbrust", "de", "Saftige Hähnchenbrust vom Holzkohlegrill mit hausgemachter Kräuterbutter aus frischen Gartenkräutern, Zitrone und Knoblauch"],
      ["ğŸ¥©", "Rinderroulade", "de", "Zart gerolltes Rindfleisch gefüllt mit Senf, Speck, Zwiebeln und Gewürzgurke, langsam geschmort in kräftiger Bratensauce"],
      ["ğŸ§€", "Käsespätzle", "de", "Handgemachte Spätzle überbacken mit würzigem Bergkäse und knusprigen Röstzwiebeln – schwäbische Hausmannskost. ğŸ¥š Vegetarisch"]
    ],
    beilage: [
      ["ğŸš", "Basmati-Reis", "in", "Locker gedämpfter Langkornreis mit einem Hauch Kardamom – ideale Begleitung zu Currys und Schmorgerichten. ğŸŒ± Vegan"],
      ["ğŸ«“", "Knoblauch-Naan", "in", "Frisch im Tandoor gebackenes indisches Fladenbrot mit Knoblauchbutter und Koriander – fluffig und duftend. ğŸ¥š Vegetarisch"],
      ["ğŸŒ¿", "Raita", "in", "Erfrischender Joghurt-Dip mit Gurke, Minze und einer Prise Kreuzkümmel – kühlt und ergänzt würzige Currys perfekt. ğŸ¥š Vegetarisch"],
      ["ğŸ", "Focaccia", "it", "Fluffiges italienisches Fladenbrot mit nativem Olivenöl, grobem Meersalz und frischem Rosmarin – knusprig außen, weich innen. ğŸŒ± Vegan"],
      ["ğŸ¥—", "Italienischer gemischter Salat", "it", "Blattsalate, Kirschtomaten, Oliven und rote Zwiebeln mit leichtem Balsamico-Dressing. ğŸ¥š Vegetarisch"],
      ["ğŸ¥’", "Gegrilltes mediterranes Gemüse", "it", "Saisonales Gemüse auf dem Grill mit Olivenöl, Meersalz und mediterranen Kräutern – bunt, knackig und aromatisch. ğŸŒ± Vegan"],
      ["ğŸ¥”", "Rosmarin-Kartoffeln", "de", "Ofenkartoffeln mit frischem Rosmarin, Knoblauch und Olivenöl – außen golden-knusprig, innen weich. ğŸŒ± Vegan"],
      ["ğŸ¥¬", "Rotkohl", "de", "Klassisch geschmorter Rotkohl mit Äpfeln, Gewürznelken und einem Schuss Rotweinessig – süßlich-herzhaft. ğŸŒ± Vegan"],
      ["ğŸ¥—", "Krautsalat", "de", "Frisch geraspelter Weißkohl mit Essig-Öl-Dressing und Kümmel – knackig, bekömmlich und typisch deutsch. ğŸŒ± Vegan"]
    ],
    nachtisch: [
      ["ğŸ®", "Gulab Jamun", "in", "Zarte Milchpulver-Bällchen goldbraun frittiert, getränkt in einem duftenden Rosenwasser-Zuckersirup mit Kardamom. ğŸ¥š Vegetarisch"],
      ["ğŸš", "Kheer", "in", "Cremiger indischer Milchreis mit Safran, Kardamom, Rosenwasser und gerösteten Pistazien – warm oder kalt ein Genuss. ğŸ¥š Vegetarisch"],
      ["â˜•", "Tiramisu", "it", "Klassisches Dessert aus espresso-getränkten Löffelbiskuits und luftig-cremiger Mascarpone-Creme, abgeschlossen mit feinem Kakaopulver. ğŸ¥š Vegetarisch"],
      ["ğŸ®", "Panna Cotta", "it", "Samtige Vanille-Sahne-Creme, serviert mit einem fruchtigen Beerenragout oder Karamellsauce – elegant und leicht. ğŸ¥š Vegetarisch"],
      ["ğŸ", "Apfelstrudel mit Vanillesoße", "de", "Knuspriger Blätterteig gefüllt mit gezuckerten Äpfeln, Zimt und Rosinen, serviert mit warmer hausgemachter Vanillesoße. ğŸ¥š Vegetarisch"],
      ["ğŸ’", "Rote Grütze mit Vanillesoße", "de", "Fruchtige Beerenkompott aus Himbeeren, Kirschen und Johannisbeeren mit cremiger Vanillesoße. ğŸ¥š Vegetarisch"]
    ]
  };

  // Additive per-item pricing (1V+2H+2B+1N = 3+12+4+3 = 22 â‚¬/p)
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
    ".mki-cat{margin-bottom:12px;border-radius:16px;overflow:hidden;}",
    ".mki-cat-hd{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;cursor:pointer;user-select:none;gap:10px;}",
    ".mki-cat-hd:hover{opacity:.88;}",
    ".mki-cat-arrow{font-size:1rem;transition:transform .25s;line-height:1;color:#888;}",
    ".mki-cat.open .mki-cat-arrow{transform:rotate(180deg);}",
    ".mki-cat-body{padding:0 18px;max-height:0;overflow:hidden;transition:max-height .35s ease,padding .25s ease;}",
    ".mki-cat.open .mki-cat-body{max-height:2400px;padding:0 18px 16px;}",
    ".mki-cat-vorspeise{background:rgba(16,185,129,.06);}",
    ".mki-cat-vorspeise .mki-cat-hd{background:rgba(16,185,129,.09);}",
    ".mki-cat-vorspeise .mki{background:rgba(16,185,129,.05);border-color:rgba(16,185,129,.3);}",
    ".mki-cat-vorspeise .mki:hover{border-color:var(--color-primary,#e63030);}",
    ".mki-cat-hauptgericht{background:rgba(245,100,40,.06);}",
    ".mki-cat-hauptgericht .mki-cat-hd{background:rgba(245,100,40,.09);}",
    ".mki-cat-hauptgericht .mki{background:rgba(245,100,40,.05);border-color:rgba(245,100,40,.28);}",
    ".mki-cat-hauptgericht .mki:hover{border-color:var(--color-primary,#e63030);}",
    ".mki-cat-beilage{background:rgba(234,179,8,.07);}",
    ".mki-cat-beilage .mki-cat-hd{background:rgba(234,179,8,.12);}",
    ".mki-cat-beilage .mki{background:rgba(234,179,8,.06);border-color:rgba(200,155,5,.3);}",
    ".mki-cat-beilage .mki:hover{border-color:var(--color-primary,#e63030);}",
    ".mki-cat-nachtisch{background:rgba(139,92,246,.06);}",
    ".mki-cat-nachtisch .mki-cat-hd{background:rgba(139,92,246,.1);}",
    ".mki-cat-nachtisch .mki{background:rgba(139,92,246,.05);border-color:rgba(139,92,246,.28);}",
    ".mki-cat-nachtisch .mki:hover{border-color:var(--color-primary,#e63030);}",
    ".mki-cat .mki.on{border-color:var(--color-primary,#e63030)!important;background:rgba(230,48,48,.09)!important;}",
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
    "@media(max-width:900px){#cateringLayout{display:flex !important;flex-direction:column;}#cateringMain{display:contents;}#cateringMsgCard{order:1;}#cateringDateCard{order:2;}#cateringMenuCard{order:3;}#cateringSidebar{order:4;position:static !important;top:auto !important;}#cateringFormCard{order:5;}#cateringThanks{order:6;}body{padding-bottom:calc(72px + env(safe-area-inset-bottom,0px))!important;}}",
    "@media(max-width:600px){#cateringEvGrid{grid-template-columns:1fr !important;}.fi-input{padding:15px 0 !important;}}",
    "#mkiBar{position:fixed;bottom:0;left:0;right:0;z-index:9999;background:var(--color-primary,#e63030);color:#fff;display:none;align-items:center;gap:10px;padding:12px 16px;padding-bottom:calc(12px + env(safe-area-inset-bottom,0px));box-shadow:0 -4px 24px rgba(0,0,0,.35);box-sizing:border-box;}",
    "@media(max-width:900px){#mkiBar{display:flex;}}",
    "@media(min-width:901px){#mkiBar{display:none!important;}}",
    ".mkiBar__info{flex:1;min-width:0;overflow:hidden;}",
    ".mkiBar__label{font-size:0.68rem;opacity:.8;margin-bottom:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
    ".mkiBar__price{font-size:1.55rem;font-weight:700;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
    ".mkiBar__sub{font-size:0.68rem;font-weight:400;opacity:.8;margin-left:3px;}",
    ".mkiBar__btn{background:rgba(255,255,255,.2);border:1.5px solid rgba(255,255,255,.5);color:#fff;border-radius:10px;padding:9px 14px;font-size:0.82rem;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;touch-action:manipulation;}",
    "#mkiReco{background:rgba(0,0,0,.03);border-radius:14px;padding:14px 16px;margin-bottom:24px;}",
    ".mkiReco__pill{display:inline-flex;align-items:center;gap:5px;background:#fff;border:1.5px solid #ddd;border-radius:100px;padding:5px 12px;font-size:0.78rem;font-weight:500;color:#555;transition:border-color .2s,background .2s,color .2s;}",
    ".mkiReco__pill--partial{border-color:#f59e0b;background:rgba(245,158,11,.08);color:#92600a;}",
    ".mkiReco__pill--done{border-color:#10b981;background:rgba(16,185,129,.1);color:#065f46;}",
    ".mkiReco__prog{font-weight:700;font-size:0.75rem;}"
  ].join("");
  document.head.appendChild(css);

  function formatEur(n) {
    return n.toFixed(2).replace(".", ",") + "Â â‚¬";
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
    { key: "vorspeise",    icon: "ğŸ¥—",  label: "Vorspeise" },
    { key: "hauptgericht", icon: "ğŸ½ï¸", label: "Hauptgerichte" },
    { key: "beilage",      icon: "ğŸ¥˜",  label: "Beilagen" },
    { key: "nachtisch",    icon: "ğŸ®",  label: "Nachtisch" }
  ];

  var MONTHS_DE = ["Januar","Februar","MÃ¤rz","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
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
      if (dateVal) infoHtml += '<div style="display:flex;align-items:center;gap:8px;font-size:0.85rem;color:rgba(255,255,255,0.8);margin-bottom:5px;"><span>ğŸ“…</span>' + formatDateDE(dateVal) + "</div>";
      if (guests)  infoHtml += '<div style="display:flex;align-items:center;gap:8px;font-size:0.85rem;color:rgba(255,255,255,0.8);"><span>ğŸ‘¥</span>' + guests + " Personen</div>";
      infoEl.innerHTML = infoHtml;
      if (infoHtml) infoEl.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
      if (infoHtml) infoEl.style.paddingBottom = "14px";
    }

    // --- selection list ---
    var el = document.getElementById("sidebarSelection");
    if (!el) return;
    var hasAny = CAT_META.some(function (m) { return sel[m.key].length > 0; });
    if (!hasAny) {
      el.innerHTML = '<p style="color:rgba(255,255,255,0.3);font-size:0.82rem;margin:0;">Noch keine Gerichte gewÃ¤hlt â€¦</p>';
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
      labelEl.textContent = "Noch nichts gewÃ¤hlt";
      priceEl.innerHTML = '0,00 â‚¬<span class="mkiBar__sub"> gesamt</span>';
      return;
    }
    var parts = [];
    CAT_META.forEach(function (m) { if (sel[m.key].length) parts.push(sel[m.key].length + "Ã— " + m.label); });
    labelEl.textContent = parts.join(" Â· ") + (guests ? " Â· " + guests + " Pers. Â· " + formatEur(mk) + "/P" : " Â· " + formatEur(mk) + "/Person");
    if (guests && mk) {
      priceEl.innerHTML = formatEur(mk * guests) + '<span class="mkiBar__sub"> gesamt</span>';
    } else {
      priceEl.innerHTML = formatEur(mk) + '<span class="mkiBar__sub">/Person</span>';
    }
  }

  var RECO = { vorspeise: 1, hauptgericht: 2, beilage: 2, nachtisch: 1 };

  function updateReco() {
    Object.keys(RECO).forEach(function (key) {
      var el = document.getElementById("reco-" + key);
      if (!el) return;
      var n = sel[key].length;
      var r = RECO[key];
      var prog = el.querySelector(".mkiReco__prog");
      if (prog) prog.textContent = n >= r ? "âœ“" : n + "/" + r;
      el.className = "mkiReco__pill" + (n >= r ? " mkiReco__pill--done" : n > 0 ? " mkiReco__pill--partial" : "");
    });
  }

  function updatePrice() {
    var guests = parseInt((document.getElementById("guestCount") || {}).value) || 0;
    var labelEl = document.getElementById("priceTotalLabel");
    if (labelEl) labelEl.textContent = guests ? "GESAMT FÃœR " + guests + " PERSONEN" : "GESAMT";
    if (!hasSelection()) {
      document.getElementById("priceMK").textContent = "0,00 â‚¬";
      document.getElementById("priceRegular").textContent = "0,00 â‚¬";
      document.getElementById("priceTotal").textContent = "0,00 â‚¬";
      updateMobileBar(0, guests);
      updateSidebar();
      updateReco();
      return;
    }
    var mk = getPrice();
    var regular = mk * SHOW_MULT;
    document.getElementById("priceMK").textContent = formatEur(mk);
    document.getElementById("priceRegular").textContent = formatEur(regular);
    document.getElementById("priceTotal").textContent = guests ? formatEur(mk * guests) : "â€”";
    updateMobileBar(mk, guests);
    updateSidebar();
    updateReco();
  }

  function updateCounter(key, isRadio) {
    var el = document.getElementById("cnt-" + key);
    if (!el) return;
    var n = sel[key].length;
    if (isRadio) {
      el.className = "mki-cnt " + (n === 1 ? "ok" : "neutral");
      el.textContent = n === 1 ? "1 gewÃ¤hlt" : "bitte wÃ¤hlen";
    } else {
      el.className = "mki-cnt " + (n > 0 ? "ok" : "neutral");
      el.textContent = n + " gewÃ¤hlt";
    }
  }

  function renderFlag(code) {
    if (!code) return "";
    if (code === "vegan") return '<span class="mki__flag"><span class="mki__flag-em">ğŸŒ±</span></span>';
    if (code === "intl")  return '<span class="mki__flag"><span class="mki__flag-em">ğŸŒ</span></span>';
    return '<span class="mki__flag"><img src="https://flagcdn.com/20x15/' + code + '.png" width="20" height="15" alt="' + code.toUpperCase() + '"></span>';
  }

  function renderCategory(key, title, icon, isRadio, hint, defaultOpen) {
    var items = ITEMS[key];
    var countBadge = isRadio ? "bitte wÃ¤hlen" : "0 gewÃ¤hlt";
    var openClass = defaultOpen ? " open" : "";
    var html =
      '<div class="mki-cat mki-cat-' + key + openClass + '" id="mki-acc-' + key + '">' +
      '<div class="mki-cat-hd" onclick="(function(el){var cat=el.closest(\'.mki-cat\');cat.classList.toggle(\'open\');})(this)">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<h3 style="margin:0;">' + icon + " " + title + "</h3>" +
          '<span class="mki-cnt neutral" id="cnt-' + key + '">' + countBadge + "</span>" +
        "</div>" +
        '<span class="mki-cat-arrow">â–¼</span>' +
      "</div>" +
      '<div class="mki-cat-body">' +
      (hint ? '<p class="mki-hint" style="margin:8px 0 12px;">' + hint + "</p>" : "") +
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
    html += "</div></div></div>";
    return html;
  }

  function initMenu() {
    var section = document.getElementById("menuSection");
    section.innerHTML =
      renderCategory("vorspeise", "Vorspeise", "ğŸ¥—", false, "3 â‚¬/Person Â· jede Vorspeise zÃ¤hlt einzeln", true) +
      renderCategory("hauptgericht", "Hauptgerichte", "ğŸ½ï¸", false, "Basispaket: 2 Gerichte Â· jedes weitere +7Â â‚¬/P Â· weniger = gÃ¼nstiger", false) +
      renderCategory("beilage", "Beilagen", "ğŸ¥˜", false, "Basispaket: 2 Beilagen Â· jede weitere +2Â â‚¬/P Â· weniger = gÃ¼nstiger", false) +
      renderCategory("nachtisch", "Nachtisch", "ğŸ®", false, "3 â‚¬/Person Â· jeder Nachtisch zÃ¤hlt einzeln", false);

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
          card.querySelector(".mki__dot").textContent = "âœ“";
        } else {
          var idx = sel[key].indexOf(val);
          if (idx === -1) {
            sel[key].push(val);
            card.classList.add("on");
            card.querySelector(".mki__dot").textContent = "âœ“";
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
      person ? "Exklusiv fÃ¼r " + firma + " Â· " + person : "Exklusiv fÃ¼r " + firma;
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
      '<button class="mkiBar__btn" onclick="document.getElementById(\'cateringFormCard\').scrollIntoView({behavior:\'smooth\'})">Zum Formular â†“</button>';
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
      var email = document.getElementById("contactEmail").value.trim();
      var statusEl = document.getElementById("cateringStatus");

      if (!date) { statusEl.textContent = "Bitte ein Veranstaltungsdatum wÃ¤hlen."; statusEl.className = "form-status form-status--error"; return; }
      if (!name) { statusEl.textContent = "Bitte Ihren Namen eingeben."; statusEl.className = "form-status form-status--error"; return; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { statusEl.textContent = "Bitte eine gültige E-Mail-Adresse eingeben."; statusEl.className = "form-status form-status--error"; return; }
      if (!sel.hauptgericht.length) { statusEl.textContent = "Bitte mindestens ein Hauptgericht wÃ¤hlen."; statusEl.className = "form-status form-status--error"; return; }

      var mk = getPrice();
      var total = mk * (parseInt(guests) || 1);
      statusEl.textContent = "Wird gesendet â€¦";
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
          Telefon: phone || "â€”",
          "E-Mail": email,
          Datum: date,
          "Anzahl GÃ¤ste": guests,
          "MK Preis / Person": mk.toFixed(2) + " â‚¬",
          Gesamtpreis: total.toFixed(2) + " â‚¬",
          Vorspeise: sel.vorspeise.join(", ") || "â€”",
          Hauptgerichte: sel.hauptgericht.join(", ") || "â€”",
          Beilagen: sel.beilage.join(", ") || "â€”",
          Nachtisch: sel.nachtisch.join(", ") || "â€”"
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
