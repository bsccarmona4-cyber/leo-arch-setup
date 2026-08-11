# 🛡️ Protocolo de Seguridad para Repos GitHub

## Pasos obligatorios (SIEMPRE antes de clonar)

### 1. Inspección visual
- Revisar nombre, descripción, autor, stars, forks
- Verificar confiabilidad del autor/repo

### 2. Análisis sin clonar
- Examinar archivos clave: package.json, requirements.txt, Makefile
- Identificar patrones sospechosos a simple vista

### 3. Clonación en sandbox
- Clonar en /tmp/
- Usar `tree` para ver estructura
- Usar `analyze` para entender funciones y clases

### 4. Detección de malware
- Buscar: eval(), exec(), base64 decode, ofuscación
- Buscar: curl|bash, wget|sh, chmod +x sospechoso
- Buscar: descargas externas no documentadas
- Buscar: tokens/API keys hardcodeadas

### 5. Reporte
- ✅ Seguro → integrar
- ❌ Sospechoso → reportar y NO ejecutar

## Regla fija
- ❌ **NUNCA** ejecutar curl | bash, wget -O- | sh sin analizar
- ❌ **NUNCA** clonar sin inspeccionar
- ✅ Solo proceder después del protocolo completo
