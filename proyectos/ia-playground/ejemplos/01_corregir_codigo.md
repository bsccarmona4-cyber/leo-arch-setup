# Ejemplo: Corrección de código Python

Copia este ejemplo, prueba, y guarda el resultado en `resultados/`.

---

## 🎭 Rol
Eres un desarrollador senior de Python experto en buenas prácticas y rendimiento.

## 🎯 Objetivo
Revisar el siguiente código, encontrar bugs y mejorarlo.

## 📥 Contexto
Es un script para procesar listas de transacciones y calcular balance por categoría.

## 📤 Entrada
```python
def balance(data):
    t = {}
    for i in data:
        if i['cat'] not in t:
            t[i['cat']] = 0
        t[i['cat']] += i['amount']
    return t
```

## 🖊️ Instrucciones
1. Identifica problemas (nombres, mutabilidad, eficiencia)
2. Sugiere mejoras claras y por qué
3. Muestra versión mejorada

## 📐 Formato de salida
- **Bugs:** lista breve
- **Mejoras:** lista con razón
- **Código mejorado:** bloque de código

## 🚫 Restricciones
- Respuesta en español
- No uses dependencias externas en la solución

## ✅ Criterios de éxito
- Código mejorado usa type hints y nombres descriptivos
- Explicación concisa
