/**
 * Maya — AI order assistant widget for Birria Patro Jaramillo.
 * Same-origin: posts to /api/chat on this site, and writes directly into the
 * existing localStorage cart (addToCart/updateCartBadge/showToast from
 * assets/common.js) instead of keeping a separate server-side order store.
 */
(function () {
  "use strict";

  const RESTAURANT_NAME = "Birria Patro Jaramillo";

  const SESSION_KEY = "bpj_chat_session";
  function getSessionId() {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }
  const sessionId = getSessionId();

  const HISTORY_KEY = "bpj_chat_history";
  function saveHistory(h) {
    try {
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(-40)));
    } catch (e) {}
  }
  try {
    sessionStorage.removeItem(HISTORY_KEY);
  } catch (e) {} // fresh conversation on every page load
  let history = [];

  const html = `
    <button id="maya-widget-btn" aria-label="Open chat">
      <span class="maya-btn-icon">💬</span>
      <span class="maya-btn-label">Chat With Assistant</span>
      <span class="maya-badge" id="maya-badge">1</span>
    </button>
    <div id="maya-widget-panel" role="dialog" aria-label="Maya Chat">
      <div class="maya-header">
        <div class="maya-avatar">M</div>
        <div class="maya-header-info">
          <div class="maya-header-name">${RESTAURANT_NAME}</div>
          <div class="maya-header-sub">Maya · AI Order Assistant</div>
        </div>
        <button class="maya-close" id="maya-close" aria-label="Close">×</button>
      </div>
      <div class="maya-messages" id="maya-messages"></div>
      <div class="maya-quick-prompts" id="maya-quick-prompts">
        <button class="maya-quick-btn">See our menu</button>
        <button class="maya-quick-btn">Store hours</button>
        <button class="maya-quick-btn">Location</button>
        <button class="maya-quick-btn">Catering</button>
      </div>
      <div class="maya-order-bar" id="maya-order-bar">
        <span class="maya-order-count" id="maya-item-count">0 items</span>
        <span class="maya-order-total" id="maya-order-total">$0.00</span>
      </div>
      <div class="maya-input-area">
        <input class="maya-input" id="maya-input" type="text" placeholder="Type your order or ask anything..." autocomplete="off" />
        <button class="maya-send" id="maya-send" disabled aria-label="Send">➤</button>
      </div>
    </div>
  `;

  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);

  const btn = container.querySelector("#maya-widget-btn");
  const panel = container.querySelector("#maya-widget-panel");
  const closeBtn = container.querySelector("#maya-close");
  const messagesEl = container.querySelector("#maya-messages");
  const inputEl = container.querySelector("#maya-input");
  const sendBtn = container.querySelector("#maya-send");
  const quickEl = container.querySelector("#maya-quick-prompts");
  const quickPrompts = container.querySelectorAll(".maya-quick-btn");
  const orderBar = container.querySelector("#maya-order-bar");
  const itemCountEl = container.querySelector("#maya-item-count");
  const orderTotalEl = container.querySelector("#maya-order-total");
  const badgeEl = container.querySelector("#maya-badge");

  let isOpen = false;
  let isLoading = false;
  let hasBadge = true;

  function openPanel() {
    isOpen = true;
    panel.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
    hideBadge();
    if (history.length === 0) renderWelcome();
    inputEl.focus();
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  }

  function hideBadge() {
    hasBadge = false;
    badgeEl.style.display = "none";
  }

  btn.addEventListener("click", () => (isOpen ? closePanel() : openPanel()));
  closeBtn.addEventListener("click", closePanel);

  function renderWelcome() {
    const welcome = `Hi! Welcome to ${RESTAURANT_NAME}! 🌮 I'm Maya — I can answer questions about our menu, hours, or location, and I can take your order right here. What can I get started for you?\n\n(¿Inglés o Español? Either works!)`;
    history = [{ role: "assistant", content: welcome }];
    saveHistory(history);
    appendBubble("bot", welcome);
  }

  function renderText(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  }

  function appendBubble(type, text) {
    const row = document.createElement("div");
    row.className = `maya-msg ${type === "user" ? "user" : ""}`;
    const bubble = document.createElement("div");
    bubble.className = `maya-bubble ${type}`;
    if (type === "bot") {
      bubble.innerHTML = renderText(text);
    } else {
      bubble.textContent = text;
    }
    row.appendChild(bubble);
    messagesEl.appendChild(row);
    scrollBottom();
  }

  function appendTyping() {
    const row = document.createElement("div");
    row.className = "maya-msg";
    row.id = "maya-typing";
    row.innerHTML = `<div class="maya-bubble bot"><div class="maya-dots"><div class="maya-dot"></div><div class="maya-dot"></div><div class="maya-dot"></div></div></div>`;
    messagesEl.appendChild(row);
    scrollBottom();
  }

  function removeTyping() {
    const t = messagesEl.querySelector("#maya-typing");
    if (t) t.remove();
  }

  function scrollBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  quickPrompts.forEach((qBtn) => {
    qBtn.addEventListener("click", () => {
      sendMessage(qBtn.textContent);
      quickEl.style.display = "none";
    });
  });

  inputEl.addEventListener("input", () => {
    sendBtn.disabled = !inputEl.value.trim() || isLoading;
  });

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading && inputEl.value.trim()) {
      e.preventDefault();
      sendMessage(inputEl.value.trim());
    }
  });

  sendBtn.addEventListener("click", () => {
    if (!isLoading && inputEl.value.trim()) sendMessage(inputEl.value.trim());
  });

  async function sendMessage(text) {
    if (isLoading) return;
    quickEl.style.display = "none";

    appendBubble("user", text);
    history.push({ role: "user", content: text });
    inputEl.value = "";
    sendBtn.disabled = true;
    isLoading = true;
    appendTyping();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, sessionId }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      removeTyping();

      const reply = data.message || "Sorry, something went wrong. Please try again!";
      appendBubble("bot", reply);
      history.push({ role: "assistant", content: reply });
      saveHistory(history);

      applyActions(data.actions);
    } catch (err) {
      clearTimeout(timeout);
      removeTyping();
      const msg =
        err && err.name === "AbortError"
          ? "That took a bit too long — please try again!"
          : "I had a hiccup — please try again, or call us at (408) 281-8345!";
      appendBubble("bot", msg);
    } finally {
      isLoading = false;
      sendBtn.disabled = !inputEl.value.trim();
      inputEl.focus();
    }
  }

  function applyActions(actions) {
    if (!Array.isArray(actions) || !actions.length) return;
    let addedCount = 0;
    actions.forEach((action) => {
      if (action && action.type === "add_to_cart" && action.line) {
        addToCart(action.line);
        addedCount++;
      }
    });
    if (addedCount) {
      showToast(addedCount === 1 ? "Added to cart!" : `Added ${addedCount} items to cart!`);
    }
    refreshOrderBar();
  }

  function refreshOrderBar() {
    const count = cartCount();
    if (count > 0) {
      itemCountEl.textContent = `${count} item${count !== 1 ? "s" : ""}`;
      orderTotalEl.textContent = `$${cartSubtotal().toFixed(2)}`;
      orderBar.classList.add("visible");
    } else {
      orderBar.classList.remove("visible");
    }
  }

  refreshOrderBar();

  setTimeout(() => {
    if (!isOpen && hasBadge) {
      badgeEl.style.display = "flex";
    }
  }, 3000);
})();
