(function () {
  "use strict";

  // Reiter "Plan": Ziel, Kennzahlen, Fahrplan (Meilensteine), Wochenrueckblick.
  // Aufgaben (business-aufgaben.js) haengen optional an einem Meilenstein.
  var QUELLEN = {
    manuell: "Selbst eintragen", karteninhaber: "Karteninhaber (automatisch)",
    leads_woche: "Neue Leads diese Woche (automatisch)", leads_monat: "Neue Leads diesen Monat (automatisch)",
    bestellungen_monat: "Bestellungen über die Karte diesen Monat (automatisch)"
  };
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function iso(d) { var p = function (n) { return String(n).padStart(2, "0"); }; return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()); }
  function datum(s) { return s ? new Date(s + "T12:00:00").toLocaleDateString("de-DE", { day: "numeric", month: "numeric", year: "2-digit" }) : ""; }
  function montag(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
  function kw(d) { var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); var n = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - n); var j = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - j) / 864e5 + 1) / 7); }

  var client = null, text = {}, kennz = [], meil = [], aufg = [], auto = {};

  function laden() {
    if (!client) return;
    var heute = new Date(), mo = montag(heute), monat = new Date(heute.getFullYear(), heute.getMonth(), 1);
    Promise.all([
      client.from("mk_plan_text").select("*"),
      client.from("mk_kennzahlen").select("*").order("sort").order("created_at"),
      client.from("mk_meilensteine").select("*").order("sort").order("frist", { nullsFirst: false }),
      client.from("mk_aufgaben").select("id,titel,faellig,erledigt_at,meilenstein_id,created_at"),
      client.from("prospects").select("id", { count: "exact", head: true }).not("card_token", "is", null),
      client.from("prospects").select("id", { count: "exact", head: true }).gte("created_at", mo.toISOString()),
      client.from("prospects").select("id", { count: "exact", head: true }).gte("created_at", monat.toISOString()),
      client.from("prospect_signals").select("id", { count: "exact", head: true }).neq("art", "abmeldung").gte("created_at", monat.toISOString())
    ]).then(function (r) {
      if (r[0].error || r[2].error) { $("plWrap").innerHTML = '<p class="af-hinweis">Der Plan braucht noch die Tabellen in Supabase (SQL 020 ausführen).</p>'; return; }
      text = {}; (r[0].data || []).forEach(function (x) { text[x.schluessel] = x.wert; });
      kennz = r[1].data || []; meil = r[2].data || []; aufg = r[3].data || [];
      auto = { karteninhaber: r[4].count || 0, leads_woche: r[5].count || 0, leads_monat: r[6].count || 0, bestellungen_monat: r[7].count || 0 };
      zeichnen();
      document.dispatchEvent(new CustomEvent("mk-meilensteine", { detail: meil }));
    });
  }

  function istWert(k) { return k.quelle === "manuell" ? Number(k.ist_wert) || 0 : (auto[k.quelle] || 0); }
  function balken(p, rot) { p = Math.max(0, Math.min(100, Math.round(p))); return '<div class="pl-bar' + (rot ? " is-rot" : "") + '"><i style="width:' + p + '%"></i></div>'; }

  function zeichnen() {
    var heute = iso(new Date());
    var h = "";
    // Ziel
    h += '<section class="pl-box pl-ziel"><div class="pl-kopf"><span class="pl-label">Unser Ziel</span><button type="button" class="pl-mini" data-act="ziel">Bearbeiten</button></div>' +
      (text.ziel ? '<p class="pl-ziel__satz">' + esc(text.ziel) + "</p>" : '<p class="pl-leer">Noch kein Ziel festgelegt.</p>') + "</section>";
    // Kennzahlen
    h += '<section class="pl-box"><div class="pl-kopf"><span class="pl-label">Kennzahlen</span><button type="button" class="pl-mini" data-act="kz-neu">+ Kennzahl</button></div>';
    if (!kennz.length) h += '<p class="pl-leer">Noch keine Kennzahlen. Lege fest, woran wir Erfolg messen.</p>';
    else h += '<div class="pl-kz">' + kennz.map(function (k) {
      var ist = istWert(k), ziel = Number(k.ziel_wert) || 1, p = ist / ziel * 100, rot = k.frist && k.frist < heute && ist < ziel;
      return '<div class="pl-kz__k" data-kz="' + k.id + '"><div class="pl-kz__oben"><strong>' + esc(k.titel) + '</strong><button type="button" class="pl-x" data-act="kz-weg" title="Löschen">×</button></div>' +
        '<div class="pl-kz__zahl"><b>' + ist + '</b> / ' + ziel + (k.frist ? '<span class="' + (rot ? "pl-rot" : "") + '">bis ' + datum(k.frist) + "</span>" : "") + "</div>" + balken(p, rot) +
        (k.quelle === "manuell" ? '<button type="button" class="pl-link" data-act="kz-ist">Stand eintragen</button>' : '<span class="pl-auto">automatisch</span>') + "</div>";
    }).join("") + "</div>";
    h += "</section>";
    // Fahrplan
    h += '<section class="pl-box"><div class="pl-kopf"><span class="pl-label">Fahrplan</span><button type="button" class="pl-mini" data-act="ms-neu">+ Meilenstein</button></div>';
    if (!meil.length) h += '<p class="pl-leer">Noch keine Meilensteine. Hier entsteht Schritt für Schritt unser Weg zum Ziel.</p>';
    else {
      var phasen = []; meil.forEach(function (m) { if (phasen.indexOf(m.phase) < 0) phasen.push(m.phase); });
      phasen.forEach(function (ph) {
        var ms = meil.filter(function (m) { return m.phase === ph; }), fertig = ms.filter(function (m) { return m.erledigt_at; }).length;
        h += '<div class="pl-phase"><div class="pl-phase__kopf"><strong>' + esc(ph) + '</strong><span>' + fertig + " / " + ms.length + "</span></div>" + balken(fertig / ms.length * 100) +
          '<ol class="pl-ms">' + ms.map(function (m) {
            var a = aufg.filter(function (x) { return x.meilenstein_id === m.id; }), ad = a.filter(function (x) { return x.erledigt_at; }).length;
            var spaet = !m.erledigt_at && m.frist && m.frist < heute, leer = !m.erledigt_at && !a.filter(function (x) { return !x.erledigt_at; }).length;
            return '<li class="pl-ms__m' + (m.erledigt_at ? " is-fertig" : "") + (spaet ? " is-spaet" : "") + '" data-ms="' + m.id + '">' +
              '<button type="button" class="af-haken" data-act="ms-fertig" aria-label="Erledigt">' + (m.erledigt_at ? "✓" : "") + "</button>" +
              '<div class="pl-ms__t"><strong>' + esc(m.titel) + "</strong>" +
              '<span class="pl-ms__meta">' + (m.frist ? '<span class="' + (spaet ? "pl-rot" : "") + '">bis ' + datum(m.frist) + "</span>" : "ohne Frist") +
              (a.length ? " · Aufgaben " + ad + "/" + a.length : "") + (leer ? ' · <em class="pl-warn">Nächster Schritt fehlt</em>' : "") + "</span>" +
              (a.length ? balken(ad / a.length * 100) : "") + (m.notiz ? '<span class="af-notiz">' + esc(m.notiz) + "</span>" : "") + "</div>" +
              '<button type="button" class="pl-x" data-act="ms-weg" title="Löschen">×</button></li>';
          }).join("") + "</ol></div>";
      });
    }
    h += "</section>";
    // Wochenrueckblick
    var mo = montag(new Date()), wochen = [];
    for (var i = 0; i < 4; i++) {
      var von = new Date(mo); von.setDate(von.getDate() - 7 * i); var bis = new Date(von); bis.setDate(bis.getDate() + 7);
      var vI = iso(von), bI = iso(bis);
      var geplant = aufg.filter(function (a) { return a.faellig && a.faellig >= vI && a.faellig < bI; });
      var erl = aufg.filter(function (a) { return a.erledigt_at && a.erledigt_at.slice(0, 10) >= vI && a.erledigt_at.slice(0, 10) < bI; });
      wochen.push({ kw: kw(von), g: geplant.length, gd: geplant.filter(function (a) { return a.erledigt_at; }).length, e: erl.length, jetzt: i === 0 });
    }
    h += '<section class="pl-box"><div class="pl-kopf"><span class="pl-label">Wochenrückblick</span></div><div class="pl-wochen">' + wochen.map(function (w) {
      return '<div class="pl-woche' + (w.jetzt ? " is-jetzt" : "") + '"><strong>KW ' + w.kw + (w.jetzt ? " · jetzt" : "") + "</strong><span>" + w.gd + " von " + w.g + " geplanten erledigt</span>" + balken(w.g ? w.gd / w.g * 100 : 0) + "<small>" + w.e + " Aufgaben insgesamt abgehakt</small></div>";
    }).join("") + "</div></section>";
    $("plWrap").innerHTML = h;
  }

  function speichernText(k, v) { return client.from("mk_plan_text").upsert({ schluessel: k, wert: v }); }

  function klick(e) {
    var b = e.target.closest("[data-act]"); if (!b) return;
    var act = b.dataset.act, kzEl = b.closest("[data-kz]"), msEl = b.closest("[data-ms]");
    if (act === "ziel") {
      var z = prompt("Unser Ziel in einem Satz:", text.ziel || ""); if (z === null) return;
      speichernText("ziel", z.trim()).then(laden);
    } else if (act === "kz-neu") {
      var t = prompt("Kennzahl, z. B. „Karteninhaber“ oder „Google-Bewertungen“:"); if (!t) return;
      var q = prompt("Woher kommt der Stand?\n1 = selbst eintragen\n2 = Karteninhaber (automatisch)\n3 = Neue Leads diese Woche\n4 = Neue Leads diesen Monat\n5 = Bestellungen über die Karte diesen Monat", "1"); if (q === null) return;
      var quelle = ["manuell", "karteninhaber", "leads_woche", "leads_monat", "bestellungen_monat"][(parseInt(q, 10) || 1) - 1] || "manuell";
      var zw = parseFloat(prompt("Zielwert (Zahl):", "")); if (!zw) return;
      var fr = prompt("Bis wann? (TT.MM.JJJJ, leer = ohne Frist)", "");
      client.from("mk_kennzahlen").insert({ titel: t.trim(), quelle: quelle, ziel_wert: zw, frist: deDatum(fr), sort: kennz.length }).then(laden);
    } else if (act === "kz-ist" && kzEl) {
      var k = kennz.filter(function (x) { return x.id === kzEl.dataset.kz; })[0];
      var v = prompt("Aktueller Stand für „" + k.titel + "“:", k.ist_wert); if (v === null) return;
      client.from("mk_kennzahlen").update({ ist_wert: parseFloat(v) || 0 }).eq("id", k.id).then(laden);
    } else if (act === "kz-weg" && kzEl) {
      if (confirm("Kennzahl löschen?")) client.from("mk_kennzahlen").delete().eq("id", kzEl.dataset.kz).then(laden);
    } else if (act === "ms-neu") {
      var mt = prompt("Meilenstein, z. B. „100 physische Karten im Umlauf“:"); if (!mt) return;
      var phs = meil.map(function (m) { return m.phase; }).filter(function (p, i, a) { return a.indexOf(p) === i; });
      var ph = prompt("Phase" + (phs.length ? " (bisher: " + phs.join(", ") + ")" : "") + ":", phs[phs.length - 1] || "Phase 1 · Lokal"); if (ph === null) return;
      var mf = prompt("Bis wann? (TT.MM.JJJJ, leer = ohne Frist)", "");
      client.from("mk_meilensteine").insert({ titel: mt.trim(), phase: (ph || "Phase 1").trim(), frist: deDatum(mf), sort: meil.length }).then(laden);
    } else if (act === "ms-fertig" && msEl) {
      var m = meil.filter(function (x) { return x.id === msEl.dataset.ms; })[0];
      client.from("mk_meilensteine").update({ erledigt_at: m.erledigt_at ? null : new Date().toISOString() }).eq("id", m.id).then(laden);
    } else if (act === "ms-weg" && msEl) {
      if (confirm("Meilenstein löschen? Die Aufgaben bleiben erhalten.")) client.from("mk_meilensteine").delete().eq("id", msEl.dataset.ms).then(laden);
    }
  }
  function deDatum(s) {
    if (!s) return null; var m = String(s).trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/); if (!m) return null;
    var j = m[3].length === 2 ? "20" + m[3] : m[3]; return j + "-" + ("0" + m[2]).slice(-2) + "-" + ("0" + m[1]).slice(-2);
  }

  function start() {
    if (client || !window.mkVertrieb || !window.mkVertrieb.client) return;
    client = window.mkVertrieb.client;
    $("plWrap").addEventListener("click", klick);
    laden();
  }
  window.mkPlanNeuLaden = function () { laden(); };
  document.addEventListener("mk-vertrieb-bereit", start);
  start();
  var reiter = document.querySelector('[data-tab="tabAufgaben"]');
  if (reiter) reiter.addEventListener("click", function () { if (client) laden(); });
})();
