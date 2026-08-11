"""
orquestador.py — Super-agente de comandos para Cafetería POS.
Inspirado en krei-orquestador: parse → clasificar → despachar → verificar → entregar.

Interpreta lenguaje natural y ejecuta operaciones del POS.
Modo NLU (reglas, offline) + Modo IA (DeepSeek, opcional).
"""

import json
import re
import os
from dataclasses import dataclass, field
from typing import Optional


# ═══════════════════════════════════════════════════════════════════
# Intenciones disponibles
# ═══════════════════════════════════════════════════════════════════

INTENCIONES = {
    "vender": {
        "keywords": ["vender", "venta", "cobrar", "orden", "pedido", "comprar", "nueva venta", "cobro"],
        "agente": "VENDEDOR",
        "desc": "Registrar una venta",
        "ejemplos": ["vender 2 capuchinos", "venta de un latte", "cobrar americano y croissant"],
    },
    "clientes": {
        "keywords": ["cliente", "clientes", "registrar", "cumpleaños", "buscar cliente", "historial"],
        "agente": "CLIENTES",
        "desc": "Gestionar clientes",
        "ejemplos": ["buscar cliente carlos", "clientes cumpleaños", "registrar cliente nuevo"],
    },
    "lealtad": {
        "keywords": ["puntos", "lealtad", "canjear", "promoción", "promociones", "recompensa"],
        "agente": "LEALTAD",
        "desc": "Programa de lealtad",
        "ejemplos": ["consultar puntos de carlos", "canjear café gratis", "ver promociones"],
    },
    "productos": {
        "keywords": ["producto", "productos", "catálogo", "precio", "stock", "categoría", "agregar", "editar"],
        "agente": "PRODUCTOS",
        "desc": "Gestionar productos",
        "ejemplos": ["listar productos", "agregar chai latte", "categoría café"],
    },
    "reportes": {
        "keywords": ["reporte", "reportes", "ranking", "resumen", "ventas hoy", "top", "más vendidos", "dashboard"],
        "agente": "REPORTES",
        "desc": "Consultar reportes",
        "ejemplos": ["reporte de ventas hoy", "ranking de clientes", "productos más vendidos"],
    },
    "sistema": {
        "keywords": ["usuario", "usuarios", "admin", "backup", "respaldo", "salir", "cerrar"],
        "agente": "SISTEMA",
        "desc": "Administrar sistema",
        "ejemplos": ["listar usuarios", "hacer backup"],
    },
    "ayuda": {
        "keywords": ["ayuda", "help", "comandos", "qué puedo hacer", "?", "comando"],
        "agente": "AYUDA",
        "desc": "Mostrar ayuda",
        "ejemplos": ["ayuda", "qué comandos hay"],
    },
}


@dataclass
class Comando:
    """Resultado del parser NLU."""
    intencion: str = ""
    accion: str = ""
    entidades: dict = field(default_factory=dict)
    confianza: float = 0.0
    raw: str = ""


class Orquestador:
    """Super-agente que interpreta comandos y despacha a módulos."""

    def __init__(self, pos_system=None):
        self._system = pos_system  # referencia al POS para ejecutar acciones
        self._use_ia = False
        self._ia_client = None

    # ─── PARSE: interpretación del lenguaje natural ───────────────

    def interpretar(self, texto: str) -> Comando:
        """FASE 1-2: Parse + Clasificar — interpreta el comando y detecta intención."""
        texto = texto.strip().lower()
        if not texto:
            return Comando(intencion="ayuda", accion="mostrar", raw=texto)

        # Si el texto inicia con "/" se trata como comando directo
        if texto.startswith("/"):
            return self._parse_comando_directo(texto)

        # Intentar IA si está disponible
        if self._use_ia and self._ia_client:
            ia_result = self._interpretar_ia(texto)
            if ia_result and ia_result.confianza > 0.7:
                return ia_result

        # Parser NLU por reglas
        return self._parse_nlu(texto)

    def _parse_nlu(self, texto: str) -> Comando:
        """Parser basado en reglas: keywords + patrones."""
        scores = {}

        for intencion, meta in INTENCIONES.items():
            score = 0
            for kw in meta["keywords"]:
                if kw in texto:
                    score += 1 + (0.5 if texto.startswith(kw) else 0)
            if score > 0:
                scores[intencion] = score

        if not scores:
            return Comando(
                intencion="desconocido",
                accion="preguntar",
                entidades={"mensaje": texto},
                confianza=0.0,
                raw=texto,
            )

        # La intención con mayor score gana
        mejor = max(scores, key=scores.get)
        max_score = scores[mejor]
        confianza = min(max_score / 3.0, 0.9)

        cmd = Comando(intencion=mejor, confianza=confianza, raw=texto)
        cmd.entidades = self._extraer_entidades(texto, mejor)
        cmd.accion = self._detectar_accion(texto, mejor)
        return cmd

    def _extraer_entidades(self, texto: str, intencion: str) -> dict:
        """Extrae entidades del texto (números, nombres, fechas)."""
        ent = {}

        # Cantidades
        nums = re.findall(r"(\d+)\s*(?:x\s*)?(capuchino|latte|mocha|frappé|croissant|muffin|americano|espresso|sandwich|té|jugo|agua|chocolate|panini|ensalada|galleta|chai|smoothie)", texto)
        if nums:
            ent["productos"] = [{"cantidad": int(n), "nombre": p} for n, p in nums]

        # IDs
        ids = re.findall(r"(?:id|cliente|#)\s*(\d+)", texto)
        if ids:
            ent["id_cliente"] = int(ids[0])

        # Nombres de cliente
        nombres = re.findall(r"(?:cliente|de)\s+(\w+)", texto)
        if nombres:
            ent["nombre_cliente"] = nombres[0]

        # Fechas
        fechas = re.findall(r"(\d{4}-\d{2}-\d{2})", texto)
        if fechas:
            ent["fecha"] = fechas[0]

        # Categorías
        categorias = ["café", "té", "bebida fría", "bebida caliente", "panadería", "alimentos"]
        for cat in categorias:
            if cat in texto:
                ent["categoria"] = cat.capitalize()
                break

        # Período (hoy, ayer, semana, mes)
        if "hoy" in texto:
            ent["periodo"] = "hoy"
        elif "ayer" in texto:
            ent["periodo"] = "ayer"
        elif "semana" in texto:
            ent["periodo"] = "semana"
        elif "mes" in texto:
            ent["periodo"] = "mes"

        return ent

    def _detectar_accion(self, texto: str, intencion: str) -> str:
        """Determina la acción concreta dentro de la intención."""
        acciones = {
            "vender": [("nueva", "nueva_venta"), ("venta", "nueva_venta")],
            "clientes": [("buscar", "buscar"), ("registrar", "registrar"), ("historial", "historial"),
                         ("cumpleaños", "cumpleaños"), ("listar", "listar"), ("editar", "editar")],
            "lealtad": [("consultar", "consultar"), ("canjear", "canjear"), ("ver", "listar"),
                        ("promociones", "listar"), ("crear", "crear")],
            "productos": [("listar", "listar"), ("buscar", "buscar"), ("agregar", "agregar"),
                          ("editar", "editar"), ("categoría", "por_categoria")],
            "reportes": [("día", "ventas_dia"), ("hoy", "ventas_dia"), ("ranking", "ranking"),
                         ("resumen", "resumen"), ("top", "mas_vendidos"),
                         ("más vendidos", "mas_vendidos"), ("periodo", "ventas_periodo")],
            "sistema": [("usuario", "usuarios"), ("backup", "backup"), ("respaldo", "backup")],
            "ayuda": [("mostrar", "mostrar")],
        }

        for accion, keywords in acciones.get(intencion, []):
            for kw in keywords:
                if kw in texto:
                    return accion

        return "listar"  # default

    def _parse_comando_directo(self, texto: str) -> Comando:
        """Comandos con /: /venta, /reporte, /puntos, /productos, /clientes, /salir, /help."""
        mapa = {
            "/venta": "vender", "/vender": "vender", "/v": "vender",
            "/cliente": "clientes", "/clientes": "clientes", "/c": "clientes",
            "/puntos": "lealtad", "/lealtad": "lealtad", "/p": "lealtad",
            "/producto": "productos", "/productos": "productos", "/prod": "productos",
            "/reporte": "reportes", "/reportes": "reportes", "/r": "reportes",
            "/salir": "sistema", "/exit": "sistema", "/q": "sistema",
            "/help": "ayuda", "/ayuda": "ayuda", "/h": "ayuda", "/?": "ayuda",
            "/backup": "sistema", "/usuarios": "sistema",
        }
        partes = texto.split(maxsplit=1)
        cmd = partes[0]
        resto = partes[1] if len(partes) > 1 else ""

        intencion = mapa.get(cmd, "ayuda")
        c = Comando(intencion=intencion, accion="directo", raw=texto,
                    entidades={"comando": cmd, "resto": resto}, confianza=1.0)

        if resto:
            c.entidades.update(self._extraer_entidades(resto, intencion))
        return c

    # ─── IA (opcional) ─────────────────────────────────────────────

    def _interpretar_ia(self, texto: str) -> Optional[Comando]:
        """Usa DeepSeek API para interpretar el comando en lenguaje natural."""
        try:
            from config import get_config
            cfg = get_config()
            if not cfg.deepseek_api_key:
                return None

            import httpx
            r = httpx.post(
                "https://api.deepseek.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {cfg.deepseek_api_key}"},
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "system", "content": _IA_SYSTEM_PROMPT},
                        {"role": "user", "content": texto},
                    ],
                    "temperature": 0.0,
                    "max_tokens": 200,
                },
                timeout=10,
            )
            data = r.json()
            content = data["choices"][0]["message"]["content"]

            # Extraer JSON de la respuesta
            m = re.search(r"\{.*\}", content, re.DOTALL)
            if m:
                parsed = json.loads(m.group())
                return Comando(
                    intencion=parsed.get("intencion", ""),
                    accion=parsed.get("accion", ""),
                    entidades=parsed.get("entidades", {}),
                    confianza=parsed.get("confianza", 0.8),
                    raw=texto,
                )
        except Exception:
            pass
        return None

    def activar_ia(self):
        """Activa el modo asistente con DeepSeek."""
        from config import get_config
        cfg = get_config()
        if cfg.deepseek_api_key:
            self._use_ia = True
            return True
        return False

    # ─── FEEDBACK ───────────────────────────────────────────────────

    def resumen_comando(self, cmd: Comando) -> str:
        """Genera un resumen legible del comando interpretado."""
        agente = INTENCIONES.get(cmd.intencion, {}).get("agente", "?")
        return (
            f"[{agente}] {cmd.intencion} → {cmd.accion} "
            f"(confianza: {cmd.confianza:.0%})"
        )


_IA_SYSTEM_PROMPT = """Eres un intérprete de comandos para un sistema POS de cafetería.
Tu trabajo es analizar el mensaje del usuario y devolver SOLO un JSON con esta estructura:

{
  "intencion": "vender|clientes|lealtad|productos|reportes|sistema|ayuda|desconocido",
  "accion": "acción concreta dentro de la intención",
  "entidades": {
    "productos": [{"cantidad": int, "nombre": "string"}],
    "id_cliente": int | null,
    "nombre_cliente": "string" | null,
    "fecha": "YYYY-MM-DD" | null,
    "categoria": "string" | null,
    "periodo": "hoy|ayer|semana|mes" | null
  },
  "confianza": 0.0-1.0
}

Intenciones disponibles:
- vender: registrar venta, cobrar, orden, pedido
- clientes: buscar, registrar, editar, historial, cumpleaños
- lealtad: puntos, canjear, promociones, recompensas
- productos: listar, buscar, agregar, editar, categorías, precios
- reportes: ventas del día, ranking, resumen, más vendidos
- sistema: usuarios, backup, cerrar sesión
- ayuda: comandos disponibles

Responde ÚNICAMENTE con el JSON, sin explicaciones."""
