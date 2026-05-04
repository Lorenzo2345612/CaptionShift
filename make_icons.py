"""
Genera los iconos de la extensión a partir del logo fuente.
Quita el fondo navy y exporta icon{16,48,128}.png en icons/.

Uso:
    python make_icons.py
"""

from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).parent
SRC = ROOT / "lucid-origin_Prompt_principal_recomendado_Minimalist_app_icon_for_CaptionShift_a_Chrome_exten-0.jpg"
OUT = ROOT / "icons"
SIZES = [16, 48, 128]

# Tolerancia para considerar un pixel como "fondo" (distancia RGB euclidiana).
BG_LOW = 25    # < esto: 100% transparente
BG_HIGH = 55   # > esto: 100% opaco; en medio: alpha proporcional (anti-alias)


def remove_background(img: Image.Image) -> Image.Image:
    arr = np.array(img.convert("RGBA"))
    h, w = arr.shape[:2]
    # Promedio de las 4 esquinas como color de fondo (más robusto que un solo pixel).
    corners = np.stack([arr[2, 2, :3], arr[2, w-3, :3], arr[h-3, 2, :3], arr[h-3, w-3, :3]])
    bg = corners.mean(axis=0)

    diff = arr[..., :3].astype(np.float32) - bg
    dist = np.sqrt((diff ** 2).sum(axis=2))

    alpha = np.clip((dist - BG_LOW) / (BG_HIGH - BG_LOW), 0, 1) * 255
    arr[..., 3] = alpha.astype(np.uint8)

    mask = arr[..., 3] > 10
    ys, xs = np.where(mask)
    top, bottom = int(ys.min()), int(ys.max())
    left, right = int(xs.min()), int(xs.max())
    return Image.fromarray(arr[top:bottom + 1, left:right + 1])


def main() -> None:
    OUT.mkdir(exist_ok=True)
    icon = remove_background(Image.open(SRC))
    for size in SIZES:
        icon.resize((size, size), Image.LANCZOS).save(OUT / f"icon{size}.png")
        print(f"  generado icon{size}.png")


if __name__ == "__main__":
    main()
