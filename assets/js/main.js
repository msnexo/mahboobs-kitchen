(function () {
  "use strict";

  // Sticky header background on scroll
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 30) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile nav toggle
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      header.classList.toggle("is-scrolled", isOpen);
    });
  }

  // Mobile dropdown toggle (tap-to-expand instead of hover)
  document.querySelectorAll(".main-nav .dropdown > a").forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (window.matchMedia("(max-width: 920px)").matches) {
        e.preventDefault();
        link.parentElement.classList.toggle("is-open");
      }
    });
  });

  // FAQ accordion
  document.querySelectorAll(".faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      var answer = item.querySelector(".faq-a");
      var isOpen = item.classList.contains("is-open");
      document.querySelectorAll(".faq-item.is-open").forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove("is-open");
          openItem.querySelector(".faq-a").style.maxHeight = null;
          openItem.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        }
      });
      if (isOpen) {
        item.classList.remove("is-open");
        answer.style.maxHeight = null;
        btn.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("is-open");
        answer.style.maxHeight = answer.scrollHeight + "px";
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  // Multi-step lead form
  var form = document.getElementById("leadForm");
  if (form) {
    var steps = Array.prototype.slice.call(form.querySelectorAll(".form-step"));
    var progressDots = Array.prototype.slice.call(form.querySelectorAll(".progress span"));
    var current = 0;
    var data = { datum: "", personen: "", kueche: [], name: "", nachricht: "" };

    function showStep(i) {
      steps.forEach(function (s, idx) { s.classList.toggle("is-active", idx === i); });
      progressDots.forEach(function (d, idx) { d.classList.toggle("active", idx <= i); });
      current = i;
      if (i === steps.length - 1) buildSummary();
    }

    form.querySelectorAll("[data-next]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        collectStep(current);
        if (current < steps.length - 1) showStep(current + 1);
      });
    });
    form.querySelectorAll("[data-back]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (current > 0) showStep(current - 1);
      });
    });

    function collectStep(i) {
      var step = steps[i];
      step.querySelectorAll("input[type=radio]:checked").forEach(function (r) {
        data[r.name] = r.value;
      });
      step.querySelectorAll("input[type=checkbox]:checked").forEach(function (c) {
        if (!data[c.name]) data[c.name] = [];
        if (Array.isArray(data[c.name]) && data[c.name].indexOf(c.value) === -1) data[c.name].push(c.value);
      });
      step.querySelectorAll("input[type=text], input[type=date], input[type=tel], input[type=email], textarea").forEach(function (f) {
        data[f.name] = f.value;
      });
    }

    function buildSummary() {
      collectStep(current);
      var kueche = Array.isArray(data.kueche) ? data.kueche.join(", ") : data.kueche;
      var summaryEl = form.querySelector(".form-summary");
      if (summaryEl) {
        summaryEl.innerHTML =
          "<strong>Termin:</strong> " + (data.datum || "-") + "<br>" +
          "<strong>Personen:</strong> " + (data.personen || "-") + "<br>" +
          "<strong>Wunschküche:</strong> " + (kueche || "-") + "<br>" +
          "<strong>Telefon:</strong> " + (data.telefon || "-");
      }
      var message =
        "Hallo Mahboobs Kitchen, ich möchte Catering anfragen.\n" +
        "Termin: " + (data.datum || "-") + "\n" +
        "Personen: " + (data.personen || "-") + "\n" +
        "Wunschküche: " + (kueche || "-") + "\n" +
        "Name: " + (data.name || "-") + "\n" +
        "Telefon: " + (data.telefon || "-") + "\n" +
        "Nachricht: " + (data.nachricht || "-");
      var encoded = encodeURIComponent(message);
      var waLink = form.querySelector("#waSendLink");
      if (waLink) waLink.href = "https://wa.me/4917720198 89".replace(" ", "") + "?text=" + encoded;
    }

    var statusEl = form.querySelector("#formStatus");
    var sendBtn = form.querySelector("#sendRequestBtn");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      collectStep(current);
      sendBtn.disabled = true;
      sendBtn.textContent = "Wird gesendet …";
      statusEl.textContent = "";
      statusEl.className = "form-status";
      fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      })
        .then(function (response) {
          if (response.ok) {
            statusEl.textContent = "Danke! Ihre Anfrage wurde gesendet. Wir melden uns in Kürze.";
            statusEl.className = "form-status form-status--ok";
            sendBtn.textContent = "Gesendet ✓";
          } else {
            throw new Error("send failed");
          }
        })
        .catch(function () {
          statusEl.textContent = "Senden hat leider nicht geklappt. Bitte nutzen Sie alternativ den WhatsApp-Button oder rufen Sie uns an.";
          statusEl.className = "form-status form-status--error";
          sendBtn.disabled = false;
          sendBtn.textContent = "Anfrage jetzt senden";
        });
    });

    showStep(0);
  }
})();
