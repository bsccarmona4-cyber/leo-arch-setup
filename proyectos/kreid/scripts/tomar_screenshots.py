#!/usr/bin/env python3
"""Toma screenshots de la tienda KREID y las guarda como PNG"""
from playwright.sync_api import sync_playwright
import os

img_dir = os.path.expanduser("~/kreid/docs/imagenes")
os.makedirs(img_dir, exist_ok=True)

URL = "http://localhost:5173"
SCREENSHOTS = [
    ("homepage-hero.png", 0, "Home - Hero + Featured Products"),
    ("products-section.png", 900, "Products Section"),
    ("testimonials.png", 2800, "Testimonials + FAQ"),
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    
    print(f"🌐 Navegando a {URL}...")
    page.goto(URL, wait_until="networkidle", timeout=15000)
    page.wait_for_timeout(2000)  # Esperar animaciones
    
    for filename, scroll_y, desc in SCREENSHOTS:
        page.evaluate(f"window.scrollTo(0, {scroll_y})")
        page.wait_for_timeout(500)
        path = os.path.join(img_dir, filename)
        page.screenshot(path=path, full_page=False)
        size_kb = os.path.getsize(path) / 1024
        print(f"   📸 {desc}: {filename} ({size_kb:.0f} KB)")
    
    browser.close()

print("\n✅ Screenshots guardados en", img_dir)
