(function () {
  "use strict";

  var form = document.getElementById("cardForm");
  if (!form) return;

  var msg = document.getElementById("cMsg");
  var btn = document.getElementById("cSubmit");
  var fName = document.getElementById("cName");
  var fCompany = document.getElementById("cCompany");
  var fPhone = document.getElementById("cPhone");
  var fEmail = document.getElementById("cEmail");
  var fConsent = document.getElementById("cConsent");

  function val(el) {
    return el && el.value ? el.value.trim() : "";
  }

  function say(text, kind) {
    msg.textContent = text;
    msg.className = "form__msg" + (kind ? " form__msg--" + kind : "");
  }

  function reset(label) {
    btn.disabled = false;
    btn.textContent = label;
  }

  function done() {
    say("Danke! Ich melde mich persönlich bei Ihnen.", "ok");
    form.reset();
    btn.textContent = "Gesendet ✓";
  }

  // Notfall-Weg: wenn Supabase nicht erreichbar ist, geht der Kontakt per
  // Formspree an info@mahboobs-kitchen.com - es darf keiner verloren gehen.
  function sendFallback(payload) {
    if (!window.CARD_FALLBACK) return Promise.reject(new Error("no fallback"));
    var body = new FormData();
    body.append("Firma", payload.p_company);
    body.append("Name", payload.p_name);
    body.append("Telefon", payload.p_phone || "—");
    body.append("E-Mail", payload.p_email || "—");
    body.append("Einwilligung", payload.p_consent ? "ja" : "nein");
    body.append("Quelle", "Visitenkarte " + (window.CARD_PERSON || ""));
    return fetch(window.CARD_FALLBACK, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: body
    }).then(function (res) {
      if (!res.ok) throw new Error("fallback failed");
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = val(fName);
    var company = val(fCompany);
    var phone = val(fPhone);
    var email = val(fEmail);

    if (!name && !company) {
      say("Bitte Namen oder Firma angeben.", "err");
      (name ? fCompany : fName).focus();
      return;
    }
    // Telefon ODER E-Mail reicht - wenn beides da ist, wird auch beides gespeichert.
    if (!phone && !email) {
      say("Bitte Telefon oder E-Mail angeben – eines von beiden genügt.", "err");
      fPhone.focus();
      return;
    }
    if (email && email.indexOf("@") < 1) {
      say("Bitte eine gültige E-Mail-Adresse angeben.", "err");
      fEmail.focus();
      return;
    }

    var payload = {
      p_company: company,
      p_name: name,
      p_phone: phone,
      p_email: email,
      p_role: null,
      p_consent: !!(fConsent && fConsent.checked),
      p_owner: window.CARD_OWNER || "REA",
      p_source: "Visitenkarte " + (window.CARD_PERSON || "")
    };

    btn.disabled = true;
    btn.textContent = "Wird gesendet …";
    say("");

    var client = null;
    if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
      client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    }

    var attempt = client
      ? client.rpc("submit_card_contact", payload).then(function (res) {
          if (res.error) throw res.error;
        })
      : Promise.reject(new Error("no client"));

    attempt.then(done).catch(function () {
      sendFallback(payload).then(done).catch(function () {
        say("Senden hat nicht geklappt. Rufen Sie mich gern direkt an.", "err");
        reset("Kontakt senden");
      });
    });
  });
})();

/* Hero-Video: Autoplay auf dem Handy nachhelfen.
   iOS/Android starten stummes Autoplay oft nicht von selbst - im Low Power Mode
   bzw. Datensparmodus gar nicht. Daher play() wiederholt anstossen und
   spaetestens bei der ersten Nutzergeste nachholen. */
(function () {
  "use strict";

  var v = document.querySelector(".hero__video");
  if (!v) return;

  // Manche Browser pruefen die Property, nicht das Attribut.
  v.muted = true;
  v.defaultMuted = true;
  v.setAttribute("muted", "");
  v.setAttribute("playsinline", "");

  function kick() {
    if (!v.paused) return;
    var p = v.play();
    if (p && p.catch) p.catch(function () { /* Autoplay blockiert - Geste holt es nach */ });
  }

  kick();
  v.addEventListener("loadeddata", kick);
  v.addEventListener("canplay", kick);

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) kick();
  });

  ["touchstart", "pointerdown", "click", "scroll"].forEach(function (ev) {
    document.addEventListener(ev, kick, { once: true, passive: true });
  });
})();

/* Einblenden beim Scrollen. Die Klasse js-reveal setzt erst dieses Skript -
   ohne JavaScript bleibt die Seite vollstaendig sichtbar. */
(function () {
  "use strict";

  var ziele = document.querySelectorAll("[data-reveal],[data-line]");
  if (!ziele.length) return;

  var sparsam = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || sparsam) {
    for (var i = 0; i < ziele.length; i++) ziele[i].classList.add("is-in");
    return;
  }

  document.documentElement.classList.add("js-reveal");

  // Gestaffelt einblenden: Geschwister nacheinander, nicht alle gleichzeitig.
  var zaehler = new Map();
  ziele.forEach(function (el) {
    var eltern = el.parentNode;
    var n = zaehler.get(eltern) || 0;
    zaehler.set(eltern, n + 1);
    if (el.hasAttribute("data-reveal")) {
      el.style.transitionDelay = Math.min(n, 5) * 80 + "ms";
    }
  });

  var beobachter = new IntersectionObserver(function (eintraege) {
    eintraege.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      beobachter.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

  ziele.forEach(function (el) { beobachter.observe(el); });
})();
