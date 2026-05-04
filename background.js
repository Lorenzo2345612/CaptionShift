/**
 * background.js — Service Worker
 * Persiste el estado de la extensión entre páginas.
 */

'use strict';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    enabled: false,
    sourceLang: 'es',
    targetLang: 'en',
  });
});

// Sincronizar estado cuando cambia el tab activo
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const stored = await chrome.storage.local.get(['enabled', 'sourceLang', 'targetLang']);
    if (stored.enabled) {
      await chrome.tabs.sendMessage(tabId, {
        type: 'ST_SET_LANGS',
        sourceLang: stored.sourceLang,
        targetLang: stored.targetLang,
      });
    }
  } catch {
    // Tab puede no tener content script (chrome://, etc.)
  }
});
