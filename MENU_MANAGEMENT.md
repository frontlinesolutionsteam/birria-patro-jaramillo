# Updating the Menu — Instructions for Birria Patro Jaramillo Staff

Your website menu now updates automatically from a Google Sheet. You do **not** need
anyone to touch any code. Just edit the spreadsheet like a normal document, and the
changes show up on the website automatically.

No special skills needed — if you can edit a spreadsheet, you can update the menu.

---

## 1. How to open the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and sign in with the restaurant's
   Google account.
2. Open the sheet named **"Birria Patro Jaramillo — Menu"**.
3. You'll see one row per menu item, with columns across the top:
   `category | name | description | price | available | customizable`

If you're setting this up for the very first time, see the **"First-time setup"**
section at the bottom of this document.

---

## 2. How to change a price

1. Find the row for the item you want to change.
2. Click on the cell under the **price** column for that row.
3. Type the new price as a plain number — no dollar sign. For example, type `18.99`,
   not `$18.99`.
4. Press Enter. That's it — no need to click a save button, Google Sheets saves
   automatically.

The new price will appear on the website the next time someone loads the page
(usually within about a minute).

---

## 3. How to hide an item temporarily (86'd / out of stock)

1. Find the row for the item.
2. Click the cell under the **available** column.
3. Change it from `TRUE` to `FALSE`.
4. Press Enter.

The item will disappear from the website menu until you change it back. Nothing is
deleted — the row stays in the sheet, just hidden from customers.

---

## 4. How to add a brand new item

1. Scroll to the bottom of the item list (the last item in the same category is a
   good place to add near).
2. Click into a blank row and fill in each column:
   - **category** — must match one of the existing category names exactly
     (see the important note below)
   - **name** — what the item is called on the menu
   - **description** — the short description shown under the name
   - **price** — a plain number, no dollar sign (leave blank if the price varies —
     the site will show "Call to Order" instead of a price)
   - **available** — type `TRUE` to make it visible right away
   - **customizable** — type `TRUE` if customers should be able to choose a meat,
     tortilla, or add-ons when ordering it; type `FALSE` for simple items like drinks
     or sides that don't need any choices
3. Press Enter.

The new item will appear on the website automatically.

---

## 5. How to bring a hidden item back

1. Find the row for the item (it's still there, just hidden).
2. Click the **available** cell and change `FALSE` back to `TRUE`.
3. Press Enter. The item reappears on the menu.

---

## 6. Important: category names must match exactly

The website groups items into tabs (Birria Tacos, Burritos, Drinks, etc.) based on
whatever you type in the **category** column. If you misspell a category name or use
different capitalization, that item will show up as its own new tab instead of joining
the existing one.

**Use one of these exact category names** for existing tabs:

```
Birria Tacos
Birria Plates
Burritos
Quesadillas
Tostadas
Nachos
Mariscos
Breakfast
Menudo
Especiales
Sides
Kids
Dessert
Drinks
```

If you want to create a brand-new category (a new tab), just type a new name — the
website will automatically create a new tab for it. Just make sure you spell it the
same way every time you use it.

---

## 7. How fast do changes show up?

Changes go live within about **1 minute** — as soon as the next customer opens (or
refreshes) the menu or order page, they'll see your update. There's nothing to
publish, deploy, or restart. If you don't see your change after a minute, try a hard
refresh of the page (or wait a moment — sometimes a browser caches the old page
briefly).

If something goes wrong with the sheet (bad internet, sheet accidentally unpublished,
etc.), the website automatically falls back to its built-in backup menu, so the site
will never show a blank page or break for customers.

---

## Quick reference

| I want to...                        | Do this                                  |
|--------------------------------------|-------------------------------------------|
| Change a price                       | Edit the **price** cell                   |
| Hide an item (sold out, seasonal)    | Set **available** to `FALSE`              |
| Bring an item back                   | Set **available** to `TRUE`               |
| Add a new item                       | Add a new row, fill in all 6 columns      |
| Let customers pick meat/tortilla     | Set **customizable** to `TRUE`            |
| Make it a simple "just add" item     | Set **customizable** to `FALSE`           |
| Show "Call to Order" instead of a price | Leave the **price** cell blank         |

---

## First-time setup (only needed once)

If the Google Sheet hasn't been connected to the website yet, see the **"Connecting
your Google Sheet"** section in `README.md` for the one-time setup steps (this part
does require a developer, but only needs to be done a single time).
