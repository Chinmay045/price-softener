const { DEFAULTS, lowerAmount, formatINR } = self.PriceSoftener;

const SAMPLE = 129999;
const el = (id) => document.getElementById(id);

let settings = { ...DEFAULTS };

function render() {
  el('enabled').checked = settings.enabled;
  el('percent').value = settings.percent;
  el('percentLabel').textContent = settings.percent + '%';
  el('natural').checked = settings.natural;
  el('realInCart').checked = settings.realInCart;
  el('minAmount').value = settings.minAmount;
  el('previewReal').textContent = '₹' + formatINR(SAMPLE, 0);
  el('previewSoft').textContent = '₹' + formatINR(lowerAmount(SAMPLE, settings), 0);
  document.body.classList.toggle('off', !settings.enabled);
}

function save(patch) {
  settings = { ...settings, ...patch };
  render();
  chrome.storage.sync.set(patch);
}

chrome.storage.sync.get(DEFAULTS).then((stored) => {
  settings = stored;
  render();
});

el('enabled').addEventListener('change', (e) => save({ enabled: e.target.checked }));
el('natural').addEventListener('change', (e) => save({ natural: e.target.checked }));
el('realInCart').addEventListener('change', (e) => save({ realInCart: e.target.checked }));
el('minAmount').addEventListener('change', (e) => save({ minAmount: Math.max(0, Number(e.target.value) || 0) }));

// Update the label live while dragging, but only write to storage when released.
el('percent').addEventListener('input', (e) => {
  settings.percent = Number(e.target.value);
  render();
});
el('percent').addEventListener('change', (e) => save({ percent: Number(e.target.value) }));
