const PRODUCTS = {
  apple: { name: "Apple", emoji: "🍏" },
  banana: { name: "Banana", emoji: "🍌" },
  lemon: { name: "Lemon", emoji: "🍋" },
};

function getBasket() {
  try {
    const basket = localStorage.getItem("basket");
    if (!basket) return [];
    const parsed = JSON.parse(basket);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Error parsing basket from localStorage:", error);
    return [];
  }
}

function addToBasket(product) {
  const basket = getBasket();
  basket.push(product);
  localStorage.setItem("basket", JSON.stringify(basket));
}

function clearBasket() {
  localStorage.removeItem("basket");
}

function renderBasket() {
  const basket = getBasket();
  const basketList = document.getElementById("basketList");
  const cartButtonsRow = document.querySelector(".cart-buttons-row");
  if (!basketList) return;
  basketList.innerHTML = "";
  if (basket.length === 0) {
    basketList.innerHTML = "<li>No products in basket.</li>";
    if (cartButtonsRow) cartButtonsRow.style.display = "none";
    return;
  }
  basket.forEach((product) => {
    const item = PRODUCTS[product];
    if (item) {
      const li = document.createElement("li");
      li.innerHTML = `<span class='basket-emoji'>${item.emoji}</span> <span>${item.name}</span>`;
      basketList.appendChild(li);
    }
  });
  if (cartButtonsRow) cartButtonsRow.style.display = "flex";
}

function renderBasketIndicator() {
  const basket = getBasket();
  let indicator = document.querySelector(".basket-indicator");
  if (!indicator) {
    const basketLink = document.querySelector(".basket-link");
    if (!basketLink) return;
    indicator = document.createElement("span");
    indicator.className = "basket-indicator";
    basketLink.appendChild(indicator);
  }
  if (basket.length > 0) {
    indicator.textContent = basket.length;
    indicator.style.display = "flex";
  } else {
    indicator.style.display = "none";
  }
}

// Call this on page load and after basket changes
if (document.readyState !== "loading") {
  renderBasketIndicator();
} else {
  document.addEventListener("DOMContentLoaded", renderBasketIndicator);
}

// Patch basket functions to update indicator
const origAddToBasket = window.addToBasket;
window.addToBasket = function (product) {
  origAddToBasket(product);
  renderBasketIndicator();
};
const origClearBasket = window.clearBasket;
window.clearBasket = function () {
  origClearBasket();
  renderBasketIndicator();
};

// ==========================
// Dark Mode Toggle (fixed)
// ==========================

const themeToggleBtn = document.getElementById("themeToggle");

// Apply the theme based on a preference value: "light" | "dark" | "auto"
function applyTheme(pref) {
  const body = document.body;
  if (pref === "auto") {
    // Resolve to system preference
    const sys = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    body.classList.toggle("dark-mode", sys === "dark");
  } else {
    body.classList.toggle("dark-mode", pref === "dark");
  }
}

// Read stored preference (literal preference, not resolved)
function readStoredPref() {
  const saved = localStorage.getItem("theme");
  return saved === "light" || saved === "dark" || saved === "auto"
    ? saved
    : "auto";
}

// Save preference helper
function savePref(pref) {
  localStorage.setItem("theme", pref);
}

// Keep `currentPref` as the literal preference (light|dark|auto)
let currentPref = readStoredPref();
applyTheme(currentPref);

// Keep button label reflecting the preference
function updateButtonLabel(pref) {
  if (!themeToggleBtn) return;
  themeToggleBtn.textContent =
    pref === "light" ? "☀️ Light" : pref === "dark" ? "🌙 Dark" : "🌓 Auto";
}
updateButtonLabel(currentPref);

// Cycle preference: light -> dark -> auto -> light ...
function nextPreference(pref) {
  return pref === "light" ? "dark" : pref === "dark" ? "auto" : "light";
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const nextPref = nextPreference(currentPref);
    savePref(nextPref);
    currentPref = nextPref;
    applyTheme(currentPref);
    updateButtonLabel(currentPref);
  });
}

// When in "auto", listen for OS theme changes and re-apply dynamically
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
function handleSystemChange() {
  if (currentPref === "auto") applyTheme("auto");
}
if (typeof mediaQuery.addEventListener === "function") {
  mediaQuery.addEventListener("change", handleSystemChange);
} else if (typeof mediaQuery.addListener === "function") {
  // backward-compatible
  mediaQuery.addListener(handleSystemChange);
}