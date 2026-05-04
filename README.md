# 🌐 Subtitle Translator — Chrome AI Extension

Traduce subtítulos en tiempo real directamente en el navegador, usando la
**Chrome Translator API** nativa (on-device). No envía ningún dato a servidores externos.

---

## ✨ Características

- **On-device & privado**: usa `window.Translator` (Chrome 138+), sin APIs externas
- **Streaming con debounce**: traduce cada cambio de subtítulo con 250ms de debounce
- **Caché inteligente**: frases repetidas no se re-traducen (caché LRU de 200 entradas)
- **Multi-plataforma**: detecta subtítulos en Netflix, YouTube, Disney+, Prime Video, HBO Max, Apple TV+ y cualquier sitio con clases `subtitle`/`caption`/`timedtext`
- **60+ idiomas** soportados vía BCP 47
- **Overlay superpuesto**: muestra la traducción encima del player sin modificar el DOM original

---

## 🖥 Requisitos

| Requisito | Mínimo |
|-----------|--------|
| Chrome versión | 138+ (desktop) |
| Sistema operativo | Windows 10/11, macOS 13+, Linux |
| Espacio libre | ~22 GB (para los modelos) |
| GPU VRAM | > 4 GB |

> ⚠️ La Translator API **no funciona en mobile** (Chrome para Android/iOS).

---

## 🚀 Instalación (modo desarrollador)

1. Descarga o clona este repositorio
2. Abre Chrome → `chrome://extensions/`
3. Activa **"Modo desarrollador"** (toggle superior derecho)
4. Haz clic en **"Cargar descomprimida"** y selecciona la carpeta `subtitle-translator/`
5. La extensión aparece en la barra de herramientas

### Verificar que la API está activa

Abre DevTools (F12) → Console y ejecuta:
```js
console.log('Translator' in self); // debe ser true
```

Si es `false`, habilita la flag en:
```
chrome://flags/#optimization-guide-on-device-model
```
Selecciona **Enabled BypassPerfRequirement** y reinicia Chrome.

---

## 📖 Uso

1. Abre la extensión haciendo clic en su ícono 🌐
2. Selecciona el **idioma origen** (el de los subtítulos del video) y el **idioma destino**
3. Activa el toggle **"Traducir subtítulos"**
4. La primera vez puede descargar el modelo de idioma (~segundos a minutos)
5. Reproduce cualquier video con subtítulos — la traducción aparece superpuesta

### Intercambiar idiomas
Usa el botón **⇄** para invertir origen/destino rápidamente.

---

## 🗂 Estructura del proyecto

```
subtitle-translator/
├── manifest.json       # Configuración de la extensión (MV3)
├── content.js          # Inyectado en páginas: detecta y traduce subtítulos
├── background.js       # Service Worker: persiste estado entre tabs
├── popup.html          # UI del popup
├── popup.js            # Lógica del popup + check de disponibilidad
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## 🔧 Cómo funciona

```
[Página web]
    │
    ▼
[MutationObserver]  ←── Detecta cambios en nodos de subtítulos
    │
    ▼
[Translator API]    ←── window.Translator.create({ sourceLanguage, targetLanguage })
    │                       (on-device, modelo descargado localmente)
    ▼
[Caché LRU]         ←── Evita re-traducir frases repetidas
    │
    ▼
[Overlay DOM]       ←── Muestra la traducción encima del video
```

---

## 🌍 API utilizada

**`window.Translator`** — Chrome Built-in AI Translator API (Chrome 138+)  
Docs: https://developer.chrome.com/docs/ai/translator-api  
MDN: https://developer.mozilla.org/en-US/docs/Web/API/Translator

```js
const translator = await Translator.create({
  sourceLanguage: 'es',
  targetLanguage: 'en',
});
const result = await translator.translate('Hola mundo');
// → "Hello world"
```

---

## 📝 Notas

- Los modelos se cachean en `chrome://on-device-translation-internals/`
- No todos los pares de idiomas están disponibles; el popup indica el estado
- En sitios con CSP estricto puede que el overlay no sea visible; en ese caso revisa la consola

---

## Licencia

MIT
# CaptionShift
