/**
 * content.js — CaptionShift
 *
 * SOPORTE OFICIAL: Netflix únicamente.
 * Otros reproductores (YouTube, Disney+, etc.) no están testeados — el
 * manifest restringe la inyección a *.netflix.com.
 *
 * - Detecta los nodos de texto dentro de los contenedores de subtítulos
 *   de Netflix (.player-timedtext-text-container).
 * - Los vacía al instante para evitar el flash del original.
 * - Traduce todo el texto del bubble en una sola llamada.
 * - Reparte la traducción entre los text nodes originales preservando
 *   los <span> y <br> (layout vertical intacto).
 */

'use strict';

const state = {
  enabled:    false,
  sourceLang: 'es',
  targetLang: 'en',
  translator: null,
  observer:   null,
  cache:      new Map(),
};

// Cada text node recuerda el último contenido que procesamos (original vacío
// o traducción) — así el observer no nos vuelve a disparar para lo mismo.
const seen = new WeakMap();

// Selectores específicos de Netflix.
const SUBTITLE_SELECTORS = [
  '.player-timedtext-text-container',
];

// Devuelve los contenedores hoja (que no contienen a otro contenedor de subtítulo).
function getLeafContainers() {
  const sel = SUBTITLE_SELECTORS.join(',');
  const all = document.querySelectorAll(sel);
  const leaves = [];
  for (const c of all) {
    let isLeaf = true;
    for (const other of all) {
      if (other !== c && c.contains(other)) { isLeaf = false; break; }
    }
    if (isLeaf) leaves.push(c);
  }
  return leaves;
}

function getTextNodesIn(root) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const out = [];
  let n;
  while ((n = w.nextNode())) {
    if (n.textContent.trim()) out.push(n);
  }
  return out;
}

// ── Translator API ────────────────────────────────────────────────────────────

async function initTranslator() {
  state.translator = null;
  state.cache.clear();
  if (!('Translator' in self)) return false;
  try {
    const av = await Translator.availability({ sourceLanguage: state.sourceLang, targetLanguage: state.targetLang });
    if (av === 'unavailable') return false;
    state.translator = await Translator.create({
      sourceLanguage: state.sourceLang,
      targetLanguage: state.targetLang,
    });
    return true;
  } catch { return false; }
}

async function translateText(text) {
  if (!text || !state.translator) return null;
  if (state.cache.has(text)) return state.cache.get(text);
  try {
    const r = await state.translator.translate(text);
    state.cache.set(text, r);
    if (state.cache.size > 200) state.cache.delete(state.cache.keys().next().value);
    return r;
  } catch { return null; }
}

// ── Procesar ──────────────────────────────────────────────────────────────────

let scheduled = false;
function schedule() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => { scheduled = false; processSubtitles(); });
}

function processSubtitles() {
  if (!state.enabled || !state.translator) return;

  for (const container of getLeafContainers()) {
    const nodes = getTextNodesIn(container);
    if (!nodes.length) continue;

    const pending = nodes.filter(n => seen.get(n) !== n.textContent);
    if (!pending.length) continue;

    const originals = pending.map(n => n.textContent);
    const joined = originals.join(' ').trim();
    if (!joined) continue;

    // Vaciar de inmediato — adiós al flash del original
    for (const n of pending) {
      seen.set(n, '');
      n.textContent = '';
    }

    translateText(joined).then(translated => {
      if (!translated) return;
      // Repartir las palabras de la traducción proporcionalmente al
      // tamaño de cada línea original, cortando en espacios.
      const words = translated.split(/\s+/).filter(Boolean);
      const totalLen = originals.reduce((a, b) => a + b.length, 0) || 1;
      let cursor = 0;
      for (let i = 0; i < pending.length; i++) {
        const n = pending[i];
        if (!n.parentNode || n.textContent !== '') continue;
        let chunk;
        if (i === pending.length - 1) {
          chunk = words.slice(cursor).join(' ');
        } else {
          const ratio = originals[i].length / totalLen;
          const take = Math.max(1, Math.round(words.length * ratio));
          chunk = words.slice(cursor, cursor + take).join(' ');
          cursor += take;
        }
        n.textContent = chunk;
        seen.set(n, chunk);
      }
    });
  }
}

// ── Observer ──────────────────────────────────────────────────────────────────

function startObserver() {
  if (state.observer) state.observer.disconnect();
  state.observer = new MutationObserver(schedule);
  state.observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  schedule();
}

function stopObserver() {
  if (state.observer) { state.observer.disconnect(); state.observer = null; }
}

// ── Mensajes ──────────────────────────────────────────────────────────────────

// ── Auto-init desde storage ───────────────────────────────────────────────────
// Sin esto, tras reboot o recarga del tab el content script se queda inerte
// hasta que el usuario vuelva a togglear el popup.
(async () => {
  try {
    const s = await chrome.storage.local.get(['enabled', 'sourceLang', 'targetLang']);
    state.sourceLang = s.sourceLang ?? state.sourceLang;
    state.targetLang = s.targetLang ?? state.targetLang;
    if (s.enabled) {
      state.enabled = true;
      const ok = await initTranslator();
      if (ok) startObserver();
    }
  } catch {}
})();

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    switch (msg.type) {

      case 'ST_TOGGLE':
        state.enabled = msg.enabled;
        if (state.enabled) {
          const ok = await initTranslator();
          if (ok) startObserver();
          sendResponse({ ok });
        } else {
          stopObserver();
          sendResponse({ ok: true });
        }
        break;

      case 'ST_SET_LANGS': {
        const changed = state.sourceLang !== msg.sourceLang || state.targetLang !== msg.targetLang;
        state.sourceLang = msg.sourceLang;
        state.targetLang = msg.targetLang;
        if (state.enabled && changed) {
          stopObserver();
          const ok = await initTranslator();
          if (ok) startObserver();
        }
        sendResponse({ ok: true });
        break;
      }
    }
  })();
  return true;
});
