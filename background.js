importScripts('pricing.js');

const { DEFAULTS } = self.PriceSoftener;

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.sync.get(null);
  await chrome.storage.sync.set({ ...DEFAULTS, ...current });
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'toggle-prices') return;
  const { enabled } = await chrome.storage.sync.get({ enabled: DEFAULTS.enabled });
  await chrome.storage.sync.set({ enabled: !enabled });
});
