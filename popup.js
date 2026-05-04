'use strict';

const LANGUAGES = [
  { code: 'af', name: 'Afrikáans' }, { code: 'sq', name: 'Albanés' },
  { code: 'ar', name: 'Árabe' }, { code: 'hy', name: 'Armenio' },
  { code: 'az', name: 'Azerí' }, { code: 'eu', name: 'Euskera' },
  { code: 'be', name: 'Bielorruso' }, { code: 'bn', name: 'Bengalí' },
  { code: 'bs', name: 'Bosnio' }, { code: 'bg', name: 'Búlgaro' },
  { code: 'ca', name: 'Catalán' }, { code: 'zh', name: 'Chino (simplificado)' },
  { code: 'zh-TW', name: 'Chino (tradicional)' }, { code: 'hr', name: 'Croata' },
  { code: 'cs', name: 'Checo' }, { code: 'da', name: 'Danés' },
  { code: 'nl', name: 'Neerlandés' }, { code: 'en', name: 'Inglés' },
  { code: 'et', name: 'Estonio' }, { code: 'fi', name: 'Finlandés' },
  { code: 'fr', name: 'Francés' }, { code: 'gl', name: 'Gallego' },
  { code: 'ka', name: 'Georgiano' }, { code: 'de', name: 'Alemán' },
  { code: 'el', name: 'Griego' }, { code: 'gu', name: 'Gujarati' },
  { code: 'he', name: 'Hebreo' }, { code: 'hi', name: 'Hindi' },
  { code: 'hu', name: 'Húngaro' }, { code: 'is', name: 'Islandés' },
  { code: 'id', name: 'Indonesio' }, { code: 'it', name: 'Italiano' },
  { code: 'ja', name: 'Japonés' }, { code: 'kn', name: 'Kannada' },
  { code: 'kk', name: 'Kazajo' }, { code: 'ko', name: 'Coreano' },
  { code: 'lv', name: 'Letón' }, { code: 'lt', name: 'Lituano' },
  { code: 'mk', name: 'Macedonio' }, { code: 'ms', name: 'Malayo' },
  { code: 'ml', name: 'Malabar' }, { code: 'mr', name: 'Maratí' },
  { code: 'mn', name: 'Mongol' }, { code: 'ne', name: 'Nepalés' },
  { code: 'nb', name: 'Noruego' }, { code: 'fa', name: 'Persa' },
  { code: 'pl', name: 'Polaco' }, { code: 'pt', name: 'Portugués' },
  { code: 'pa', name: 'Panyabí' }, { code: 'ro', name: 'Rumano' },
  { code: 'ru', name: 'Ruso' }, { code: 'sr', name: 'Serbio' },
  { code: 'sk', name: 'Eslovaco' }, { code: 'sl', name: 'Esloveno' },
  { code: 'es', name: 'Español' }, { code: 'sw', name: 'Suajili' },
  { code: 'sv', name: 'Sueco' }, { code: 'tl', name: 'Filipino' },
  { code: 'ta', name: 'Tamil' }, { code: 'te', name: 'Telugu' },
  { code: 'th', name: 'Tailandés' }, { code: 'tr', name: 'Turco' },
  { code: 'uk', name: 'Ucraniano' }, { code: 'ur', name: 'Urdu' },
  { code: 'uz', name: 'Uzbeko' }, { code: 'vi', name: 'Vietnamita' },
];

const toggleEl  = document.getElementById('enabled-toggle');
const toggleSub = document.getElementById('toggle-sub');
const sourceSel = document.getElementById('source-lang');
const targetSel = document.getElementById('target-lang');
const swapBtn   = document.getElementById('swap-btn');
const apiBanner = document.getElementById('api-banner');
const apiText   = document.getElementById('api-status-text');

function populateSelects() {
  LANGUAGES.forEach(({ code, name }) => {
    [sourceSel, targetSel].forEach(sel => {
      const o = document.createElement('option');
      o.value = code; o.textContent = name;
      sel.appendChild(o);
    });
  });
}

function setBanner(type, icon, text) {
  apiBanner.className = `api-banner ${type}`;
  apiBanner.querySelector('.api-banner-icon').textContent = icon;
  apiText.textContent = text;
}

async function checkApi(src, tgt) {
  if (!('Translator' in self)) {
    setBanner('err', '✗', 'Translator API no disponible. Chrome 138+ desktop requerido.');
    return;
  }
  try {
    const av = await Translator.availability({ sourceLanguage: src, targetLanguage: tgt });
    if (av === 'available')         setBanner('ok',   '✓', `Modelo listo · ${src.toUpperCase()} → ${tgt.toUpperCase()}`);
    else if (av === 'downloadable') setBanner('warn', '⬇', `Se descargará al activar · ${src.toUpperCase()} → ${tgt.toUpperCase()}`);
    else                            setBanner('err',  '✗', `Par ${src.toUpperCase()} → ${tgt.toUpperCase()} no soportado`);
  } catch (e) { setBanner('err', '✗', e.message); }
}

async function sendMsg(type, extra = {}) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return null;
    return await chrome.tabs.sendMessage(tab.id, { type, ...extra });
  } catch { return null; }
}

async function init() {
  populateSelects();
  const s = await chrome.storage.local.get(['enabled','sourceLang','targetLang']);

  sourceSel.value = s.sourceLang ?? 'es';
  targetSel.value = s.targetLang ?? 'en';
  toggleEl.checked = s.enabled   ?? false;
  toggleSub.textContent = s.enabled ? 'Activado' : 'Desactivado';

  await checkApi(sourceSel.value, targetSel.value);
}

toggleEl.addEventListener('change', async () => {
  const en = toggleEl.checked;
  toggleSub.textContent = en ? 'Activando…' : 'Desactivado';
  await chrome.storage.local.set({ enabled: en });
  const res = await sendMsg('ST_TOGGLE', { enabled: en });
  toggleSub.textContent = en ? (res?.ok ? 'Activado' : 'Error — recarga la página') : 'Desactivado';
});

async function onLangChange() {
  const src = sourceSel.value, tgt = targetSel.value;
  if (src === tgt) { setBanner('warn', '⚠', 'Los idiomas no pueden ser iguales'); return; }
  await chrome.storage.local.set({ sourceLang: src, targetLang: tgt });
  await sendMsg('ST_SET_LANGS', { sourceLang: src, targetLang: tgt });
  await checkApi(src, tgt);
}
sourceSel.addEventListener('change', onLangChange);
targetSel.addEventListener('change', onLangChange);
swapBtn.addEventListener('click', async () => {
  const tmp = sourceSel.value; sourceSel.value = targetSel.value; targetSel.value = tmp;
  await onLangChange();
});

init();
