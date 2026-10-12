// Shared price math, used by the content script, popup and background worker.
(function (root) {
  const DEFAULTS = {
    enabled: true,
    percent: 25,        // how much lower prices should look
    natural: true,      // round to believable endings like 84,999
    minAmount: 1000,    // leave small amounts (delivery fees etc.) alone
    realInCart: false   // also show real prices on the cart page
  };

  // ₹1,29,999  ₹ 499.00  Rs. 2,500  INR 15000
  const PRICE_RE = /(₹|Rs\.?|INR)(\s?)(\d{1,3}(?:,\d{2,3})+(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/g;

  function parseAmount(str) {
    return parseFloat(String(str).replace(/,/g, ''));
  }

  function naturalize(v) {
    const step = v >= 10000 ? 1000 : v >= 1000 ? 100 : 10;
    const r = Math.round(v / step) * step - 1;
    return r > 0 ? r : Math.round(v);
  }

  function lowerAmount(n, s) {
    if (!isFinite(n) || n < s.minAmount || s.percent <= 0) return n;
    let v = n * (1 - s.percent / 100);
    v = s.natural ? naturalize(v) : Math.round(v);
    return Math.max(1, v);
  }

  function formatINR(n, decimals) {
    return n.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function maskString(str, s) {
    return str.replace(PRICE_RE, (match, cur, space, num) => {
      const n = parseAmount(num);
      const low = lowerAmount(n, s);
      if (low === n) return match;
      const decimals = (num.split('.')[1] || '').length;
      return cur + space + formatINR(low, decimals);
    });
  }

  root.PriceSoftener = { DEFAULTS, PRICE_RE, parseAmount, lowerAmount, formatINR, maskString };
})(typeof self !== 'undefined' ? self : globalThis);
