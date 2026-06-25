(function () {
  "use strict";

  var form = document.getElementById("activateForm");
  if (!form) return;

  var statusEl = document.getElementById("formStatus");
  var submitBtn = document.getElementById("activateBtn");
  var client = window.mkBusiness.client;

  function setStatus(message, ok) {
    statusEl.textContent = message;
    statusEl.className = "form-status " + (ok ? "form-status--ok" : "form-status--error");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var cardCode = form.cardCode.value.trim().toUpperCase();
    var email = form.email.value.trim();
    var password = form.password.value;
    var passwordConfirm = form.passwordConfirm.value;

    if (password.length < 6) {
      setStatus("Das Passwort muss mindestens 6 Zeichen haben.", false);
      return;
    }
    if (password !== passwordConfirm) {
      setStatus("Die Passwörter stimmen nicht überein.", false);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Wird aktiviert …";
    setStatus("", true);

    client.rpc("check_card_code", { p_card_code: cardCode }).then(function (res) {
      if (res.error) throw res.error;
      if (!res.data) throw new Error("invalid_code");
      return client.auth.signUp({ email: email, password: password });
    }).then(function (res) {
      if (res.error) throw res.error;
      return client.rpc("activate_company", { p_card_code: cardCode });
    }).then(function (res) {
      if (res.error) throw res.error;
      window.location.href = "/business/dashboard/";
    }).catch(function (err) {
      var message = "Aktivierung fehlgeschlagen. Bitte Code prüfen oder Mahboobs Kitchen kontaktieren.";
      if (err && err.message === "invalid_code") {
        message = "Dieser Karten-Code ist ungültig oder wurde bereits verwendet.";
      } else if (err && /already registered/i.test(err.message || "")) {
        message = "Für diese E-Mail existiert bereits ein Konto. Bitte direkt einloggen.";
      }
      setStatus(message, false);
      submitBtn.disabled = false;
      submitBtn.textContent = "Zugang aktivieren";
    });
  });
})();
