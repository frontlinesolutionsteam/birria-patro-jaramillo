/* ===================== STATE ===================== */
let activeCategory = "all";
let currentItem = null;
let modalState = { tortilla: null, meat: null, addons: new Set(), qty: 1 };
let LIVE_ITEMS = [];
let LIVE_CATEGORIES = [];

/* ===================== LOADING SKELETON ===================== */
function renderSkeleton() {
  const container = document.getElementById("menuContent");
  const skeletonCard = `
    <div class="menu-item-card skeleton-card">
      <div class="skeleton-line w-60"></div>
      <div class="skeleton-line w-90"></div>
      <div class="skeleton-line w-40"></div>
    </div>`;
  container.innerHTML = `
    <div class="menu-category-block">
      <div class="menu-grid">
        ${skeletonCard}${skeletonCard}${skeletonCard}
      </div>
    </div>`;
}

/* ===================== RENDER TABS ===================== */
function renderTabs() {
  const wrap = document.getElementById("categoryTabs");
  const all = [{ key: "all", emoji: "🍽️", label: "All" }, ...LIVE_CATEGORIES];
  wrap.innerHTML = all
    .map(
      (c) => `
    <button class="cat-tab ${c.key === activeCategory ? "active" : ""}" data-cat="${c.key}">
      <span>${c.emoji}</span><span>${c.label}</span>
    </button>`
    )
    .join("");
  wrap.querySelectorAll(".cat-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      renderTabs();
      renderMenu();
    });
  });
}

/* ===================== RENDER MENU ===================== */
function priceLabel(price) {
  return price === null ? "Market Price" : `$${price.toFixed(2)}`;
}

function renderMenu() {
  const container = document.getElementById("menuContent");
  const cats = activeCategory === "all" ? LIVE_CATEGORIES : LIVE_CATEGORIES.filter((c) => c.key === activeCategory);

  container.innerHTML = cats
    .map((cat) => {
      const items = LIVE_ITEMS.filter((i) => i.categoryLabel === cat.label);
      if (!items.length) return "";
      return `
      <div class="menu-category-block" id="cat-${cat.key}">
        <h2>${cat.emoji} ${cat.label}</h2>
        <div class="cat-sub">${cat.subtitle || ""}</div>
        <div class="menu-grid">
          ${items.map((item) => renderCard(item)).join("")}
        </div>
      </div>`;
    })
    .join("");

  container.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => openModal(btn.dataset.add));
  });
}

function renderCard(item) {
  const isMarket = item.price === null;
  return `
    <div class="menu-item-card">
      ${item.popular ? '<span class="badge-popular">POPULAR</span>' : ""}
      ${item.image ? `<div class="card-photo"><img src="${item.image}" alt="${item.name}" loading="lazy"></div>` : ""}
      <div class="card-content">
        <div class="item-top">
          <span class="item-name">${item.name}</span>
          <span class="item-price">${priceLabel(item.price)}</span>
        </div>
        ${item.desc ? `<p class="item-desc">${item.desc}</p>` : '<p class="item-desc"></p>'}
        <div class="item-add-row">
          ${
            isMarket
              ? `<a href="tel:+14082818345" class="btn btn-outline-dark btn-sm">📞 Call to Order</a>`
              : `<button class="btn btn-primary btn-sm" data-add="${item.id}">Add</button>`
          }
        </div>
      </div>
    </div>`;
}

/* ===================== MODAL ===================== */
function openModal(itemId) {
  currentItem = LIVE_ITEMS.find((i) => i.id === itemId);
  if (!currentItem) return;
  modalState = {
    tortilla: currentItem.options.tortilla ? currentItem.options.tortilla[0] : null,
    meat: currentItem.options.meat ? currentItem.options.meat[0] : null,
    addons: new Set(),
    qty: 1,
  };
  document.getElementById("modalItemName").textContent = currentItem.name;
  document.getElementById("modalItemDesc").textContent = currentItem.desc || "";
  renderModalBody();
  document.getElementById("modalOverlay").classList.add("open");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  currentItem = null;
}

function renderModalBody() {
  const body = document.getElementById("modalBody");
  const opts = currentItem.options || {};
  let html = "";

  if (opts.meat) {
    html += `
    <div class="option-group">
      <label class="group-title">Meat Choice</label>
      <div class="option-list" data-group="meat">
        ${opts.meat
          .map(
            (m) => `
          <label class="option-item ${modalState.meat === m ? "selected" : ""}" data-value="${m}">
            <span class="opt-name">${m}</span>
            <input type="radio" name="meat" ${modalState.meat === m ? "checked" : ""} />
          </label>`
          )
          .join("")}
      </div>
    </div>`;
  }

  if (opts.tortilla) {
    html += `
    <div class="option-group">
      <label class="group-title">Tortilla</label>
      <div class="option-list" data-group="tortilla">
        ${opts.tortilla
          .map(
            (t) => `
          <label class="option-item ${modalState.tortilla && modalState.tortilla.name === t.name ? "selected" : ""}" data-value="${t.name}">
            <span class="opt-name">${t.name}</span>
            <span class="opt-extra">${t.extra > 0 ? "+$" + t.extra.toFixed(2) : "Included"}</span>
            <input type="radio" name="tortilla" ${modalState.tortilla && modalState.tortilla.name === t.name ? "checked" : ""} />
          </label>`
          )
          .join("")}
      </div>
    </div>`;
  }

  if (opts.addons) {
    html += `
    <div class="option-group">
      <label class="group-title">Add-ons</label>
      <div class="option-list" data-group="addons">
        ${opts.addons
          .map(
            (a) => `
          <label class="option-item ${modalState.addons.has(a.name) ? "selected" : ""}" data-value="${a.name}">
            <span class="opt-name">${a.name}</span>
            <span class="opt-extra">+$${a.extra.toFixed(2)}</span>
            <input type="checkbox" ${modalState.addons.has(a.name) ? "checked" : ""} />
          </label>`
          )
          .join("")}
      </div>
    </div>`;
  }

  html += `
    <div class="option-group">
      <div class="qty-row">
        <label class="group-title" style="margin-bottom:0;">Quantity</label>
        <div class="qty-control">
          <button type="button" data-qty="minus">−</button>
          <span id="qtyDisplay">${modalState.qty}</span>
          <button type="button" data-qty="plus">+</button>
        </div>
      </div>
    </div>`;

  body.innerHTML = html;
  wireModalEvents();
  updateAddBtnPrice();
}

function wireModalEvents() {
  const body = document.getElementById("modalBody");

  body.querySelectorAll('[data-group="meat"] .option-item input').forEach((input) => {
    input.addEventListener("change", () => {
      modalState.meat = input.closest(".option-item").dataset.value;
      renderModalBody();
    });
  });

  body.querySelectorAll('[data-group="tortilla"] .option-item input').forEach((input) => {
    input.addEventListener("change", () => {
      const value = input.closest(".option-item").dataset.value;
      modalState.tortilla = currentItem.options.tortilla.find((x) => x.name === value);
      renderModalBody();
    });
  });

  body.querySelectorAll('[data-group="addons"] .option-item input').forEach((input) => {
    input.addEventListener("change", () => {
      const name = input.closest(".option-item").dataset.value;
      if (input.checked) {
        modalState.addons.add(name);
      } else {
        modalState.addons.delete(name);
      }
      renderModalBody();
    });
  });

  const qtyMinus = body.querySelector('[data-qty="minus"]');
  const qtyPlus = body.querySelector('[data-qty="plus"]');
  if (qtyMinus)
    qtyMinus.addEventListener("click", () => {
      if (modalState.qty > 1) modalState.qty--;
      document.getElementById("qtyDisplay").textContent = modalState.qty;
      updateAddBtnPrice();
    });
  if (qtyPlus)
    qtyPlus.addEventListener("click", () => {
      modalState.qty++;
      document.getElementById("qtyDisplay").textContent = modalState.qty;
      updateAddBtnPrice();
    });
}

function unitPrice() {
  let price = currentItem.price;
  if (modalState.tortilla) price += modalState.tortilla.extra;
  modalState.addons.forEach((name) => {
    const a = currentItem.options.addons.find((x) => x.name === name);
    if (a) price += a.extra;
  });
  return price;
}

function updateAddBtnPrice() {
  const total = round2(unitPrice() * modalState.qty);
  document.getElementById("modalAddBtn").textContent = `Add to Cart — $${total.toFixed(2)}`;
}

function confirmAddToCart() {
  const optionParts = [];
  if (modalState.meat) optionParts.push(modalState.meat);
  if (modalState.tortilla) optionParts.push(modalState.tortilla.name + " Tortilla");
  modalState.addons.forEach((a) => optionParts.push(a));

  const line = {
    itemId: currentItem.id,
    name: currentItem.name,
    qty: modalState.qty,
    optionsLabel: optionParts.join(", "),
    basePrice: currentItem.price,
    extraPerUnit: round2(unitPrice() - currentItem.price),
    lineTotal: round2(unitPrice() * modalState.qty),
  };
  addToCart(line);
  showToast("Added to cart!");
  closeModal();
}

/* ===================== INIT ===================== */
document.addEventListener("DOMContentLoaded", async () => {
  const hash = window.location.hash.replace("#", "");

  renderSkeleton();
  const data = await loadMenuData();
  LIVE_ITEMS = data.items;
  LIVE_CATEGORIES = data.categories;

  if (hash && LIVE_CATEGORIES.some((c) => c.key === hash)) {
    activeCategory = hash;
  }
  renderTabs();
  renderMenu();

  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "modalOverlay") closeModal();
  });
  document.getElementById("modalAddBtn").addEventListener("click", confirmAddToCart);

  if (activeCategory !== "all") {
    setTimeout(() => {
      const el = document.getElementById(`cat-${activeCategory}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  initScrollSpy();
});

/* ===================== SCROLL SPY (highlight tab while scrolling) ===================== */
function initScrollSpy() {
  if (activeCategory !== "all" || !("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const key = entry.target.id.replace("cat-", "");
        document.querySelectorAll(".cat-tab").forEach((tab) => {
          tab.classList.toggle("active", tab.dataset.cat === key);
        });
      });
    },
    { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
  );
  document.querySelectorAll(".menu-category-block").forEach((block) => observer.observe(block));
}
