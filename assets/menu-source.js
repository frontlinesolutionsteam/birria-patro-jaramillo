/* ===================== CONFIG ===================== */
const MENU_CONFIG = {
  SHEET_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT0Bgdp7YaxL_NAyOPTnpYN70DwXwtHzafO2YcNKA-st7KOan2lT3tBdxAB0_ddu0g5IS6nxJ-YuBKT/pub?gid=0&single=true&output=csv",
  FALLBACK_TO_HARDCODED: true,
  FETCH_TIMEOUT_MS: 5000,
};

/* category label -> emoji, borrowed from the hardcoded CATEGORIES list so sheet-driven
   categories that reuse the same names still get the right icon. */
const CATEGORY_EMOJI_BY_LABEL = {};
CATEGORIES.forEach((c) => {
  CATEGORY_EMOJI_BY_LABEL[c.label] = c.emoji;
});

/* ===================== CSV PARSER ===================== */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/* ===================== SLUG HELPER ===================== */
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* ===================== CSV -> CANONICAL MENU SHAPE ===================== */
function csvToMenu(csvText) {
  const rows = parseCSV(csvText).filter((r) => r.some((cell) => cell.trim() !== ""));
  if (rows.length < 2) throw new Error("Sheet CSV has no data rows");

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const iCategory = header.indexOf("category");
  const iName = header.indexOf("name");
  const iDesc = header.indexOf("description");
  const iPrice = header.indexOf("price");
  const iAvailable = header.indexOf("available");
  const iCustomizable = header.indexOf("customizable");

  if (iCategory === -1 || iName === -1 || iPrice === -1) {
    throw new Error("Sheet CSV is missing required columns (category, name, price)");
  }

  const items = [];
  const categoryOrder = [];
  const seenCategories = new Set();

  rows.slice(1).forEach((r) => {
    const name = (r[iName] || "").trim();
    if (!name) return;

    const availableRaw = (r[iAvailable] || "TRUE").trim().toUpperCase();
    if (availableRaw === "FALSE") return;

    const categoryLabel = (r[iCategory] || "Other").trim() || "Other";
    if (!seenCategories.has(categoryLabel)) {
      seenCategories.add(categoryLabel);
      categoryOrder.push(categoryLabel);
    }

    const priceRaw = (r[iPrice] || "").trim().replace("$", "");
    const price = priceRaw === "" || isNaN(parseFloat(priceRaw)) ? null : round2(parseFloat(priceRaw));

    const customizable = (r[iCustomizable] || "FALSE").trim().toUpperCase() === "TRUE";

    items.push({
      id: slugify(`${categoryLabel}-${name}`),
      name,
      desc: (r[iDesc] || "").trim(),
      price,
      categoryLabel,
      popular: false,
      options: customizable ? { meat: MEAT_CHOICES, tortilla: TORTILLA_CHOICES, addons: ADDONS } : {},
    });
  });

  if (!items.length) throw new Error("Sheet CSV has no available items");

  const categories = categoryOrder.map((label) => ({
    key: slugify(label),
    label,
    emoji: CATEGORY_EMOJI_BY_LABEL[label] || "🍽️",
    subtitle: CATEGORY_SUBTITLES[slugify(label)] || "",
  }));

  return { items, categories };
}

/* ===================== HARDCODED FALLBACK -> CANONICAL SHAPE ===================== */
function normalizeFallbackMenu() {
  const items = MENU_ITEMS.map((item) => {
    const cat = CATEGORIES.find((c) => c.key === item.category);
    return {
      id: item.id,
      name: item.name,
      desc: item.desc,
      price: item.price,
      categoryLabel: cat ? cat.label : item.category,
      popular: !!item.popular,
      options: item.options || {},
    };
  });

  const categories = CATEGORIES.map((c) => ({
    key: c.key,
    label: c.label,
    emoji: c.emoji,
    subtitle: CATEGORY_SUBTITLES[c.key] || "",
  }));

  return { items, categories };
}

/* ===================== LOADER (sheet CSV, with fallback) ===================== */
async function loadMenuData() {
  const url = MENU_CONFIG.SHEET_CSV_URL;
  const isConfigured = !!url && !url.includes("REPLACE_WITH_YOUR_PUBLISHED_CSV_URL");

  if (!isConfigured) {
    return { ...normalizeFallbackMenu(), source: "hardcoded" };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), MENU_CONFIG.FETCH_TIMEOUT_MS);
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    clearTimeout(timer);

    if (!res.ok) throw new Error(`Sheet fetch failed with status ${res.status}`);
    const csvText = await res.text();
    const parsed = csvToMenu(csvText);
    return { ...parsed, source: "sheet" };
  } catch (err) {
    console.warn("Menu sheet fetch failed, falling back to hardcoded menu:", err);
    if (MENU_CONFIG.FALLBACK_TO_HARDCODED) {
      return { ...normalizeFallbackMenu(), source: "hardcoded-fallback" };
    }
    throw err;
  }
}
