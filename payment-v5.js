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

// Pages rebuild marker: demo removed permanently.
