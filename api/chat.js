const { loadMenuItems, MEAT_CHOICES, TORTILLA_CHOICES, ADDONS, round2 } = require("./_lib/menu");

const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";
const ANTHROPIC_TIMEOUT_MS = 20000;
const MAX_HISTORY_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;
const FALLBACK_MESSAGE = "Maya's taking a quick break — please call us at (408) 281-8345 and we'll take care of you!";

const BUSINESS_INFO = `
Restaurant: Birria Patro Jaramillo
Address: 3961 Snell Ave, Suite 2, San Jose, CA 95136
Phone: (408) 281-8345
Hours: Monday 9:00 AM-4:00 PM; Tuesday-Friday 9:00 AM-7:50 PM; Saturday-Sunday 8:30 AM-7:50 PM
Established: 2015, family-owned, Zacatecas-style birria (lamb and beef, slow-cooked in rich chili broth)
Signature dish: Birria Revolcada (grilled birria with charred onions)
Catering available - direct customers to call (408) 281-8345 for catering.
`.trim();

function buildSystemPrompt(items) {
  const menuLines = items
    .map((item) => {
      const price = item.price === null ? "market price, call to order" : `$${item.price.toFixed(2)}`;
      const custom = item.customizable ? " (customizable: meat/tortilla/add-ons available)" : "";
      return `- [${item.id}] ${item.name} — ${price}${custom}${item.desc ? " — " + item.desc : ""}`;
    })
    .join("\n");

  return `You are Maya, the friendly AI order assistant for Birria Patro Jaramillo, an authentic Zacatecas-style birria restaurant in San Jose, CA.

BUSINESS INFO:
${BUSINESS_INFO}

CURRENT MENU (id — name — price — description):
${menuLines}

CUSTOMIZATION OPTIONS (only for items marked customizable):
- Meat choice: ${MEAT_CHOICES.join(", ")}
- Tortilla: Corn (included), Flour (included), Handmade Corn (+$1.00)
- Add-ons: Extra Consomé 8oz (+$1.50), Avocado (+$1.00), Extra Cheese (+$1.00)

INSTRUCTIONS:
- Reply in whichever language the customer uses (English or Spanish), warmly and concisely — this is a chat widget, keep replies short.
- Be proud of the restaurant's Zacatecas heritage and family history, but stay brief and helpful.
- You can answer questions about the menu, prices, hours, location, and catering.
- When a customer clearly confirms they want to order a specific item (and quantity, and any required choices), call the add_to_cart tool using the exact item id from the menu list above. Also include a short natural-language confirmation in your reply text in the same turn.
- Never call add_to_cart for an item whose price is "market price, call to order" — tell the customer to call (408) 281-8345 instead.
- Don't invent menu items, ids, or prices that aren't listed above.`;
}

const ADD_TO_CART_TOOL = {
  name: "add_to_cart",
  description:
    "Add a confirmed item to the customer's cart. Only call this once the customer has clearly confirmed the item, quantity, and any required choices.",
  input_schema: {
    type: "object",
    properties: {
      item_id: { type: "string", description: "Exact id of the menu item from the menu list." },
      quantity: { type: "integer", minimum: 1 },
      meat_choice: { type: "string", description: "One of the allowed meat choices, if applicable." },
      tortilla_choice: { type: "string", description: "One of: Corn, Flour, Handmade Corn." },
      addons: { type: "array", items: { type: "string" }, description: "Any of: Extra Consomé 8oz, Avocado, Extra Cheese." },
    },
    required: ["item_id", "quantity"],
  },
};

function buildLineFromToolUse(input, items) {
  const item = items.find((i) => i.id === input.item_id);
  if (!item || item.price === null) return null;

  const qty = Math.max(1, parseInt(input.quantity, 10) || 1);
  const optionParts = [];
  let extraPerUnit = 0;

  if (input.meat_choice && MEAT_CHOICES.includes(input.meat_choice)) {
    optionParts.push(input.meat_choice);
  }
  if (input.tortilla_choice) {
    const t = TORTILLA_CHOICES.find((t) => t.name === input.tortilla_choice);
    if (t) {
      extraPerUnit += t.extra;
      optionParts.push(t.name + " Tortilla");
    }
  }
  if (Array.isArray(input.addons)) {
    input.addons.forEach((name) => {
      const a = ADDONS.find((a) => a.name === name);
      if (a) {
        extraPerUnit += a.extra;
        optionParts.push(a.name);
      }
    });
  }

  extraPerUnit = round2(extraPerUnit);
  return {
    itemId: item.id,
    name: item.name,
    qty,
    optionsLabel: optionParts.join(", "),
    basePrice: item.price,
    extraPerUnit,
    lineTotal: round2((item.price + extraPerUnit) * qty),
  };
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ message: FALLBACK_MESSAGE, actions: [] });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(200).json({ message: FALLBACK_MESSAGE, actions: [] });
    return;
  }

  try {
    const body = req.body || {};
    const incomingMessages = Array.isArray(body.messages) ? body.messages : [];

    const messages = incomingMessages
      .slice(-MAX_HISTORY_MESSAGES)
      .filter((m) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LENGTH) }));

    if (!messages.length) {
      res.status(200).json({ message: FALLBACK_MESSAGE, actions: [] });
      return;
    }

    const items = await loadMenuItems();
    const systemPrompt = buildSystemPrompt(items);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ANTHROPIC_TIMEOUT_MS);

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 500,
        system: systemPrompt,
        messages,
        tools: [ADD_TO_CART_TOOL],
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!anthropicRes.ok) {
      console.error("[api/chat] Anthropic API error:", anthropicRes.status, await anthropicRes.text());
      res.status(200).json({ message: FALLBACK_MESSAGE, actions: [] });
      return;
    }

    const data = await anthropicRes.json();
    const content = Array.isArray(data.content) ? data.content : [];

    const textParts = content.filter((b) => b.type === "text").map((b) => b.text);
    const toolUses = content.filter((b) => b.type === "tool_use" && b.name === "add_to_cart");

    const actions = toolUses
      .map((b) => buildLineFromToolUse(b.input || {}, items))
      .filter(Boolean)
      .map((line) => ({ type: "add_to_cart", line }));

    let message = textParts.join("\n\n").trim();
    if (!message && actions.length) {
      message = actions
        .map((a) => `Added ${a.line.qty}x ${a.line.name} to your cart!`)
        .join(" ");
    }
    if (!message) {
      message = "Sorry, I didn't quite catch that — could you try rephrasing?";
    }

    res.status(200).json({ message, actions });
  } catch (err) {
    console.error("[api/chat] Unexpected error:", err);
    res.status(200).json({ message: FALLBACK_MESSAGE, actions: [] });
  }
};
