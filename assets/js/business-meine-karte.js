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

  window.mkBusiness.client.rpc("business_karte_anzeigen", { p_token: schluessel }).then(function (res) {
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

    if (laden) laden.hidden = true;
    inhalt.hidden = false;
    if (mehr) mehr.hidden = false;
  }).catch(fehler);
})();
