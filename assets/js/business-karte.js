(function () {
  "use strict";

  // MK Black Card - Kundenkarte. Der Kunde kommt ueber seinen persoenlichen Link
  // (?k=...). Eine Frage, zwei Wege: Essen fuers Buero oder Feier planen.
  // Alles landet wie bisher per karte_reaktion im Vertrieb und per Mail.

  var TEL_WA = "491772019889";
  var MINDEST = 25;              // Mittagstisch: Mindestbestellwert in Euro
  var BUFFET = 27.5, BUFFET_NORMAL = 31.9;
  var SUESS = 3.9;               // Team-Paket: Suesses pro Person
  var ZEITEN = ["11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00"];

  var KATS = [["pizza", "Pizza"], ["pasta", "Pasta"], ["indisch", "Indisch"], ["sushi", "Sushi"], ["klein", "Beilagen & Dessert"]];
  var GERICHTE = [
    ["pizza", "Pizza Margherita", 10.5, 11.9, "margherita", "Ø 30 cm · Tomatensauce, Mozzarella · vegetarisch"],
    ["pizza", "Pizza Funghi", 11.5, 12.9, "funghi", "Ø 30 cm · Mit frischen Champignons · vegetarisch"],
    ["pizza", "Pizza Salami", 11.9, 13.5, "salami", "Ø 30 cm · Mit Salami"],
    ["pizza", "Pizza Mr. Veggi", 12.5, 13.9, "veggi", "Ø 30 cm · Bunter Gemüse-Mix · vegetarisch"],
    ["pizza", "Pizza Chicken Teriyaki", 13.5, 14.9, "teriyaki", "Ø 30 cm · Hähnchen, Brokkoli, Frühlingszwiebeln, Sesam"],
    ["pasta", "Pasta Mista", 11.5, 12.9, "mista", "Champignons in Tomaten-Sahnesauce · vegetarisch"],
    ["pasta", "Tortellini alla Panna", 12.5, 13.9, "tortellini", "In Schinken-Sahnesauce"],
    ["pasta", "Spaghetti Carbonara", 12.5, 13.9, "carbonara", "Mit Schinken, Ei und Sahnesauce"],
    ["pasta", "Maccaroni al Forno", 12.9, 14.5, "forno", "Champignons, Schinken, Hackfleisch, mit Käse überbacken"],
    ["indisch", "Butter Chicken", 13.5, 14.9, "butterchicken", "Mit Basmati-Reis · mild und cremig"],
    ["indisch", "Chicken Tikka Masala", 13.5, 14.9, "tikka", "Mit Basmati-Reis · würzig"],
    ["indisch", "Chicken Korma", 13.5, 14.9, "korma", "Mit Basmati-Reis · mild, mit Nüssen"],
    ["indisch", "Chicken Biryani", 13.9, 15.5, "biryani", "Gewürzreis mit Hähnchen und Raita"],
    ["indisch", "Lamb Rogan Josh", 15.5, 17.5, "rogan", "Mit Basmati-Reis · Lamm-Curry"],
    ["indisch", "Palak Paneer", 12.9, 14.5, "paneer", "Mit Basmati-Reis · vegetarisch"],
    ["indisch", "Chana Masala", 11.5, 12.9, "chana", "Mit Basmati-Reis · vegan"],
    ["indisch", "Dal Tadka", 11.5, 12.9, "dal", "Gelbe Linsen, mit Basmati-Reis · vegetarisch"],
    ["sushi", "Sushi-Box Klassik", 14.9, 16.9, "sushibox", "6 Maki Lachs + 8 California Roll Lachs-Avocado"],
    ["sushi", "Sushi-Box Veggie", 12.9, 14.5, "sushiveg", "6 Maki Avocado + 8 Crispy Roll Gemüse · vegetarisch"],
    ["klein", "Pommes", 4.5, 4.9, "pommes", "Mit Ketchup und Mayo"],
    ["klein", "Knoblauchbrot", 4.9, 5.5, "knoblauch", "Mit Knoblauchdip"],
    ["klein", "Pizzabrötchen", 5.9, 6.5, "pizzabroetchen", "6 Stück, mit Käse und Knoblauchdip"],
    ["klein", "Samosa", 5.5, 5.9, "samosa", "2 Stück, mit Minz-Chutney · vegetarisch"],
    ["klein", "Rucola-Salat", 8.5, 9.5, "rucola", "Mit Parmesan und Balsamico"],
    ["klein", "Tiramisu", 4.9, 5.5, "tiramisu", "Hausgemacht"],
    ["klein", "Panna Cotta", 4.5, 4.9, "pannacotta", "Mit Erdbeersauce"]
  ].map(function (g) { return { kat: g[0], name: g[1], preis: g[2], statt: g[3], bild: "/assets/img/mittag/" + g[4] + ".webp", text: g[5] }; });

  var PAKETE = [
    { key: "pizza", name: "Pizza-Runde", preis: 12.9, statt: 14.5, bild: "margherita", text: "Pizzen Ø 30 cm (1 Pizza für 2 Personen), Knoblauchbrot, Rucola-Salat",
      wahl: { min: 1, max: 4, titel: "Welche Pizzen?", hilfe: "bis zu 4 Sorten", optionen: ["Margherita", "Funghi", "Salami", "Mr. Veggi", "Chicken Teriyaki"] } },
    { key: "pasta", name: "Pasta-Runde", preis: 16.9, statt: 18.9, bild: "carbonara", text: "2 Pastagerichte, Rucola-Salat, Knoblauchbrot",
      wahl: { min: 2, max: 2, titel: "Welche 2 Pastagerichte?", hilfe: "genau 2", optionen: ["Pasta Mista", "Tortellini alla Panna", "Spaghetti Carbonara", "Maccaroni al Forno"] } },
    { key: "snack", name: "Meeting-Snack", preis: 11.9, statt: 13.5, bild: "samosa", text: "Fingerfood, etwa 6 Teile pro Person: Samosa, Pakora, Pizzabrötchen, Knoblauchbrot, Dips", wahl: null },
    { key: "curry", name: "Curry-Runde", preis: 18.9, statt: 21.5, bild: "butterchicken", text: "2 Currys, Basmati-Reis, Naan, Salat",
      wahl: { min: 2, max: 2, titel: "Welche 2 Currys?", hilfe: "genau 2", optionen: ["Butter Chicken", "Chicken Tikka Masala", "Chicken Korma", "Lamb Rogan Josh", "Palak Paneer", "Chana Masala", "Dal Tadka"] } },
    { key: "sushi", name: "Sushi-Runde", preis: 16.9, statt: 18.9, bild: "sushibox", text: "Gemischte Platte, etwa 12 Stück pro Person, mit Sojasauce, Ingwer und Wasabi",
      wahl: { min: 1, max: 1, titel: "Mit oder ohne Fisch?", hilfe: "", optionen: ["Gemischt mit Lachs und Thunfisch", "Nur vegetarisch"] } }
  ];

  var ANLAESSE = ["Weihnachtsfeier", "Sommerfest", "Firmenjubiläum", "Meeting / Konferenz", "Geburtstag", "Hochzeit", "Vereinsfest", "Etwas anderes"];
  var WO = [
    { key: "haus", titel: "Bei uns im Haus", text: "Wir liefern das Buffet und bauen auf" },
    { key: "aussen", titel: "Außer Haus", text: "Wir finden eine passende Location" },
    { key: "offen", titel: "Weiß ich noch nicht", text: "Ich berate Sie zu beidem" }
  ];
  var KUECHEN = ["Deutsch", "Indisch", "Italienisch", "Sushi", "Vegetarisch im Mittelpunkt", "Fingerfood statt Buffet", "Überraschen Sie uns"];

  var $ = function (id) { return document.getElementById(id); };
  var app = $("kxApp"), laden = $("mkKarteLaden"), fehlerBox = $("mkKarteFehler");
  var schluessel = new URLSearchParams(location.search).get("k") || "";
  var bewegungAus = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fehler() { if (laden) laden.hidden = true; if (fehlerBox) fehlerBox.hidden = false; }
  if (!/^[0-9a-f]{32}$/.test(schluessel) || !window.mkBusiness) { fehler(); return; }
  var client = window.mkBusiness.client;

  function euro(n) { return n.toFixed(2).replace(".", ",") + " €"; }
  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }
  function isoTag(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function tagLang(iso) { return new Date(iso + "T12:00:00").toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" }); }
  function datumDe(iso) { return new Date(iso + "T12:00:00").toLocaleDateString("de-DE"); }

  var K = {};          // Kartendaten
  var S = {            // Zustand
    modus: "einzeln", kat: "pizza", menge: {}, paket: null, personen: 10, suess: false, wahl: [],
    tag: null, zeit: null, notiz: "",
    f: { anlass: "", datum: "", offen: false, personen: 30, wo: "", kueche: [], nachricht: "" }
  };

  // ---------- Navigation: ein Bildschirm nach dem anderen, Zurueck-Taste geht ----------
  var REIHE = ["start", "essen", "liefern", "feier1", "feier2", "feier3", "feier4", "feier5", "danke"];
  var aktuell = "start";
  function zeige(name, zurueck) {
    var alt = app.querySelector(".kx-screen.is-on");
    if (alt) alt.classList.remove("is-on", "is-back");
    var neu = app.querySelector('[data-screen="' + name + '"]');
    if (zurueck) neu.classList.add("is-back");
    neu.classList.add("is-on");
    aktuell = name;
    if (name.indexOf("feier") === 0) schritte(name);
    leiste();
    var oben = app.getBoundingClientRect().top + window.scrollY - 90;
    if (window.scrollY > oben) window.scrollTo({ top: Math.max(0, oben), behavior: bewegungAus ? "auto" : "smooth" });
  }
  function geh(name, ersetzen) {
    var zurueck = REIHE.indexOf(name) < REIHE.indexOf(aktuell) && name !== "start";
    if (ersetzen) history.replaceState({ s: name }, ""); else history.pushState({ s: name }, "");
    zeige(name, zurueck || name === "start");
  }
  window.addEventListener("popstate", function (e) {
    var s = (e.state && e.state.s) || "start";
    if (s === "danke") s = "start";
    zeige(s, true);
  });
  app.addEventListener("click", function (e) {
    var b = e.target.closest("[data-back]");
    if (b) { e.preventDefault(); history.back(); }
  });

  function schritte(name) {
    var n = parseInt(name.slice(5), 10);
    Array.prototype.forEach.call(app.querySelectorAll('[data-screen="' + name + '"] .kx-schritte i'), function (i, idx) {
      i.classList.toggle("is-an", idx < n);
    });
  }

  // ---------- Leiste unten ----------
  var bar = $("kxBar"), barT = $("kxBarTitel"), barS = $("kxBarText"), barBtn = $("kxBarBtn"), barF = $("kxBarFehler");
  var barAktion = null;
  function setBar(an, titel, text, knopf, aktiv, aktion) {
    bar.classList.toggle("is-on", !!an);
    bar.setAttribute("aria-hidden", an ? "false" : "true");
    if (!an) return;
    barT.textContent = titel; barS.textContent = text;
    barBtn.innerHTML = esc(knopf) + ' <span aria-hidden="true">→</span>';
    barBtn.disabled = !aktiv; barAktion = aktion;
  }
  function bump() { if (bewegungAus) return; bar.classList.remove("is-bump"); void bar.offsetWidth; bar.classList.add("is-bump"); }
  function barFehler(t) { barF.textContent = t; barF.hidden = !t; }
  barBtn.addEventListener("click", function () { barFehler(""); if (barAktion) barAktion(); });

  function warenkorb() {
    var n = 0, s = 0, liste = [];
    GERICHTE.forEach(function (g) { var m = S.menge[g.name] || 0; if (m) { n += m; s += m * g.preis; liste.push(m + "× " + g.name); } });
    return { n: n, summe: s, liste: liste };
  }
  function paketObj() { return PAKETE.filter(function (p) { return p.key === S.paket; })[0] || null; }
  function paketSumme() { var p = paketObj(); return p ? S.personen * (p.preis + (S.suess ? SUESS : 0)) : 0; }
  function paketOk() {
    var p = paketObj(); if (!p || S.personen < 5) return false;
    return !p.wahl || (S.wahl.length >= p.wahl.min && S.wahl.length <= p.wahl.max);
  }

  function leiste() {
    barFehler("");
    if (aktuell === "essen") {
      if (S.modus === "einzeln") {
        var w = warenkorb();
        if (!w.n) return setBar(true, "Noch nichts ausgewählt", "Gerichte mit + hinzufügen · ab " + MINDEST + " € geliefert", "Weiter", false);
        var fehlt = MINDEST - w.summe;
        setBar(true, w.n + (w.n === 1 ? " Gericht" : " Gerichte") + " · " + euro(w.summe),
          fehlt > 0 ? "Noch " + euro(fehlt) + " bis zur Lieferung" : "Lieferung inklusive",
          "Weiter", fehlt <= 0, function () { geh("liefern"); });
      } else {
        var p = paketObj();
        if (!p) return setBar(true, "Paket wählen", "Ab 5 Personen · bis zum Vortag bestellen", "Weiter", false);
        var ok = paketOk();
        setBar(true, p.name + " · " + S.personen + " Pers. · " + euro(paketSumme()),
          ok ? euro(p.preis + (S.suess ? SUESS : 0)) + " pro Person" : (p.wahl ? "Bitte noch wählen: " + p.wahl.titel.replace("?", "") : ""),
          "Weiter", ok, function () { geh("liefern"); });
      }
    } else if (aktuell === "liefern") {
      var titel = S.modus === "einzeln" ? warenkorb().n + " Gerichte · " + euro(warenkorb().summe) : (paketObj().name + " · " + S.personen + " Pers. · " + euro(paketSumme()));
      setBar(true, titel, S.tag && S.zeit ? tagLang(S.tag) + " · " + S.zeit + " Uhr" : "Tag und Uhrzeit wählen", "Jetzt bestellen", !!(S.tag && S.zeit), bestellen);
    } else if (aktuell === "feier2") {
      setBar(true, S.f.anlass + " · " + S.f.personen + " Personen", "Buffet ab " + euro(BUFFET) + " p. P. · ca. " + euro(S.f.personen * BUFFET),
        "Weiter", !!(S.f.datum || S.f.offen), function () { geh("feier3"); });
    } else if (aktuell === "feier4") {
      setBar(true, S.f.anlass + " · " + S.f.personen + " Personen", S.f.kueche.length ? S.f.kueche.join(", ") : "Küche wählen – oder einfach weiter",
        "Weiter", true, function () { zusammenfassung(); geh("feier5"); });
    } else if (aktuell === "feier5") {
      setBar(true, S.f.anlass + " · " + S.f.personen + " Personen", "Unverbindlich · Antwort meist am selben Tag", "Anfrage senden", true, feierSenden);
    } else {
      setBar(false);
    }
  }

  // ---------- Start ----------
  function start() {
    var wer = K.ansprechpartner || K.firma;
    var std = new Date().getHours();
    $("kxGruss").textContent = (std < 11 ? "Guten Morgen" : std < 18 ? "Guten Tag" : "Guten Abend") + ",";
    $("kxName").textContent = wer + ".";
    $("kxSub").innerHTML = (K.ansprechpartner && K.kategorie !== "Privatperson" ? "<strong>" + esc(K.firma) + "</strong><br>" : "") + '<span style="white-space:nowrap">Kundennummer <strong>' + esc(K.kundennummer) + "</strong></span>";
    $("kxKarteName").textContent = K.firma;
    $("kxKarteNr").textContent = K.kundennummer;
    document.title = "MK Black Card " + K.kundennummer + " | Mahboobs Kitchen";

    var vorstellung = "Hallo Reyyan, hier ist " + wer + (K.kategorie !== "Privatperson" && K.ansprechpartner ? " von " + K.firma : "") + ". Meine Kundennummer: " + K.kundennummer;
    Array.prototype.forEach.call(app.querySelectorAll("[data-wa]"), function (l) { l.href = "https://wa.me/" + TEL_WA + "?text=" + encodeURIComponent(vorstellung); });
    // Unterer Chat startet, sobald er ins Bild kommt
    var unten = $("kxChatUnten");
    if (unten && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { unten.classList.add("is-an"); io.disconnect(); } }, { threshold: 0.4 });
      io.observe(unten);
    } else if (unten) unten.classList.add("is-an");
    $("mkAbmelden").href = "/business/abmelden/?k=" + schluessel;
    $("kxRechner").href = "/business/catering-angebot/?firma=" + encodeURIComponent(K.firma || "") +
      (K.ansprechpartner ? "&person=" + encodeURIComponent(K.ansprechpartner) : "") + "&code=" + encodeURIComponent(K.kundennummer) + "&k=" + schluessel;

    // Saison: September bis 20. Dezember
    var jetzt = new Date(), mo = jetzt.getMonth();
    if (mo >= 8 && !(mo === 11 && jetzt.getDate() > 20)) {
      var dez = new Date(jetzt.getFullYear(), 11, 1), tage = Math.ceil((dez - jetzt) / 864e5);
      $("kxSaisonTitel").textContent = "Weihnachtsfeier " + jetzt.getFullYear();
      $("kxSaisonText").textContent = tage > 0 ? "Beliebte Termine sichern – noch " + tage + " Tage bis Dezember" : "Jetzt noch einen Termin sichern";
      $("kxSaison").hidden = false;
      $("kxSaison").onclick = function () { feierStart("Weihnachtsfeier"); };
    }

    wiederZeigen();

    Array.prototype.forEach.call(app.querySelectorAll("[data-go]"), function (b) {
      b.addEventListener("click", function () { if (b.dataset.go === "essen") essenStart(); else feierStart(); });
    });

    $("kxRueckruf").onclick = function () {
      var b = this; b.disabled = true;
      reaktion("rueckruf", null, "Rückruf über die Black Card").then(function (ok) {
        if (ok) { b.textContent = "✓ Ich rufe Sie zurück"; b.classList.add("kx-ok"); }
        else { b.disabled = false; b.textContent = "Bitte nochmal versuchen"; }
      });
    };
    angebote();
  }

  // Wie letztes Mal? - die letzte Bestellung steht auf diesem Geraet
  function wiederZeigen() {
    var letzte = null;
    try { letzte = JSON.parse(localStorage.getItem("mkLetzte_" + schluessel) || "null"); } catch (e) {}
    $("kxWieder").hidden = !(letzte && letzte.text);
    if (!letzte || !letzte.text) return;
    $("kxWiederText").textContent = letzte.text;
    $("kxWiederBtn").onclick = function () {
      if (letzte.modus === "einzeln") { S.modus = "einzeln"; S.menge = JSON.parse(JSON.stringify(letzte.menge || {})); }
      else { S.modus = "paket"; S.paket = letzte.paket; S.personen = letzte.personen || 10; S.suess = !!letzte.suess; S.wahl = (letzte.wahl || []).slice(); }
      essenStart(true);
    };
  }

  function reaktion(art, angebot, text) {
    return client.rpc("karte_reaktion", { p_token: schluessel, p_offer: angebot || null, p_art: art, p_text: text || null })
      .then(function (r) {
        if (r.error && /PGRST202|p_text|function/i.test(r.error.message || "")) return client.rpc("karte_reaktion", { p_token: schluessel, p_offer: angebot || null, p_art: art });
        return r;
      }).then(function (r) { return !r.error; }, function () { return false; });
  }
  function mail(betreff, felder) {
    if (!window.MK_FORMSPREE) return Promise.resolve(false);
    var d = { _subject: betreff + " – " + (K.firma || ""), Firma: K.firma || "—", Ansprechpartner: K.ansprechpartner || "—", Kundennummer: K.kundennummer || "—" };
    Object.keys(felder).forEach(function (k) { d[k] = felder[k]; });
    return fetch(window.MK_FORMSPREE, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(d) })
      .then(function (r) { return r.ok; }, function () { return false; });
  }

  function angebote() {
    client.from("offers").select("*").eq("active", true).order("created_at", { ascending: false }).then(function (res) {
      var heute = isoTag(new Date());
      var liste = (res.data || []).filter(function (o) { return !o.valid_until || o.valid_until >= heute; }).slice(0, 3);
      if (!liste.length) return;
      $("kxAngeboteListe").innerHTML = liste.map(function (o) {
        return '<div class="kx-angebot">' + (o.image_url ? '<img src="' + esc(o.image_url) + '" alt="" loading="lazy">' : "") +
          '<div class="kx-angebot__t"' + (o.image_url ? "" : ' style="grid-column:1/3"') + '><strong>' + esc(o.title) + "</strong>" +
          (o.description ? "<span>" + esc(o.description.length > 140 ? o.description.slice(0, 137) + "…" : o.description) + "</span>" : "") +
          (o.valid_until ? "<small>Gültig bis " + datumDe(o.valid_until) + "</small>" : "") + "</div>" +
          '<button type="button" class="kx-mini" data-angebot="' + esc(o.id) + '">Interesse</button></div>';
      }).join("");
      Array.prototype.forEach.call($("kxAngeboteListe").querySelectorAll("[data-angebot]"), function (b) {
        b.onclick = function () {
          b.disabled = true;
          reaktion("interesse", b.dataset.angebot).then(function (ok) {
            if (ok) { b.textContent = "✓ Ich melde mich"; b.classList.add("is-ok"); } else { b.disabled = false; }
          });
        };
      });
      $("kxAngebote").hidden = false;
    });
  }

  // ---------- Essen fuers Buero ----------
  var segPille = $("kxSegPille");
  function segment() {
    Array.prototype.forEach.call(app.querySelectorAll("[data-modus]"), function (b) {
      var an = b.dataset.modus === S.modus;
      b.classList.toggle("is-on", an); b.setAttribute("aria-pressed", an);
      if (an && segPille) { segPille.style.width = b.offsetWidth + "px"; segPille.style.transform = "translateX(" + (b.offsetLeft - 4) + "px)"; }
    });
    $("kxEinzeln").hidden = S.modus !== "einzeln";
    $("kxPaket").hidden = S.modus !== "paket";
  }
  function essenStart(wieder) {
    geh("essen");
    segment(); kategorien(); gerichte(); pakete(); leiste();
    if (wieder) bump();
  }
  Array.prototype.forEach.call(app.querySelectorAll("[data-modus]"), function (b) {
    b.addEventListener("click", function () { S.modus = b.dataset.modus; segment(); leiste(); });
  });
  window.addEventListener("resize", function () { if (aktuell === "essen") segment(); });

  function kategorien() {
    $("kxKats").innerHTML = KATS.map(function (k) {
      var n = 0; GERICHTE.forEach(function (g) { if (g.kat === k[0]) n += S.menge[g.name] || 0; });
      return '<button type="button" class="kx-chip' + (S.kat === k[0] ? " is-on" : "") + '" data-kat="' + k[0] + '">' + k[1] + (n ? "<b>" + n + "</b>" : "") + "</button>";
    }).join("");
  }
  $("kxKats").addEventListener("click", function (e) {
    var b = e.target.closest("[data-kat]"); if (!b) return;
    S.kat = b.dataset.kat; kategorien(); gerichte();
  });
  function gerichte() {
    $("kxGerichte").innerHTML = GERICHTE.filter(function (g) { return g.kat === S.kat; }).map(function (g, i) {
      var m = S.menge[g.name] || 0;
      return '<div class="kx-gericht' + (m ? " is-gew" : "") + '" style="animation-delay:' + (i * 0.04) + 's" data-name="' + esc(g.name) + '">' +
        '<img src="' + g.bild + '" alt="" loading="lazy" width="86" height="86">' +
        '<div class="kx-gericht__t"><strong>' + esc(g.name) + "</strong><small>" + esc(g.text) + "</small>" +
        '<div class="kx-gericht__unten"><span class="kx-preis">' + euro(g.preis) + "<s>" + euro(g.statt) + "</s></span>" +
        '<span class="kx-menge"><button type="button" data-d="-1" aria-label="' + esc(g.name) + ' weniger">−</button><output>' + m + '</output><button type="button" class="kx-plus" data-d="1" aria-label="' + esc(g.name) + ' mehr">+</button></span>' +
        "</div></div></div>";
    }).join("");
  }
  $("kxGerichte").addEventListener("click", function (e) {
    var b = e.target.closest("[data-d]"); if (!b) return;
    var karte = b.closest("[data-name]"), name = karte.dataset.name;
    var m = Math.max(0, Math.min(50, (S.menge[name] || 0) + parseInt(b.dataset.d, 10)));
    S.menge[name] = m;
    var out = karte.querySelector("output"); out.textContent = m;
    out.classList.remove("is-pop"); void out.offsetWidth; out.classList.add("is-pop");
    karte.classList.toggle("is-gew", m > 0);
    kategorien(); leiste(); if (b.dataset.d === "1") bump();
  });

  function pakete() {
    $("kxPakete").innerHTML = PAKETE.map(function (p, i) {
      return '<button type="button" class="kx-paket' + (S.paket === p.key ? " is-on" : "") + '" data-paket="' + p.key + '" style="animation-delay:' + (i * 0.05) + 's">' +
        '<img src="/assets/img/mittag/' + p.bild + '.webp" alt="" loading="lazy">' +
        "<strong>" + p.name + "</strong><small>" + esc(p.text) + "</small>" +
        '<span class="kx-preis">' + euro(p.preis) + " p. P.<s>" + euro(p.statt) + "</s></span></button>";
    }).join("");
    paketWahl();
    $("kxPersonen").value = S.personen;
    $("kxSuess").checked = S.suess;
  }
  $("kxPakete").addEventListener("click", function (e) {
    var b = e.target.closest("[data-paket]"); if (!b) return;
    if (S.paket !== b.dataset.paket) S.wahl = [];
    S.paket = b.dataset.paket;
    Array.prototype.forEach.call($("kxPakete").children, function (x) { x.classList.toggle("is-on", x === b); });
    paketWahl(); leiste(); bump();
    $("kxPaketDetails").hidden = false;
  });
  function paketWahl() {
    var p = paketObj();
    $("kxPaketDetails").hidden = !p;
    if (!p || !p.wahl) { $("kxWahlBox").innerHTML = ""; return; }
    $("kxWahlBox").innerHTML = '<p class="kx-unterfrage">' + esc(p.wahl.titel) + (p.wahl.hilfe ? "<small>" + esc(p.wahl.hilfe) + "</small>" : "") + "</p>" +
      '<div class="kx-chips" style="flex-wrap:wrap;overflow:visible;margin:0;padding:0">' + p.wahl.optionen.map(function (o) {
        return '<button type="button" class="kx-chip' + (S.wahl.indexOf(o) > -1 ? " is-on" : "") + '" data-wahl="' + esc(o) + '">' + esc(o) + "</button>";
      }).join("") + "</div>";
  }
  $("kxWahlBox").addEventListener("click", function (e) {
    var b = e.target.closest("[data-wahl]"); if (!b) return;
    var p = paketObj(), o = b.dataset.wahl, i = S.wahl.indexOf(o);
    if (p.wahl.max === 1) S.wahl = [o];
    else if (i > -1) S.wahl.splice(i, 1);
    else if (S.wahl.length < p.wahl.max) S.wahl.push(o);
    else { S.wahl.shift(); S.wahl.push(o); }
    paketWahl(); leiste();
  });

  function zaehler(input, minus, plus, min, max, setze) {
    function set(v) { v = parseInt(v, 10); if (isNaN(v)) v = min; v = Math.max(min, Math.min(max, v)); input.value = v; setze(v); }
    function halten(btn, d) {
      var t1, t2;
      function stop() { clearTimeout(t1); clearInterval(t2); }
      btn.addEventListener("pointerdown", function (e) {
        e.preventDefault(); set(parseInt(input.value, 10) + d); var k = 0;
        t1 = setTimeout(function () { t2 = setInterval(function () { k++; set(parseInt(input.value, 10) + d * (k > 15 ? 5 : 1)); }, 80); }, 400);
      });
      ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) { btn.addEventListener(ev, stop); });
      btn.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); set(parseInt(input.value, 10) + d); } });
    }
    halten(minus, -1); halten(plus, 1);
    input.addEventListener("change", function () { set(input.value); });
    input.addEventListener("input", function () { var v = parseInt(input.value, 10); if (!isNaN(v) && v >= min && v <= max) setze(v); });
    input.addEventListener("focus", function () { input.select(); });
  }
  zaehler($("kxPersonen"), $("kxPersMinus"), $("kxPersPlus"), 5, 300, function (v) { S.personen = v; leiste(); });
  $("kxSuess").addEventListener("change", function () { S.suess = this.checked; leiste(); });

  // ---------- Liefertag & Uhrzeit ----------
  function lieferStart() {
    var tage = [], d = new Date(), jetzt = new Date();
    // Einzeln: heute moeglich, wenn noch eine Zeit mit 1 Stunde Vorlauf geht. Paket: ab morgen.
    if (S.modus === "paket" || jetzt.getHours() * 60 + jetzt.getMinutes() > 14 * 60) d.setDate(d.getDate() + 1);
    while (tage.length < 5) { if (d.getDay() !== 0 && d.getDay() !== 6) tage.push(isoTag(d)); d.setDate(d.getDate() + 1); }
    if (tage.indexOf(S.tag) === -1) S.tag = tage[0];
    $("kxTage").innerHTML = tage.map(function (t) {
      var x = new Date(t + "T12:00:00");
      var heute = t === isoTag(new Date()), morgen = t === isoTag(new Date(Date.now() + 864e5));
      return '<button type="button" class="kx-tag' + (S.tag === t ? " is-on" : "") + '" data-tag="' + t + '"><small>' +
        (heute ? "Heute" : morgen ? "Morgen" : x.toLocaleDateString("de-DE", { weekday: "short" })) + "</small><strong>" + x.getDate() + "." + (x.getMonth() + 1) + ".</strong></button>";
    }).join("");
    zeiten();
    $("kxLieferText").textContent = S.modus === "einzeln"
      ? "Montag bis Freitag zwischen 11:30 und 15:00 Uhr – frisch gekocht, mindestens 1 Stunde Vorlauf."
      : "Team-Pakete bestellen Sie bis zum Vortag – geliefert mit Servietten und Besteck.";
    $("kxNotiz").value = S.notiz;
  }
  function zeiten() {
    var heute = S.tag === isoTag(new Date()), jetzt = new Date(), grenze = jetzt.getHours() * 60 + jetzt.getMinutes() + 60;
    if (S.zeit && heute) { var p = S.zeit.split(":"); if (+p[0] * 60 + +p[1] < grenze) S.zeit = null; }
    $("kxZeiten").innerHTML = ZEITEN.map(function (z) {
      var p = z.split(":"), weg = heute && (+p[0] * 60 + +p[1] < grenze);
      return '<button type="button" class="kx-chip' + (S.zeit === z ? " is-on" : "") + '" data-zeit="' + z + '"' + (weg ? " disabled" : "") + ">" + z + "</button>";
    }).join("");
  }
  $("kxTage").addEventListener("click", function (e) {
    var b = e.target.closest("[data-tag]"); if (!b) return;
    S.tag = b.dataset.tag;
    Array.prototype.forEach.call(this.children, function (x) { x.classList.toggle("is-on", x === b); });
    zeiten(); leiste();
  });
  $("kxZeiten").addEventListener("click", function (e) {
    var b = e.target.closest("[data-zeit]"); if (!b || b.disabled) return;
    S.zeit = b.dataset.zeit; zeiten(); leiste(); bump();
  });
  $("kxNotiz").addEventListener("input", function () { S.notiz = this.value; });
  // Beim Wechsel auf "liefern" Tage aufbauen
  var _zeige = zeige;
  zeige = function (name, zurueck) { if (name === "liefern") lieferStart(); _zeige(name, zurueck); };

  function bestellen() {
    var tagText = tagLang(S.tag), notiz = (S.notiz || "").trim().replace(/\s+/g, " "), kurz, mehr, betreff, felder, danke, letzte;
    if (S.modus === "einzeln") {
      var w = warenkorb();
      kurz = "Mittagstisch · " + tagText + " · " + S.zeit + " Uhr · " + w.n + " Artikel";
      mehr = w.liste.join(", ") + " · " + euro(w.summe);
      betreff = "Mittagstisch-Bestellung: " + tagText + " " + S.zeit + " Uhr";
      felder = { Tag: tagText, Uhrzeit: S.zeit + " Uhr", Bestellung: w.liste.join(", "), Artikel: w.n, Summe: euro(w.summe), Notiz: notiz || "—" };
      danke = [["Bestellung", w.liste.join(", ")], ["Lieferung", tagText + " · " + S.zeit + " Uhr"], ["Summe", euro(w.summe)]];
      letzte = { modus: "einzeln", menge: S.menge, text: w.liste.join(", ") };
    } else {
      var p = paketObj(), s = paketSumme();
      kurz = "Team-Paket · " + p.name + " · " + tagText + " · " + S.zeit + " Uhr · " + S.personen + " Personen";
      mehr = (S.wahl.length ? S.wahl.join(", ") + " · " : "") + euro(p.preis) + " p. P." + (S.suess ? " + Süßes" : "") + " · " + euro(s);
      betreff = "Team-Paket: " + p.name + " · " + S.personen + " Pers. · " + tagText + " " + S.zeit + " Uhr";
      felder = { Paket: p.name, Auswahl: S.wahl.join(", ") || "—", Personen: S.personen, "Süßes dazu": S.suess ? "ja" : "nein", Tag: tagText, Uhrzeit: S.zeit + " Uhr", Summe: euro(s), Notiz: notiz || "—" };
      danke = [["Paket", p.name + (S.wahl.length ? " (" + S.wahl.join(", ") + ")" : "")], ["Personen", String(S.personen) + (S.suess ? " · mit Süßem" : "")], ["Lieferung", tagText + " · " + S.zeit + " Uhr"], ["Summe", euro(s)]];
      letzte = { modus: "paket", paket: p.key, personen: S.personen, suess: S.suess, wahl: S.wahl, text: p.name + " für " + S.personen + " Personen" };
    }
    barBtn.disabled = true; barBtn.textContent = "Wird gesendet …";
    Promise.all([reaktion("interesse", null, kurz + " | " + mehr + (notiz ? " | Notiz: " + notiz : "")), mail(betreff, felder)]).then(function (r) {
      if (!r[0] && !r[1]) { leiste(); barFehler("Das hat leider nicht geklappt – bitte nochmal versuchen oder anrufen: 0177 201 9889"); return; }
      try { localStorage.setItem("mkLetzte_" + schluessel, JSON.stringify(letzte)); } catch (e) {}
      wiederZeigen();
      dankeZeigen("Danke – Ihre Bestellung ist da.", "Ich bestätige sie Ihnen gleich persönlich per WhatsApp oder Anruf. Bezahlung bar, auf Rechnung oder per PayPal.", danke);
      S.menge = {}; S.paket = null; S.wahl = []; S.suess = false; S.tag = null; S.zeit = null; S.notiz = "";
    });
  }

  // ---------- Feier planen ----------
  function feierStart(anlass) {
    S.f = { anlass: anlass || "", datum: "", offen: false, personen: S.f.personen || 30, wo: "", kueche: [], nachricht: "" };
    $("kxAnlaesse").innerHTML = ANLAESSE.map(function (a) { return '<button type="button" class="kx-chip' + (S.f.anlass === a ? " is-on" : "") + '" data-anlass="' + esc(a) + '">' + esc(a) + "</button>"; }).join("");
    $("kxWo").innerHTML = WO.map(function (w) { return '<button type="button" class="kx-chip" data-wo="' + w.key + '"><strong style="display:block;font-weight:500">' + w.titel + '</strong><small style="opacity:.7">' + w.text + "</small></button>"; }).join("");
    $("kxKuechen").innerHTML = KUECHEN.map(function (k) { return '<button type="button" class="kx-chip" data-kueche="' + esc(k) + '">' + esc(k) + "</button>"; }).join("");
    var heute = new Date();
    var schmal = window.matchMedia("(max-width: 860px)").matches;
    kalAnsicht = anlass === "Weihnachtsfeier" && heute.getMonth() < 11 ? new Date(heute.getFullYear(), schmal ? 11 : 10, 1) : new Date(heute.getFullYear(), heute.getMonth(), 1);
    $("kxOffen").checked = false;
    kalender();
    $("kxFPers").value = S.f.personen;
    $("kxNachricht").value = "";
    if (anlass) { $("kxF2Titel").textContent = "Wann und für wie viele?"; geh("feier2"); }
    else geh("feier1");
  }
  $("kxAnlaesse").addEventListener("click", function (e) {
    var b = e.target.closest("[data-anlass]"); if (!b) return;
    S.f.anlass = b.dataset.anlass;
    Array.prototype.forEach.call(this.children, function (x) { x.classList.toggle("is-on", x === b); });
    setTimeout(function () { geh("feier2"); }, bewegungAus ? 0 : 260);
  });
  // Kalender wie auf der Startseite: zwei Monate (Handy: einer), Do/Fr markiert, fruehestens in 3 Tagen
  var MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  var kalAnsicht = new Date();
  function kalMin() { var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 3); return d; }
  function kalMonat(y, m) {
    var h = '<div class="kx-kal__m"><h4>' + MONATE[m] + " " + y + '</h4><div class="kx-kal__g">' +
      ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map(function (w) { return "<b>" + w + "</b>"; }).join("");
    var off = (new Date(y, m, 1).getDay() + 6) % 7, n = new Date(y, m + 1, 0).getDate(), min = kalMin();
    for (var i = 0; i < off; i++) h += "<i></i>";
    for (var d = 1; d <= n; d++) {
      var x = new Date(y, m, d), iso = isoTag(x), wd = x.getDay();
      h += '<button type="button" data-d="' + iso + '"' + (x < min ? " disabled" : "") + ' class="' + ((wd === 4 || wd === 5) ? "is-pop" : "") + (S.f.datum === iso ? " is-sel" : "") +
        '" aria-label="' + d + ". " + MONATE[m] + " " + y + '" aria-pressed="' + (S.f.datum === iso) + '">' + d + "</button>";
    }
    return h + "</div></div>";
  }
  function kalender() {
    var y = kalAnsicht.getFullYear(), m = kalAnsicht.getMonth(), min = kalMin();
    $("kxKalMonate").innerHTML = kalMonat(y, m) + kalMonat(m === 11 ? y + 1 : y, (m + 1) % 12);
    $("kxKalVor").disabled = y < min.getFullYear() || (y === min.getFullYear() && m <= min.getMonth());
    $("kxKalSel").textContent = S.f.datum ? new Date(S.f.datum + "T12:00:00").toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "long", year: "numeric" }) : (S.f.offen ? "Noch offen" : "Bitte wählen");
    $("kxKal").classList.toggle("is-aus", S.f.offen);
  }
  $("kxKalVor").addEventListener("click", function () { kalAnsicht = new Date(kalAnsicht.getFullYear(), kalAnsicht.getMonth() - 1, 1); kalender(); });
  $("kxKalNach").addEventListener("click", function () { kalAnsicht = new Date(kalAnsicht.getFullYear(), kalAnsicht.getMonth() + 1, 1); kalender(); });
  $("kxKalMonate").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-d]"); if (!b || b.disabled) return;
    S.f.datum = b.dataset.d; S.f.offen = false; $("kxOffen").checked = false; kalender(); leiste(); bump();
  });
  $("kxOffen").addEventListener("change", function () { S.f.offen = this.checked; if (this.checked) S.f.datum = ""; kalender(); leiste(); });
  zaehler($("kxFPers"), $("kxFMinus"), $("kxFPlus"), 5, 1000, function (v) { S.f.personen = v; leiste(); });
  $("kxWo").addEventListener("click", function (e) {
    var b = e.target.closest("[data-wo]"); if (!b) return;
    S.f.wo = b.dataset.wo;
    Array.prototype.forEach.call(this.children, function (x) { x.classList.toggle("is-on", x === b); });
    setTimeout(function () { geh("feier4"); }, bewegungAus ? 0 : 260);
  });
  $("kxKuechen").addEventListener("click", function (e) {
    var b = e.target.closest("[data-kueche]"); if (!b) return;
    var k = b.dataset.kueche, i = S.f.kueche.indexOf(k);
    if (i > -1) S.f.kueche.splice(i, 1); else S.f.kueche.push(k);
    b.classList.toggle("is-on", i === -1); leiste();
  });
  $("kxNachricht").addEventListener("input", function () { S.f.nachricht = this.value; });

  function woText() { var w = WO.filter(function (x) { return x.key === S.f.wo; })[0]; return w ? w.titel : "Noch offen"; }
  function feierZeilen() {
    return [["Anlass", S.f.anlass], ["Termin", S.f.datum ? datumDe(S.f.datum) : "noch offen"], ["Gäste", S.f.personen + " Personen"], ["Ort", woText()],
      ["Küche", S.f.kueche.length ? S.f.kueche.join(", ") : "berate ich Sie gern"]];
  }
  function zusammenfassung() {
    var z = feierZeilen();
    $("kxFSumme").innerHTML = z.map(function (r) { return '<div class="kx-summe__z"><span>' + r[0] + "</span><b>" + esc(r[1]) + "</b></div>"; }).join("") +
      '<div class="kx-summe__z is-total"><span>Ihr Black-Card-Preis</span><b>ab ' + euro(BUFFET) + ' p. P.<br><small style="color:var(--mute);font-weight:400">statt ' + euro(BUFFET_NORMAL) + " · ca. " + euro(S.f.personen * BUFFET).replace(",00", "") + " gesamt</small></b></div>" +
      (S.f.nachricht.trim() ? '<div class="kx-summe__z"><span>Nachricht</span><b>' + esc(S.f.nachricht.trim()) + "</b></div>" : "");
  }
  function feierSenden() {
    var kurz = S.f.anlass + " · " + (S.f.datum ? datumDe(S.f.datum) : "Termin offen") + " · " + S.f.personen + " Personen";
    var mehr = woText() + " · Küche: " + (S.f.kueche.join(", ") || "offen") + " · ab " + euro(BUFFET) + " p. P.";
    var nachricht = S.f.nachricht.trim().replace(/\s+/g, " ");
    barBtn.disabled = true; barBtn.textContent = "Wird gesendet …";
    Promise.all([
      reaktion("interesse", null, kurz + " | " + mehr + (nachricht ? " | Nachricht: " + nachricht : "")),
      mail("Feier-Anfrage: " + kurz, { Anlass: S.f.anlass, Termin: S.f.datum ? datumDe(S.f.datum) : "offen", Personen: S.f.personen, Ort: woText(), Küche: S.f.kueche.join(", ") || "offen", Nachricht: nachricht || "—" })
    ]).then(function (r) {
      if (!r[0] && !r[1]) { leiste(); barFehler("Das hat leider nicht geklappt – bitte nochmal versuchen oder anrufen: 0177 201 9889"); return; }
      dankeZeigen("Danke – Ihre Anfrage ist da.", "Ich melde mich persönlich mit Ihrem Angebot, meist noch am selben Tag.", feierZeilen());
    });
  }

  // ---------- Danke ----------
  function dankeZeigen(titel, text, zeilen) {
    $("kxDankeTitel").textContent = titel;
    $("kxDankeText").textContent = text;
    $("kxDankeSumme").innerHTML = zeilen.map(function (r) { return '<div class="kx-summe__z"><span>' + esc(r[0]) + "</span><b>" + esc(r[1]) + "</b></div>"; }).join("");
    var h = $("kxHaken"); var neu = h.cloneNode(true); h.parentNode.replaceChild(neu, h); // Animation neu starten
    geh("danke", true);
  }
  $("kxNochmal").addEventListener("click", function () { geh("start", true); });

  // ---------- Laden ----------
  client.rpc("business_karte_anzeigen", { p_token: schluessel }).then(function (res) {
    if (res.error || !res.data || !res.data.kundennummer) throw res.error || new Error("nicht gefunden");
    K = res.data;
    history.replaceState({ s: "start" }, "");
    start();
    if (laden) laden.hidden = true;
    app.hidden = false;
    if (location.hash === "#weihnachten") feierStart("Weihnachtsfeier");
    else if (location.hash === "#bestellen") essenStart();
  }).catch(fehler);
})();
