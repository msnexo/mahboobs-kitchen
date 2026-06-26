(function () {
  "use strict";

  var form = document.getElementById("loginForm");
  if (!form) return;

  var statusEl = document.getElementById("formStatus");
  var submitBtn = document.getElementById("loginBtn");
  var client = window.mkBusiness.client;

  function setStatus(message, ok) {
    statusEl.textContent = message;
    statusEl.className = "form-status " + (ok ? "form-status--ok" : "form-status--error");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = form.email.value.trim();
    var password = form.password.value;

    submitBtn.disabled = true;
    submitBtn.textContent = "Wird angemeldet …";
    setStatus("", true);

    client.auth.signInWithPassword({ email: email, password: password }).then(function (res) {
      if (res.error) throw res.error;
      return window.mkBusiness.getProfile(res.data.user.id);
    }).then(function (profile) {
      if (profile && profile.role === "admin") {
        window.location.href = "/business/admin/";
        return;
      }
      var redirect = new URLSearchParams(window.location.search).get("redirect");
      window.location.href = redirect && redirect.indexOf("/business/") === 0 ? redirect : "/business/dashboard/";
    }).catch(function (err) {
      setStatus("Anmeldung fehlgeschlagen: E-Mail oder Passwort ist falsch.", false);
      submitBtn.disabled = false;
      submitBtn.textContent = "Anmelden";
    });
  });
})();
