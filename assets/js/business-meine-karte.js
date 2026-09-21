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
  // p_text ist ein kurzer Zusatz wie "Weihnachtsfeier · 12.12.2026 · 25 Personen"
  // (braucht SQL 016; ohne sie kommt die Meldung ohne den Text an).
  function melden(art, angebotId, knopf, danke, zusatz) {
    // Nur die Knöpfe direkt daneben sperren, nicht alles im Block
    var gruppe = Array.prototype.filter.call(knopf.parentNode.children, function (c) {
      return c.tagName === "BUTTON";
    });
    if (gruppe.indexOf(knopf) === -1) gruppe = [knopf];
    gruppe.forEach(function (b) { b.disabled = true; });
    var daten = { p_token: schluessel, p_offer: angebotId || null, p_art: art };
    client.rpc("karte_reaktion", {
      p_token: daten.p_token, p_offer: daten.p_offer, p_art: art, p_text: zusatz || null
    }).then(function (res) {
      // Solange SQL 016 nicht eingespielt ist, kennt die Datenbank p_text nicht -
      // dann geht die Meldung wenigstens ohne den Zusatztext raus.
      if (res.error && /PGRST202|p_text|function/i.test(res.error.message || "")) {
        return client.rpc("karte_reaktion", daten);
      }
      return res;
    }).then(function (res) {
      if (res.error) throw res.error;
      // Bei mehrzeiligen Knöpfen nur die Überschrift austauschen
      (knopf.querySelector(".mk-xmas__zusage-gross") || knopf).textContent = "Gesendet ✓";
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

  function datumDeutsch(iso) {
    return new Date(iso + "T12:00:00").toLocaleDateString("de-DE");
  }

  // Weihnachtsfeier: Wunschtermin unverbindlich vormerken. Der Block steht nur
  // von September bis Dezember auf der Karte.
  function weihnachtenZeigen() {
    var box = document.getElementById("mkWeihnachten");
    var btn = document.getElementById("mkXmasBtn");
    if (!box || !btn) return;
    var monat = new Date().getMonth();          // 0 = Januar
    if (monat < 8) return;                      // erst ab September
    box.hidden = false;

    var datum = document.getElementById("mkXmasDatum");
    var gaeste = document.getElementById("mkXmasGaeste");
    var notiz = document.getElementById("mkXmasNotiz");
    var danke = document.getElementById("mkXmasDanke");
    if (datum) datum.min = heute();

    // Erst "wo", dann passt sich an, was darunter steht
    var WO = {
      haus: {
        text: "Bei uns im Haus", aussen: false,
        titel: "Weihnachtsfeier bei Ihnen im Haus",
        preis: "ab 23 € pro Person", zusatz: "· Buffet, geliefert und aufgebaut",
        dabei: "Lieferung, Aufbau, Warmhaltebehälter und Abholung des Geschirrs"
      },
      aussen: {
        text: "Außer Haus", aussen: true,
        titel: "Weihnachtsfeier außer Haus",
        preis: "ab 23 € pro Person", zusatz: "· fürs Essen, der Raum je nach Location",
        dabei: "Personal vor Ort, Auf- und Abbau, alle Absprachen mit dem Haus"
      },
      offen: {
        text: "Wo noch offen", aussen: true,
        titel: "Ihre Weihnachtsfeier",
        preis: "ab 23 € pro Person", zusatz: "· fürs Essen, je nachdem, wo Sie feiern",
        dabei: "Lieferung, Aufbau und alles, was sonst dazugehört"
      }
    };
    var wahl = "haus";
    var gewaehlterOrt = "";
    var teilAussen = document.getElementById("mkXmasAussen");

    function zeigeWahl(neu) {
      wahl = neu;
      if (teilAussen) teilAussen.hidden = !WO[wahl].aussen;
      Array.prototype.forEach.call(box.querySelectorAll("[data-wahl]"), function (b) {
        b.classList.toggle("is-an", b.getAttribute("data-wahl") === wahl);
      });
      zusammenfassung();
    }
    Array.prototype.forEach.call(box.querySelectorAll("[data-wahl]"), function (b) {
      b.addEventListener("click", function () { zeigeWahl(b.getAttribute("data-wahl")); });
    });

    // Geschmacksrichtung: mehrere moeglich, nichts ist auch in Ordnung
    function richtungen() {
      return Array.prototype.filter.call(box.querySelectorAll("[data-richtung]"), function (c) {
        return c.classList.contains("is-an");
      }).map(function (c) { return c.getAttribute("data-richtung"); });
    }
    Array.prototype.forEach.call(box.querySelectorAll("[data-richtung]"), function (c) {
      c.addEventListener("click", function () { c.classList.toggle("is-an"); zusammenfassung(); });
    });

    // Die Karte "außer Haus" zeigt, was der Kunde bisher ausgesucht hat
    function schreib(id, wert) {
      var el = document.getElementById(id);
      if (el) el.textContent = wert;
    }
    function zusammenfassung() {
      var w = WO[wahl];
      schreib("mkZusTitel", w.titel);
      schreib("mkZusPreis", w.preis);
      schreib("mkZusPreisZusatz", w.zusatz);
      schreib("mkZusDabei", w.dabei);
      var ortZeile = document.getElementById("mkZusOrtZeile");
      if (ortZeile) ortZeile.hidden = !w.aussen;
      schreib("mkZusOrt", gewaehlterOrt || "Noch offen – ich schlage Ihnen etwas Passendes vor");
      var lust = richtungen();
      schreib("mkZusEssen", lust.length
        ? lust.join(", ")
        : "Ihr Wunschmenü – indisch, italienisch, Sushi oder gemischt");
      var wann = datum && datum.value;
      var wieViele = gaeste && parseInt(gaeste.value, 10);
      schreib("mkZusTermin", wann
        ? datumDeutsch(wann) + (wieViele > 0 ? " · " + wieViele + " Personen" : "")
        : "Bitte oben eintragen");
      var eigenes = notiz && notiz.value.trim();
      var notizZeile = document.getElementById("mkZusNotizZeile");
      if (notizZeile) notizZeile.hidden = !eigenes;
      schreib("mkZusNotiz", eigenes || "");
    }
    if (datum) datum.addEventListener("change", zusammenfassung);
    if (gaeste) gaeste.addEventListener("input", zusammenfassung);
    if (notiz) notiz.addEventListener("input", zusammenfassung);
    zusammenfassung();

    // Termin, Personenzahl und Ort stehen einmal oben - jedes Paket schickt sie mit.
    function anfragen(knopf, paket) {
      var wann = datum && datum.value;
      if (!wann) {
        danke.textContent = "Bitte tragen Sie oben noch Ihren Wunschtermin ein.";
        danke.className = "mk-danke mk-danke--fehler";
        danke.hidden = false;
        if (datum) datum.focus();
        return;
      }
      var wieViele = gaeste && parseInt(gaeste.value, 10);
      var lust = richtungen();
      // Vor dem senkrechten Strich steht, was im Vertrieb an der Meldung steht,
      // dahinter die Einzelheiten fuers Logbuch.
      var kurz = "Weihnachtsfeier" + (paket ? " · " + paket : "") +
        " · " + datumDeutsch(wann) +
        (wieViele > 0 ? " · " + wieViele + " Personen" : "");
      var mehr = WO[wahl].text +
        (WO[wahl].aussen ? " · " + (gewaehlterOrt || "Ort noch offen") : "") +
        (lust.length ? " · " + lust.join(", ") : "");
      var text = notiz && notiz.value.trim();
      melden("interesse", null, knopf, danke,
        kurz + " | " + mehr + (text ? " | Nachricht: " + text.replace(/\s+/g, " ") : ""));
    }

    btn.addEventListener("click", function () { anfragen(btn, ""); });
    Array.prototype.forEach.call(box.querySelectorAll("[data-xpaket]"), function (b) {
      b.addEventListener("click", function () { anfragen(b, b.getAttribute("data-xpaket")); });
    });
    // Ort aussuchen: nur anhaken, verschickt wird erst mit dem Paket oder dem Termin
    Array.prototype.forEach.call(box.querySelectorAll("[data-xort]"), function (b) {
      b.addEventListener("click", function () {
        var name = b.getAttribute("data-xort");
        gewaehlterOrt = gewaehlterOrt === name ? "" : name;
        Array.prototype.forEach.call(box.querySelectorAll("[data-xort]"), function (x) {
          x.classList.toggle("is-an", x.getAttribute("data-xort") === gewaehlterOrt);
        });
        zusammenfassung();
      });
    });
  }

  // Kacheln: klein im Format der Business Karte, beim Klick waechst die grosse
  // Ansicht vom Platz der Kachel aus heraus (erst messen, dann zurueckrechnen).
  // Es ist immer nur eine offen.
  var ruckelfrei = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var offeneKachel = null;

  function kachelAnschalten(wrap) {
    var kachel = wrap.querySelector(".mk-xmas__kachel");
    var gross = wrap.querySelector(".mk-xmas__box");
    var zuKnopf = wrap.querySelector(".mk-xmas__zu");
    if (!kachel || !gross) return;
    var laeuft = false;
    var kleinB = 0;
    var kleinH = 0;
    var steuerung = {};

    function aufraeumen() {
      gross.style.transition = "";
      gross.style.transform = "";
      gross.style.transformOrigin = "";
      gross.style.opacity = "";
    }

    function auf() {
      if (laeuft) return;
      if (offeneKachel && offeneKachel !== steuerung) offeneKachel.zu(true);
      laeuft = true;
      var klein = kachel.getBoundingClientRect();
      kleinB = klein.width;
      kleinH = klein.height;
      wrap.classList.add("is-offen");
      kachel.style.display = "none";
      gross.hidden = false;
      offeneKachel = steuerung;
      var ziel = gross.getBoundingClientRect();
      if (!ruckelfrei && ziel.width && ziel.height) {
        gross.style.transformOrigin = "top left";
        gross.style.transform = "translate(" + (klein.left - ziel.left) + "px," + (klein.top - ziel.top) + "px) " +
          "scale(" + (klein.width / ziel.width) + "," + (klein.height / ziel.height) + ")";
        gross.style.opacity = "0.25";
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            gross.style.transition = "transform .55s cubic-bezier(.22,.7,.3,1), opacity .4s ease";
            gross.style.transform = "none";
            gross.style.opacity = "1";
          });
        });
      }
      setTimeout(function () {
        aufraeumen();
        laeuft = false;
        // Liegt die grosse Ansicht halb ausserhalb, sanft hinscrollen
        var oben = gross.getBoundingClientRect().top;
        if (oben < 70 || oben > window.innerHeight * 0.5) {
          window.scrollBy({ top: oben - 90, behavior: ruckelfrei ? "auto" : "smooth" });
        }
        if (zuKnopf) zuKnopf.focus({ preventScroll: true });
      }, ruckelfrei ? 0 : 600);
    }

    // Wieder klein: die grosse Ansicht schrumpft zurueck auf Kachelgroesse
    function zu(sofort) {
      if (gross.hidden) return;
      if (laeuft && !sofort) return;
      laeuft = true;
      var fertig = function () {
        gross.hidden = true;
        aufraeumen();
        wrap.classList.remove("is-offen");
        kachel.style.display = "";
        laeuft = false;
        if (offeneKachel === steuerung) offeneKachel = null;
        if (!sofort) kachel.focus({ preventScroll: true });
      };
      var jetzt = gross.getBoundingClientRect();
      if (sofort || ruckelfrei || !jetzt.width || !kleinB) { fertig(); return; }
      gross.style.transformOrigin = "top left";
      gross.style.transition = "transform .45s cubic-bezier(.4,0,.6,1), opacity .35s ease";
      gross.style.transform = "scale(" + (kleinB / jetzt.width) + "," + (kleinH / jetzt.height) + ")";
      gross.style.opacity = "0.2";
      setTimeout(fertig, 460);
    }
    steuerung.zu = zu;

    kachel.addEventListener("click", auf);
    if (zuKnopf) zuKnopf.addEventListener("click", function () { zu(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") zu();
    });
    // Klick daneben - irgendwo sonst auf die Seite - klappt auch zu
    document.addEventListener("click", function (e) {
      if (gross.hidden || laeuft) return;
      if (wrap.contains(e.target)) return;
      zu();
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
    // Location: Orte antippen (mehrfach), dann "Location gesucht" - die Auswahl
    // steht im Vertrieb an der Meldung und im Logbuch.
    Array.prototype.forEach.call(document.querySelectorAll("[data-lort]"), function (b) {
      b.addEventListener("click", function () { b.classList.toggle("is-an"); });
    });
    var location_ = document.getElementById("mkLocation");
    if (location_) {
      location_.addEventListener("click", function () {
        var orte = Array.prototype.map.call(document.querySelectorAll("[data-lort].is-an"), function (b) {
          return b.getAttribute("data-lort");
        });
        melden("interesse", null, location_, document.getElementById("mkLocationDanke"),
          "Sucht eine Location" + (orte.length ? " | Gefällt: " + orte.join(", ") : ""));
      });
    }
    var abmelden = document.getElementById("mkAbmelden");
    if (abmelden) abmelden.href = "/business/abmelden/?k=" + schluessel;

    // Der Rechner weiss dann schon, wer da rechnet
    var rechner = document.getElementById("mkRechnerLink");
    if (rechner) {
      rechner.href = "/business/catering-angebot/?firma=" + encodeURIComponent(k.firma || "") +
        (k.ansprechpartner ? "&person=" + encodeURIComponent(k.ansprechpartner) : "") +
        "&code=" + encodeURIComponent(nr) + "&k=" + schluessel;
      // Aus der Weihnachtsfeier in denselben Rechner - er weiss dann den Anlass
      var xmasRechner = document.getElementById("mkXmasRechner");
      if (xmasRechner) xmasRechner.href = rechner.href + "&anlass=Weihnachtsfeier";
    }

    weihnachtenZeigen();
    Array.prototype.forEach.call(document.querySelectorAll(".mk-kachelwrap"), kachelAnschalten);

    if (laden) laden.hidden = true;
    inhalt.hidden = false;
    if (mehr) mehr.hidden = false;
    angeboteZeigen();
  }).catch(fehler);
})();
