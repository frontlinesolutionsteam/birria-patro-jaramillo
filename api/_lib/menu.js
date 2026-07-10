const fs = require("fs");
const path = require("path");

/* Mirrors assets/menu-source.js's MENU_CONFIG so Maya always answers with the
   same live sheet data customers see on the menu page. Kept as a literal
   duplicate string (not required from the browser file) because a
   global-scope browser script and a Node module can't share one file
   without a bundler. */
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT0Bgdp7YaxL_NAyOPTnpYN70DwXwtHzafO2YcNKA-st7KOan2lT3tBdxAB0_ddu0g5IS6nxJ-YuBKT/pub?gid=0&single=true&output=csv";
const FETCH_TIMEOUT_MS = 5000;

/* Same customization option tables as assets/menu-source.js. */
const MEAT_CHOICES = ["Birria (Lamb)", "Carne Asada", "Carnitas", "Cabeza", "Chorizo", "Shrimp"];
const TORTILLA_CHOICES = [
  { name: "Corn", extra: 0 },
  { name: "Flour", extra: 0 },
  { name: "Handmade Corn", extra: 1.0 },
];
const ADDONS = [
  { name: "Extra Consomé 8oz", extra: 1.5 },
  { name: "Avocado", extra: 1.0 },
  { name: "Extra Cheese", extra: 1.0 },
];

function round2(n) {
  return Math.round(n * 100) / 100;
}

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* Same parser as assets/menu-source.js's parseCSV. */
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

function csvToItems(csvText) {
  const rows = parseCSV(csvText).filter((r) => r.some((cell) => cell.trim() !== ""));
  if (rows.length < 2) throw new Error("CSV has no data rows");

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const iCategory = header.indexOf("category");
  const iName = header.indexOf("name");
  const iDesc = header.indexOf("description");
  const iPrice = header.indexOf("price");
  const iAvailable = header.indexOf("available");
  const iCustomizable = header.indexOf("customizable");

  if (iCategory === -1 || iName === -1 || iPrice === -1) {
    throw new Error("CSV missing required columns");
  }

  const items = [];
  rows.slice(1).forEach((r) => {
    const name = (r[iName] || "").trim();
    if (!name) return;

    const availableRaw = (r[iAvailable] || "TRUE").trim().toUpperCase();
    if (availableRaw === "FALSE") return;

    const categoryLabel = (r[iCategory] || "Other").trim() || "Other";
    const priceRaw = (r[iPrice] || "").trim().replace("$", "");
    const price = priceRaw === "" || isNaN(parseFloat(priceRaw)) ? null : round2(parseFloat(priceRaw));
    const customizable = (r[iCustomizable] || "FALSE").trim().toUpperCase() === "TRUE";

    items.push({
      id: slugify(`${categoryLabel}-${name}`),
      name,
      desc: (r[iDesc] || "").trim(),
      price,
      categoryLabel,
      customizable,
    });
  });

  if (!items.length) throw new Error("CSV has no available items");
  return items;
}

function loadFallbackItems() {
  const csvPath = path.join(__dirname, "..", "..", "menu-template.csv");
  const csvText = fs.readFileSync(csvPath, "utf8");
  return csvToItems(csvText);
}

async function loadMenuItems() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(SHEET_CSV_URL, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`Sheet fetch failed with status ${res.status}`);
    const csvText = await res.text();
    return csvToItems(csvText);
  } catch (err) {
    console.warn("[api/chat] Menu sheet fetch failed, using local menu-template.csv:", err.message);
    return loadFallbackItems();
  }
}

module.exports = {
  loadMenuItems,
  MEAT_CHOICES,
  TORTILLA_CHOICES,
  ADDONS,
  round2,
};
