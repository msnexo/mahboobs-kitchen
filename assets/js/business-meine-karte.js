(function () {
  "use strict";

  // Die Business Karte des Kunden. Er kommt ueber den Link aus der Mail -
  // ohne Code, ohne E-Mail, ohne Passwort.
  var laden = document.getElementById("mkKarteLaden");
  var inhalt = document.getElementById("mkKarteInhalt");
  var mehr = document.getElementById("mkKarteMehr");
  var fehlerBox = document.getElementById("mkKarteFehler");
  if (!inhalt) return;

  var TELEFON_WA = "491772019889";
  var MAIL = "info@mahboobs-kitchen.com";

  function text(id, wert) {
    var el = document.getElementById(id);
    if (el) el.textContent = wert;
  }

  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function heute() {
    var d = new Date();
    var pad = function (n) { return String(n).padStart(2, "0"); };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function fehler() {
    if (laden) laden.hidden = true;
    if (fehlerBox) fehlerBox.hidden = false;
  }

  // Der Link traegt einen geheimen Schluessel - ohne ihn gibt es nichts zu sehen.
  var schluessel = new URLSearchParams(window.location.search).get("k") || "";
  if (!/^[0-9a-f]{32}$/.test(schluessel) || !window.mkBusiness) {
    fehler();
    return;
  }
  var client = window.mkBusiness.client;

  // "Interesse" oder "Bitte um Rueckruf" - landet mit einer Hand im Vertrieb.
  function melden(art, angebotId, knopf, danke) {
    var gruppe = knopf.parentNode.querySelectorAll("button");
    Array.prototype.forEach.call(gruppe, function (b) { b.disabled = true; });
    client.rpc("karte_reaktion", { p_token: schluessel, p_offer: angebotId || null, p_art: art }).then(function (res) {
      if (res.error) throw res.error;
      knopf.textContent = "Gesendet ✓";
      danke.textContent = art === "rueckruf"
        ? "Danke! Reyyan ruft Sie zeitnah zurück."
        : "Danke! Reyyan meldet sich persönlich bei Ihnen.";
      danke.className = "mk-danke";
      danke.hidden = false;
    }).catch(function () {
      Array.prototype.forEach.call(gruppe, function (b) { b.disabled = false; });
      danke.textContent = "Das hat leider nicht geklappt – rufen Sie gern direkt an: 0177 201 9889";
      danke.className = "mk-danke mk-danke--fehler";
      danke.hidden = false;
    });
  }

  function angeboteZeigen() {
    client.from("offers").select("*").eq("active", true).order("created_at", { ascending: false }).then(function (res) {
      var liste = (res.data || []).filter(function (o) { return !o.valid_until || o.valid_until >= heute(); });
      if (!liste.length) return;
      var box = document.getElementById("mkAngeboteListe");
      box.innerHTML = liste.map(function (o) {
        return '<article class="mk-angebot">' +
          (o.image_url ? '<img src="' + esc(o.image_url) + '" alt="">' : "") +
          '<div class="mk-angebot__text">' +
          "<h3>" + esc(o.title) + "</h3>" +
          (o.description ? "<p>" + esc(o.description).replace(/\n/g, "<br>") + "</p>" : "") +
          (o.valid_until
            ? '<span class="mk-angebot__bis">Gültig bis ' +
              new Date(o.valid_until + "T12:00:00").toLocaleDateString("de-DE") + "</span>"
            : "") +
          '<div class="mk-angebot__knoepfe">' +
          '<button type="button" class="btn btn--primary" data-art="interesse" data-angebot="' + esc(o.id) + '">Ich habe Interesse</button>' +
          '<button type="button" class="btn btn--dark" data-art="rueckruf" data-angebot="' + esc(o.id) + '">Bitte um Rückruf</button>' +
          "</div>" +
          '<p class="mk-danke" hidden></p>' +
          "</div></article>";
      }).join("");
      Array.prototype.forEach.call(box.querySelectorAll("[data-art]"), function (knopf) {
        knopf.addEventListener("click", function () {
          var danke = knopf.closest(".mk-angebot__text").querySelector(".mk-danke");
          melden(knopf.getAttribute("data-art"), knopf.getAttribute("data-angebot"), knopf, danke);
        });
      });
      document.getElementById("mkAngebote").hidden = false;
      // Aus der Wochen-Mail ("Angebot ansehen") direkt zu den Angeboten
      if (window.location.hash === "#angebote") {
        document.getElementById("angebote").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  client.rpc("business_karte_anzeigen", { p_token: schluessel }).then(function (res) {
    if (res.error || !res.data || !res.data.kundennummer) throw res.error || new Error("nicht gefunden");
    var k = res.data;
    var nr = k.kundennummer;
    var privat = k.kategorie === "Privatperson";
    var wer = k.ansprechpartner || k.firma;

    text("mkKarteNummer", nr);
    text("mkKarteNummer2", nr);
    text("mkKarteInhaber", k.firma);
    text("mkKarteSeit", String(new Date(k.seit).getFullYear()));
    text("mkKarteGruss", "Willkommen, " + wer);
    document.title = "MK Business Karte " + nr + " | Mahboobs Kitchen";

    // Die Kundennummer steht in jeder Anfrage schon drin.
    var vorstellung = "Hallo Reyyan, hier ist " + wer +
      (!privat && k.ansprechpartner ? " von " + k.firma : "") +
      ". Meine Kundennummer: " + nr;
    var wa = document.getElementById("mkKarteWhatsApp");
    if (wa) wa.href = "https://wa.me/" + TELEFON_WA + "?text=" + encodeURIComponent(vorstellung);
    var mail = document.getElementById("mkKarteMail");
    if (mail) {
      mail.href = "mailto:" + MAIL +
        "?subject=" + encodeURIComponent("Anfrage – Kundennummer " + nr) +
        "&body=" + encodeURIComponent("Hallo Reyyan,\n\n\n\nViele Grüße\n" + wer +
          (privat ? "" : "\n" + k.firma) + "\nKundennummer " + nr);
    }

    var rueckruf = document.getElementById("mkRueckruf");
    if (rueckruf) {
      rueckruf.addEventListener("click", function () {
        melden("rueckruf", null, rueckruf, document.getElementById("mkRueckrufDanke"));
      });
    }
    var abmelden = document.getElementById("mkAbmelden");
    if (abmelden) abmelden.href = "/business/abmelden/?k=" + schluessel;

    if (laden) laden.hidden = true;
    inhalt.hidden = false;
    if (mehr) mehr.hidden = false;
    angeboteZeigen();
  }).catch(fehler);
})();
