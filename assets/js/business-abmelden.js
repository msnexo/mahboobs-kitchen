(function () {
  "use strict";

  // Abmeldung von der Werbung - ein Klick, die Business Karte bleibt gueltig.
  var frage = document.getElementById("abFrage");
  var fertig = document.getElementById("abFertig");
  var ungueltig = document.getElementById("abFehler");
  var knopf = document.getElementById("abBtn");
  var status = document.getElementById("abStatus");
  if (!frage || !knopf) return;

  var schluessel = new URLSearchParams(window.location.search).get("k") || "";
  if (!/^[0-9a-f]{32}$/.test(schluessel) || !window.mkBusiness) {
    frage.hidden = true;
    ungueltig.hidden = false;
    return;
  }

  var karte = "/business/meine-karte/?k=" + schluessel;
  document.getElementById("abZurueck").href = karte;
  document.getElementById("abKarte").href = karte;

  knopf.addEventListener("click", function () {
    knopf.disabled = true;
    status.textContent = "Wird abgemeldet …";
    status.className = "form-status";
    window.mkBusiness.client.rpc("karte_abmelden", { p_token: schluessel }).then(function (res) {
      if (res.error) throw res.error;
      frage.hidden = true;
      fertig.hidden = false;
    }).catch(function () {
      knopf.disabled = false;
      status.textContent = "Das hat leider nicht geklappt. Schreiben Sie uns kurz an info@mahboobs-kitchen.com – wir tragen Sie sofort aus.";
      status.className = "form-status form-status--error";
    });
  });
})();
