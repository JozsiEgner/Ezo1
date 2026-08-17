(function configureCheckout() {
  "use strict";

  const REVOLUT_URL = "https://revolut.me/jozsi96";
  const PRICE_MINOR_UNITS = "50000000";
  const form = document.getElementById("checkoutForm");
  const usernameInput = document.getElementById("githubUsername");
  const consentInput = document.getElementById("manualConsent");
  const errorElement = document.getElementById("checkoutError");

  if (!form || !usernameInput || !consentInput || !errorElement) return;

  function isValidGitHubUsername(value) {
    return /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(value) && !value.includes("--");
  }

  usernameInput.addEventListener("input", function () {
    if (errorElement.textContent) errorElement.textContent = "";
  });

  form.addEventListener("submit", function handleCheckout(event) {
    event.preventDefault();
    const username = usernameInput.value.trim().replace(/^@/, "");

    if (!isValidGitHubUsername(username)) {
      errorElement.textContent = "Adj meg érvényes GitHub-felhasználónevet.";
      usernameInput.focus();
      return;
    }

    if (!consentInput.checked) {
      errorElement.textContent = "A folytatáshoz jelöld be a manuális hozzáférés tudomásulvételét.";
      consentInput.focus();
      return;
    }

    errorElement.textContent = "";
    const paymentUrl = new URL(REVOLUT_URL);
    paymentUrl.searchParams.set("currency", "HUF");
    paymentUrl.searchParams.set("amount", PRICE_MINOR_UNITS);
    paymentUrl.searchParams.set("note", "Ezo1-GitHub-" + username);
    window.location.assign(paymentUrl.toString());
  });
})();

(function configureUseCasesModal() {
  "use strict";

  const modal = document.getElementById("useCasesModal");
  const openButton = document.getElementById("openUseCases");
  const closeButton = document.getElementById("closeUseCases");
  const dismissButton = document.getElementById("dismissUseCases");
  const purchaseLink = document.getElementById("modalPurchaseLink");

  if (!modal || !openButton || !closeButton || !dismissButton || !purchaseLink) return;

  let previouslyFocusedElement = null;

  function openModal() {
    previouslyFocusedElement = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    closeButton.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    if (previouslyFocusedElement) previouslyFocusedElement.focus();
  }

  openButton.addEventListener("click", openModal);
  closeButton.addEventListener("click", closeModal);
  dismissButton.addEventListener("click", closeModal);
  purchaseLink.addEventListener("click", closeModal);
  modal.addEventListener("click", function (event) {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });
})();

(function configureInteractiveDemo() {
  "use strict";

  const anchor = document.getElementById("ajanlat") || document.getElementById("vasarlas");
  if (!anchor || document.getElementById("ezoDemo")) return;

  const section = document.createElement("section");
  section.id = "ezoDemo";
  section.className = "section shell ezo-demo-section";
  section.innerHTML = `
    <div class="section-copy">
      <p class="eyebrow">Interaktív Ézó1 demo</p>
      <h2>Adj bemenetet. Nézd meg, melyik végpont nyer.</h2>
      <p>Ez a publikus demonstráció az Ézó1 determinisztikus routing-elvét szemlélteti. A zárt Mag belső számítási logikáját nem teszi közzé.</p>
    </div>
    <div class="ezo-demo-grid">
      <div class="ezo-demo-controls">
        <label for="demoMode">Feladat típusa</label>
        <select id="demoMode">
          <option value="ai">AI / agent routing</option>
          <option value="api">API / szolgáltató routing</option>
          <option value="workflow">Workflow / ügyelosztás</option>
        </select>

        <label for="demoPriority">Prioritás <strong id="demoPriorityValue">70</strong></label>
        <input id="demoPriority" type="range" min="0" max="100" value="70">

        <label for="demoRisk">Kockázati szint <strong id="demoRiskValue">35</strong></label>
        <input id="demoRisk" type="range" min="0" max="100" value="35">

        <label for="demoSpeed">Sebességigény <strong id="demoSpeedValue">60</strong></label>
        <input id="demoSpeed" type="range" min="0" max="100" value="60">

        <button id="demoRun" class="button primary ezo-demo-run" type="button">Ézó1 döntés futtatása</button>
        <button id="demoReset" class="button secondary ezo-demo-reset" type="button">Alaphelyzet</button>
      </div>

      <div class="ezo-demo-output" aria-live="polite">
        <div class="ezo-demo-status"><span>ÉZÓ1 MAG</span><strong id="demoWinner">Végpont 02</strong></div>
        <div id="demoBars" class="ezo-demo-bars"></div>
        <div class="ezo-demo-result">
          <small>STRUKTURÁLT KIMENET</small>
          <code id="demoJson"></code>
        </div>
        <p id="demoReason" class="ezo-demo-reason"></p>
      </div>
    </div>
  `;
  anchor.parentNode.insertBefore(section, anchor);

  const mode = document.getElementById("demoMode");
  const priority = document.getElementById("demoPriority");
  const risk = document.getElementById("demoRisk");
  const speed = document.getElementById("demoSpeed");
  const bars = document.getElementById("demoBars");
  const winner = document.getElementById("demoWinner");
  const json = document.getElementById("demoJson");
  const reason = document.getElementById("demoReason");

  const labels = {
    ai: ["Modell 01", "Agent 02", "Modell 03", "Fallback 04"],
    api: ["API 01", "Szolgáltató 02", "API 03", "Fallback 04"],
    workflow: ["Csapat 01", "Szakértő 02", "Csapat 03", "Sor 04"]
  };

  function normalize(raw) {
    const positive = raw.map(function (v) { return Math.max(1, v); });
    const total = positive.reduce(function (a, b) { return a + b; }, 0);
    const values = positive.map(function (v) { return Math.floor((v / total) * 100); });
    let remainder = 100 - values.reduce(function (a, b) { return a + b; }, 0);
    for (let i = 0; remainder > 0; i = (i + 1) % values.length) {
      values[i] += 1;
      remainder -= 1;
    }
    return values;
  }

  function calculate() {
    const p = Number(priority.value);
    const r = Number(risk.value);
    const s = Number(speed.value);
    const modeBias = mode.value === "ai" ? [10, 18, 7, 3] : mode.value === "api" ? [14, 12, 9, 4] : [8, 16, 12, 5];
    const raw = [
      25 + modeBias[0] + p * 0.28 + (100 - r) * 0.16,
      25 + modeBias[1] + p * 0.18 + s * 0.32,
      25 + modeBias[2] + (100 - r) * 0.30 + s * 0.14,
      18 + modeBias[3] + r * 0.26 + (100 - p) * 0.12
    ];
    const scores = normalize(raw);
    const best = scores.indexOf(Math.max.apply(null, scores));
    const names = labels[mode.value];

    document.getElementById("demoPriorityValue").textContent = p;
    document.getElementById("demoRiskValue").textContent = r;
    document.getElementById("demoSpeedValue").textContent = s;
    winner.textContent = names[best];
    bars.innerHTML = scores.map(function (score, i) {
      return `<div class="ezo-demo-bar-row ${i === best ? "winner" : ""}"><div><span>${names[i]}</span><strong>${score}%</strong></div><div class="ezo-demo-track"><i style="width:${score}%"></i></div></div>`;
    }).join("");
    json.textContent = JSON.stringify({ selected: names[best], weights: scores, total: 100 }, null, 2);
    reason.textContent = "Azonos feladattípus és azonos bemenet mellett a demonstráció ugyanazt a kimenetet adja. A súlyok összege: 100%.";
  }

  [mode, priority, risk, speed].forEach(function (control) {
    control.addEventListener("input", calculate);
  });
  document.getElementById("demoRun").addEventListener("click", calculate);
  document.getElementById("demoReset").addEventListener("click", function () {
    mode.value = "ai";
    priority.value = "70";
    risk.value = "35";
    speed.value = "60";
    calculate();
  });
  calculate();
})();