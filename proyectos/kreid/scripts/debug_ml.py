import requests, re, json
h = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', 'Accept': 'text/html', 'Accept-Language': 'es-MX,es'}
r = requests.get('https://listado.mercadolibre.com.mx/corta%C3%B1as-electrico', headers=h, timeout=15)
print('Status:', r.status_code, 'Len:', len(r.text))
# Find script tags with JSON
scripts = re.findall(r'<script[^>]*type="application/json"[^>]*>(.*?)</script>', r.text, re.DOTALL)
print(f'JSON scripts: {len(scripts)}')
for i, s in enumerate(scripts[:3]):
    print(f'Script {i}: {s[:200]}')
# Find window.__PRELOADED
preloaded = re.findall(r'window\.__PRELOADED_STATE__\s*=\s*', r.text)
print(f'PRELOADED found: {len(preloaded)}')
# Check for other patterns
if 'cortau' in r.text.lower():
    print('Has cortau text')
else:
    print('NO cortau text in page!')
    # Print sample
    print('Sample:', r.text[500:1500])
