(function () {
  "use strict";

  var ENDPOINT = window.CATERING_FORMSPREE || "";

  var ITEMS = {
    vorspeise: [
      "Samosas mit Minz-Chutney",
      "Bruschetta al Pomodoro",
      "Hummus mit Fladenbrot & Oliven",
      "Gemischte Antipasti",
      "Miso-Suppe",
      "Caprese-Salat"
    ],
    hauptgericht: [
      "Butter Chicken (Indisch)",
      "Lamm Rogan Josh (Indisch)",
      "Hähnchen Tikka Masala (Indisch)",
      "Lasagne al Forno (Italienisch)",
      "Pollo alla Parmigiana (Italienisch)",
      "Teriyaki-Lachs (Asiatisch)",
      "Sushi-Variation (Japanisch)",
      "Vegetarisches Gemüse-Curry (Vegan)",
      "Gegrillte Hähnchenbrust mit Kräuterbutter"
    ],
    beilage: [
      "Basmati-Reis",
      "Knoblauch-Naan",
      "Rosmarin-Kartoffeln",
      "Gemüse vom Grill",
      "Coleslaw hausgemacht",
      "Taboulé",
      "Focaccia mit Olivenöl",
      "Edamame"
    ],
    nachtisch: [
      "Gulab Jamun (Indisch)",
      "Tiramisu (Italienisch)",
      "Mochi-Eis (Japanisch)",
      "Crème Brûlée",
      "Baklava",
      "Schokoladen-Mousse"
    ]
  };

  var BASE_PRICE = 22;
  var BASE_COUNT = { hauptgericht: 2, beilage: 2 };
  var EXTRA = { vorspeise: 3, hauptgericht: 5, beilage: 2.5, nachtisch: 3.5 };
  var REDUCTION = { hauptgericht: 4, beilage: 2 };
  var SHOW_MULT = 1.36;

  var selections = { vorspeise: [], hauptgericht: [], beilage: [], nachtisch: [] };

  function formatEur(n) {
    return n.toFixed(2).replace(".", ",") + " €";
  }

  function getParams() {
    var result = {};
    var search = window.location.search.replace(/^\?/, "");
    if (!search) return result;
    search.split("&").forEach(function (pair) {
      var parts = pair.split("=");
      if (parts[0]) result[decodeURIComponent(parts[0])] = decodeURIComponent((parts[1] || "").replace(/\+/g, " "));
    });
    return result;
  }

  function getPrice() {
    var price = BASE_PRICE;
    var h = selections.hauptgericht.length;
    if (h > BASE_COUNT.hauptgericht) price += (h - BASE_COUNT.hauptgericht) * EXTRA.hauptgericht;
    else if (h < BASE_COUNT.hauptgericht && h > 0) price -= (BASE_COUNT.hauptgericht - h) * REDUCTION.hauptgericht;
    var b = selections.beilage.length;
    if (b > BASE_COUNT.beilage) price += (b - BASE_COUNT.beilage) * EXTRA.beilage;
    else if (b < BASE_COUNT.beilage && b > 0) price -= (BASE_COUNT.beilage - b) * REDUCTION.beilage;
    return Math.max(price, 10);
  }

  function updatePrice() {
    var guests = parseInt(document.getElementById("guestCount").value) || 20;
    var mk = getPrice();
    var regular = mk * SHOW_MULT;
    var total = mk * guests;
    document.getElementById("priceMK").textContent = formatEur(mk);
    document.getElementById("priceRegular").textContent = formatEur(regular);
    document.getElementById("priceTotal").textContent = formatEur(total);
    document.getElementById("priceGuests").textContent = guests;
  }

  function styleLabel(label, selected) {
    var check = label.querySelector(".mki-check");
    if (selected) {
      label.style.borderColor = "var(--color-primary, #e63030)";
      label.style.background = "rgba(230,48,48,0.07)";
      check.textContent = "✓";
      check.style.borderColor = "var(--color-primary, #e63030)";
      check.style.color = "var(--color-primary, #e63030)";
    } else {
      label.style.borderColor = "";
      label.style.background = "";
      check.textContent = "";
      check.style.borderColor = "";
      check.style.color = "";
    }
  }

  function renderCategory(key, heading, note, isRadio) {
    var html = '<div style="margin-bottom:28px;">' +
      '<h3 style="margin-bottom:' + (note ? "6px" : "12px") + ';">' + heading + "</h3>" +
      (note ? '<p class="muted" style="font-size:0.83rem;margin-bottom:12px;">' + note + "</p>" : "") +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px;">';
    ITEMS[key].forEach(function (item) {
      html +=
        '<label class="mki-label" data-key="' + key + '" data-val="' + item.replace(/"/g, "&quot;") + '" style="display:flex;align-items:center;gap:8px;padding:10px 14px;border:2px solid var(--color-border);border-radius:10px;cursor:pointer;transition:border-color .15s,background .15s;user-select:none;">' +
        '<input type="' + (isRadio ? "radio" : "checkbox") + '" style="display:none;" name="' + key + '" value="' + item.replace(/"/g, "&quot;") + '">' +
        '<span class="mki-check" style="width:16px;height:16px;border:2px solid var(--color-border);border-radius:' + (isRadio ? "50%" : "4px") + ';flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;transition:border-color .15s;"></span>' +
        '<span style="font-size:0.88rem;line-height:1.3;">' + item + "</span></label>";
    });
    html += "</div></div>";
    return html;
  }

  function initMenu() {
    var section = document.getElementById("menuSection");
    section.innerHTML =
      renderCategory("vorspeise", "🥗 Vorspeise <small style='font-size:0.78rem;font-weight:normal;color:var(--color-text-soft);'>(1 wählen)</small>", "", true) +
      renderCategory("hauptgericht", "🍽️ Hauptgerichte", "Basis: 2 Gerichte – mehr wählen kostet etwas mehr, weniger etwas weniger.", false) +
      renderCategory("beilage", "🥘 Beilagen", "Basis: 2 Beilagen – mehr wählen kostet etwas mehr, weniger etwas weniger.", false) +
      renderCategory("nachtisch", "🍮 Nachtisch <small style='font-size:0.78rem;font-weight:normal;color:var(--color-text-soft);'>(1 wählen)</small>", "", true);

    Array.prototype.forEach.call(section.querySelectorAll(".mki-label"), function (label) {
      label.addEventListener("click", function () {
        var key = label.getAttribute("data-key");
        var val = label.getAttribute("data-val");
        var input = label.querySelector("input");
        var isRadio = input.type === "radio";

        if (isRadio) {
          Array.prototype.forEach.call(section.querySelectorAll('.mki-label[data-key="' + key + '"]'), function (l) {
            l.querySelector("input").checked = false;
            styleLabel(l, false);
          });
          selections[key] = [val];
          input.checked = true;
          styleLabel(label, true);
        } else {
          var idx = selections[key].indexOf(val);
          if (idx === -1) {
            selections[key].push(val);
            input.checked = true;
            styleLabel(label, true);
          } else {
            selections[key].splice(idx, 1);
            input.checked = false;
            styleLabel(label, false);
          }
        }
        updatePrice();
      });
    });

    function clickDefault(key, idx) {
      var labels = section.querySelectorAll('.mki-label[data-key="' + key + '"]');
      if (labels[idx]) labels[idx].click();
    }
    clickDefault("vorspeise", 0);
    clickDefault("hauptgericht", 0);
    clickDefault("hauptgericht", 1);
    clickDefault("beilage", 0);
    clickDefault("beilage", 1);
    clickDefault("nachtisch", 0);
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
      person ? "Speziell für " + firma + " · " + person : "Speziell für " + firma;
    if (msg) {
      document.getElementById("cateringMsg").textContent = msg;
      document.getElementById("cateringMsgCard").hidden = false;
    }

    initMenu();
    updatePrice();

    document.getElementById("guestCount").addEventListener("input", updatePrice);
    document.getElementById("eventDate").min = new Date().toISOString().slice(0, 10);

    document.getElementById("cateringSubmitBtn").addEventListener("click", function () {
      var date = document.getElementById("eventDate").value;
      var guests = document.getElementById("guestCount").value;
      var name = document.getElementById("contactName").value.trim();
      var phone = document.getElementById("contactPhone").value.trim();
      var statusEl = document.getElementById("cateringStatus");

      if (!date) { statusEl.textContent = "Bitte wählen Sie ein Veranstaltungsdatum."; statusEl.className = "form-status form-status--error"; return; }
      if (!name) { statusEl.textContent = "Bitte geben Sie Ihren Namen ein."; statusEl.className = "form-status form-status--error"; return; }
      if (!selections.hauptgericht.length) { statusEl.textContent = "Bitte wählen Sie mindestens ein Hauptgericht."; statusEl.className = "form-status form-status--error"; return; }

      var mk = getPrice();
      var total = mk * (parseInt(guests) || 20);

      statusEl.textContent = "Wird gesendet …";
      statusEl.className = "form-status";
      document.getElementById("cateringSubmitBtn").disabled = true;

      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: "Catering-Anfrage von " + firma,
          Firma: firma,
          Ansprechpartner: person,
          "Kontaktname": name,
          Telefon: phone || "—",
          Datum: date,
          "Anzahl Gäste": guests,
          "MK Preis / Person": mk.toFixed(2) + " €",
          Gesamtpreis: total.toFixed(2) + " €",
          Vorspeise: selections.vorspeise.join(", ") || "—",
          Hauptgerichte: selections.hauptgericht.join(", ") || "—",
          Beilagen: selections.beilage.join(", ") || "—",
          Nachtisch: selections.nachtisch.join(", ") || "—"
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
