(function () {
  "use strict";

  // Aufgaben-Reiter im Vertrieb: alles, was fuer MK erledigt werden muss,
  // an einem Ort. Nutzt die Anmeldung des Vertriebs (window.mkVertrieb).
  var ARTEN = {
    anruf: "Anruf", lieferung: "Lieferung", vertrieb: "Vertrieb", marketing: "Marketing", sonstiges: "Sonstiges"
  };

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function iso(d) {
    var p = function (n) { return String(n).padStart(2, "0"); };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }
  function plusTage(n) { var d = new Date(); d.setDate(d.getDate() + n); return iso(d); }
  function datumKurz(s) {
    if (!s) return "";
    var d = new Date(s + "T12:00:00");
    return d.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "numeric" });
  }

  var client = null, aufgaben = [], kontakte = [], meilensteine = [], zeigeErledigt = false;
  document.addEventListener("mk-meilensteine", function (e) {
    meilensteine = e.detail || [];
    var sel = $("afMeilenstein"); if (!sel) return;
    var v = sel.value;
    sel.innerHTML = '<option value="">Ohne Meilenstein</option>' + meilensteine.filter(function (m) { return !m.erledigt_at; }).map(function (m) { return '<option value="' + m.id + '">' + esc(m.phase + " · " + m.titel) + "</option>"; }).join("");
    sel.value = v;
    if (aufgaben.length) zeichnen();
  });
  function msName(id) { var m = meilensteine.filter(function (x) { return x.id === id; })[0]; return m ? m.titel : ""; }

  function laden() {
    if (!client) return;
    Promise.all([
      client.from("mk_aufgaben").select("*").order("faellig", { ascending: true, nullsFirst: false }).order("created_at"),
      client.from("prospects").select("id,name").order("name")
    ]).then(function (r) {
      if (r[0].error) {
        $("afListe").innerHTML = '<p class="af-hinweis">Die Aufgaben-Tabelle fehlt noch in Supabase (SQL 019 ausführen).</p>';
        return;
      }
      aufgaben = r[0].data || [];
      kontakte = r[1].data || [];
      kontaktListe();
      zeichnen();
    });
  }

  function kontaktListe() {
    var dl = $("afKontakte");
    if (dl) dl.innerHTML = kontakte.map(function (k) { return '<option value="' + esc(k.name) + '"></option>'; }).join("");
  }
  function kontaktName(id) {
    var k = kontakte.filter(function (x) { return x.id === id; })[0];
    return k ? k.name : "";
  }

  function zeile(a) {
    var heute = iso(new Date()), spaet = a.faellig && a.faellig < heute && !a.erledigt_at;
    return '<div class="af-zeile' + (a.erledigt_at ? " is-erledigt" : "") + '" data-id="' + a.id + '">' +
      '<button type="button" class="af-haken" data-haken aria-label="' + (a.erledigt_at ? "Wieder öffnen" : "Erledigt") + '">' + (a.erledigt_at ? "✓" : "") + "</button>" +
      '<div class="af-text"><strong>' + esc(a.titel) + "</strong>" +
      '<span class="af-meta"><em class="af-art af-art--' + a.art + '">' + ARTEN[a.art] + "</em>" +
      (a.faellig ? '<span class="' + (spaet ? "af-spaet" : "") + '">' + datumKurz(a.faellig) + "</span>" : "") +
      (a.prospect_id ? '<button type="button" class="af-kontakt" data-kontakt="' + a.prospect_id + '">' + esc(kontaktName(a.prospect_id)) + " →</button>" : "") +
      (a.meilenstein_id && msName(a.meilenstein_id) ? '<span class="af-ms">◆ ' + esc(msName(a.meilenstein_id)) + "</span>" : "") +
      "</span>" + (a.notiz ? '<span class="af-notiz">' + esc(a.notiz) + "</span>" : "") + "</div>" +
      '<button type="button" class="af-weg" data-weg aria-label="Löschen" title="Löschen">×</button></div>';
  }

  function gruppe(titel, liste, klasse) {
    if (!liste.length) return "";
    return '<div class="af-gruppe ' + (klasse || "") + '"><p class="af-gruppe__titel">' + titel + ' <span>' + liste.length + "</span></p>" + liste.map(zeile).join("") + "</div>";
  }

  function zeichnen() {
    var heute = iso(new Date()), woche = plusTage(7);
    var offen = aufgaben.filter(function (a) { return !a.erledigt_at; });
    var erledigt = aufgaben.filter(function (a) { return a.erledigt_at; }).sort(function (a, b) { return b.erledigt_at.localeCompare(a.erledigt_at); });
    var html =
      gruppe("Überfällig", offen.filter(function (a) { return a.faellig && a.faellig < heute; }), "af-gruppe--spaet") +
      gruppe("Heute", offen.filter(function (a) { return a.faellig === heute; }), "af-gruppe--heute") +
      gruppe("Nächste 7 Tage", offen.filter(function (a) { return a.faellig && a.faellig > heute && a.faellig <= woche; })) +
      gruppe("Später", offen.filter(function (a) { return a.faellig && a.faellig > woche; })) +
      gruppe("Ohne Termin", offen.filter(function (a) { return !a.faellig; }));
    if (!offen.length) html = '<p class="af-leer">Alles erledigt ✓</p>';
    html += '<button type="button" class="btn btn--dark af-toggle" id="afToggle">' + (zeigeErledigt ? "Erledigte ausblenden" : "Erledigte anzeigen (" + erledigt.length + ")") + "</button>";
    if (zeigeErledigt) html += gruppe("Erledigt", erledigt.slice(0, 40), "af-gruppe--fertig");
    $("afListe").innerHTML = html;
    var n = offen.filter(function (a) { return a.faellig && a.faellig <= heute; }).length;
    var badge = $("afBadge");
    if (badge) { badge.textContent = n; badge.hidden = !n; }
  }

  function anlegen(e) {
    e.preventDefault();
    var titel = $("afTitel").value.trim();
    if (!titel) { $("afTitel").focus(); return; }
    var kName = $("afKontakt").value.trim();
    var k = kontakte.filter(function (x) { return x.name.toLowerCase() === kName.toLowerCase(); })[0];
    var btn = $("afSpeichern"); btn.disabled = true;
    client.from("mk_aufgaben").insert({
      titel: titel, art: $("afArt").value, faellig: $("afFaellig").value || null,
      prospect_id: k ? k.id : null, meilenstein_id: ($("afMeilenstein") && $("afMeilenstein").value) || null, notiz: $("afNotiz").value.trim() || null
    }).then(function (r) {
      btn.disabled = false;
      if (r.error) { $("afStatus").textContent = "Speichern hat nicht geklappt."; return; }
      $("afForm").reset(); $("afStatus").textContent = "";
      laden();
      if (window.mkPlanNeuLaden) window.mkPlanNeuLaden();
    });
  }

  function klick(e) {
    var z = e.target.closest("[data-id]");
    if (e.target.id === "afToggle") { zeigeErledigt = !zeigeErledigt; zeichnen(); return; }
    var kb = e.target.closest("[data-kontakt]");
    if (kb) { if (window.mkVertrieb && window.mkVertrieb.oeffneKontakt) window.mkVertrieb.oeffneKontakt(kb.dataset.kontakt); return; }
    if (!z) return;
    var a = aufgaben.filter(function (x) { return x.id === z.dataset.id; })[0];
    if (!a) return;
    if (e.target.closest("[data-haken]")) {
      a.erledigt_at = a.erledigt_at ? null : new Date().toISOString();
      zeichnen();
      client.from("mk_aufgaben").update({ erledigt_at: a.erledigt_at }).eq("id", a.id).then(function (r) { if (r.error) laden(); if (window.mkPlanNeuLaden) window.mkPlanNeuLaden(); });
    } else if (e.target.closest("[data-weg]")) {
      if (!confirm("Aufgabe löschen?")) return;
      aufgaben = aufgaben.filter(function (x) { return x.id !== a.id; });
      zeichnen();
      client.from("mk_aufgaben").delete().eq("id", a.id).then(function (r) { if (r.error) laden(); });
    }
  }

  function start() {
    if (client || !window.mkVertrieb || !window.mkVertrieb.client) return;
    client = window.mkVertrieb.client;
    $("afForm").addEventListener("submit", anlegen);
    $("afListe").addEventListener("click", klick);
    $("afFaellig").value = iso(new Date());
    laden();
  }
  document.addEventListener("mk-vertrieb-bereit", start);
  start();
  var reiter = document.querySelector('[data-tab="tabAufgaben"]');
  if (reiter) reiter.addEventListener("click", function () { if (client) laden(); });
})();
