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