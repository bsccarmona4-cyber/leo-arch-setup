# 🛡️ Seguridad en Arch + Black Arch

## Contexto
Leo usa **Arch Linux** con herramientas de **Black Arch** (pentesting). Tiene automatizaciones y flujos de trabajo en su lap. Esto presenta riesgos específicos.

## Riesgos identificados

| Riesgo | Nivel |
|---|---|
| AUR/PKGBUILD ejecutan código como root sin revisión | 🔴 Alto |
| Mezclar herramientas de pentesting con uso diario | 🟡 Medio |
| Tokens/API keys en scripts de automatización | 🟡 Medio |
| Scripts con sudo sin contraseña | 🔴 Alto |
| Servicios listening en 0.0.0.0 | 🟡 Medio |

## Buenas prácticas para este equipo

- ✅ Separar entornos: Docker para automatizaciones, host para uso diario
- ✅ Tokens en variables de entorno o .env, nunca hardcodeados
- ✅ Cada automatización en su propio contenedor con mínimo privilegio
- ✅ Auditoría periódica con security-guidance de Anthropic
- ✅ No automatizar nada que toque claves SSH, GPG o billeteras
