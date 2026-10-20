#!/usr/bin/env python3
"""
Prepare the Scintillart portal depth layers from the collage photograph.

Honest scope: the collage only exists as ONE flattened photograph. This script
does not invent image detail. It
  1. rectifies the photographed kraft paper (perspective correction),
  2. applies the masks in art-source/masks/ (machine-assisted cut-outs:
     hand-traced polygons refined with OpenCV GrabCut),
  3. exports each masked region as a tightly cropped, transparent WebP whose
     position is recorded in normalised collage coordinates, so every fragment
     lines up exactly with the original composition,
  4. fills the area of each fragment that is covered by a higher fragment with a
     dark, heavily blurred "recess" tone (derived from the surrounding pixels, no
     invented detail). When the stack separates, gaps read as shadowed hollows
     behind raised paper, instead of showing the same cut-out twice,
  5. writes public/portal/manifest.json, read by the PortalScene.

Masks can be refined by hand in any image editor (white = keep) and this script
re-run. When genuine photographed/scanned cut-outs exist, replace the masks or
the exported WebPs directly. See README "Artwork assets".

Usage:  python3 scripts/prepare_portal_layers.py
Needs:  pip install opencv-python-headless numpy pillow
"""
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art-source" / "collage-photo-original.jpg"
MASKS = ROOT / "art-source" / "masks"
OUT = ROOT / "public" / "portal"

# Corners of the kraft sheet in the original photo (TL, TR, BR, BL), measured by hand.
PHOTO_CORNERS = [[44, 365], [1087, 367], [1059, 1717], [65, 1715]]
SHEET_W, SHEET_H, MARGIN = 1020, 1350, 24  # rectified sheet size + margin for handmade edges

# Back to front. depth = distance in front of the paper, in units of collage height.
LAYERS = [
    ("flowers", 0.030, "Floral field"),
    ("roof", 0.050, "Foil roof and geometric star"),
    ("foil", 0.085, "Holographic panel"),
    ("owl", 0.100, "Owl"),
    ("doorway", 0.125, "Architectural doorway"),
    ("coils", 0.160, "Silver coils"),
    ("crystal", 0.200, "Crystal"),
]
# Layers whose material is reflective: the shader adds a restrained moving highlight.
REFLECTIVE = {"roof": 0.55, "foil": 1.0, "coils": 0.45, "crystal": 0.35}

# Portal geometry in rectified pixel coordinates (measured on the doorway image).
APERTURE = {"cx": 538, "cy": 750, "rx": 44, "ry": 75}         # the mirrored egg at the end of the corridor
ARCH = {"x0": 480, "x1": 598, "top": 640, "bottom": 838}      # innermost pointed arch around it

SCALES = {"": 1.0, "-sm": 0.5}


def rectify():
    im = cv2.imread(str(SRC))
    dst = np.float32([[MARGIN, MARGIN], [MARGIN + SHEET_W, MARGIN],
                      [MARGIN + SHEET_W, MARGIN + SHEET_H], [MARGIN, MARGIN + SHEET_H]])
    P = cv2.getPerspectiveTransform(np.float32(PHOTO_CORNERS), dst)
    size = (SHEET_W + 2 * MARGIN, SHEET_H + 2 * MARGIN)
    return cv2.warpPerspective(im, P, size, flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE)


def feather(mask):
    # 1px anti-aliased edge so cut-paper borders don't alias when scaled in WebGL.
    return cv2.GaussianBlur(mask, (3, 3), 0)


def recess_fill(rgb, region):
    """Replace `region` with a dark, very soft tone taken from the surroundings."""
    inner = cv2.erode(region, np.ones((11, 11), np.uint8))  # keep a margin under the upper layer's edge
    soft = cv2.GaussianBlur(inner, (0, 0), 3).astype(np.float32)[..., None] / 255.0
    tone = cv2.GaussianBlur(rgb, (0, 0), 28).astype(np.float32) * 0.46
    return (rgb.astype(np.float32) * (1 - soft) + tone * soft).astype(np.uint8)


def save_rgba(rgb, alpha, path, scale, quality=86):
    rgba = np.dstack([cv2.cvtColor(rgb, cv2.COLOR_BGR2RGB), alpha])
    im = Image.fromarray(rgba, "RGBA")
    if scale != 1.0:
        im = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS)
    im.save(path, "WEBP", quality=quality, method=6)
    return im.size


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    rect = rectify()
    H, W = rect.shape[:2]
    paper = cv2.imread(str(MASKS / "paper.png"), 0)

    manifest = {
        "width": W, "height": H,
        "aperture": {k: v / (W if k in ("cx", "rx") else H) for k, v in APERTURE.items()},
        "arch": {"x0": ARCH["x0"] / W, "x1": ARCH["x1"] / W, "top": ARCH["top"] / H, "bottom": ARCH["bottom"] / H},
        "layers": [],
    }

    masks = {}
    for name, _, _ in LAYERS:
        masks[name] = cv2.bitwise_and(cv2.imread(str(MASKS / f"{name}.png"), 0), paper)
    order = [name for name, _, _ in LAYERS]

    def covered_by_above(index):
        out = np.zeros((H, W), np.uint8)
        for upper in order[index + 1:] if index >= 0 else order:
            out = cv2.bitwise_or(out, masks[upper])
        return out

    # Untouched composite: the static fallback image and <img> alternative.
    alpha = feather(paper)
    for suffix, sc in SCALES.items():
        save_rgba(rect, alpha, OUT / f"collage{suffix}.webp", sc, quality=84)

    # Kraft ground for the depth scene: every area covered by a fragment becomes a recess.
    paper_rgb = recess_fill(rect, cv2.bitwise_and(covered_by_above(-1), paper))
    for suffix, sc in SCALES.items():
        save_rgba(paper_rgb, alpha, OUT / f"paper{suffix}.webp", sc, quality=84)
    manifest["layers"].append({
        "id": "paper", "label": "Kraft paper ground", "depth": 0.0,
        "x": 0, "y": 0, "w": 1, "h": 1, "src": "paper", "reflect": 0, "shadow": None,
    })

    pad = 4
    for index, (name, depth, label) in enumerate(LAYERS):
        m = masks[name]
        layer_rgb = recess_fill(rect, cv2.bitwise_and(covered_by_above(index), m))
        ys, xs = np.where(m > 0)
        x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, W - 1)
        y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, H - 1)
        crop_a = feather(m)[y0:y1 + 1, x0:x1 + 1]
        crop = layer_rgb[y0:y1 + 1, x0:x1 + 1]
        for suffix, sc in SCALES.items():
            save_rgba(crop, crop_a, OUT / f"{name}{suffix}.webp", sc)

        # Soft contact shadow: blurred silhouette, quarter resolution, padded for blur.
        sp = 48
        sh = np.zeros((y1 - y0 + 1 + 2 * sp, x1 - x0 + 1 + 2 * sp), np.uint8)
        sh[sp:-sp, sp:-sp] = m[y0:y1 + 1, x0:x1 + 1]
        sh = cv2.GaussianBlur(sh, (0, 0), 14)
        sh_small = cv2.resize(sh, (sh.shape[1] // 4, sh.shape[0] // 4), interpolation=cv2.INTER_AREA)
        Image.fromarray(np.dstack([np.zeros_like(sh_small)] * 3 + [sh_small]), "RGBA").save(
            OUT / f"{name}-shadow.webp", "WEBP", quality=70)

        manifest["layers"].append({
            "id": name, "label": label, "depth": depth,
            "x": x0 / W, "y": y0 / H, "w": (x1 - x0 + 1) / W, "h": (y1 - y0 + 1) / H,
            "src": name, "reflect": REFLECTIVE.get(name, 0),
            "shadow": {"x": (x0 - sp) / W, "y": (y0 - sp) / H,
                       "w": (x1 - x0 + 1 + 2 * sp) / W, "h": (y1 - y0 + 1 + 2 * sp) / H},
        })

    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2))
    print("wrote", OUT)


if __name__ == "__main__":
    main()
