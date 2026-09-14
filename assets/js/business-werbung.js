(function () {
  "use strict";

  // Werbebereich: Angebote auf der Business Karte, Wochen-Mail, Rueckmeldungen.
  // Nutzt die Anmeldung des Vertriebs (window.mkVertrieb).
  var SEITE = "https://mahboobs-kitchen.com";
  var TESTADRESSE = "info@mahboobs-kitchen.com";
  var BILDER = "werbung-bilder";

  function $(id) { return document.getElementById(id); }

  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Brevo liest {{ ... }} als Platzhalter - in eigenen Texten entschaerfen.
  function mailEsc(str) {
    return esc(str).replace(/\{/g, "&#123;").replace(/\}/g, "&#125;");
  }

  function heute() {
    var d = new Date();
    var pad = function (n) { return String(n).padStart(2, "0"); };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function datum(iso) {
    if (!iso) return "";
    return new Date(iso.length <= 10 ? iso + "T12:00:00" : iso).toLocaleDateString("de-DE");
  }

  function datumZeit(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString("de-DE") + ", " + d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  }

  function meldung(el, text, art) {
    el.textContent = text;
    el.className = "form-status" + (art ? " form-status--" + art : "");
  }

  function jedes(liste, fn) { Array.prototype.forEach.call(liste, fn); }

  // Handyfotos sind oft riesig - fuer Karte und Mail reichen 1200 Pixel.
  function bildVerkleinern(datei) {
    return new Promise(function (fertig) {
      if (!datei || !/^image\/(jpeg|png|webp)$/.test(datei.type)) { fertig(datei); return; }
      var adresse = URL.createObjectURL(datei);
      var bild = new Image();
      bild.onload = function () {
        var faktor = Math.min(1, 1200 / Math.max(bild.width, bild.height));
        var leinwand = document.createElement("canvas");
        leinwand.width = Math.round(bild.width * faktor);
        leinwand.height = Math.round(bild.height * faktor);
        var ctx = leinwand.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, leinwand.width, leinwand.height);
        ctx.drawImage(bild, 0, 0, leinwand.width, leinwand.height);
        URL.revokeObjectURL(adresse);
        leinwand.toBlob(function (blob) { fertig(blob || datei); }, "image/jpeg", 0.85);
      };
      bild.onerror = function () { URL.revokeObjectURL(adresse); fertig(datei); };
      bild.src = adresse;
    });
  }

  // Die Wochen-Mail. Platzhalter fuellt die Versand-Funktion pro Empfaenger.
  function mailHtml(angebote, betreff, einleitung) {
    var f = "font-family:Arial,Helvetica,sans-serif;";
    var bloecke = angebote.map(function (a) {
      return '<tr><td style="padding:0 28px 28px;">' +
        (a.image_url
          ? '<img src="' + esc(a.image_url) + '" width="504" alt="" style="display:block;width:100%;max-width:504px;height:auto;border-radius:12px;margin:0 0 14px;">'
          : "") +
        '<div style="' + f + 'font-size:20px;font-weight:bold;color:#161616;margin:0 0 6px;">' + mailEsc(a.title) + "</div>" +
        (a.description
          ? '<div style="' + f + 'font-size:15px;line-height:1.55;color:#444444;margin:0 0 12px;">' + mailEsc(a.description).replace(/\n/g, "<br>") + "</div>"
          : "") +
        (a.valid_until
          ? '<div style="' + f + 'font-size:12px;color:#9a9a9a;margin:0 0 12px;">G&uuml;ltig bis ' + datum(a.valid_until) + "</div>"
          : "") +
        '<a href="{{params.karte}}#angebote" style="' + f + 'display:inline-block;padding:11px 22px;border-radius:999px;' +
        'background:#e8590c;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;">Angebot ansehen</a>' +
        "</td></tr>";
    }).join("");

    return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">' +
      "<title>" + mailEsc(betreff) + "</title></head>" +
      '<body style="margin:0;padding:0;background:#f4f1ec;">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f1ec;">' +
      '<tr><td align="center" style="padding:24px 12px;">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">' +
      '<tr><td style="background:#161616;padding:18px 28px;">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
      '<td><img src="' + SEITE + '/assets/img/mail/logo.png" width="120" alt="Mahboobs Kitchen" style="display:block;width:120px;height:auto;"></td>' +
      '<td align="right" style="' + f + 'font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#e8590c;font-weight:bold;">' +
      'MK Business Karte<br><span style="color:#9a9a9a;letter-spacing:2px;">{{params.nummer}}</span></td>' +
      "</tr></table></td></tr>" +
      '<tr><td style="padding:28px 28px 22px;' + f + 'font-size:16px;line-height:1.55;color:#161616;">' +
      "{{params.anrede}},<br><br>" + mailEsc(einleitung).replace(/\n/g, "<br>") + "</td></tr>" +
      bloecke +
      '<tr><td style="padding:0 28px 28px;' + f + 'font-size:15px;line-height:1.55;color:#161616;">' +
      "Ich freue mich auf Ihre Nachricht &ndash; einfach auf diese E-Mail antworten oder anrufen: 0177 201 9889.<br><br>" +
      "Herzliche Gr&uuml;&szlig;e<br><strong>Reyyan Ahmad</strong><br>Mahboobs Kitchen</td></tr>" +
      "</table>" +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">' +
      '<tr><td style="padding:16px 28px;' + f + 'font-size:11px;line-height:1.6;color:#9a9a9a;text-align:center;">' +
      "Sie erhalten diese E-Mail als Inhaber der MK Business Karte. " +
      '<a href="{{params.abmelden}}" style="color:#9a9a9a;">Keine Angebote mehr erhalten</a><br>' +
      'Mahboobs Kitchen &middot; Henstedter Str. 4 &middot; 24558 Wakendorf II &middot; ' +
      '<a href="' + SEITE + '/impressum/" style="color:#9a9a9a;">Impressum</a></td></tr></table>' +
      "</td></tr></table></body></html>";
  }

  function start(client) {
    if (start.client) return;
    start.client = client;

    var angebote = [];
    var kunden = [];
    var personen = [];
    var signale = [];
    var versand = [];
    var sqlFehlt = false;
    var bearbeiteId = null;
    var betreffVonHand = false;

    function istAktiv(a) { return a.active && (!a.valid_until || a.valid_until >= heute()); }

    function kundeName(id) {
      var k = kunden.filter(function (x) { return x.id === id; })[0];
      return k ? k.name : "Kontakt";
    }

    // Dieselbe Auswahl wie in der Versand-Funktion
    function empfaenger() {
      var liste = [];
      var ohneMail = 0;
      var abgemeldet = 0;
      kunden.forEach(function (k) {
        if (!k.card_token) return;
        if (k.werbung_abgemeldet_at) { abgemeldet++; return; }
        var passend = personen.filter(function (p) { return p.prospect_id === k.id && p.email && p.marketing_consent; });
        var p = passend.filter(function (x) { return x.name === k.card_person; })[0] || passend[0];
        if (!p) { ohneMail++; return; }
        liste.push({ kunde: k, person: p });
      });
      return { liste: liste, ohneMail: ohneMail, abgemeldet: abgemeldet };
    }

    function laden() {
      return Promise.all([
        client.from("offers").select("*").order("created_at", { ascending: false }),
        client.from("prospects").select("id, name, status, customer_no, card_token, card_person, werbung_abgemeldet_at").eq("status", "customer"),
        client.from("prospect_people").select("prospect_id, name, email, marketing_consent, created_at").order("created_at", { ascending: true }),
        client.from("prospect_signals").select("*").order("created_at", { ascending: false }).limit(100),
        client.from("werbung_versand").select("*").order("created_at", { ascending: false }).limit(10)
      ]).then(function (r) {
        sqlFehlt = !!(r[1].error || r[3].error || r[4].error);
        angebote = r[0].data || [];
        kunden = r[1].data || [];
        personen = r[2].data || [];
        signale = r[3].data || [];
        versand = r[4].data || [];
        zeichneZahlen();
        zeichneSignale();
        zeichneAngebote();
        zeichneMailAuswahl();
        zeichneVerlauf();
      });
    }
    start.laden = laden;

    function zeichneZahlen() {
      if (sqlFehlt) {
        $("wbZahlen").innerHTML = '<span class="wb-hinweis">Die Datenbank-Erweiterung f&uuml;r den Werbebereich (SQL 015) fehlt noch.</span>';
        return;
      }
      var e = empfaenger();
      $("wbZahlen").innerHTML = "<strong>" + kunden.length + "</strong> Stammkunden &middot; " +
        "<strong>" + e.liste.length + "</strong> bekommen Werbung &middot; " +
        e.abgemeldet + " abgemeldet &middot; " + e.ohneMail + " ohne E-Mail oder Zustimmung";
    }

    function zeichneSignale() {
      var offen = signale.filter(function (s) { return !s.erledigt_at && s.art !== "abmeldung"; });
      var abmeldungen = signale.filter(function (s) { return s.art === "abmeldung"; }).slice(0, 10);

      function zeile(s, mitErledigt) {
        var was = s.art === "rueckruf" ? "Bitte um R&uuml;ckruf" : s.art === "abmeldung" ? "Hat sich abgemeldet" : "Interesse";
        return '<div class="wb-zeile">' +
          (s.art === "abmeldung" ? "" : '<span class="hand">&#9995;</span>') +
          "<span><strong>" + esc(kundeName(s.prospect_id)) + "</strong> &middot; " + was +
          (s.offer_title ? " an &bdquo;" + esc(s.offer_title) + "&ldquo;" : "") +
          ' <small class="muted">' + datumZeit(s.created_at) + "</small></span>" +
          '<span class="wb-zeile__knoepfe">' +
          '<button type="button" class="dk-knopf" data-oeffnen="' + esc(s.prospect_id) + '">Kontakt &ouml;ffnen</button>' +
          (mitErledigt ? '<button type="button" class="dk-knopf dk-knopf--primaer" data-erledigt="' + esc(s.id) + '">Erledigt</button>' : "") +
          "</span></div>";
      }

      $("wbSignale").innerHTML =
        (offen.length
          ? offen.map(function (s) { return zeile(s, true); }).join("")
          : '<p class="muted wb-leer">Keine offenen R&uuml;ckmeldungen.</p>') +
        (abmeldungen.length
          ? '<p class="wb-schritt">Abmeldungen</p>' + abmeldungen.map(function (s) { return zeile(s, false); }).join("")
          : "");

      jedes($("wbSignale").querySelectorAll("[data-oeffnen]"), function (b) {
        b.addEventListener("click", function () {
          if (window.mkVertrieb) window.mkVertrieb.oeffneKontakt(b.getAttribute("data-oeffnen"));
        });
      });
      jedes($("wbSignale").querySelectorAll("[data-erledigt]"), function (b) {
        b.addEventListener("click", function () {
          b.disabled = true;
          client.from("prospect_signals").update({ erledigt_at: new Date().toISOString() })
            .eq("id", b.getAttribute("data-erledigt"))
            .then(function () {
              if (window.mkVertrieb) window.mkVertrieb.neuLaden();
              return laden();
            });
        });
      });
    }

    function zeichneAngebote() {
      var liste = $("wbAngebotListe");
      if (!angebote.length) {
        liste.innerHTML = '<p class="muted wb-leer">Noch keine Angebote. Leg oben das erste an &ndash; es erscheint sofort auf allen Business Karten.</p>';
        return;
      }
      liste.innerHTML = '<div class="wb-angebote">' + angebote.map(function (a) {
        var st = !a.active ? ["pausiert", "Pausiert"]
          : (a.valid_until && a.valid_until < heute()) ? ["abgelaufen", "Abgelaufen"]
          : ["aktiv", "Auf den Karten sichtbar"];
        return '<div class="wb-angebot">' +
          (a.image_url ? '<img src="' + esc(a.image_url) + '" alt="">' : "") +
          '<div class="wb-angebot__text">' +
          '<span class="wb-status wb-status--' + st[0] + '">' + st[1] + "</span>" +
          "<strong>" + esc(a.title) + "</strong>" +
          (a.description ? "<p>" + esc(a.description) + "</p>" : "") +
          (a.valid_until ? "<p>G&uuml;ltig bis " + datum(a.valid_until) + "</p>" : "") +
          '<div class="bk-knoepfe">' +
          '<button type="button" class="dk-knopf" data-bearbeiten="' + esc(a.id) + '">Bearbeiten</button>' +
          '<button type="button" class="dk-knopf" data-pause="' + esc(a.id) + '">' + (a.active ? "Pausieren" : "Aktivieren") + "</button>" +
          '<button type="button" class="dk-knopf dk-knopf--loeschen" data-loeschen="' + esc(a.id) + '">L&ouml;schen</button>' +
          "</div></div></div>";
      }).join("") + "</div>";

      function angebot(id) { return angebote.filter(function (a) { return a.id === id; })[0]; }

      jedes(liste.querySelectorAll("[data-bearbeiten]"), function (b) {
        b.addEventListener("click", function () {
          var a = angebot(b.getAttribute("data-bearbeiten"));
          if (!a) return;
          bearbeiteId = a.id;
          $("wbTitel").value = a.title || "";
          $("wbText").value = a.description || "";
          $("wbBis").value = a.valid_until || "";
          $("wbBild").value = "";
          $("wbAngebotSpeichern").textContent = "Änderungen speichern";
          $("wbAngebotAbbrechen").hidden = false;
          meldung($("wbAngebotStatus"), a.image_url ? "Neues Bild nur auswählen, wenn es ersetzt werden soll." : "");
          $("wbTitel").scrollIntoView({ block: "center", behavior: "smooth" });
          $("wbTitel").focus();
        });
      });
      jedes(liste.querySelectorAll("[data-pause]"), function (b) {
        b.addEventListener("click", function () {
          var a = angebot(b.getAttribute("data-pause"));
          if (!a) return;
          client.from("offers").update({ active: !a.active }).eq("id", a.id).then(laden);
        });
      });
      jedes(liste.querySelectorAll("[data-loeschen]"), function (b) {
        b.addEventListener("click", function () {
          var a = angebot(b.getAttribute("data-loeschen"));
          if (!a || !window.confirm("„" + a.title + "“ wirklich löschen? Es verschwindet von allen Karten.")) return;
          client.from("offers").delete().eq("id", a.id).then(laden);
        });
      });
    }

    function formularLeeren() {
      bearbeiteId = null;
      $("wbTitel").value = "";
      $("wbText").value = "";
      $("wbBis").value = "";
      $("wbBild").value = "";
      $("wbAngebotSpeichern").textContent = "Angebot speichern";
      $("wbAngebotAbbrechen").hidden = true;
    }

    $("wbAngebotAbbrechen").addEventListener("click", function () {
      formularLeeren();
      meldung($("wbAngebotStatus"), "");
    });

    $("wbAngebotSpeichern").addEventListener("click", function () {
      var knopf = $("wbAngebotSpeichern");
      var st = $("wbAngebotStatus");
      var titel = $("wbTitel").value.trim();
      if (!titel) {
        meldung(st, "Bitte einen Titel eintragen.", "error");
        $("wbTitel").focus();
        return;
      }
      var datei = $("wbBild").files[0];
      var warBearbeitung = !!bearbeiteId;
      knopf.disabled = true;
      meldung(st, "Wird gespeichert …");

      var bild = datei
        ? bildVerkleinern(datei).then(function (blob) {
            var endung = blob.type === "image/jpeg" ? "jpg" : (datei.name.split(".").pop() || "bild");
            var name = datei.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-]/g, "_").slice(0, 40) || "bild";
            var pfad = Date.now() + "-" + name + "." + endung;
            return client.storage.from(BILDER).upload(pfad, blob, { contentType: blob.type || datei.type }).then(function (res) {
              if (res.error) throw res.error;
              return client.storage.from(BILDER).getPublicUrl(res.data.path).data.publicUrl;
            });
          })
        : Promise.resolve(null);

      bild.then(function (adresse) {
        var daten = {
          title: titel,
          description: $("wbText").value.trim() || null,
          valid_until: $("wbBis").value || null
        };
        if (adresse) daten.image_url = adresse;
        if (bearbeiteId) return client.from("offers").update(daten).eq("id", bearbeiteId);
        daten.active = true;
        return client.from("offers").insert(daten);
      }).then(function (res) {
        if (res && res.error) throw res.error;
        meldung(st, warBearbeitung ? "Gespeichert ✓" : "Das Angebot ist jetzt auf allen Business Karten ✓", "ok");
        formularLeeren();
        return laden();
      }).catch(function (err) {
        meldung(st, "Speichern fehlgeschlagen: " + ((err && err.message) || "unbekannter Fehler"), "error");
      }).then(function () {
        knopf.disabled = false;
      });
    });

    // ---------- Wochen-Mail ----------
    function ausgewaehlt() {
      var ids = [];
      jedes($("wbMailAngebote").querySelectorAll("input[data-angebot]:checked"), function (c) {
        ids.push(c.getAttribute("data-angebot"));
      });
      return angebote.filter(function (a) { return ids.indexOf(a.id) !== -1; });
    }

    function zeichneMailAuswahl() {
      var box = $("wbMailAngebote");
      var aktiv = angebote.filter(istAktiv);
      var schon = {};
      versand.slice().reverse().forEach(function (v) {
        if (v.test) return;
        (v.offer_ids || []).forEach(function (id) { schon[id] = v.created_at; });
      });
      var vorher = {};
      jedes(box.querySelectorAll("input[data-angebot]"), function (c) { vorher[c.getAttribute("data-angebot")] = c.checked; });

      box.innerHTML = aktiv.length
        ? aktiv.map(function (a) {
            var an = a.id in vorher ? vorher[a.id] : !schon[a.id];
            return '<label class="wb-check"><input type="checkbox" data-angebot="' + esc(a.id) + '"' + (an ? " checked" : "") + ">" +
              "<span>" + esc(a.title) +
              (schon[a.id] ? " <small>(schon verschickt am " + datum(schon[a.id]) + ")</small>" : " <small>(neu)</small>") +
              "</span></label>";
          }).join("")
        : '<p class="muted wb-leer">Keine aktiven Angebote &ndash; leg unten eins an.</p>';

      jedes(box.querySelectorAll("input"), function (c) { c.addEventListener("change", mailAktualisieren); });
      mailAktualisieren();
    }

    function beispiel() {
      var e = empfaenger().liste[0];
      return {
        anrede: "Hallo " + (e ? e.person.name : "Silke Brandt"),
        nummer: e ? e.kunde.customer_no : "MK-2746-08",
        karte: SEITE + "/business/meine-karte/?k=" + (e ? e.kunde.card_token : ""),
        abmelden: SEITE + "/business/abmelden/?k=" + (e ? e.kunde.card_token : "")
      };
    }

    function vorschauZeigen() {
      var p = beispiel();
      var html = mailHtml(ausgewaehlt(), $("wbBetreff").value, $("wbEinleitung").value)
        .replace(/\{\{params\.(\w+)\}\}/g, function (m, k) { return esc(p[k] || ""); });
      $("wbVorschau").hidden = false;
      $("wbVorschauFrame").srcdoc = html;
    }

    function mailAktualisieren() {
      var liste = ausgewaehlt();
      if (!betreffVonHand) {
        $("wbBetreff").value = liste.length
          ? "Neu für Sie: " + liste.slice(0, 2).map(function (a) { return a.title; }).join(" & ")
          : "";
      }
      var anzahl = empfaenger().liste.length;
      $("wbSendenBtn").textContent = "An alle " + anzahl + " senden";
      $("wbSendenBtn").disabled = !liste.length || !anzahl;
      $("wbTestBtn").disabled = !liste.length;
      if (!$("wbVorschau").hidden) vorschauZeigen();
    }

    $("wbBetreff").addEventListener("input", function () { betreffVonHand = !!$("wbBetreff").value.trim(); });
    $("wbEinleitung").addEventListener("input", function () { if (!$("wbVorschau").hidden) vorschauZeigen(); });
    $("wbVorschauBtn").addEventListener("click", function () {
      if ($("wbVorschau").hidden) vorschauZeigen();
      else $("wbVorschau").hidden = true;
    });

    function senden(test) {
      var st = $("wbMailStatus");
      var liste = ausgewaehlt();
      var betreff = $("wbBetreff").value.trim();
      if (!liste.length) { meldung(st, "Bitte mindestens ein Angebot auswählen.", "error"); return; }
      if (!betreff) { meldung(st, "Bitte einen Betreff eintragen.", "error"); return; }
      var anzahl = empfaenger().liste.length;
      if (!test && !window.confirm("Wochen-Mail „" + betreff + "“ jetzt an " + anzahl + " Stammkunden senden?")) return;

      $("wbTestBtn").disabled = true;
      $("wbSendenBtn").disabled = true;
      meldung(st, test ? "Testmail wird verschickt …" : "Wird an " + anzahl + " Stammkunden verschickt …");

      client.auth.getSession().then(function (res) {
        var token = res.data && res.data.session && res.data.session.access_token;
        return fetch(window.SUPABASE_URL + "/functions/v1/werbung-senden", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: window.SUPABASE_ANON_KEY,
            Authorization: "Bearer " + (token || window.SUPABASE_ANON_KEY)
          },
          body: JSON.stringify({
            betreff: betreff,
            html: mailHtml(liste, betreff, $("wbEinleitung").value),
            angebote: liste.map(function (a) { return a.id; }),
            test: test,
            testAn: TESTADRESSE
          })
        });
      }).then(function (antwort) {
        if (antwort.status === 404) throw new Error("nicht_eingerichtet");
        return antwort.json().then(function (daten) {
          if (!antwort.ok || daten.error) throw new Error(daten.error || "Fehler " + antwort.status);
          return daten;
        });
      }).then(function (daten) {
        if (daten.fehler) {
          meldung(st, daten.gesendet + " verschickt, " + daten.fehler + " fehlgeschlagen. " + (daten.letzterFehler || ""), "error");
        } else {
          meldung(st, test
            ? "Testmail ist unterwegs an " + TESTADRESSE + " ✓"
            : "Verschickt an " + daten.gesendet + " Stammkunden ✓", "ok");
        }
        if (!test) {
          betreffVonHand = false;
          if (window.mkVertrieb) window.mkVertrieb.neuLaden();
        }
        return laden();
      }).catch(function (err) {
        var grund = err && err.message;
        meldung(st, grund === "nicht_eingerichtet" || /fetch/i.test(grund || "")
          ? "Der Versand ist noch nicht eingerichtet: Es fehlen noch das Brevo-Konto und die Funktion „werbung-senden“."
          : "Versand fehlgeschlagen: " + (grund || "unbekannter Fehler"), "error");
      }).then(mailAktualisieren);
    }

    $("wbTestBtn").addEventListener("click", function () { senden(true); });
    $("wbSendenBtn").addEventListener("click", function () { senden(false); });

    function zeichneVerlauf() {
      $("wbVerlauf").innerHTML = versand.length
        ? versand.map(function (v) {
            return '<div class="wb-zeile"><span>' + datumZeit(v.created_at) + " &middot; <strong>" + esc(v.betreff) + "</strong></span>" +
              '<span class="wb-zeile__knoepfe muted">' +
              (v.test ? "Testmail" : v.empfaenger + " Empf&auml;nger" + (v.fehler ? ", " + v.fehler + " Fehler" : "")) +
              "</span></div>";
          }).join("")
        : '<p class="muted wb-leer">Noch keine Wochen-Mail verschickt.</p>';
    }

    laden();
  }

  function bereit() {
    if (window.mkVertrieb && window.mkVertrieb.client) start(window.mkVertrieb.client);
  }
  document.addEventListener("mk-vertrieb-bereit", bereit);
  document.addEventListener("mk-signale-geaendert", function () { if (start.laden) start.laden(); });
  bereit();

  // Beim Wechsel in den Werbebereich immer frisch laden
  var reiter = document.querySelector('[data-tab="tabWerbung"]');
  if (reiter) reiter.addEventListener("click", function () { if (start.laden) start.laden(); });
})();
