#!/usr/bin/env python3
"""Descarga imágenes libres de Wikimedia Commons para la página."""
import json, os, subprocess, urllib.parse

OUT = "/home/leo/final-unidad-1/imagenes/web"
os.makedirs(OUT, exist_ok=True)

FILES = [
    "File:Compression-artifacts.jpg",
    "File:JPEG compression Example.jpg",
    "File:Test - image size comparison (Jpeg vs Png vs Jpeg XL vs Heic).png",
    "File:Nopngs.gif",
    "File:Vector vs raster.png",
    "File:Frontal lobe animation.gif",
    "File:Image formats by scope.svg",
]

titles = "|".join(urllib.parse.quote(t) for t in FILES)
url = f"https://commons.wikimedia.org/w/api.php?action=query&titles={titles}&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1400&format=json"
res = subprocess.run(["curl", "-s", url], capture_output=True, text=True)
data = json.loads(res.stdout)

items = []
for p in data["query"]["pages"].values():
    ii = p.get("imageinfo", [{}])[0]
    items.append({
        "title": p["title"],
        "w": ii.get("width"), "h": ii.get("height"),
        "mime": ii.get("mime"),
        "url": ii.get("thumburl") or ii.get("url"),
        "orig": ii.get("url"),
    })

for it in items:
    name = it["title"].replace("File:", "").replace(" ", "_")
    ext = os.path.splitext(name)[1].lower()
    target = os.path.join(OUT, name)
    # Evitar thumbnails gigantes: si la original es < 2MB y razonable, bajar original
    print(f"{it['title']} | {it['w']}x{it['h']} | {it['mime']} | {it['url']}")
    r = subprocess.run(["curl", "-sL", "-o", target, it["url"]], capture_output=True)
    size = os.path.getsize(target) if os.path.exists(target) else 0
    print(f"   -> {target} ({size:,} bytes)")
