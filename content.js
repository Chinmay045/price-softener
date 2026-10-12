(() => {
  const { DEFAULTS, parseAmount, lowerAmount, formatINR, maskString } = self.PriceSoftener;

  let settings = { ...DEFAULTS };
  // Every text node we changed -> its real text and the text we wrote.
  const touched = new Map();

  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT']);

  // ---------- which pages stay real ----------

  function isPaymentPage() {
    const { hostname, pathname } = location;
    if (hostname.includes('amazon')) {
      return /^\/(gp\/buy|checkout|cpe|gp\/checkoutportal|ap\/|gp\/cart\/desktop\/go-to-checkout)/.test(pathname);
    }
    if (hostname.includes('flipkart')) {
      return /\/(checkout|payments?)(\/|$)/.test(pathname);
    }
    // Other stores: anything that looks like checkout, address, payment or order placement.
    return /checkout|payment|\/pay(\/|$)|place-?order|shipping|\/address/i.test(pathname);
  }

  function isCartPage() {
    const { hostname, pathname } = location;
    if (hostname.includes('amazon')) return /^\/(gp\/cart|cart)/.test(pathname);
    if (hostname.includes('flipkart')) return /^\/viewcart/.test(pathname);
    return /\/(cart|bag|viewcart|checkout\/cart)(\/|$)/i.test(pathname);
  }

  function isActive() {
    if (!settings.enabled) return false;
    if (isPaymentPage()) return false;
    if (settings.realInCart && isCartPage()) return false;
    return true;
  }

  // ---------- reversible text edits ----------

  function originalOf(node) {
    const rec = touched.get(node);
    return rec && node.data === rec.masked ? rec.orig : node.data;
  }

  function applyTo(node, transform) {
    const orig = originalOf(node);
    const masked = transform(orig);
    if (masked === orig) {
      if (node.data !== orig) node.data = orig;
      touched.delete(node);
      return;
    }
    touched.set(node, { orig, masked });
    if (node.data !== masked) node.data = masked;
  }

  function restoreAll() {
    for (const [node, rec] of touched) {
      if (node.isConnected && node.data === rec.masked) node.data = rec.orig;
    }
    touched.clear();
  }

  function pruneDetached() {
    for (const node of touched.keys()) {
      if (!node.isConnected) touched.delete(node);
    }
  }

  // ---------- Amazon's split price widget ----------
  // <span class="a-price"><span class="a-offscreen">₹1,29,999.00</span>
  //   <span><span class="a-price-symbol">₹</span><span class="a-price-whole">1,29,999<span class="a-price-decimal">.</span></span>
  //   <span class="a-price-fraction">00</span></span></span>

  function directText(el) {
    if (!el) return null;
    for (const child of el.childNodes) {
      if (child.nodeType === Node.TEXT_NODE && /\d/.test(child.data)) return child;
    }
    return null;
  }

  function handleAmazonPrice(el) {
    const offNode = directText(el.querySelector('.a-offscreen'));
    const wholeNode = directText(el.querySelector('.a-price-whole'));
    if (!offNode || !wholeNode) return;

    const numMatch = originalOf(offNode).match(/\d[\d,]*(?:\.\d+)?/);
    if (!numMatch) return;
    const n = parseAmount(numMatch[0]);
    const low = lowerAmount(n, settings);

    applyTo(offNode, (orig) => maskString(orig, settings));
    applyTo(wholeNode, (orig) =>
      low === n ? orig : formatINR(Math.floor(low), 0)
    );
    const fracNode = directText(el.querySelector('.a-price-fraction'));
    if (fracNode) {
      applyTo(fracNode, (orig) =>
        low === n ? orig : String(Math.round((low % 1) * 100)).padStart(2, '0')
      );
    }
  }

  // ---------- scanning ----------

  function scan() {
    const root = document.body || document.documentElement;
    if (!root) return;

    root.querySelectorAll('.a-price').forEach(handleAmazonPrice);

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || SKIP_TAGS.has(parent.tagName) || parent.isContentEditable) {
          return NodeFilter.FILTER_REJECT;
        }
        const text = originalOf(node);
        return /₹|Rs|INR/.test(text) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) applyTo(node, (orig) => maskString(orig, settings));

    pruneDetached();
  }

  function run() {
    if (isActive()) scan();
    else if (touched.size) restoreAll();
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      run();
    }, 120);
  }

  // ---------- wiring ----------

  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  });

  // Flipkart (and parts of Amazon) change pages without a reload.
  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      schedule();
    }
  }, 400);

  chrome.storage.sync.get(DEFAULTS).then((stored) => {
    settings = stored;
    schedule();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    for (const [key, { newValue }] of Object.entries(changes)) settings[key] = newValue;
    // A new percentage must be computed from the real prices, so start clean.
    restoreAll();
    schedule();
  });
})();
