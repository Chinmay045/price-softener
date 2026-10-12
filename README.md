<p align="center">
  <img src="icons/icon128.png" alt="Price Softener icon" width="96">
</p>

<h1 align="center">Price Softener</h1>

<p align="center">
  <b>Keep gift prices private while shopping with family on Indian stores.</b><br>
  A Chrome extension that shows a softer, lower price on product pages, while checkout and payment always show the real one.
</p>

---

## Why

You want to buy a new phone, TV or appliance for your parents or grandparents. You find the right one, show it to them, and the conversation stops at the price: *"So expensive? Don't waste money on me."*

Price Softener lets you browse together while the conversation stays on what they like rather than what it costs. Prices on product pages look lower **on your screen only**. When you reach checkout, the real price comes back, and you pay exactly what the store charges.

## Features

- **Adjustable reduction**: show prices 0–60% lower using a slider
- **Natural-looking prices**: rounded to believable endings, so ₹97,499 shows as ₹96,999
- **Consistent discounts**: M.R.P. and savings amounts are lowered by the same percentage, so "13% off" still adds up
- **Leaves small amounts alone**: delivery fees and prices below a limit you set (default ₹1,000) are not changed
- **Instant on/off**: press <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>H</kbd>, or use the switch in the popup
- **Real price at payment**: checkout, address and payment pages always show the actual price, and this cannot be turned off
- **Private**: no account, no tracking, no data collection

## Supported stores

| Store | Website |
|---|---|
| Amazon India | amazon.in |
| Flipkart | flipkart.com |
| Croma | croma.com |
| Reliance Digital | reliancedigital.in |
| Vijay Sales | vijaysales.com |
| Tata CLiQ | tatacliq.com |
| JioMart | jiomart.com |
| Myntra | myntra.com |
| AJIO | ajio.com |
| Nykaa | nykaa.com |

Prices in ₹, `Rs.` and `INR` formats are recognised, including Indian digit grouping (₹1,29,999).

> **Tested:** Amazon.in and Flipkart price formats.
> **Not yet tested:** the other eight stores. If prices don't change on one of them, please [open an issue](../../issues).

## Installation

### From source (developer mode)

1. Download this repository: click **Code → Download ZIP** and unzip it, or run:
   ```bash
   git clone https://github.com/Chinmay045/price-softener.git
   ```
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the `price-softener` folder.
5. Pin the extension from the puzzle-piece menu in the toolbar.

### From the Chrome Web Store

*Coming soon.*

## How to use

1. Click the ₹ icon in the toolbar.
2. Drag the slider to choose how much lower prices should look. Open tabs update straight away.
3. Browse product pages with your family as usual.
4. Add to cart and go to checkout. The real price is shown there, and that is the amount you pay.

### Settings

| Setting | Default | What it does |
|---|---|---|
| On/off switch | On | Turns price softening on or off |
| Show prices lower by | 25% | How much lower prices should look (0–60%) |
| Round to natural endings | On | Rounds to prices like ₹24,999 or ₹1,499 |
| Show real prices in the cart too | Off | Shows real prices on the cart page as well |
| Only change prices above ₹ | 1,000 | Leaves smaller amounts untouched |

You can change the keyboard shortcut at `chrome://extensions/shortcuts`.

## How it works

- A content script finds price text on the page and rewrites what is **displayed**. It handles Amazon's split price widget (whole and fraction shown separately), plain text prices, and prices that load after the page opens.
- The real price of every changed element is remembered, so switching off or changing the percentage restores the page exactly.
- Nothing is sent to the store. Your cart, order and payment are never touched.
- Pages whose address contains `checkout`, `payment`, `pay`, `shipping` or `address`, plus Amazon's `/gp/buy` and `/cpe` pages, are always left showing real prices.

## Project structure

```
price-softener/
├── manifest.json       Extension configuration (Manifest V3)
├── pricing.js          Shared price detection and lowering logic
├── content.js          Rewrites prices on store pages; checkout detection
├── background.js       Default settings and keyboard shortcut
├── popup.html/.css/.js Settings popup
├── icons/              Extension icons (16, 32, 48, 128 px)
└── store/              Chrome Web Store listing text and privacy policy
```

## Adding another store

1. Add the site to `content_scripts.matches` in [`manifest.json`](manifest.json).
2. If its checkout or payment addresses don't contain `checkout`, `payment`, `pay`, `shipping` or `address`, add a pattern to `isPaymentPage()` in [`content.js`](content.js).
3. Reload the extension at `chrome://extensions` and check a product page **and** the checkout page.

## Building for the Chrome Web Store

Zip the extension files (not the `store/` folder or this README) with forward-slash paths, so that `manifest.json` sits at the top of the zip. Listing text and the privacy policy are in [`store/`](store).

## Privacy

Price Softener collects no data. Your settings are kept in Chrome's own storage in your browser. See the full [privacy policy](store/PRIVACY_POLICY.md).

## Responsible use

This extension is meant for gifts **you** pay for. The real price is always shown at checkout and payment, so no one ever pays an amount they didn't see. Please don't install it on someone else's browser without telling them.
