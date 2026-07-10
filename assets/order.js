const TAX_RATE = 0.0925;
const SERVICE_FEE = 0.99;
const DELIVERY_FEE = 5.99;

let orderType = "pickup";
let LIVE_MENU_BY_ID = {};

/* ===================== SYNC CART WITH LIVE MENU DATA ===================== */
function syncCartWithLiveMenu() {
  const cart = getCart();
  let changed = false;

  const updated = cart.map((line) => {
    const live = LIVE_MENU_BY_ID[line.itemId];
    if (!live || live.price === null || typeof line.basePrice !== "number") return line;
    if (live.price === line.basePrice && live.name === line.name) return line;

    changed = true;
    const extraPerUnit = typeof line.extraPerUnit === "number" ? line.extraPerUnit : 0;
    return {
      ...line,
      name: live.name,
      basePrice: live.price,
      lineTotal: round2((live.price + extraPerUnit) * line.qty),
    };
  });

  if (changed) saveCart(updated);
}

/* ===================== RENDER CART ===================== */
function renderCartList() {
  const cart = getCart();
  const list = document.getElementById("cartList");
  const placeBtn = document.getElementById("placeOrderBtn");

  if (!cart.length) {
    list.innerHTML = `<div class="empty-cart">Your cart is empty.<br><a href="menu.html">Browse the menu →</a></div>`;
    placeBtn.disabled = true;
  } else {
    placeBtn.disabled = false;
    list.innerHTML = cart
      .map(
        (line, idx) => `
      <div class="cart-line">
        <div>
          <div class="cart-line-name">${line.qty}× ${line.name}</div>
          ${line.optionsLabel ? `<div class="cart-line-opts">${line.optionsLabel}</div>` : ""}
          <div class="cart-line-controls">
            <button type="button" data-decr="${idx}">−</button>
            <span>${line.qty}</span>
            <button type="button" data-incr="${idx}">+</button>
            <button type="button" class="cart-line-remove" data-remove="${idx}">Remove</button>
          </div>
        </div>
        <div class="cart-line-price">$${line.lineTotal.toFixed(2)}</div>
      </div>`
      )
      .join("");

    list.querySelectorAll("[data-incr]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const idx = +btn.dataset.incr;
        const cart = getCart();
        updateCartQty(idx, cart[idx].qty + 1);
        renderAll();
      })
    );
    list.querySelectorAll("[data-decr]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const idx = +btn.dataset.decr;
        const cart = getCart();
        updateCartQty(idx, cart[idx].qty - 1);
        renderAll();
      })
    );
    list.querySelectorAll("[data-remove]").forEach((btn) =>
      btn.addEventListener("click", () => {
        removeFromCart(+btn.dataset.remove);
        renderAll();
      })
    );
  }
}

/* ===================== RENDER TOTALS ===================== */
function renderTotals() {
  const subtotal = cartSubtotal();
  const tax = round2(subtotal * TAX_RATE);
  const deliveryFee = orderType === "delivery" ? DELIVERY_FEE : 0;
  const total = round2(subtotal + tax + SERVICE_FEE + deliveryFee);

  document.getElementById("sumSubtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("sumTax").textContent = `$${tax.toFixed(2)}`;
  document.getElementById("sumService").textContent = `$${SERVICE_FEE.toFixed(2)}`;
  document.getElementById("sumTotal").textContent = `$${total.toFixed(2)}`;

  const deliveryRow = document.getElementById("deliveryFeeRow");
  if (orderType === "delivery") {
    deliveryRow.style.display = "flex";
    document.getElementById("sumDelivery").textContent = `$${DELIVERY_FEE.toFixed(2)}`;
  } else {
    deliveryRow.style.display = "none";
  }
}

function renderAll() {
  renderCartList();
  renderTotals();
  updateCartBadge();
}

/* ===================== ORDER TYPE TOGGLE ===================== */
function setOrderType(type) {
  orderType = type;
  document.querySelectorAll("[data-order-type]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.orderType === type);
  });
  const pickupFields = document.getElementById("pickupFields");
  const deliveryFields = document.getElementById("deliveryFields");
  const est = document.getElementById("orderEst");
  const payNote = document.querySelector(".pay-note span");

  if (type === "pickup") {
    pickupFields.style.display = "block";
    deliveryFields.style.display = "none";
    est.innerHTML = "<strong>Ready in ~15 min</strong> · Pickup is free";
    payNote.textContent = "Pay at pickup — cash or card accepted at the counter.";
  } else {
    pickupFields.style.display = "none";
    deliveryFields.style.display = "block";
    est.innerHTML = "<strong>35–50 min</strong> · Delivery is $5.99";
    payNote.textContent = "Pay at delivery — cash or card accepted from the driver.";
  }
  renderTotals();
}

/* ===================== SUBMIT ===================== */
function generateOrderNumber() {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `BPJ-${digits}`;
}

function handleSubmit(e) {
  e.preventDefault();
  const cart = getCart();
  if (!cart.length) return;

  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  if (!name || !phone) return;

  if (orderType === "delivery") {
    const addr = document.getElementById("deliveryAddress").value.trim();
    if (!addr) {
      document.getElementById("deliveryAddress").focus();
      return;
    }
  }

  const subtotal = cartSubtotal();
  const tax = round2(subtotal * TAX_RATE);
  const deliveryFee = orderType === "delivery" ? DELIVERY_FEE : 0;
  const total = round2(subtotal + tax + SERVICE_FEE + deliveryFee);

  const orderNum = generateOrderNumber();
  document.getElementById("confirmOrderNum").textContent = orderNum;
  document.getElementById("confirmType").textContent =
    orderType === "pickup" ? "Pickup order — ready in ~15 min" : "Delivery order — arriving in 35–50 min";
  document.getElementById("confirmTotal").textContent = `Total: $${total.toFixed(2)} · Pay at ${orderType === "pickup" ? "pickup" : "delivery"}`;

  localStorage.removeItem(CART_KEY);
  updateCartBadge();

  document.getElementById("orderView").style.display = "none";
  document.getElementById("confirmationView").style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ===================== INIT ===================== */
document.addEventListener("DOMContentLoaded", async () => {
  document.querySelectorAll("[data-order-type]").forEach((btn) => {
    btn.addEventListener("click", () => setOrderType(btn.dataset.orderType));
  });
  document.getElementById("checkoutForm").addEventListener("submit", handleSubmit);

  renderAll();

  try {
    const data = await loadMenuData();
    LIVE_MENU_BY_ID = {};
    data.items.forEach((item) => {
      LIVE_MENU_BY_ID[item.id] = item;
    });
    syncCartWithLiveMenu();
    renderAll();
  } catch (err) {
    console.warn("Could not sync cart with live menu data:", err);
  }
});
