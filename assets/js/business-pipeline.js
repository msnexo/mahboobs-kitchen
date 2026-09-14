(function () {
  "use strict";

  var DAILY_GOAL = 10;

  var PIPELINE_PINS = window.PIPELINE_PINS || { REA: "1111" };
  var NUTZER = "REA";   // aktuell arbeitet nur eine Person damit

  function getPipelineUser()   { return sessionStorage.getItem("mk_pipeline_user"); }
  function setPipelineUser(u)  { sessionStorage.setItem("mk_pipeline_user", u); }
  function clearPipelineUser() { sessionStorage.removeItem("mk_pipeline_user"); }


  function escapeHtml(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Nur an Handynummern kann WhatsApp zustellen. Deutsche Mobilfunknummern
  // beginnen nach der Landesvorwahl mit 15, 16 oder 17 - Festnetz nicht.
  function normalisiereNummer(nummer) {
    var d = (nummer || "").replace(/[^\d+]/g, "");
    if (d.indexOf("+") === 0) d = d.slice(1);
    else if (d.indexOf("00") === 0) d = d.slice(2);
    else if (d.indexOf("0") === 0) d = "49" + d.slice(1);
    return d;
  }

  function istHandy(nummer) {
    var d = normalisiereNummer(nummer);
    if (!d) return false;
    // Auslaendische Nummern koennen wir nicht beurteilen - die lassen wir zu.
    if (d.indexOf("49") !== 0) return d.length >= 8;
    return /^49(15|16|17)/.test(d) && d.length >= 11;
  }

  // Die Nummer, an die WhatsApp gehen darf: bevorzugt das Handy-Feld.
  function handyVon(person) {
    if (!person) return "";
    if (istHandy(person.mobile)) return normalisiereNummer(person.mobile);
    if (istHandy(person.phone)) return normalisiereNummer(person.phone);
    return "";
  }

  // "firma.de" reicht als Eingabe - fuers Oeffnen braucht der Browser https://
  function vollstaendigeAdresse(eingabe) {
    var w = (eingabe || "").trim();
    if (!w) return null;
    return /^https?:\/\//i.test(w) ? w : "https://" + w;
  }

  var SEITE = "https://mahboobs-kitchen.com";
  var KARTE_URL = SEITE + "/karte/reyyan/";

  // Link zur Business Karte des Kunden - der Schluessel ist geheim, ohne ihn
  // laesst sich keine Karte oeffnen.
  function karteLink(schluessel) {
    return SEITE + "/business/meine-karte/?k=" + schluessel;
  }

  // Heutiges Datum nach Ortszeit (nicht UTC) - fuer Datumsfelder.
  function heuteLokal() {
    var d = new Date();
    var pad = function (n) { return String(n).padStart(2, "0"); };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  // Am Handy oeffnet wa.me die App direkt. Am Laptop oeffnen wir ueber
  // whatsapp:// die installierte App - WhatsApp Web wuerde jedes Mal einen
  // neuen Tab aufmachen und das Geraet neu verknuepfen wollen.
  var amHandy = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Einheitliche Strich-Symbole statt Emojis - sehen auf jedem Geraet gleich aus.
  function sym(pfad) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + pfad + "</svg>";
  }
  var SYM = {
    festnetz: sym('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>'),
    handy:    sym('<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>'),
    whatsapp: sym('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.5-5A8 8 0 1 1 21 12Z"/>'),
    mail:     sym('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
    stift:    sym('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>'),
    kopieren: sym('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>'),
    haken:    sym('<path d="m5 12 5 5L20 7"/>')
  };

  // Ort aus "Strasse, PLZ Ort" herausziehen, damit die Suche die richtige Firma trifft.
  function ortAus(adresse) {
    var teil = (adresse || "").split(",").pop().trim();
    return teil.replace(/^\d{4,5}\s*/, "");
  }

  function googleSuche(text) {
    return "https://www.google.com/search?q=" + encodeURIComponent(text.trim());
  }

  function linkedinFirma(name) {
    return "https://www.linkedin.com/search/results/companies/?keywords=" + encodeURIComponent(name.trim());
  }

  function linkedinPerson(person, firma) {
    return "https://www.linkedin.com/search/results/people/?keywords=" +
      encodeURIComponent((person + " " + (firma || "")).trim());
  }

  // frisch = direkt nach dem Besuch, sonst der neutrale Text fuer spaeter.
  function kartenText(name, frisch) {
    var anrede = name ? "Hallo " + name + ", " : "Hallo, ";
    return anrede + (frisch
      ? "schön, dass wir eben sprechen konnten. Hier ist meine digitale Visitenkarte "
      : "wie besprochen hier meine digitale Visitenkarte ") +
      "mit allem, was wir anbieten: " + KARTE_URL;
  }

  function waZiel(nummer, text) {
    var t = text ? encodeURIComponent(text) : "";
    if (amHandy) {
      return "https://wa.me/" + (nummer || "") + (t ? "?text=" + t : "");
    }
    var teile = [];
    if (nummer) teile.push("phone=" + nummer);
    if (t) teile.push("text=" + t);
    return "whatsapp://send" + (teile.length ? "?" + teile.join("&") : "");
  }

  // Am Handy in neuem Fenster, am Laptop direkt die App - ein neuer Tab
  // bliebe dort sonst leer zurueck.
  function oeffneWhatsApp(url) {
    if (amHandy) window.open(url, "_blank");
    else window.location.href = url;
  }

  // Am Laptop oeffnet mailto Outlook - deshalb dort direkt Gmail mit dem
  // Geschaeftskonto. Am Handy nimmt mailto die Mail-App (z. B. Gmail-App).
  var MAIL_ABSENDER = "info@mahboobs-kitchen.com";

  function mailZiel(empfaenger, text, betreff) {
    if (betreff === undefined) betreff = "Mahboobs Kitchen – meine Visitenkarte";
    text = text || "";
    if (amHandy) {
      var teile = [];
      if (betreff) teile.push("subject=" + encodeURIComponent(betreff));
      if (text) teile.push("body=" + encodeURIComponent(text));
      return "mailto:" + (empfaenger || "") + (teile.length ? "?" + teile.join("&") : "");
    }
    return "https://mail.google.com/mail/u/" + MAIL_ABSENDER + "/?view=cm&fs=1" +
      "&to=" + encodeURIComponent(empfaenger || "") +
      (betreff ? "&su=" + encodeURIComponent(betreff) : "") +
      (text ? "&body=" + encodeURIComponent(text) : "");
  }

  // Gmail am Laptop in neuem Tab, mailto am Handy im selben Fenster.
  function mailFenster(a) {
    if (!a) return;
    if (amHandy) { a.removeAttribute("target"); a.removeAttribute("rel"); }
    else { a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener"); }
  }

  function buildWhatsAppLink(phone, message) {
    var digits = (phone || "").replace(/[^\d+]/g, "").replace(/^\+/, "");
    if (digits.indexOf("0") === 0) digits = "49" + digits.slice(1);
    return "https://wa.me/" + digits + "?text=" + encodeURIComponent(message);
  }

  function buildTelLink(phone) {
    var digits = (phone || "").replace(/[^\d+]/g, "").replace(/^\+/, "");
    if (digits.indexOf("0") === 0) digits = "49" + digits.slice(1);
    return "tel:+" + digits;
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function addDaysISO(days) {
    var d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function formatSimpleDate(iso) {
    var parts = iso.split("-");
    return parts[2] + "." + parts[1] + "." + parts[0];
  }

  function dateOnly(value) {
    return value ? value.slice(0, 10) : null;
  }

  function formatDateTime(iso) {
    if (!iso) return "";
    // Date-only strings (YYYY-MM-DD) parse as UTC midnight in JS → add local noon to avoid timezone shift
    var d = new Date(iso.length <= 10 ? iso + "T12:00:00" : iso);
    return d.toLocaleDateString("de-DE") + ", " + d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  }

  function formatDateOnly(iso) {
    if (!iso) return "";
    return new Date(iso.length <= 10 ? iso + "T12:00:00" : iso).toLocaleDateString("de-DE");
  }

  function toDatetimeLocalValue(iso) {
    if (!iso) return "";
    var d = new Date(iso.length <= 10 ? iso + "T12:00:00" : iso);
    var pad = function (n) { return String(n).padStart(2, "0"); };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  var statusLabels = { lead: "Lead", contacted: "Kontaktiert", customer: "Stammkunde", lost: "Kein Interesse" };

  // Nahe Tage bekommen einen Namen, der Rest das Datum.
  function tagName(iso) {
    var heute = todayISO();
    if (iso === heute) return "Heute";
    if (iso === addDaysISO(1)) return "Morgen";
    if (iso === addDaysISO(-1)) return "Gestern";
    if (iso === addDaysISO(-2)) return "Vorgestern";
    return formatDayLabel(iso);
  }

  function formatDayLabel(iso) {
    var d = new Date(iso + "T12:00:00");
    var dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
    return dayNames[d.getDay()] + " " + d.getDate() + "." + (d.getMonth() + 1) + ".";
  }

  function setReminder(id, name, at) {
    var reminders = getReminders().filter(function (r) { return r.id !== id; });
    if (at) reminders.push({ id: id, name: name, at: at, fired: false, gesehen: false });
    localStorage.setItem("mk_reminders", JSON.stringify(reminders));
  }

  function hasReminder(id) {
    return reminderZustand(id) !== "keine";
  }

  function getReminders() {
    try { return JSON.parse(localStorage.getItem("mk_reminders") || "[]"); }
    catch (e) { return []; }
  }

  // "keine" | "gesetzt" | "faellig" - fuer die Klingel in Liste und Logbuch.
  // Wer den Eintrag geoeffnet hat, hat die Erinnerung gesehen: sie leuchtet
  // dann nicht mehr, bleibt aber als blasse Markierung stehen.
  function reminderZustand(id) {
    var r = getReminders().filter(function (x) { return x.id === id; })[0];
    if (!r) return "keine";
    if (r.gesehen) return "gesetzt";
    return new Date(r.at).getTime() <= Date.now() ? "faellig" : "gesetzt";
  }

  function erinnerungGesehen(id) {
    var reminders = getReminders();
    var geaendert = false;
    reminders.forEach(function (r) {
      if (r.id === id && !r.gesehen && new Date(r.at).getTime() <= Date.now()) {
        r.gesehen = true;
        geaendert = true;
      }
    });
    if (geaendert) localStorage.setItem("mk_reminders", JSON.stringify(reminders));
    return geaendert;
  }

  function checkReminders() {
    var reminders = getReminders();
    var now = Date.now();
    var geaendert = false;

    reminders.forEach(function (r) {
      // Faellig und noch nicht gemeldet? Dann jetzt melden - auch wenn der
      // Zeitpunkt laengst vorbei ist, weil die Seite damals zu war.
      if (!r.fired && new Date(r.at).getTime() <= now) {
        r.fired = true;
        geaendert = true;
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("🔔 Erinnerung: " + r.name, {
            body: "Nächster Kontakt ist fällig",
            icon: "/assets/img/favicon.webp"
          });
        }
      }
    });

    if (geaendert) {
      localStorage.setItem("mk_reminders", JSON.stringify(reminders));
      document.dispatchEvent(new CustomEvent("mk-erinnerung"));
    }
  }

  function startPipeline(client, currentUser) {
    var allProspects = [];
    var currentPeople = [];
    var selectedProspectId = null;
    var showArchive = false;
    var searchQuery = "";

    var dailyCounterEl = document.getElementById("dailyCounter");

    var addProspectBtn = document.getElementById("addProspectBtn");
    var addProspectOverlay = document.getElementById("addProspectOverlay");
    var addProspectClose = document.getElementById("addProspectClose");
    var addProspectForm = document.getElementById("addProspectForm");
    var addProspectStatus = document.getElementById("addProspectStatus");

    var pipelineLeads = document.getElementById("pipelineLeads");
    var pipelineOverdue = document.getElementById("pipelineOverdue");
    var pipelineToday = document.getElementById("pipelineToday");
    var pipelineTomorrow = document.getElementById("pipelineTomorrow");
    var pipelineDates = document.getElementById("pipelineDates");
    var pipelineStammkunden = document.getElementById("pipelineStammkunden");
    var pipelineArchive = document.getElementById("pipelineArchive");
    var toggleArchiveBtn = document.getElementById("toggleArchiveBtn");

    var detailOverlay = document.getElementById("prospectDetailOverlay");
    var detailClose = document.getElementById("prospectDetailClose");
    var detailStatus = document.getElementById("prospectDetailStatus");
    var statusSelect = document.getElementById("prospectStatusSelect");
    var detailNameInput = document.getElementById("prospectDetailNameInput");
    var detailCategoryInput = document.getElementById("prospectDetailCategoryInput");
    var detailNotes = document.getElementById("prospectDetailNotes");
    var saveNotesBtn = document.getElementById("prospectDetailSaveNotes");
    var peopleListEl = document.getElementById("prospectDetailPeople");
    var newPersonName = document.getElementById("newPersonName");
    var newPersonPhone = document.getElementById("newPersonPhone");
    var newPersonEmail = document.getElementById("newPersonEmail");
    var addPersonBtn = document.getElementById("addPersonBtn");
    var detailWebsite = document.getElementById("prospectDetailWebsite");
    var detailWebsiteOpen = document.getElementById("prospectDetailWebsiteOpen");
    var detailAddress = document.getElementById("prospectDetailAddress");
    var nextContactDate = document.getElementById("nextContactDate");
    var nextContactNotes = document.getElementById("nextContactNotes");
    var logContactBtn = document.getElementById("logContactBtn");
    var logStatus = document.getElementById("logStatus");
    var reminderBellBtn = document.getElementById("reminderBellBtn");
    var reminderStatus = document.getElementById("reminderStatus");
    var historyEl = document.getElementById("prospectDetailHistory");
    var markLostBtn = document.getElementById("markLostBtn");
    var deleteProspectBtn = document.getElementById("deleteProspectBtn");
    var bkInhalt = document.getElementById("bkInhalt");

    function loadDailyCounter() {
      client.from("prospect_contacts").select("id", { count: "exact", head: true }).eq("contact_date", todayISO()).then(function (res) {
        dailyCounterEl.textContent = (res.count || 0) + " von " + DAILY_GOAL + " heute kontaktiert";
      });
    }

    // Klingel: grau wenn nur gesetzt, orange und pulsierend wenn faellig.
    function glockeHtml(zustand) {
      if (zustand === "keine") return "";
      var faellig = zustand === "faellig";
      return '<span class="glocke' + (faellig ? " glocke--faellig" : "") + '" title="' +
        (faellig ? "Erinnerung f&auml;llig" : "Erinnerung gesetzt") + '">&#128276;</span>';
    }

    function renderProspectCard(p, index, total) {
      var moveBtnStyle = "background:none;border:1px solid var(--color-border);border-radius:6px;cursor:pointer;padding:2px 8px;font-size:0.8rem;color:var(--color-text-soft);";
      var upBtn = index > 0 ? '<button type="button" data-move="up" style="' + moveBtnStyle + '">▲</button>' : "";
      var downBtn = index < total - 1 ? '<button type="button" data-move="down" style="' + moveBtnStyle + '">▼</button>' : "";
      return (
        '<div class="card prospect-card" data-prospect-id="' + p.id + '" style="cursor:pointer;margin-bottom:10px;padding:16px 20px;">' +
        '<div class="btn-row" style="justify-content:space-between;align-items:center;">' +
        "<div>" + glockeHtml(reminderZustand(p.id)) + handHtml(p.id) + "<strong>" + escapeHtml(p.name) +
        '</strong> <span class="muted">(' + escapeHtml(p.category) + ")</span></div>" +
        '<div style="display:flex;align-items:center;gap:8px;">' + upBtn + downBtn +
        (p.status === "customer" && p.customer_no
          ? (p.werbung_abgemeldet_at ? '<span class="abgemeldet-pill" title="Bekommt keine Werbung mehr">abgemeldet</span>' : "") +
            '<span class="kundennr" title="Kundennummer">' + escapeHtml(p.customer_no) + "</span>"
          : '<span class="status-pill status-pill--' + p.status + '">' + statusLabels[p.status] + "</span>") +
        "</div>" +
        "</div>" +
        (function () {
          var person = erstePersonen[p.id];
          var teile = [];
          if (p.next_contact_date) {
            var wann = new Date(p.next_contact_date);
            var mitUhrzeit = p.next_contact_date.length > 10 &&
              (wann.getHours() !== 0 || wann.getMinutes() !== 0);
            var text = "Termin: " + (mitUhrzeit ? formatDateTime(p.next_contact_date)
                                                : formatDateOnly(p.next_contact_date));
            // Vorbei? Dann hervorheben - gemessen an der Uhr, nicht nur am Tag.
            teile.push(wann.getTime() < Date.now()
              ? '<span class="termin-vorbei">' + text + "</span>" : text);
          }
          if (person && person.name) teile.push(escapeHtml(person.name));
          var nr = person && (person.mobile || person.phone);
          if (nr) teile.push(escapeHtml(nr));
          if (person && person.email) teile.push(escapeHtml(person.email));
          return teile.length
            ? '<p class="muted zeile2" style="margin:6px 0 0;font-size:0.8rem;">' +
              teile.join(" &middot; ") + "</p>"
            : "";
        })() +
        (p.notes ? '<p class="muted" style="margin:8px 0 0;font-size:0.85rem;">' + escapeHtml(p.notes.slice(0, 120)) + "</p>" : "") +
        "</div>"
      );
    }

    function moveProspect(bucket, id, dir) {
      var idx = bucket.findIndex(function (p) { return p.id === id; });
      var swapIdx = dir === "up" ? idx - 1 : idx + 1;
      if (idx === -1 || swapIdx < 0 || swapIdx >= bucket.length) return;
      var reordered = bucket.slice();
      var tmp = reordered[idx];
      reordered[idx] = reordered[swapIdx];
      reordered[swapIdx] = tmp;
      Promise.all(reordered.map(function (p, i) {
        return client.from("prospects").update({ sort_order: i }).eq("id", p.id);
      })).then(function () { loadProspects(); });
    }

    // Beim Laden der Seite ist alles zu. Waehrend der Sitzung bleibt geoeffnet,
    // was geoeffnet wurde - sonst wuerde das automatische Neuzeichnen es zuklappen.
    var offeneGruppen = {};

    function gruppeHtml(titel, prospects, klasse) {
      return '<details class="bucket' + (klasse ? " " + klasse : "") + '"' +
        (offeneGruppen[titel] ? " open" : "") +
        ' data-bucket="' + escapeHtml(titel) + '">' +
        "<summary>" + escapeHtml(titel) + ' <span class="bucket__zahl">' + prospects.length + "</span></summary>" +
        '<div class="bucket__inhalt">' +
        prospects.map(function (p, i) { return renderProspectCard(p, i, prospects.length); }).join("") +
        "</div></details>";
    }

    function merkeOffen(container) {
      Array.prototype.forEach.call(container.querySelectorAll("details.bucket"), function (d) {
        d.addEventListener("toggle", function () {
          offeneGruppen[d.getAttribute("data-bucket")] = d.open;
        });
      });
    }

    function renderBucket(container, title, prospects, klasse) {
      if (!prospects.length) {
        container.innerHTML = "";
        return;
      }
      container.innerHTML = gruppeHtml(title, prospects, klasse);
      merkeOffen(container);
      Array.prototype.forEach.call(container.querySelectorAll("[data-prospect-id]"), function (card) {
        card.addEventListener("click", function (e) {
          if (e.target.closest("[data-move]")) return;
          openDetail(card.getAttribute("data-prospect-id"));
        });
      });
      Array.prototype.forEach.call(container.querySelectorAll("[data-move]"), function (btn) {
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          var card = btn.closest("[data-prospect-id]");
          moveProspect(prospects, card.getAttribute("data-prospect-id"), btn.getAttribute("data-move"));
        });
      });
    }

    // Stammkunden haben einen eigenen Bereich - offen, alphabetisch, ohne Datumsgruppen.
    function renderStammkunden(container, prospects) {
      if (!container) return;
      var zahl = document.getElementById("stammZahl");
      if (zahl) zahl.textContent = prospects.length;
      // Wer sich gemeldet hat, steht oben
      prospects = prospects.slice().sort(function (a, b) {
        return (offeneSignale[b.id] ? 1 : 0) - (offeneSignale[a.id] ? 1 : 0);
      });
      var gemeldet = prospects.filter(function (p) { return offeneSignale[p.id]; }).length;
      var hand = document.getElementById("stammHand");
      if (hand) {
        hand.hidden = !gemeldet;
        hand.innerHTML = "&#9995; " + gemeldet;
      }
      container.innerHTML = prospects.length
        ? prospects.map(function (p) { return renderProspectCard(p, 0, 1); }).join("")
        : '<p class="muted pl-leer">Noch keine Stammkunden &ndash; sie kommen hierher, sobald die Business Karte zugeschickt ist.</p>';
      Array.prototype.forEach.call(container.querySelectorAll("[data-prospect-id]"), function (card) {
        card.addEventListener("click", function () { openDetail(card.getAttribute("data-prospect-id")); });
      });
    }

    function byDate(a, b) { return new Date(a.next_contact_date) - new Date(b.next_contact_date); }
    function byCreated(a, b) { return new Date(b.created_at) - new Date(a.created_at); }

    function renderLaterBuckets(container, prospects) {
      if (!prospects.length) { container.innerHTML = ""; return; }
      var grouped = {};
      prospects.forEach(function (p) {
        var d = dateOnly(p.next_contact_date);
        if (!grouped[d]) grouped[d] = [];
        grouped[d].push(p);
      });
      var dates = Object.keys(grouped).sort();
      container.innerHTML = dates.map(function (d) {
        return gruppeHtml(tagName(d), grouped[d], d < todayISO() ? "bucket--faellig" : "");
      }).join("");
      merkeOffen(container);
      Array.prototype.forEach.call(container.querySelectorAll("[data-prospect-id]"), function (card) {
        card.addEventListener("click", function (e) {
          if (e.target.closest("[data-move]")) return;
          openDetail(card.getAttribute("data-prospect-id"));
        });
      });
      Array.prototype.forEach.call(container.querySelectorAll("[data-move]"), function (btn) {
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          var card = btn.closest("[data-prospect-id]");
          var pid = card.getAttribute("data-prospect-id");
          var pr = prospects.filter(function (p) { return p.id === pid; })[0];
          if (!pr) return;
          moveProspect(grouped[dateOnly(pr.next_contact_date)], pid, btn.getAttribute("data-move"));
        });
      });
    }

    function renderPipeline() {
      var today = todayISO();
      var tomorrow = addDaysISO(1);
      var q = searchQuery.toLowerCase();
      var visible = allProspects.filter(function (p) {
        if (q && p.name.toLowerCase().indexOf(q) === -1) return false;
        return true;
      });
      var active = visible.filter(function (p) { return p.status === "lead" || p.status === "contacted"; });
      var archived = visible.filter(function (p) { return p.status === "lost"; });
      // Stammkunde = Business Karte verschickt. Alphabetisch, damit man sie schnell findet.
      var stammkunden = visible.filter(function (p) { return p.status === "customer"; })
        .sort(function (a, b) { return a.name.localeCompare(b.name, "de"); });

      var leads = active.filter(function (p) { return !p.next_contact_date; }).sort(byCreated);
      var overdue = active.filter(function (p) { return p.next_contact_date && dateOnly(p.next_contact_date) < today; }).sort(byDate);
      var dueToday = active.filter(function (p) { return dateOnly(p.next_contact_date) === today; }).sort(byDate);
      var dueTomorrow = active.filter(function (p) { return dateOnly(p.next_contact_date) === tomorrow; }).sort(byDate);
      var later = active.filter(function (p) { return p.next_contact_date && dateOnly(p.next_contact_date) > tomorrow; }).sort(byDate);

      var liste = document.querySelector(".work-list");
      var scrollStand = liste ? liste.scrollTop : 0;

      renderBucket(pipelineLeads, "Neue Leads", leads);
      renderLaterBuckets(pipelineOverdue, overdue);
      renderBucket(pipelineToday, "Heute", dueToday, "bucket--heute");
      renderBucket(pipelineTomorrow, "Morgen", dueTomorrow);
      renderLaterBuckets(pipelineDates, later);
      renderStammkunden(pipelineStammkunden, stammkunden);
      var leadZahl = document.getElementById("leadZahl");
      if (leadZahl) leadZahl.textContent = active.length;
      renderBucket(pipelineArchive, "Archiv", archived);

      if (liste) liste.scrollTop = scrollStand;
      if (selectedProspectId) markiereAktiv(selectedProspectId);
    }

    // Erste Ansprechpartner je Eintrag, damit die Liste Name und Nummer zeigt,
    // ohne dass man jede Zeile oeffnen muss.
    var erstePersonen = {};

    function loadErstePersonen() {
      return client.from("prospect_people")
        .select("prospect_id, name, phone, mobile, email")
        .order("created_at", { ascending: true })
        .then(function (res) {
          erstePersonen = {};
          (res.data || []).forEach(function (pe) {
            if (!erstePersonen[pe.prospect_id]) erstePersonen[pe.prospect_id] = pe;
          });
        })
        .catch(function () { erstePersonen = {}; });
    }

    // Offene Rueckmeldungen (Interesse, Rueckruf) von der Business Karte.
    var offeneSignale = {};

    function ladeSignale() {
      return client.from("prospect_signals")
        .select("id, prospect_id, art, offer_title, created_at")
        .is("erledigt_at", null)
        .neq("art", "abmeldung")
        .order("created_at", { ascending: false })
        .then(function (res) {
          offeneSignale = {};
          (res.data || []).forEach(function (sig) {
            (offeneSignale[sig.prospect_id] = offeneSignale[sig.prospect_id] || []).push(sig);
          });
        });
    }

    // Hand = "hier hat sich jemand gemeldet". Die Glocke bleibt fuer die Wiedervorlage.
    function handHtml(id) {
      var sig = offeneSignale[id];
      if (!sig || !sig.length) return "";
      return '<span class="hand" title="' + sig.length + " offene R\u00fcckmeldung" + (sig.length > 1 ? "en" : "") + '">&#9995;</span>';
    }

    function loadProspects() {
      return client.from("prospects").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false }).then(function (res) {
        allProspects = res.data || [];
        return Promise.all([loadErstePersonen(), ladeSignale()]);
      }).then(function () {
        renderPipeline();
      });
    }

    function renderPeople(people) {
      currentPeople = people;
      if (!people.length) {
        peopleListEl.innerHTML = '<p class="muted">Noch keine Ansprechpartner.</p>';
        return;
      }
      var firmaName = ((allProspects.filter(function (x) { return x.id === selectedProspectId; })[0]) || {}).name || "";
      peopleListEl.innerHTML = people.map(function (person) {
        var handy = handyVon(person);
        var pid = escapeHtml(person.id);

        // B: Festnetz und Handy getrennt anrufen
        var anruf = function (nummer, art, zeichen) {
          return '<a class="dk-sym" href="' + buildTelLink(nummer) + '" title="' + art + ' anrufen" ' +
            'data-aktion="anruf" data-art="' + art + '" data-nummer="' + escapeHtml(nummer) + '" ' +
            'data-person="' + pid + '">' + zeichen + "</a>";
        };

        // C: Karte schicken oder normal schreiben
        var menue = function (typ, zeichen, titel, karteHref, leerHref, neuesFenster) {
          var ziel = neuesFenster ? ' target="_blank" rel="noopener"' : "";
          return '<span class="dk-menue-wrap">' +
            '<button type="button" class="dk-sym' + (typ === "wa" ? " dk-sym--wa" : "") + '" title="' + titel + '" ' +
            'data-menue="' + typ + "-" + pid + '">' + zeichen + "</button>" +
            '<span class="dk-menue" id="' + typ + "-" + pid + '" hidden>' +
            '<a href="' + escapeHtml(karteHref) + '"' + ziel + ' data-aktion="' + typ + '-karte" data-person="' + pid + '">Visitenkarte schicken</a>' +
            '<a href="' + escapeHtml(leerHref) + '"' + ziel + ' data-aktion="' + typ + '-normal" data-person="' + pid + '">Normal schreiben</a>' +
            "</span></span>";
        };

        var waLeer = handy ? waZiel(handy, "") : "";

        var symbole =
          (person.phone ? anruf(person.phone, "Festnetz", SYM.festnetz) : "") +
          (person.mobile ? anruf(person.mobile, "Handy", SYM.handy) : "") +
          (handy ? menue("wa", SYM.whatsapp, "WhatsApp", waZiel(handy, kartenText(person.name, false)), waLeer, amHandy) : "") +
          (person.email ? menue("mail", SYM.mail, "E-Mail",
            mailZiel(person.email, kartenText(person.name, false)), mailZiel(person.email, "", ""), !amHandy) : "") +
          // E: Person recherchieren - nichts wird gespeichert oder ins Logbuch geschrieben
          '<a class="dk-sym dk-sym--marke" href="' + escapeHtml(googleSuche(person.name + " " + firmaName)) +
            '" target="_blank" rel="noopener" title="' + escapeHtml(person.name) + ' bei Google suchen">' +
            '<span class="dk-marke dk-marke--g">G</span></a>' +
          '<a class="dk-sym dk-sym--marke" href="' + escapeHtml(linkedinPerson(person.name, firmaName)) +
            '" target="_blank" rel="noopener" title="' + escapeHtml(person.name) + ' bei LinkedIn suchen">' +
            '<span class="dk-marke dk-marke--in">in</span></a>' +
          '<button type="button" class="dk-sym" data-edit-person="' + person.id + '" title="Bearbeiten">' + SYM.stift + "</button>";

        // D: Nummern lassen sich mit einem Klick kopieren - z. B. fuer ein
        // Telefonprogramm am Rechner, sobald der Laptop verbunden ist.
        var zeile = function (bez, wert, kopierbar) {
          if (!wert) return "";
          return '<div class="dk-pz"><span class="dk-pz__bez">' + bez + "</span>" +
            '<span class="dk-pz__wert">' + escapeHtml(wert) + "</span>" +
            (kopierbar
              ? '<button type="button" class="dk-kopieren" data-kopieren="' + escapeHtml(wert) +
                '" title="' + bez + 'nummer kopieren">' + SYM.kopieren + "</button>"
              : "") +
            "</div>";
        };

        return (
          '<div class="dk-person" data-person-row="' + person.id + '">' +
          '<div class="dk-person__kopf"><strong>' + escapeHtml(person.name) + "</strong>" +
          (person.role ? "<span>" + escapeHtml(person.role) + "</span>" : "") + "</div>" +
          '<div class="dk-person__symbole">' + symbole + "</div>" +
          '<div class="dk-rueckfrage" data-rueckfrage="' + pid + '" hidden></div>' +
          '<div class="dk-person__daten">' +
          zeile("Festnetz", person.phone, true) + zeile("Handy", person.mobile, true) + zeile("E-Mail", person.email, false) +
          "</div>" +
          '<div class="dk-person__bearbeiten" data-edit-form="' + person.id + '" hidden>' +
          '<label>Name<input type="text" data-field="name" autocomplete="off" value="' + escapeHtml(person.name) + '"></label>' +
          '<label>Position<input type="text" data-field="role" autocomplete="off" value="' + escapeHtml(person.role || '') + '"></label>' +
          '<label>Festnetz<input type="tel" data-field="phone" autocomplete="off" value="' + escapeHtml(person.phone || '') + '"></label>' +
          '<label>Handy<input type="tel" data-field="mobile" autocomplete="off" value="' + escapeHtml(person.mobile || '') + '"></label>' +
          '<label>E-Mail<input type="email" data-field="email" autocomplete="off" value="' + escapeHtml(person.email || '') + '"></label>' +
          '<div class="dk-person__aktionen">' +
          '<button type="button" data-save-person="' + person.id + '" class="dk-knopf dk-knopf--primaer">Speichern</button>' +
          '<button type="button" data-cancel-person="' + person.id + '" class="dk-knopf">Abbrechen</button>' +
          '<button type="button" data-delete-person="' + person.id + '" class="dk-knopf dk-knopf--loeschen">L&ouml;schen</button>' +
          "</div></div>" +
          "</div>"
        );
      }).join('') +
      // Platz fuer eine zweite Person sichtbar machen, solange nur eine da ist.
      (people.length === 1
        ? '<button type="button" class="dk-person dk-person--frei" id="zweitePersonAnlegen">' +
          "<span>+</span>Zweiten Ansprechpartner anlegen</button>"
        : "");

      // Aufklappmenues fuer WhatsApp und E-Mail
      Array.prototype.forEach.call(peopleListEl.querySelectorAll("[data-menue]"), function (btn) {
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          var menueEl = document.getElementById(btn.getAttribute("data-menue"));
          var warOffen = menueEl && !menueEl.hidden;
          Array.prototype.forEach.call(peopleListEl.querySelectorAll(".dk-menue"), function (m) { m.hidden = true; });
          if (menueEl) menueEl.hidden = warOffen;
        });
      });

      // A: nach Anruf, Karte oder Nachricht kurz nachfragen - erst die Antwort traegt ein
      Array.prototype.forEach.call(peopleListEl.querySelectorAll("[data-aktion]"), function (el) {
        el.addEventListener("click", function () {
          Array.prototype.forEach.call(peopleListEl.querySelectorAll(".dk-menue"), function (m) { m.hidden = true; });
          var wer = people.filter(function (x) { return x.id === el.getAttribute("data-person"); })[0];
          if (wer) zeigeRueckfrage(wer, el.getAttribute("data-aktion"), el);
        });
      });

      // D: Nummer kopieren - kurze Bestaetigung am Knopf, kein Logbuch-Eintrag
      Array.prototype.forEach.call(peopleListEl.querySelectorAll("[data-kopieren]"), function (btn) {
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          var nummer = btn.getAttribute("data-kopieren");
          var fertig = function () {
            btn.classList.add("is-kopiert");
            btn.innerHTML = SYM.haken;
            btn.title = "Kopiert";
            setTimeout(function () {
              btn.classList.remove("is-kopiert");
              btn.innerHTML = SYM.kopieren;
              btn.title = "Nummer kopieren";
            }, 1600);
          };
          var ersatzweg = function () {
            var feld = document.createElement("textarea");
            feld.value = nummer;
            feld.setAttribute("readonly", "");
            feld.style.position = "fixed";
            feld.style.opacity = "0";
            document.body.appendChild(feld);
            feld.select();
            try { document.execCommand("copy"); fertig(); } catch (err) {}
            document.body.removeChild(feld);
          };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(nummer).then(fertig, ersatzweg);
          } else {
            ersatzweg();
          }
        });
      });

      var frei = document.getElementById("zweitePersonAnlegen");
      if (frei) {
        frei.addEventListener("click", neuePersonOeffnen);
      }

      Array.prototype.forEach.call(peopleListEl.querySelectorAll('[data-edit-person]'), function (btn) {
        btn.addEventListener('click', function () {
          var form = peopleListEl.querySelector('[data-edit-form="' + btn.getAttribute('data-edit-person') + '"]');
          var karte = form.closest('.dk-person');
          karte.classList.add('is-bearbeiten');
          form.hidden = false;
          var erstes = form.querySelector('input');
          if (erstes) erstes.focus();
        });
      });
      Array.prototype.forEach.call(peopleListEl.querySelectorAll('[data-cancel-person]'), function (btn) {
        btn.addEventListener('click', function () {
          var form = peopleListEl.querySelector('[data-edit-form="' + btn.getAttribute('data-cancel-person') + '"]');
          form.hidden = true;
          form.closest('.dk-person').classList.remove('is-bearbeiten');
        });
      });
      Array.prototype.forEach.call(peopleListEl.querySelectorAll('[data-delete-person]'), function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-delete-person');
          var person = people.filter(function (x) { return x.id === id; })[0];
          var wer = person ? person.name : 'diesen Ansprechpartner';
          if (!window.confirm('"' + wer + '" wirklich löschen?')) return;
          client.from('prospect_people').delete().eq('id', id).then(function (res) {
            if (res && res.error) throw res.error;
            loadPeople(selectedProspectId);
            loadProspects();
          }).catch(function (err) {
            window.alert('Löschen fehlgeschlagen: ' + ((err && err.message) || 'unbekannter Fehler'));
          });
        });
      });

      Array.prototype.forEach.call(peopleListEl.querySelectorAll('[data-save-person]'), function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-save-person');
          var form = peopleListEl.querySelector('[data-edit-form="' + id + '"]');
          var name = form.querySelector('[data-field="name"]').value.trim();
          var role = form.querySelector('[data-field="role"]').value.trim();
          var phone = form.querySelector('[data-field="phone"]').value.trim();
          var mobile = form.querySelector('[data-field="mobile"]').value.trim();
          var email = form.querySelector('[data-field="email"]').value.trim();
          if (!name) return;
          client.from('prospect_people').update({ name: name, role: role || null, phone: phone || null, mobile: mobile || null, email: email || null }).eq('id', id).then(function () {
            loadPeople(selectedProspectId);
            loadProspects();
          });
        });
      });
    }

    function loadPeople(prospectId) {
      return client.from("prospect_people").select("*").eq("prospect_id", prospectId).order("created_at", { ascending: true }).then(function (res) {
        renderPeople(res.data || []);
        bkZeigen();
      });
    }

    function renderHistory(contacts) {
      if (!contacts.length) {
        historyEl.innerHTML = '<p class="muted">Noch keine Einträge.</p>';
        return;
      }
      historyEl.innerHTML = contacts.map(function (c) {
        var when = formatDateTime(c.created_at || c.contact_date);
        var faellig = c.next_contact_date &&
          new Date(c.next_contact_date).getTime() <= Date.now();
        var nextBlock = c.next_contact_date
          ? '<div class="log-termin-zeile' + (faellig ? " log-termin-zeile--faellig" : "") + '">' +
            '<span class="glocke' + (faellig ? " glocke--faellig" : "") + '">&#128276;</span>' +
            "Nächster Kontakt: <strong>" + formatDateTime(c.next_contact_date) + "</strong></div>"
          : "";
        return (
          '<div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--color-border);">' +
          '<span class="muted" style="font-size:0.8rem;">' + when + "</span>" +
          '<p style="margin:4px 0 0;">' + escapeHtml(c.notes || "—") + "</p>" +
          nextBlock +
          "</div>"
        );
      }).join("");
    }

    // Schliesst offene Aufklappmenues, sobald woanders geklickt wird.
    document.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest(".dk-menue-wrap")) return;
      Array.prototype.forEach.call(document.querySelectorAll(".dk-menue"), function (m) { m.hidden = true; });
    });

    // Traegt eine wichtige Aktion ins Logbuch ein. Ein Lead mit Status "Lead"
    // wird dabei zu "Kontaktiert" - wie beim Eintrag von Hand.
    function logSignifikant(prospectId, text) {
      return client.from("prospect_contacts").insert({
        prospect_id: prospectId,
        contact_date: todayISO(),
        notes: text
      }).then(function (res) {
        if (res && res.error) throw res.error;
        var p = allProspects.filter(function (x) { return x.id === prospectId; })[0];
        if (p && p.status === "lead") {
          return client.from("prospects").update({ status: "contacted" }).eq("id", prospectId);
        }
      }).then(function () {
        loadDailyCounter();
        loadHistory(prospectId);
        return loadProspects();
      }).then(function () {
        refreshDetailStatus();
      });
    }

    function zeigeRueckfrage(person, aktion, el) {
      var leiste = document.querySelector('[data-rueckfrage="' + person.id + '"]');
      if (!leiste) return;
      var name = person.name || "Ansprechpartner";
      var frage, antworten;

      if (aktion === "anruf") {
        var art = el.getAttribute("data-art");
        var nummer = el.getAttribute("data-nummer");
        frage = "Anruf " + art + " " + nummer + " \u2013 wie lief es?";
        antworten = [
          ["Erreicht", "Anruf " + art + " " + nummer + " \u00b7 erreicht \u00b7 " + name],
          ["Nicht erreicht", "Anruf " + art + " " + nummer + " \u00b7 nicht erreicht \u00b7 " + name],
          ["Mailbox", "Anruf " + art + " " + nummer + " \u00b7 Mailbox \u00b7 " + name]
        ];
      } else {
        var texte = {
          "wa-karte":    ["Visitenkarte per WhatsApp an " + name + " verschickt?", "Visitenkarte per WhatsApp an " + name],
          "wa-normal":   ["WhatsApp an " + name + " geschrieben?", "WhatsApp an " + name + " geschrieben"],
          "mail-karte":  ["Visitenkarte per E-Mail an " + name + " verschickt?", "Visitenkarte per E-Mail an " + name],
          "mail-normal": ["E-Mail an " + name + " geschrieben?", "E-Mail an " + name + " geschrieben"]
        }[aktion];
        if (!texte) return;
        frage = texte[0];
        antworten = [["Ja", texte[1]]];
      }

      leiste.innerHTML = '<span class="dk-rueckfrage__frage">' + escapeHtml(frage) + "</span>" +
        antworten.map(function (a, i) {
          return '<button type="button" class="dk-knopf' + (i === 0 ? " dk-knopf--primaer" : "") +
            '" data-log="' + i + '">' + escapeHtml(a[0]) + "</button>";
        }).join("") +
        '<button type="button" class="dk-knopf dk-rueckfrage__weg" data-log="weg">' +
        (aktion === "anruf" ? "&times;" : "Nein") + "</button>";
      leiste.hidden = false;

      Array.prototype.forEach.call(leiste.querySelectorAll("[data-log]"), function (b) {
        b.addEventListener("click", function () {
          var wahl = b.getAttribute("data-log");
          if (wahl === "weg") { leiste.hidden = true; return; }
          var prospectId = selectedProspectId;
          leiste.innerHTML = '<span class="dk-rueckfrage__frage">Wird eingetragen \u2026</span>';
          logSignifikant(prospectId, antworten[+wahl][1]).then(function () {
            leiste.innerHTML = '<span class="dk-rueckfrage__ok">Im Logbuch eingetragen &#10003;</span>';
            setTimeout(function () { leiste.hidden = true; }, 2200);
          }).catch(function (err) {
            leiste.innerHTML = '<span class="dk-rueckfrage__fehler">Eintrag fehlgeschlagen: ' +
              escapeHtml((err && err.message) || "unbekannter Fehler") + "</span>";
          });
        });
      });
    }

    function loadHistory(prospectId) {
      return client.from("prospect_contacts").select("*").eq("prospect_id", prospectId).order("created_at", { ascending: false }).then(function (res) {
        renderHistory(res.data || []);
      });
    }

    function refreshDetailStatus() {
      var p = allProspects.filter(function (x) { return x.id === selectedProspectId; })[0];
      if (!p) return;
      detailStatus.className = "status-pill status-pill--" + p.status;
      detailStatus.textContent = statusLabels[p.status];
      statusSelect.value = p.status;
    }

    function markiereAktiv(id) {
      var platzhalter = document.getElementById("detailPlatzhalter");
      if (platzhalter) platzhalter.hidden = !!id;
      Array.prototype.forEach.call(document.querySelectorAll(".prospect-card"), function (c) {
        c.classList.toggle("is-aktiv", !!id && c.getAttribute("data-prospect-id") === id);
      });
    }

    function openDetail(id) {
      selectedProspectId = id;
      var p = allProspects.filter(function (x) { return x.id === id; })[0];
      if (!p) return;
      markiereAktiv(id);
      neuePersonSchliessen();
      var titel = document.getElementById("prospectDetailTitel");
      if (titel) titel.textContent = p.name;
      // Angesehen heisst erledigt genug - das Pulsieren hoert auf.
      if (erinnerungGesehen(id)) renderPipeline();
      detailStatus.className = "status-pill status-pill--" + p.status;
      detailStatus.textContent = statusLabels[p.status];
      detailNameInput.value = p.name;
      // Alte Werte (z. B. "Schule") nicht stillschweigend ueberschreiben:
      // fehlt der Wert in der Auswahl, wird er als Option ergaenzt.
      var kat = p.category || "Firma";
      if (detailCategoryInput.tagName === "SELECT" &&
          ![].some.call(detailCategoryInput.options, function (o) { return o.value === kat; })) {
        var opt = document.createElement("option");
        opt.value = kat;
        opt.textContent = kat;
        detailCategoryInput.appendChild(opt);
      }
      detailCategoryInput.value = kat;
      detailWebsite.value = p.website || "";
      detailAddress.value = p.address || "";
      detailWebsiteOpen.href = vollstaendigeAdresse(p.website) || "#";
      detailWebsiteOpen.hidden = !p.website;

      // E: Firma recherchieren - vor allem, um die Groesse einzuschaetzen
      var rG = document.getElementById("rechercheGoogle");
      var rIn = document.getElementById("rechercheLinkedin");
      if (rG) rG.href = googleSuche(p.name + " " + ortAus(p.address));
      if (rIn) rIn.href = linkedinFirma(p.name);
      detailNotes.value = p.notes || "";
      statusSelect.value = p.status;
      nextContactDate.value = toDatetimeLocalValue(p.next_contact_date);
      nextContactNotes.value = "";
      reminderStatus.textContent = "";
      reminderBellBtn.style.opacity = hasReminder(id) ? "1" : "0.5";
      bkHinweisFuer = null;
      if (bkInhalt) bkInhalt.innerHTML = '<p class="muted">Wird geladen &hellip;</p>';
      var xferStatus = document.getElementById("transferStatus");
      if (xferStatus) xferStatus.textContent = "Aktuell: " + (p.assigned_to || "REA");
      detailOverlay.hidden = false;
      loadPeople(id);
      loadHistory(id);
    }

    var copyCardLink = document.getElementById("copyCardLink");
    if (copyCardLink) {
      copyCardLink.addEventListener("click", function () {
        var status = document.getElementById("copyCardStatus");
        var zeigen = function (t) { if (status) status.textContent = t; };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(KARTE_URL).then(function () { zeigen("kopiert ✓"); },
                                                        function () { zeigen(KARTE_URL); });
        } else {
          zeigen(KARTE_URL);
        }
      });
    }

    addProspectBtn.addEventListener("click", function () {
      zweitePersonZu(); weitereAngabenZu();
      // Meist wird am selben Tag eingetragen - sonst das Datum einfach aendern.
      var gespraechFeld = document.getElementById("prospectGespraech");
      if (gespraechFeld && !gespraechFeld.value) gespraechFeld.value = heuteLokal();
      addProspectStatus.textContent = "";
      addProspectStatus.className = "form-status";
      addProspectOverlay.hidden = false;
    });
    addProspectClose.addEventListener("click", function () { addProspectOverlay.hidden = true; });
    detailClose.addEventListener("click", function () {
      detailOverlay.hidden = true;
      markiereAktiv(null);
      selectedProspectId = null;
    });

    detailWebsite.addEventListener("input", function () {
      detailWebsiteOpen.href = detailWebsite.value || "#";
      detailWebsiteOpen.hidden = !detailWebsite.value;
    });

    toggleArchiveBtn.addEventListener("click", function () {
      showArchive = !showArchive;
      pipelineArchive.hidden = !showArchive;
      toggleArchiveBtn.textContent = showArchive ? "Archiv ausblenden" : "Archiv anzeigen";
    });

    // ── Suche ──────────────────────────────────────────────────────────────
    var pipelineSearchEl = document.getElementById("pipelineSearch");
    if (pipelineSearchEl) {
      pipelineSearchEl.value = "";
      pipelineSearchEl.addEventListener("input", function () {
        searchQuery = pipelineSearchEl.value.trim();
        renderPipeline();
      });
    }

    // ── Alle / Meine Toggle ─────────────────────────────────────────────────

    // ── Uebergabe-Buttons ───────────────────────────────────────────────────

    // ── Abmelden ────────────────────────────────────────────────────────────
    var logoutPipelineBtn = document.getElementById("logoutPipelineBtn");
    if (logoutPipelineBtn) {
      logoutPipelineBtn.addEventListener("click", function () {
        clearPipelineUser();
        window.location.reload();
      });
    }

    // ---------- Anlage-Dialog: am Handy seltene Felder erst auf Tipp ----------
    // Am Laptop blendet das Stylesheet den Knopf aus, dort ist alles sichtbar.
    function weitereAngabenAuf() {
      var knopf = document.getElementById("anWeitereKnopf");
      var raster = knopf && knopf.parentNode;
      if (!raster) return;
      raster.classList.add("zeigt-weitere");
      var feld = document.getElementById("prospectWebsite");
      if (feld) feld.focus();
    }

    function weitereAngabenZu() {
      var knopf = document.getElementById("anWeitereKnopf");
      var raster = knopf && knopf.parentNode;
      if (raster) raster.classList.remove("zeigt-weitere");
    }

    var anWeitereKnopf = document.getElementById("anWeitereKnopf");
    if (anWeitereKnopf) anWeitereKnopf.addEventListener("click", weitereAngabenAuf);

    // ---------- Anlage-Dialog: zweite Person erst auf Klick ----------
    function zweitePersonAuf() {
      var karte = document.getElementById("anPerson2");
      var knopf = document.getElementById("anPerson2Oeffnen");
      if (!karte) return;
      karte.hidden = false;
      if (knopf) knopf.hidden = true;
      var name = document.getElementById("prospectPersonName2");
      if (name) name.focus();
    }

    function zweitePersonZu() {
      var karte = document.getElementById("anPerson2");
      var knopf = document.getElementById("anPerson2Oeffnen");
      if (!karte) return;
      karte.hidden = true;
      if (knopf) knopf.hidden = false;
      ["Name", "Role", "Phone", "Mobile", "Email"].forEach(function (f) {
        var el = document.getElementById("prospectPerson" + f + "2");
        if (el) el.value = "";
      });
    }

    var anPerson2Oeffnen = document.getElementById("anPerson2Oeffnen");
    if (anPerson2Oeffnen) anPerson2Oeffnen.addEventListener("click", zweitePersonAuf);
    var anPerson2Entfernen = document.getElementById("anPerson2Entfernen");
    if (anPerson2Entfernen) anPerson2Entfernen.addEventListener("click", zweitePersonZu);

    // ---------- Besuch erfassen: Schnellwahl fuer die Wiedervorlage ----------
    var followUpEl = document.getElementById("prospectFollowUp");
    var quickDates = document.getElementById("prospectQuickDates");
    if (quickDates) {
      quickDates.addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-tage]");
        if (!btn) return;
        var tage = btn.getAttribute("data-tage");
        followUpEl.value = tage ? addDaysISO(parseInt(tage, 10)) : "";
        Array.prototype.forEach.call(quickDates.querySelectorAll("button"), function (b) {
          b.setAttribute("aria-pressed", b === btn && tage ? "true" : "false");
        });
      });
    }

    addProspectForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("prospectName").value.trim();
      var category = document.getElementById("prospectCategory").value.trim() || "Firma";
      var gespraech = (document.getElementById("prospectGespraech") || {}).value || heuteLokal();
      var quelle = (document.getElementById("prospectQuelle") || {}).value || "Vor Ort";
      var website = vollstaendigeAdresse(document.getElementById("prospectWebsite").value);
      var address = document.getElementById("prospectAddress").value.trim() || null;
      var notiz = document.getElementById("prospectNote").value.trim();
      var wiedervorlage = followUpEl && followUpEl.value ? followUpEl.value : null;
      var einwilligung = !!document.getElementById("prospectConsent").checked;
      function wert(id) {
        var el = document.getElementById(id);
        return el ? el.value.trim() : "";
      }
      var people = ["", "2"].map(function (n) {
        return {
          name: wert("prospectPersonName" + n), role: wert("prospectPersonRole" + n),
          phone: wert("prospectPersonPhone" + n), mobile: wert("prospectPersonMobile" + n),
          email: wert("prospectPersonEmail" + n)
        };
      }).filter(function (person) { return person.name; });
      if (!name) {
        addProspectStatus.textContent = "Bitte einen Namen eintragen.";
        addProspectStatus.className = "form-status form-status--error";
        document.getElementById("prospectName").focus();
        return;
      }
      addProspectStatus.textContent = "Wird angelegt …";
      addProspectStatus.className = "form-status";

      client.from("prospects").insert({
        name: name, category: category, status: "lead", website: website, address: address,
        assigned_to: currentUser,
        notes: notiz || null,
        source: quelle,
        conversation_date: gespraech,
        next_contact_date: wiedervorlage
      }).select().single().then(function (res) {
        if (res.error) throw res.error;
        var prospect = res.data;
        var schritte = [];

        if (people.length) {
          schritte.push(Promise.all(people.map(function (person) {
            return client.from("prospect_people").insert({
              prospect_id: prospect.id, name: person.name, role: person.role || null,
              phone: person.phone || null, mobile: person.mobile || null,
              email: person.email || null,
              marketing_consent: einwilligung,
              consent_at: einwilligung ? new Date(gespraech + "T12:00:00").toISOString() : null
            }).select().single().then(function (r) {
              if (r.error) throw r.error;
            });
          })));
        }

        // Gespraech in der Historie festhalten, damit es beim Wiedervorlage-Termin dasteht.
        schritte.push(client.from("prospect_contacts").insert({
          prospect_id: prospect.id,
          contact_date: gespraech,
          notes: (quelle === "Telefon" ? "Telefonat" : "Gespräch vor Ort") + " am " + formatSimpleDate(gespraech) +
            (einwilligung ? " · Ja zu Business Karte und Angeboten" : "") +
            (notiz ? " · " + notiz : ""),
          next_contact_date: wiedervorlage
        }));

        return Promise.all(schritte).then(function () { return prospect; });
      }).then(function (prospect) {
        addProspectStatus.textContent = "";
        addProspectStatus.className = "form-status";
        addProspectOverlay.hidden = true;
        addProspectForm.reset();
        zweitePersonZu(); weitereAngabenZu();
        if (quickDates) {
          Array.prototype.forEach.call(quickDates.querySelectorAll("button"), function (b) {
            b.setAttribute("aria-pressed", "false");
          });
        }
        // Direkt in den neuen Kontakt - dort geht es mit der Business Karte weiter.
        loadProspects().then(function () { openDetail(prospect.id); });
      }).catch(function (err) {
        // Den echten Grund zeigen - "bitte erneut versuchen" hilft bei einem
        // fehlenden Feld oder einer Rechteregel niemandem weiter.
        var grund = (err && (err.message || err.hint)) || "unbekannter Fehler";
        addProspectStatus.textContent = "Anlegen fehlgeschlagen: " + grund;
        addProspectStatus.className = "form-status form-status--error";
        // Auf dem Handy steht die Meldung sonst weit ausserhalb des Bildes.
        if (addProspectStatus.scrollIntoView) {
          addProspectStatus.scrollIntoView({ block: "center", behavior: "smooth" });
        }
        if (window.console) console.error("Anlegen fehlgeschlagen:", err);
      });
    });

    saveNotesBtn.addEventListener("click", function () {
      if (!selectedProspectId) return;
      var nameVal = detailNameInput.value.trim();
      if (!nameVal) return;
      client.from("prospects").update({
        name: nameVal,
        category: detailCategoryInput.value.trim() || "Firma",
        notes: detailNotes.value.trim(),
        website: vollstaendigeAdresse(detailWebsite.value),
        address: detailAddress.value.trim() || null
      }).eq("id", selectedProspectId).then(function () {
        loadProspects();
      });
    });

    statusSelect.addEventListener("change", function () {
      if (!selectedProspectId) return;
      client.from("prospects").update({ status: statusSelect.value }).eq("id", selectedProspectId).then(function () {
        refreshDetailStatus();
        loadProspects();
      });
    });

    reminderBellBtn.addEventListener("click", function () {
      if (!selectedProspectId) return;
      var at = nextContactDate.value;
      if (!at) { reminderStatus.textContent = "Bitte zuerst ein Datum eingeben."; return; }
      var p = allProspects.filter(function (x) { return x.id === selectedProspectId; })[0];
      var name = p ? p.name : "";
      if (hasReminder(selectedProspectId)) {
        setReminder(selectedProspectId, name, null);
        reminderStatus.textContent = "Erinnerung entfernt.";
        reminderBellBtn.style.opacity = "0.5";
      } else {
        setReminder(selectedProspectId, name, at);
        reminderStatus.textContent = "Erinnerung gesetzt ✓ (" + new Date(at).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) + ")";
        reminderBellBtn.style.opacity = "1";
      }
    });

    // Die Felder fuer eine weitere Person bleiben zu, bis man sie braucht.
    function neuePersonOeffnen() {
      var felder = document.getElementById("neuePersonFelder");
      var knopf = document.getElementById("neuePersonOeffnen");
      if (!felder) return;
      felder.hidden = false;
      if (knopf) knopf.hidden = true;
      var name = document.getElementById("newPersonName");
      if (name) {
        name.scrollIntoView({ block: "center", behavior: "smooth" });
        name.focus();
      }
    }

    function neuePersonSchliessen() {
      var felder = document.getElementById("neuePersonFelder");
      var knopf = document.getElementById("neuePersonOeffnen");
      if (!felder) return;
      felder.hidden = true;
      if (knopf) knopf.hidden = false;
      ["newPersonName", "newPersonRole", "newPersonPhone", "newPersonMobile", "newPersonEmail"]
        .forEach(function (id) { var f = document.getElementById(id); if (f) f.value = ""; });
    }

    var neuePersonOeffnenBtn = document.getElementById("neuePersonOeffnen");
    if (neuePersonOeffnenBtn) neuePersonOeffnenBtn.addEventListener("click", neuePersonOeffnen);
    var neuePersonAbbrechenBtn = document.getElementById("neuePersonAbbrechen");
    if (neuePersonAbbrechenBtn) neuePersonAbbrechenBtn.addEventListener("click", neuePersonSchliessen);

    addPersonBtn.addEventListener("click", function () {
      var name = newPersonName.value.trim();
      if (!name || !selectedProspectId) return;
      var newPersonMobile = document.getElementById("newPersonMobile");
      var newPersonRole = document.getElementById("newPersonRole");
      client.from("prospect_people").insert({
        prospect_id: selectedProspectId,
        name: name,
        role: newPersonRole ? (newPersonRole.value.trim() || null) : null,
        phone: newPersonPhone.value.trim() || null,
        mobile: newPersonMobile ? (newPersonMobile.value.trim() || null) : null,
        email: newPersonEmail.value.trim() || null
      }).then(function () {
        newPersonName.value = "";
        if (newPersonRole) newPersonRole.value = "";
        newPersonPhone.value = "";
        if (newPersonMobile) newPersonMobile.value = "";
        newPersonEmail.value = "";
        neuePersonSchliessen();
        loadPeople(selectedProspectId);
        loadProspects();
      });
    });

    logContactBtn.addEventListener("click", function () {
      if (!selectedProspectId) return;
      var date = nextContactDate.value;
      // Ortszeit in UTC umrechnen, damit Supabase den richtigen Zeitpunkt speichert
      var dateUTC = date ? new Date(date).toISOString() : null;
      var datePart = date ? date.slice(0, 10) : null;
      var notes = nextContactNotes.value.trim();
      var prospectId = selectedProspectId;
      logStatus.textContent = "Wird gespeichert …";
      logStatus.className = "form-status";
      client.from("prospect_contacts").insert({
        prospect_id: prospectId,
        contact_date: todayISO(),
        notes: notes || null,
        next_contact_date: dateUTC
      }).then(function (res) {
        if (res && res.error) throw res.error;
        var p = allProspects.filter(function (x) { return x.id === prospectId; })[0];
        var updates = { next_contact_date: datePart };
        if (p && p.status === "lead") updates.status = "contacted";
        return client.from("prospects").update(updates).eq("id", prospectId);
      }).then(function () {
        nextContactNotes.value = "";
        nextContactDate.value = "";
        logStatus.textContent = "Gespeichert ✓";
        logStatus.className = "form-status form-status--ok";
        loadDailyCounter();
        loadHistory(prospectId);
        return loadProspects();
      }).then(function () {
        refreshDetailStatus();
      }).catch(function (err) {
        logStatus.textContent = "Fehler: " + (err && err.message ? err.message : "Speichern fehlgeschlagen");
        logStatus.className = "form-status form-status--error";
      });
    });

    markLostBtn.addEventListener("click", function () {
      if (!selectedProspectId) return;
      if (!window.confirm("Diesen Interessenten als 'Kein Interesse' markieren? Er kommt ins Archiv.")) return;
      client.from("prospects").update({ status: "lost" }).eq("id", selectedProspectId).then(function () {
        detailOverlay.hidden = true;
        markiereAktiv(null);
      markiereAktiv(null);
        loadProspects();
      });
    });

    deleteProspectBtn.addEventListener("click", function () {
      if (!selectedProspectId) return;
      var p = allProspects.filter(function (x) { return x.id === selectedProspectId; })[0];
      if (!p) return;
      if (!window.confirm('"' + p.name + '" komplett löschen? Das kann nicht rückgängig gemacht werden.')) return;
      client.from("prospects").delete().eq("id", selectedProspectId).then(function () {
        detailOverlay.hidden = true;
        markiereAktiv(null);
      markiereAktiv(null);
        selectedProspectId = null;
        loadProspects();
      });
    });

    // ---------- MK Business Karte: ein Knopf, ein Schwung ----------
    // "Business Karte zuschicken" macht alles auf einmal: Kundennummer, Karten
    // kopieren, Gmail oeffnen, Logbuch, Wechsel zu den Stammkunden.
    var bkHinweisFuer = null;     // direkt nach dem Zuschicken die Anleitung zeigen
    var bkGmailBlockiert = false;
    var MAIL_BILD = SEITE + "/assets/img/mail/";
    var MAIL_BETREFF = "Ihre MK Business Karte \u2013 Mahboobs Kitchen";
    var STRG_V_ZEILE = "\u25b6 Diese Zeile markieren und Strg + V dr\u00fccken \u2013 hier kommen Visitenkarte und Business Karte rein";

    function aktuellerKontakt() {
      return allProspects.filter(function (x) { return x.id === selectedProspectId; })[0];
    }

    function miniKarte(p) {
      return '<div class="mk-card bk-karte">' +
        '<div class="mk-card__top"><img src="/assets/img/logo.webp" alt="" class="mk-card__logo">' +
        '<span class="mk-card__label">Business Karte</span></div>' +
        '<div class="mk-card__number">' + escapeHtml(p.customer_no || "") + "</div>" +
        '<div class="mk-card__bottom"><div><span class="mk-card__field-label">Inhaber</span>' +
        '<div class="mk-card__name">' + escapeHtml(p.name) + "</div></div></div></div>";
    }

    // Die zwei kleinen Karten fuer die Mail. Tabellen mit festen Farben -
    // so sehen sie in Gmail, Outlook und am Handy gleich aus.
    function kartenHtml(p) {
      var schrift = "font-family:Arial,Helvetica,sans-serif;";
      var knopf = function (href, text) {
        return '<a href="' + escapeHtml(href) + '" style="' + schrift + 'display:inline-block;padding:9px 18px;' +
          'border-radius:999px;background:#e8590c;color:#ffffff;font-size:13px;font-weight:bold;text-decoration:none;">' +
          text + "</a>";
      };
      var visitenkarte =
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:340px;max-width:100%;' +
        'border:1px solid #e6e2dc;border-radius:14px;background:#ffffff;border-collapse:separate;">' +
        '<tr><td style="padding:16px 18px;">' +
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>' +
        '<td style="vertical-align:middle;padding-right:14px;">' +
        '<img src="' + MAIL_BILD + 'reyyan.jpg" width="64" height="64" alt="Reyyan Ahmad" ' +
        'style="display:block;width:64px;height:64px;border-radius:50%;"></td>' +
        '<td style="vertical-align:middle;' + schrift + '">' +
        '<div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#e8590c;font-weight:bold;">Meine Visitenkarte</div>' +
        '<div style="font-size:17px;font-weight:bold;color:#161616;margin-top:2px;">Reyyan Ahmad</div>' +
        '<div style="font-size:13px;color:#6a6a6a;">Mahboobs Kitchen &middot; 0177 201 9889</div>' +
        "</td></tr></table>" +
        '<div style="margin-top:12px;">' + knopf(KARTE_URL, "Visitenkarte ansehen") + "</div>" +
        "</td></tr></table>";
      var businesskarte =
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:340px;max-width:100%;' +
        'border-radius:14px;background:#161616;border-collapse:separate;">' +
        '<tr><td style="padding:18px 20px;' + schrift + 'color:#ffffff;">' +
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>' +
        '<td><img src="' + MAIL_BILD + 'logo.png" width="110" alt="Mahboobs Kitchen" style="display:block;width:110px;height:auto;"></td>' +
        '<td style="text-align:right;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#e8590c;font-weight:bold;' + schrift + '">Business Karte</td>' +
        "</tr></table>" +
        '<div style="font-size:22px;letter-spacing:3px;margin-top:16px;color:#ffffff;">' + escapeHtml(p.customer_no) + "</div>" +
        '<div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#9a9a9a;margin-top:14px;">Inhaber</div>' +
        '<div style="font-size:14px;font-weight:bold;text-transform:uppercase;color:#ffffff;">' + escapeHtml(p.name) + "</div>" +
        '<div style="margin-top:14px;">' + knopf(karteLink(p.card_token), "Business Karte \u00f6ffnen") + "</div>" +
        "</td></tr></table>";
      return "<div>" + visitenkarte +
        '<div style="height:12px;line-height:12px;font-size:12px;">&nbsp;</div>' + businesskarte +
        '<p style="' + schrift + 'font-size:11px;color:#9a9a9a;margin:14px 0 0;">Wie besprochen informieren wir Sie ab jetzt ' +
        "\u00fcber unsere Angebote. Wenn Sie das nicht m\u00f6chten, gen\u00fcgt eine kurze Antwort auf diese E-Mail.</p></div>";
    }

    // Dasselbe als reiner Text - fuer WhatsApp, das Handy und als Ersatz.
    function kartenReinText(p) {
      return [
        "Meine Visitenkarte:",
        KARTE_URL,
        "",
        "Ihre MK Business Karte (" + p.customer_no + "):",
        karteLink(p.card_token),
        "",
        "Wie besprochen informieren wir Sie ab jetzt \u00fcber unsere Angebote. " +
          "Wenn Sie das nicht m\u00f6chten, gen\u00fcgt eine kurze Antwort."
      ].join("\n");
    }

    function kopiereKartenAlt(html) {
      var box = document.createElement("div");
      box.contentEditable = "true";
      box.innerHTML = html;
      box.style.position = "fixed";
      box.style.left = "-9999px";
      document.body.appendChild(box);
      var bereich = document.createRange();
      bereich.selectNodeContents(box);
      var auswahl = window.getSelection();
      auswahl.removeAllRanges();
      auswahl.addRange(bereich);
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) {}
      auswahl.removeAllRanges();
      document.body.removeChild(box);
      return ok ? Promise.resolve() : Promise.reject(new Error("kopieren"));
    }

    function kopiereKarten(p) {
      var html = kartenHtml(p);
      if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
        return navigator.clipboard.write([new window.ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([kartenReinText(p)], { type: "text/plain" })
        })]).catch(function () { return kopiereKartenAlt(html); });
      }
      return kopiereKartenAlt(html);
    }

    function bkMailLink(p, pe) {
      var text = "Hallo " + (pe.name || "") + ",\n\n\n\n" + (amHandy ? kartenReinText(p) : STRG_V_ZEILE) + "\n";
      return mailZiel(pe.email, text, MAIL_BETREFF);
    }

    function bkEmpfaenger() {
      return currentPeople.filter(function (pe) { return pe.email || handyVon(pe); });
    }

    function bkSignaleHtml(p) {
      var html = (offeneSignale[p.id] || []).map(function (sig) {
        return '<div class="bk-signal"><span class="hand">&#9995;</span><span>' +
          (sig.art === "rueckruf" ? "Bitte um R\u00fcckruf" : "Interesse") +
          (sig.offer_title ? " an \u201e" + escapeHtml(sig.offer_title) + "\u201c" : "") +
          " <small>" + escapeHtml(formatDateTime(sig.created_at)) + "</small></span>" +
          '<button type="button" class="dk-knopf" data-signal-erledigt="' + escapeHtml(sig.id) + '">Erledigt</button></div>';
      }).join("");
      if (p.werbung_abgemeldet_at) {
        html += '<div class="bk-signal bk-signal--ab"><span>Bekommt keine Werbung mehr \u2013 abgemeldet am ' +
          escapeHtml(formatDateOnly(p.werbung_abgemeldet_at)) + "</span>" +
          '<button type="button" class="dk-knopf" id="bkWiederAnmelden">Wieder anmelden</button></div>';
      }
      return html;
    }

    function bkZeigen() {
      var p = aktuellerKontakt();
      if (!p || !bkInhalt) return;

      // Schon Stammkunde: Karte, kurze Anleitung, Karten jederzeit neu kopieren.
      if (p.status === "customer" && p.card_token) {
        var an = bkEmpfaenger().filter(function (pe) { return pe.name === p.card_person && pe.email; })[0] ||
                 bkEmpfaenger().filter(function (pe) { return pe.email; })[0];
        var anleitung = "";
        if (bkHinweisFuer === p.id) {
          anleitung = bkGmailBlockiert
            ? '<p class="bk-anleitung bk-anleitung--warnung">Die Karten sind kopiert, Gmail wurde aber blockiert. Klick auf <strong>Gmail \u00f6ffnen</strong>.</p>'
            : '<p class="bk-anleitung">\u2713 Gmail ist offen und die Karten sind kopiert. In Gmail die Zeile mit \u201eStrg + V\u201c markieren und <strong>Strg + V</strong> dr\u00fccken.</p>';
        }
        bkInhalt.innerHTML =
          '<div class="bk-stamm">' + miniKarte(p) +
          '<div class="bk-stamm__text"><strong>Stammkunde</strong>' +
          "<span>seit " + escapeHtml(formatDateOnly(p.card_sent_at)) +
          (p.card_person ? " \u00b7 Karte an " + escapeHtml(p.card_person) : "") + "</span>" +
          anleitung + bkSignaleHtml(p) +
          '<div class="bk-knoepfe">' +
          '<button type="button" class="dk-knopf dk-knopf--primaer" id="bkKopieren">Karten kopieren</button>' +
          (an ? '<a class="dk-knopf" id="bkGmail" href="#">Gmail \u00f6ffnen</a>' : "") +
          '<a class="dk-knopf" href="' + escapeHtml(karteLink(p.card_token)) + '" target="_blank" rel="noopener">Karte ansehen</a>' +
          "</div></div></div>";

        Array.prototype.forEach.call(bkInhalt.querySelectorAll("[data-signal-erledigt]"), function (b) {
          b.addEventListener("click", function () {
            b.disabled = true;
            client.from("prospect_signals").update({ erledigt_at: new Date().toISOString() })
              .eq("id", b.getAttribute("data-signal-erledigt"))
              .then(function (r) {
                if (r && r.error) throw r.error;
                return loadProspects();
              })
              .then(function () {
                bkZeigen();
                document.dispatchEvent(new CustomEvent("mk-signale-geaendert"));
              })
              .catch(function () { b.disabled = false; });
          });
        });
        var wieder = document.getElementById("bkWiederAnmelden");
        if (wieder) {
          wieder.addEventListener("click", function () {
            if (!window.confirm(p.name + " wieder f\u00fcr Angebote anmelden? Nur, wenn der Kunde das ausdr\u00fccklich m\u00f6chte.")) return;
            client.from("prospects").update({ werbung_abgemeldet_at: null }).eq("id", p.id).then(function (r) {
              if (r && r.error) throw r.error;
              return client.from("prospect_contacts").insert({
                prospect_id: p.id,
                contact_date: todayISO(),
                notes: "Wieder f\u00fcr Angebote angemeldet (auf Wunsch des Kunden)"
              });
            }).then(function () {
              loadHistory(p.id);
              return loadProspects();
            }).then(function () {
              bkZeigen();
              document.dispatchEvent(new CustomEvent("mk-signale-geaendert"));
            });
          });
        }

        var kopierKnopf = document.getElementById("bkKopieren");
        kopierKnopf.addEventListener("click", function () {
          kopiereKarten(p).then(function () {
            kopierKnopf.textContent = "Kopiert \u2713 \u2013 in Gmail Strg + V";
            setTimeout(function () { kopierKnopf.textContent = "Karten kopieren"; }, 2500);
          }, function () {
            kopierKnopf.textContent = "Kopieren ging nicht";
          });
        });
        var gm = document.getElementById("bkGmail");
        if (gm) {
          gm.href = bkMailLink(p, an);
          mailFenster(gm);
        }
        return;
      }

      var empfaenger = bkEmpfaenger();
      if (!empfaenger.length) {
        bkInhalt.innerHTML = '<p class="dk-hinweis">F\u00fcr die Karte braucht es einen Ansprechpartner mit E-Mail oder Handynummer.</p>';
        return;
      }

      var zugestimmt = currentPeople.filter(function (pe) { return pe.marketing_consent; })[0];
      bkInhalt.innerHTML =
        (zugestimmt
          ? '<p class="bk-ok">\u2713 Ja zu Business Karte und Angeboten' +
            (zugestimmt.consent_at ? " \u2013 am " + escapeHtml(formatDateOnly(zugestimmt.consent_at)) : "") + "</p>"
          : '<div class="bk-zustimmung">' +
            '<label><input type="checkbox" id="bkZustimmung"> Hat im Gespr\u00e4ch Ja gesagt zu Business Karte und Angeboten</label>' +
            '<span>am <input type="date" id="bkZustimmungDatum" autocomplete="off" value="' +
            escapeHtml(p.conversation_date || heuteLokal()) + '"></span></div>') +
        (empfaenger.length > 1
          ? '<div class="bk-an"><label for="bkAn">An</label><select id="bkAn" autocomplete="off">' +
            empfaenger.map(function (pe, i) {
              return '<option value="' + i + '">' + escapeHtml(pe.name + " \u2013 " + (pe.email || "nur WhatsApp")) + "</option>";
            }).join("") + "</select></div>"
          : "") +
        '<div class="bk-knoepfe"><button type="button" class="btn btn--primary" id="bkZuschicken"' +
        (zugestimmt ? "" : " disabled") + "></button></div>" +
        '<p class="form-status" id="bkStatus" role="status" aria-live="polite"></p>';

      var knopf = document.getElementById("bkZuschicken");
      var haken = document.getElementById("bkZustimmung");
      var auswahl = document.getElementById("bkAn");

      function person() { return empfaenger[auswahl ? +auswahl.value : 0] || empfaenger[0]; }
      function beschriften() {
        knopf.textContent = person().email ? "Business Karte zuschicken" : "Business Karte per WhatsApp zuschicken";
      }
      beschriften();
      if (auswahl) auswahl.addEventListener("change", beschriften);
      if (haken) haken.addEventListener("change", function () { knopf.disabled = !haken.checked; });

      knopf.addEventListener("click", function () {
        var pe = person();
        var status = document.getElementById("bkStatus");
        var weg = pe.email ? "E-Mail" : "WhatsApp";
        var zustimmungAm = zugestimmt ? null : (document.getElementById("bkZustimmungDatum").value || heuteLokal());
        knopf.disabled = true;
        status.textContent = "Wird vorbereitet \u2026";
        status.className = "form-status";

        var vorher = zugestimmt ? Promise.resolve() :
          client.from("prospect_people")
            .update({ marketing_consent: true, consent_at: new Date(zustimmungAm + "T12:00:00").toISOString() })
            .eq("prospect_id", p.id)
            .then(function (r) {
              if (r && r.error) throw r.error;
              currentPeople.forEach(function (x) { x.marketing_consent = true; });
            });

        vorher.then(function () {
          if (p.card_token) return { data: { customer_no: p.customer_no, card_token: p.card_token } };
          return client.rpc("business_karte_erstellen", { p_prospect: p.id });
        }).then(function (res) {
          if (res.error) throw res.error;
          p.customer_no = res.data.customer_no;
          p.card_token = res.data.card_token;

          // Erst kopieren (die Seite hat noch den Fokus), dann Gmail oeffnen.
          var kopiert = pe.email && !amHandy ? kopiereKarten(p).catch(function () {}) : Promise.resolve();
          return kopiert.then(function () {
            bkGmailBlockiert = false;
            if (pe.email) {
              var url = bkMailLink(p, pe);
              if (amHandy) window.location.href = url;
              else bkGmailBlockiert = !window.open(url, "_blank");
            } else {
              oeffneWhatsApp(waZiel(handyVon(pe), "Hallo " + (pe.name || "") + ",\n\n" + kartenReinText(p)));
            }
            return client.from("prospects").update({
              status: "customer",
              card_sent_at: new Date().toISOString(),
              card_person: pe.name
            }).eq("id", p.id);
          });
        }).then(function (r) {
          if (r && r.error) throw r.error;
          return client.from("prospect_contacts").insert({
            prospect_id: p.id,
            contact_date: todayISO(),
            notes: "Visitenkarte und Business Karte zugeschickt \u00b7 " + p.customer_no +
              " \u00b7 per " + weg + " an " + pe.name +
              (zustimmungAm ? " \u00b7 Ja zu Angeboten im Gespr\u00e4ch am " + formatSimpleDate(zustimmungAm) : "")
          });
        }).then(function (r) {
          if (r && r.error) throw r.error;
          bkHinweisFuer = p.id;
          loadDailyCounter();
          loadHistory(p.id);
          return loadProspects();
        }).then(function () {
          refreshDetailStatus();
          bkZeigen();
        }).catch(function (err) {
          knopf.disabled = false;
          var grund = (err && err.message) || "unbekannter Fehler";
          status.textContent = "Das hat nicht geklappt: " + grund;
          status.className = "form-status form-status--error";
        });
      });
    }

    var notifiedThisSession = false;
    function checkDueNotifications() {
      if (notifiedThisSession) return;
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      var today = todayISO();
      var due = allProspects.filter(function (p) {
        return p.next_contact_date && dateOnly(p.next_contact_date) <= today && (p.status === "lead" || p.status === "contacted");
      });
      if (due.length > 0) {
        notifiedThisSession = true;
        new Notification("MK Vertrieb – " + due.length + " fällig", {
          body: due.slice(0, 3).map(function (p) { return p.name; }).join(", ") + (due.length > 3 ? " ..." : ""),
          icon: "/assets/img/favicon.webp"
        });
      }
    }

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    setInterval(checkReminders, 60000);
    // Wird eine Erinnerung faellig, sollen die Klingeln sofort umspringen.
    document.addEventListener("mk-erinnerung", function () {
      renderPipeline();
      if (selectedProspectId) loadHistory(selectedProspectId);
    });

    loadDailyCounter();
    loadProspects().then(function () { checkDueNotifications(); });

    // Der Werbebereich nutzt dieselbe Anmeldung und springt von dort in einen Kontakt.
    window.mkVertrieb = {
      client: client,
      oeffneKontakt: function (id) {
        var reiter = document.querySelector('[data-tab="tabPipeline"]');
        if (reiter) reiter.click();
        loadProspects().then(function () { openDetail(id); });
      },
      neuLaden: function () { return loadProspects(); }
    };
    document.dispatchEvent(new CustomEvent("mk-vertrieb-bereit"));
    document.addEventListener("mk-signale-geaendert", function () { loadProspects(); });

    // Bleibt die Seite ueber Nacht offen, stimmt die Einteilung sonst nicht mehr.
    var zuletztGesehenerTag = todayISO();
    setInterval(function () {
      var jetzt = todayISO();
      if (jetzt !== zuletztGesehenerTag) {
        zuletztGesehenerTag = jetzt;
        loadDailyCounter();
        loadProspects();
      } else {
        ladeSignale().then(renderPipeline);   // neue Rueckmeldungen und "Termin vorbei" aktuell halten
      }
    }, 60000);
  } // end startPipeline

  // Chrome ignoriert autocomplete="off" hier und schreibt die gespeicherte
  // Anmelde-Adresse ins Suchfeld. Ein schreibgeschuetztes Feld fuellt es nicht -
  // beim Antippen geben wir es frei.
  (function () {
    var feld = document.getElementById("pipelineSearch");
    if (!feld) return;

    function freigeben() {
      feld.removeAttribute("readonly");
    }

    feld.value = "";
    ["focus", "pointerdown", "touchstart"].forEach(function (ev) {
      feld.addEventListener(ev, freigeben);
    });

    // Chrome fuellt teils erst kurz nach dem Laden - deshalb mehrfach leeren.
    [0, 150, 500, 1200].forEach(function (ms) {
      setTimeout(function () { if (!feld.matches(":focus")) feld.value = ""; }, ms);
    });
  })();

  // Am Rechner gehoert das Logbuch in die linke untere Zone, am Handy bleibt es
  // im Detailfenster - sonst waere es dort hinter dem Fenster verborgen.
  (function () {
    var breit = window.matchMedia("(min-width: 1100px)");

    function einsortieren() {
      var zone = document.getElementById("logZone");
      if (!zone) return;
      var ziel = breit.matches
        ? document.querySelector(".work-log")
        : document.getElementById("logHeimat");
      if (ziel && zone.parentNode !== ziel) ziel.appendChild(zone);
    }

    einsortieren();
    if (breit.addEventListener) breit.addEventListener("change", einsortieren);
    else if (breit.addListener) breit.addListener(einsortieren);
  })();

  // Kennzeichnet die Seite als Arbeitswerkzeug - die Rechner-Ansicht haengt daran.
  document.documentElement.classList.add("work-mode");

  // Reiter unabhaengig von der Anmeldung schalten - sie zeigen nur Bereiche um.
  (function () {
    var leiste = document.getElementById("bereichTabs");
    if (!leiste) return;
    leiste.addEventListener("click", function (e) {
      var btn = e.target.closest(".tabs__btn");
      if (!btn) return;
      Array.prototype.forEach.call(leiste.querySelectorAll(".tabs__btn"), function (b) {
        var aktiv = b === btn;
        b.setAttribute("aria-selected", aktiv ? "true" : "false");
        var ziel = document.getElementById(b.getAttribute("data-tab"));
        if (ziel) ziel.hidden = !aktiv;
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  })();

  // ── Pipeline-Authentifizierung & Boot ─────────────────────────────────
  (function () {
    var loginOverlay = document.getElementById("pipelineLoginOverlay");
    var pinEntry     = document.getElementById("pipelinePinEntry");
    var pinLabel     = document.getElementById("pipelinePinLabel");
    var pinInput     = document.getElementById("pipelinePinInput");
    var pinConfirm   = document.getElementById("pipelinePinConfirm");
    var pinError     = document.getElementById("pipelinePinError");
    var userBadge    = document.getElementById("pipelineUserBadge");
    function bootWithUser(user) {
      if (userBadge) {
        userBadge.textContent = user;
        userBadge.style.background = "#10b981";
      }
      // Supabase-Admin-Session erforderlich (schreibt RLS via is_admin())
      window.mkBusiness.requireAdminSession(function (session, client) {
        startPipeline(client, user);
      });
    }

    // Bereits in dieser Session angemeldet?
    var stored = getPipelineUser();
    if (stored && PIPELINE_PINS[stored]) {
      bootWithUser(stored);
      return;
    }

    // Login-Overlay zeigen
    if (loginOverlay) loginOverlay.hidden = false;

    if (pinLabel) pinLabel.textContent = "PIN:";
    if (pinInput) pinInput.focus();

    function tryLogin() {
      var entered = pinInput ? pinInput.value.trim() : "";
      if (entered === PIPELINE_PINS[NUTZER]) {
        setPipelineUser(NUTZER);
        if (loginOverlay) loginOverlay.hidden = true;
        bootWithUser(NUTZER);
      } else {
        if (pinError) pinError.textContent = "Falscher PIN. Bitte erneut versuchen.";
        if (pinInput) pinInput.value = "";
      }
    }

    if (pinConfirm) pinConfirm.addEventListener("click", tryLogin);
    if (pinInput) pinInput.addEventListener("keydown", function (e) { if (e.key === "Enter") tryLogin(); });
  })();
})();
