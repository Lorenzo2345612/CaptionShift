# Prompts para generar el logo de CaptionShift en Leonardo.ai

## Prompt principal (recomendado)

```
Minimalist app icon for "CaptionShift", a Chrome extension that translates
subtitles in real-time. Two horizontal subtitle bars stacked: the top bar
in soft white, the bottom bar morphing/shifting into a different language
shown as abstract glyphs, connected by a subtle arrow or transformation
effect. Rounded square icon, 1024x1024, vibrant gradient background
(deep purple to electric blue), flat design, modern, clean geometric
shapes, sharp edges, high contrast, centered composition, no text,
no letters, professional Chrome Web Store style icon, vector look,
crisp edges, soft inner shadow.
```

**Negative prompt:**

```
text, letters, watermark, signature, blurry, photorealistic, 3d render,
cluttered, busy background, multiple icons, low quality, cartoon, mascot
```

---

## Variante 1 — más conceptual (caption + flecha de cambio)

```
App icon depicting two parallel subtitle lines with a circular swap/refresh
arrow between them, symbolizing live translation. Glassmorphism style,
gradient from teal to violet, rounded square 1024x1024, isometric subtle
depth, glowing accent on the arrow, dark navy background with soft glow,
flat 2D vector style, Chrome extension icon aesthetic.
```

---

## Variante 2 — más minimalista (solo símbolo)

```
Logo icon: a stylized speech/caption bracket "[ ]" containing two horizontal
lines of different lengths, the bottom line in a brighter accent color
suggesting transformation. Bold, geometric, single-color silhouette on
gradient background (indigo to cyan). Flat design, rounded corners,
monochromatic with one accent color, modern tech brand identity, 1024x1024.
```

---

## Configuración recomendada en Leonardo.ai

- **Modelo**: Leonardo Phoenix o Flux Dev (mejores para iconos limpios).
- **Preset**: Illustration o Vector. Evitar Photography.
- **Aspect ratio**: 1:1.
- **Variaciones**: generar 4 y elegir la que mejor se vea reducida a 16×16
  (los iconos de Chrome se ven minúsculos en la barra).
- **Refinamiento**: si te gusta una pero quieres ajustes, usa Image-to-Image
  con strength 0.4–0.6.

## Exportar para la extensión

Reemplazar los archivos en `icons/` con tres tamaños PNG:

- `icon16.png` — 16×16
- `icon48.png` — 48×48
- `icon128.png` — 128×128
