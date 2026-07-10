/* ===================== BUSINESS INFO ===================== */
const BUSINESS = {
  name: "Birria Patro Jaramillo",
  address: "3961 Snell Ave, Suite 2, San Jose, CA 95136",
  phone: "(408) 281-8345",
  phoneHref: "tel:+14082818345",
  facebook: "https://www.facebook.com/birriapatrojaramillo/",
  mapsHref: "https://www.google.com/maps/search/?api=1&query=3961+Snell+Ave+Suite+2+San+Jose+CA+95136",
};

/* ===================== CART (localStorage) ===================== */
const CART_KEY = "bpj_cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(line) {
  const cart = getCart();
  cart.push(line);
  saveCart(cart);
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
}

function updateCartQty(index, qty) {
  const cart = getCart();
  if (!cart[index]) return;
  if (qty <= 0) {
    cart.splice(index, 1);
  } else {
    const unitPrice = cart[index].lineTotal / cart[index].qty;
    cart[index].qty = qty;
    cart[index].lineTotal = round2(unitPrice * qty);
  }
  saveCart(cart);
}

function cartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function cartSubtotal() {
  return round2(getCart().reduce((sum, item) => sum + item.lineTotal, 0));
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function updateCartBadge() {
  const badges = document.querySelectorAll("[data-cart-badge]");
  const count = cartCount();
  badges.forEach((b) => {
    b.textContent = count;
    b.classList.toggle("hidden", count === 0);
  });
}

/* ===================== NAV / MOBILE DRAWER ===================== */
function initNav() {
  const hamburger = document.querySelector("[data-hamburger]");
  const drawer = document.querySelector("[data-mobile-drawer]");
  if (!hamburger || !drawer) return;
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    drawer.classList.toggle("open");
  });
  drawer.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      hamburger.classList.remove("open");
      drawer.classList.remove("open");
    })
  );
}

/* ===================== TOAST ===================== */
function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="check">&#10003;</span> ${message}`;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ===================== SCROLL REVEAL ===================== */
function initScrollReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("in-view"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  els.forEach((el) => observer.observe(el));
}

/* ===================== ANNOUNCEMENT BAR DISMISS ===================== */
function initAnnounceBar() {
  const bar = document.querySelector("[data-announce-bar]");
  const dismissBtn = document.querySelector("[data-announce-dismiss]");
  if (!bar || !dismissBtn) return;
  if (sessionStorage.getItem("bpj_announce_dismissed") === "1") {
    bar.classList.add("dismissed");
    return;
  }
  dismissBtn.addEventListener("click", () => {
    bar.classList.add("dismissed");
    sessionStorage.setItem("bpj_announce_dismissed", "1");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  updateCartBadge();
  initScrollReveal();
  initAnnounceBar();
});
