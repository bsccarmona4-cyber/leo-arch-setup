# 🛡️ Guardián — Demo Script & Test URLs

## URLs para Demostración

### 🟢 URLs Seguras (verifican como legítimas)
```
https://www.walmart.com.mx
https://www.bbva.mx
https://www.liverpool.com.mx
https://www.mercadolibre.com.mx
https://www.sat.gob.mx
https://www.imss.gob.mx
```

### 🟡 URLs Sospechosas (generan alerta media)
```
# Dominios nuevos / genéricos (cambiar según lo que exista al momento)
https://bit.ly/ofertas-walmart-gratis
https://t.co/bbva-verificar
```

### 🔴 URLs de Fraude (para demostración del scoring)
Use estas URLs ficticias para explicar cómo funciona el scoring:

```
# Estas URLs no existen pero ilustran el patrón:
https://walmart-aniversario-gratis.xyz
https://bbva-alertas2024.com
https://liverpool-sorteo-ganaste.top
https://oxxo-despensa-gratis.site
https://sat-devolucion-impuestos.click
```

> ⚠️ Para la demo en vivo, usa la interfaz web en guardian-indol.vercel.app
> pega el URL y muestra el resultado en pantalla.

---

## Script de Demostración (5 minutos)

### 1. Problema (30 seg)
> "En México, los adultos mayores son el grupo más vulnerable a fraudes digitales. Ven un anuncio en Facebook de Walmart regalando despensas, dan clic, y pierden sus ahorros. No tienen manera de verificar."

### 2. Solución (30 seg)
> "Guardián es el intermediario que verifica por ellos. Dos canales que ya usan: WhatsApp y correo electrónico. Cero fricción, cero instalación."

### 3. Demo Web en Vivo (2 min)
1. Abrir `guardian-indol.vercel.app`
2. Pegar URL segura → mostrar veredicto 🟢
3. Pegar URL sospechosa → mostrar veredicto 🟡 con señales
4. Explicar las 6 capas del análisis

### 4. Demo WhatsApp (1 min)
1. Mostrar conversación con el bot
2. Enviar un link → respuesta en <10 segundos
3. Mostrar que el mensaje es simple, claro, para tu abuela

### 5. Dashboard (1 min)
1. Abrir `/dashboard`
2. Mostrar feed en tiempo real
3. Señalar el contador: "X personas protegidas"
4. Marcas más suplantadas
5. Distribución por canal

### 6. Diferenciadores + Modelo (30 seg)
> "A diferencia de antivirus que bloquean amenazas conocidas, Guardián detecta amenazas Zero-Day con IA. Un dominio creado esta mañana que no está en ninguna lista. Y con cada análisis, el sistema se vuelve más inteligente y más barato."

> "Modelo: gratis para el usuario. B2B con bancos que pagan por threat intelligence en tiempo real."

---

## Datos Clave para el Pitch

- **Pipeline:** 6 capas (URL resolver → Score multi-señal → LLM semántico → Fusión → Caché → Respuesta)
- **Score:** Dominio nuevo +40, Suplanta marca +35, PhishTank +50, Sin SSL +20, Pide datos +45, Urgencia +15
- **Seguridad:** Prompt injection defense, SSRF protection, HMAC webhooks, Rate limiting, RLS
- **Stack:** Next.js 16, Supabase, DeepSeek/Groq, Baileys, Vercel
- **Caché:** Si 100 personas mandan el mismo link, solo 1 llamada al LLM
