# Birria Patro Jaramillo — Website

A vanilla HTML/CSS/JS website for Birria Patro Jaramillo (San Jose, CA). No build step,
no framework, no npm dependencies — just static files deployed to Vercel.

## Project structure

```
index.html          Home page
menu.html            Full menu, category tabs, item customization modal
order.html           Cart, checkout, pickup/delivery, order confirmation
about.html           Story, stats, promises, location
assets/
  style.css          Shared design system (CSS variables, components)
  common.js          Cart (localStorage), nav/hamburger, toast helper
  menu-data.js        Hardcoded fallback menu data (used if the Google Sheet is unreachable)
  menu-source.js      Google Sheets CSV fetch + parser + fallback logic (shared by menu.js & order.js)
  menu.js             Menu page rendering + item customization modal
  order.js            Order page rendering + checkout + cart/price sync
  chat-widget.js       "Maya" AI chat widget (floating button, talks to /api/chat)
api/
  chat.js              Serverless function — calls the Anthropic API, returns replies + cart actions
  _lib/menu.js          Server-side menu loader (mirrors menu-source.js, for Maya's system prompt)
menu-template.csv     Starter template — import this into Google Sheets to seed the CMS
vercel.json           Clean URLs + asset caching
MENU_MANAGEMENT.md    Plain-English instructions for restaurant staff to update the menu
```

## Running locally

No build step required — just serve the folder with any static file server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080/index.html
```

## Deploying

```bash
vercel --prod
```

---

## Connecting your Google Sheet

The menu (`menu.html` and `order.html`) can be driven by a Google Sheet instead of the
hardcoded data in `assets/menu-data.js`. If the sheet isn't set up yet, or becomes
unreachable, the site automatically falls back to the hardcoded data — it never breaks.

### 1. Create the sheet

1. Create a new Google Sheet.
2. In row 1, add these exact column headers:

   | category | name | description | price | available | customizable |
   |----------|------|-------------|-------|-----------|--------------|

3. Import `menu-template.csv` from this repo to seed the sheet with all current menu
   items: **File → Import → Upload** → select `menu-template.csv` → choose
   **"Replace current sheet"** (if importing into a fresh blank sheet, either option
   works).

Column meaning:

- **category** — must match one of the app's category names exactly (see
  `MENU_MANAGEMENT.md` for the full list, e.g. `Birria Tacos`, `Burritos`, `Drinks`).
  A category name not seen before automatically creates a new tab.
- **name** — item display name, e.g. `Taco Suave / Soft Taco`.
- **description** — short description shown on the card.
- **price** — plain number, no `$` (e.g. `17.99`). Leave blank for "market price"
  items — the site shows a "Call to Order" button instead of an Add button.
- **available** — `TRUE` or `FALSE`. `FALSE` hides the item from the menu without
  deleting the row.
- **customizable** — `TRUE` opens the meat/tortilla/add-ons customization modal when
  a customer clicks Add. `FALSE` opens a simple quantity-only modal.

### 2. Publish the sheet as CSV

The site reads the sheet as a public CSV — no API key, no OAuth, no backend required.

1. In Google Sheets: **File → Share → Publish to web**.
2. Under "Link", choose the specific sheet/tab (not "Entire document").
3. Under the format dropdown, choose **Comma-separated values (.csv)**.
4. Click **Publish** and confirm.
5. Copy the generated URL. It looks like:

   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv&gid=SHEET_GID
   ```

   (`SHEET_ID` identifies the spreadsheet; `SHEET_GID` identifies the specific tab.)

### 3. Point the site at your sheet

Open `assets/menu-source.js` and replace the placeholder URL:

```javascript
const MENU_CONFIG = {
  SHEET_CSV_URL: 'REPLACE_WITH_YOUR_PUBLISHED_CSV_URL', // <-- paste your CSV URL here
  FALLBACK_TO_HARDCODED: true,
  FETCH_TIMEOUT_MS: 5000,
};
```

Save, redeploy (`vercel --prod`), and the menu will now load from the sheet on every
page visit. As long as `MENU_CONFIG.SHEET_CSV_URL` still contains the placeholder text,
the site skips the network call entirely and uses the hardcoded menu — so it's safe to
deploy this before the sheet is ready.

### 4. How the fallback works

- If `SHEET_CSV_URL` is still the placeholder → hardcoded menu is used, no fetch attempted.
- If the fetch fails, times out (>5 seconds), or the CSV can't be parsed / is empty →
  the site logs a warning to the browser console and falls back to the hardcoded menu
  in `assets/menu-data.js`.
- The site never shows a blank menu or crashes because of the Sheet.

### 5. Ongoing updates

Once connected, day-to-day menu changes (price updates, hiding/unhiding items, adding
new items) require **no developer involvement** — see `MENU_MANAGEMENT.md` for
instructions written for restaurant staff.

---

## AI Order Assistant ("Maya")

A floating chat widget appears on all four pages that can answer questions (menu,
hours, location, catering) and add items directly to the customer's cart. It's
powered by the Anthropic API via a small serverless function — `api/chat.js` — that
reads the same live menu described above, so Maya's answers and prices always match
what's on the menu page.

### One-time setup

Maya needs a Claude API key, set as a Vercel environment variable (never commit it
to a file):

```bash
vercel env add ANTHROPIC_API_KEY
```

Paste your key from [console.anthropic.com](https://console.anthropic.com) when
prompted, then redeploy (`vercel --prod`) so the function picks it up.

### Fallback behavior

If `ANTHROPIC_API_KEY` isn't set yet, or the Anthropic API call fails or times out,
`api/chat.js` responds with a friendly message directing the customer to call the
restaurant — the widget never shows a broken or blank state.

### How it adds items to the cart

Maya doesn't keep its own separate order system. When a customer confirms an order,
the model calls a tool (`add_to_cart`) that the server validates against the current
menu and turns into a normal cart line — the widget then calls the site's existing
`addToCart()` (in `assets/common.js`), the same function the menu page's Add button
uses. That means anything Maya adds shows up in the regular cart on `order.html` and
goes through the exact same checkout flow.
