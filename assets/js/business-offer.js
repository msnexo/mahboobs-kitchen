(function () {
  "use strict";

  var WHATSAPP_NUMBER = "491772019889";

  var params = new URLSearchParams(window.location.search);
  var offerId = params.get("id");
  var ref = params.get("ref");
  var firma = params.get("firma");

  var bodyEl = document.getElementById("offerBody");
  var notFoundEl = document.getElementById("offerNotFound");
  var titleEl = document.getElementById("offerTitle");
  var descEl = document.getElementById("offerDescription");
  var imgEl = document.getElementById("offerImage");
  var welcomeEl = document.getElementById("offerWelcome");
  var waBtn = document.getElementById("offerWhatsAppBtn");
  var callBtn = document.getElementById("offerCallBtn");
  var client = window.mkBusiness.client;

  function logInterest(type) {
    client.from("offer_requests").insert({
      offer_id: offerId,
      company_id: null,
      card_code: ref || null,
      company_name: firma || null,
      type: type
    }).then(function () {});
  }

  function showNotFound() {
    bodyEl.hidden = true;
    notFoundEl.hidden = false;
  }

  if (firma) {
    welcomeEl.textContent = "Willkommen zurück, " + firma + "!";
    welcomeEl.hidden = false;
  }

  if (!offerId) {
    showNotFound();
    return;
  }

  client.from("offers").select("*").eq("id", offerId).eq("active", true).single().then(function (res) {
    if (res.error || !res.data) {
      showNotFound();
      return;
    }
    var offer = res.data;
    titleEl.textContent = offer.title;
    descEl.textContent = offer.description || "";
    if (offer.image_url) {
      imgEl.src = offer.image_url;
      imgEl.hidden = false;
    }

    var idNote = ref ? " Meine Kundennummer: " + ref + "." : "";
    var firmaNote = firma ? " Ich bin von " + firma + "." : "";
    var message = 'Hallo, ich interessiere mich für Ihr Angebot "' + offer.title + '".' + firmaNote + idNote;
    waBtn.href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);

    callBtn.addEventListener("click", function () { logInterest("call"); });
    waBtn.addEventListener("click", function () { logInterest("interest"); });
  }).catch(function () {
    showNotFound();
  });
})();
