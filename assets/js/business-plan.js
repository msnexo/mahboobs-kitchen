(function () {
  "use strict";

  // Reiter "Plan", bewusst einfach: Ziel (mit automatischem Fortschritt),
  // Weg dorthin (Jetzt / Danach / Spaeter), darunter die Aufgaben (business-aufgaben.js).
  var STUFEN = [["jetzt", "Jetzt"], ["danach", "Danach"], ["spaeter", "Später"]];
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  var client = null, text = {}, schritte = [], aufg = [], karten = 0, zeigeFertig = false;

  function laden() {
    if (!client) return;
    Promise.all([
      client.from("mk_plan_text").select("*"),
      client.from("mk_meilensteine").select("*").order("sort").order("created_at"),
      client.from("mk_aufgaben").select("id,erledigt_at,meilenstein_id"),
      client.from("prospects").select("id", { count: "exact", head: true }).not("card_token", "is", null)
    ]).then(function (r) {
      if (r[0].error || r[1].error) { $("plWrap").innerHTML = '<p class="af-hinweis">Der Plan braucht noch die Tabellen in Supabase (SQL 020 ausführen).</p>'; return; }
      text = {}; (r[0].data || []).forEach(function (x) { text[x.schluessel] = x.wert; });
      schritte = r[1].data || []; aufg = r[2].data || []; karten = r[3].count || 0;
      zeichnen();
      document.dispatchEvent(new CustomEvent("mk-meilensteine", { detail: schritte }));
    });
  }

  function stufe(s) { return s.phase === "danach" || s.phase === "spaeter" ? s.phase : "jetzt"; }
  function offen() { return schritte.filter(function (x) { return !x.erledigt_at; }); }

  function zeichnen() {
    var zahl = parseInt(text.ziel_zahl, 10) || 0, p = zahl ? Math.min(100, Math.round(karten / zahl * 100)) : 0;
    var h = '<section class="pl-box pl-ziel">' +
      (text.vision ? '<p class="pl-vision">' + esc(text.vision) + "</p>" : "") +
      '<div class="pl-kopf"><span class="pl-label">Ziel</span><button type="button" class="pl-mini" data-act="ziel">Bearbeiten</button></div>' +
      (text.ziel ? '<p class="pl-ziel__satz">' + esc(text.ziel) + "</p>" : '<p class="pl-leer">Noch kein Ziel festgelegt.</p>') +
      (zahl ? '<div class="pl-stand"><b>' + karten + "</b> / " + zahl + " Black-Card-Firmen</div>" + '<div class="pl-bar"><i style="width:' + p + '%"></i></div>' : "") +
      '<p class="pl-kompass">Kompass: Geht es ohne Rey? · Klappt es bei 10× so vielen Kunden? · Ist es festgehalten?</p></section>';

    h += '<section class="pl-box"><div class="pl-kopf"><span class="pl-label">Weg dorthin</span><button type="button" class="pl-mini" data-act="neu">+ Schritt</button></div>';
    var fertig = schritte.filter(function (s) { return s.erledigt_at; });
    if (!schritte.length) h += '<p class="pl-leer">Noch keine Schritte. Was bringt uns als Erstes zum Ziel?</p>';
    STUFEN.forEach(function (st) {
      var liste = offen().filter(function (s) { return stufe(s) === st[0]; });
      if (!liste.length) return;
      h += '<div class="pl-stufe pl-stufe--' + st[0] + '"><span class="pl-stufe__name">' + st[1] + "</span><ul>" + liste.map(function (s) {
        var a = aufg.filter(function (x) { return x.meilenstein_id === s.id; }), ad = a.filter(function (x) { return x.erledigt_at; }).length;
        return '<li data-s="' + s.id + '"><button type="button" class="af-haken" data-act="fertig" aria-label="Erledigt"></button>' +
          '<span class="pl-s__t">' + esc(s.titel) + (a.length ? " <small>Aufgaben " + ad + "/" + a.length + "</small>" : "") + "</span>" +
          (st[0] !== "jetzt" ? '<button type="button" class="pl-link" data-act="hoch">nach oben</button>' : "") +
          '<button type="button" class="pl-x" data-act="weg" title="Löschen">×</button></li>';
      }).join("") + "</ul></div>";
    });
    if (fertig.length) {
      h += '<button type="button" class="pl-link pl-fertig-btn" data-act="zeige">' + (zeigeFertig ? "Erledigte ausblenden" : "✓ " + fertig.length + " erledigt") + "</button>";
      if (zeigeFertig) h += '<ul class="pl-fertig">' + fertig.map(function (s) { return '<li data-s="' + s.id + '"><button type="button" class="af-haken" data-act="fertig">✓</button><span class="pl-s__t">' + esc(s.titel) + "</span></li>"; }).join("") + "</ul>";
    }
    h += "</section>";
    $("plWrap").innerHTML = h;
  }

  function speichern(k, v) { return client.from("mk_plan_text").upsert({ schluessel: k, wert: v }); }

  function klick(e) {
    var b = e.target.closest("[data-act]"); if (!b) return;
    var act = b.dataset.act, li = b.closest("[data-s]"), s = li && schritte.filter(function (x) { return x.id === li.dataset.s; })[0];
    if (act === "ziel") {
      var z = prompt("Ziel in einem Satz:", text.ziel || ""); if (z === null) return;
      var n = prompt("Wie viele Black-Card-Firmen? (Zahl für den Fortschrittsbalken)", text.ziel_zahl || "50"); if (n === null) return;
      var v = prompt("Vision (kleine Zeile darüber, optional):", text.vision || ""); if (v === null) return;
      Promise.all([speichern("ziel", z.trim()), speichern("ziel_zahl", String(parseInt(n, 10) || "")), speichern("vision", v.trim())]).then(laden);
    } else if (act === "neu") {
      var t = prompt("Neuer Schritt:"); if (!t) return;
      var w = prompt("Wann?\n1 = Jetzt\n2 = Danach\n3 = Später", offen().some(function (x) { return stufe(x) === "jetzt"; }) ? "2" : "1"); if (w === null) return;
      client.from("mk_meilensteine").insert({ titel: t.trim(), phase: ["jetzt", "danach", "spaeter"][(parseInt(w, 10) || 1) - 1] || "jetzt", sort: schritte.length }).then(laden);
    } else if (act === "zeige") {
      zeigeFertig = !zeigeFertig; zeichnen();
    } else if (act === "fertig" && s) {
      client.from("mk_meilensteine").update({ erledigt_at: s.erledigt_at ? null : new Date().toISOString() }).eq("id", s.id).then(laden);
    } else if (act === "hoch" && s) {
      client.from("mk_meilensteine").update({ phase: stufe(s) === "spaeter" ? "danach" : "jetzt" }).eq("id", s.id).then(laden);
    } else if (act === "weg" && s) {
      if (confirm("Schritt löschen? Die Aufgaben bleiben erhalten.")) client.from("mk_meilensteine").delete().eq("id", s.id).then(laden);
    }
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
