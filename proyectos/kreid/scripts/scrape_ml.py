import requests, re, json
h = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', 'Accept': 'text/html', 'Accept-Language': 'es-MX,es'}
def search_ml(query):
    r = requests.get(f'https://listado.mercadolibre.com.mx/{query}', headers=h, timeout=15)
    prices = re.findall(r'\\"price\\":(\d+)', r.text)
    titles = re.findall(r'\\"title\\":\\"([^\\"]+)', r.text)
    solds = re.findall(r'\\"sold_quantity\\":(\d+)', r.text)
    print(f'--- {query} --- Status:{r.status_code} Results:{len(titles)}')
    for i in range(min(8, len(titles))):
        p = prices[i] if i < len(prices) else '?'
        s = solds[i] if i < len(solds) else '?'
        print(f'${p} MXN | {s} vendidos | {titles[i][:80]}')
    print()
search_ml('corta%C3%B1as-electrico')
search_ml('organizador-maquillaje')
search_ml('aspiradora-portatil-inalambrica')
search_ml('almohada-cervical-memory-foam')
search_ml('cepillo-dental-electrico')
search_ml('lampara-led-escritorio')
print('DONE')
