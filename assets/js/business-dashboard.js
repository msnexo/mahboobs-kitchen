(function () {
  "use strict";

  function escapeHtml(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function formatDate(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString("de-DE") + " " + d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  }

  function renderHistory(container, transactions) {
    if (!transactions.length) {
      container.innerHTML = '<p class="muted">Noch keine Punkte-Buchungen vorhanden.</p>';
      return;
    }
    var rows = transactions.map(function (t) {
      var sign = t.points > 0 ? "+" : "";
      return "<tr><td>" + formatDate(t.created_at) + "</td><td>" + sign + t.points + "</td><td>" + escapeHtml(t.reason || "-") + "</td></tr>";
    }).join("");
    container.innerHTML =
      '<table class="data-table"><thead><tr><th>Datum</th><th>Punkte</th><th>Grund</th></tr></thead><tbody>' + rows + "</tbody></table>";
  }

  window.mkBusiness.requireBusinessSession(function (session, client) {
    var logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", window.mkBusiness.logout);

    client.from("companies").select("*").eq("auth_user_id", session.user.id).maybeSingle().then(function (res) {
      if (res.error || !res.data) {
        document.getElementById("dashboardApp").innerHTML =
          '<p class="muted">Zu diesem Login ist kein Firmenkonto hinterlegt. Bitte Mahboobs Kitchen kontaktieren.</p>';
        return;
      }
      var company = res.data;
      document.getElementById("companyName").textContent = company.company_name;
      document.getElementById("pointsBalance").textContent = company.points_balance;

      return client.from("points_transactions").select("*").eq("company_id", company.id).order("created_at", { ascending: false }).then(function (txRes) {
        renderHistory(document.getElementById("transactionHistory"), txRes.data || []);
      });
    });
  });
})();
