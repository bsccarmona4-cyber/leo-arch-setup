import requests, re; h = {'User-Agent': 'Mozilla/5.0'}; r = requests.get('https://listado.mercadolibre.com.mx/cortaunas-electrico_OrderId_PRICE_NoIndex_True', headers=h, timeout=10); prices = re.findall(r'price__\w+">\$(\d[\d,]*)<', r.text)
titles = re.findall(r'alt="([^"]{10,80})"', r.text)
for i in range(min(5, len(prices))): t = titles[i] if i < len(titles) else '?'; print(f'{t[:60]} | ${prices[i].replace(",","")} MXN')
