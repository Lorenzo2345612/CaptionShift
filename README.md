# CaptionShift

Extensión de Chrome que traduce los subtítulos de **Netflix** en tiempo
real, reemplazando el texto **dentro de los mismos nodos del DOM del
reproductor**, usando la **Chrome Translator API** nativa (on-device).
Sin servidores, sin tracking.

> ⚠️ **Soporte oficial: solo Netflix.**
> El manifest restringe la inyección a `*.netflix.com`. Otros reproductores
> (YouTube, Disney+, Prime Video, etc.) no están testeados y no se
> ejecutará ahí.

---

## Cómo funciona

1. Un `MutationObserver` vigila los `.player-timedtext-text-container`
   de Netflix.
2. Al detectar texto nuevo, **vacía los text nodes al instante** para
   evitar el flash del original mientras se traduce.
3. Junta el texto del bubble y lo traduce en una sola llamada a
   `window.Translator` (mejor contexto).
4. Reparte la traducción proporcionalmente entre los text nodes
   originales, cortando en espacios. Los `<span>` anidados y los `<br>`
   quedan intactos — la traducción se ve idéntica al subtítulo de
   Netflix (posición, fuente, color, layout vertical).

Resultado: el subtítulo no se duplica, no flota encima, no rompe estilos.

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

1. Abre Netflix y reproduce algo con subtítulos.
2. Click en el ícono de CaptionShift.
3. Elige idioma origen (el de los subs del video) y destino.
4. Activa el toggle. La primera vez puede descargar el modelo.

El toggle persiste entre sesiones — al reabrir Chrome o tras reboot, la
extensión se reactiva sola en cada tab leyendo `chrome.storage.local`.

---

## Estructura

```
.
├── manifest.json   # MV3, restringido a *.netflix.com
├── content.js      # Observer + reemplazo de text nodes + Translator API
├── background.js   # Service worker: sync de idiomas al cambiar de tab
├── popup.html      # UI: toggle + selectores de idioma + estado API
├── popup.js
└── icons/
```

---

## Detalles técnicos

- **Detección**: solo `.player-timedtext-text-container` (Netflix).
- **Coalescing**: un `queueMicrotask` agrupa la ráfaga de mutaciones de
  una sola creación de bubble en un único `processSubtitles()` (sin
  retardo perceptible).
- **Anti-loop**: un `WeakMap` por text node guarda lo último que
  escribimos; el observer dispara tras nuestros cambios y los ignora.
- **Anti-race**: si entre vaciar y escribir la traducción el reproductor
  rescribe el nodo, abortamos esa escritura.
- **Caché**: `Map` LRU de 200 entradas para frases repetidas.
- **Auto-init**: el content script lee `chrome.storage.local` al cargar
  y se activa solo si `enabled === true` (sobrevive reboots).

---

## Roadmap

- Soporte para otros reproductores (YouTube, Disney+, Prime Video) está
  fuera del alcance actual. Si quieres aportar selectores y testearlos,
  PRs bienvenidos.

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
