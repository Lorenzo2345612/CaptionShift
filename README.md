# CaptionShift

Extensión de Chrome que traduce los subtítulos de cualquier reproductor de
video **en sus propios nodos del DOM**, usando la **Chrome Translator API**
nativa (on-device). Sin servidores, sin tracking.

---

## Cómo funciona

1. Un `MutationObserver` vigila los contenedores de subtítulos (Netflix,
   YouTube, Disney+, Prime Video, etc.).
2. Al detectar texto nuevo, **vacía los text nodes al instante** para evitar
   el flash del original.
3. Junta el texto del bubble y lo traduce en una sola llamada con
   `window.Translator` (mejor contexto).
4. Reparte la traducción proporcionalmente entre los text nodes originales,
   cortando en espacios. Los `<span>` anidados y los `<br>` quedan intactos —
   la traducción se ve idéntica al subtítulo original (posición, fuente,
   color, layout vertical).

Resultado: el subtítulo no se duplica, no flota encima, no rompe estilos —
es el mismo subtítulo del reproductor con el texto traducido.

---

## Requisitos

| Requisito | Mínimo |
|-----------|--------|
| Chrome | 138+ desktop |
| OS | Windows 10/11, macOS 13+, Linux |
| Espacio | ~22 GB para los modelos de idioma |
| GPU VRAM | > 4 GB |

La Translator API no funciona en Chrome móvil.

---

## Instalación (modo desarrollador)

1. Clona el repo.
2. `chrome://extensions/` → activa **Modo desarrollador**.
3. **Cargar descomprimida** → selecciona la carpeta del proyecto.
4. La extensión aparece en la barra de herramientas.

Verificar la API en DevTools:
```js
console.log('Translator' in self); // true
```

Si es `false`, en `chrome://flags/#optimization-guide-on-device-model`
selecciona **Enabled BypassPerfRequirement** y reinicia Chrome.

---

## Uso

1. Click en el ícono de la extensión.
2. Elige idioma origen y destino.
3. Activa el toggle. La primera vez puede descargar el modelo.
4. Reproduce cualquier video con subtítulos.

El toggle persiste entre sesiones — al reabrir Chrome o tras reboot, la
extensión se reactiva sola en cada tab leyendo `chrome.storage.local`.

---

## Estructura

```
.
├── manifest.json   # MV3, permisos: activeTab, storage
├── content.js      # Observer + reemplazo de text nodes + Translator API
├── background.js   # Service worker: sync de idiomas al cambiar de tab
├── popup.html      # UI: toggle + selectores de idioma + estado API
├── popup.js
└── icons/
```

---

## Detalles técnicos

- **Detección**: selectores que cubren `.player-timedtext`, `.ytp-caption-segment`,
  `.caption-window`, y patrones genéricos `[class*="subtitle|caption|timedtext"]`.
  Se filtran a "leaf containers" para no procesar dos veces estructuras anidadas.
- **Coalescing**: un `queueMicrotask` agrupa la ráfaga de mutaciones de una sola
  creación de bubble en un único `processSubtitles()` (sin retardo perceptible).
- **Anti-loop**: un `WeakMap` por text node guarda lo último que escribimos;
  el observer dispara tras nuestros cambios y los ignora.
- **Anti-race**: si entre vaciar y escribir la traducción el reproductor
  rescribe el nodo, abortamos esa escritura.
- **Caché**: `Map` LRU de 200 entradas para frases repetidas.
- **Auto-init**: el content script lee `chrome.storage.local` al cargar y
  se activa solo si `enabled === true`.

---

## API

[`window.Translator`](https://developer.chrome.com/docs/ai/translator-api) — Chrome 138+.

```js
const t = await Translator.create({ sourceLanguage: 'es', targetLanguage: 'en' });
await t.translate('Hola mundo'); // → "Hello world"
```

Modelos cacheados en `chrome://on-device-translation-internals/`.

---

## Licencia

MIT
