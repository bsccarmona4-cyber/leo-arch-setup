#!/usr/bin/env python3
"""Prueba no destructiva: lista las tools de Bloom MCP.
Lee la API key desde ~/.goose-skills/.env-keys (fuera de git).
Uso: python3 scripts/test_bloom_mcp.py
"""
import json
import os
import re
import urllib.request

HOME = os.path.expanduser("~")
KEY_FILE = os.path.join(HOME, ".goose-skills", ".env-keys")

key = None
with open(KEY_FILE) as f:
    for line in f:
        m = re.match(r"^BLOOM_API_KEY=(.+)$", line.strip())
        if m:
            key = m.group(1)
            break

if not key:
    print("ERROR: BLOOM_API_KEY no encontrada en", KEY_FILE)
    raise SystemExit(1)

print(f"Key leída de {KEY_FILE} (primeros 12 chars): {key[:12]}...")

URL = "https://www.trybloom.ai/api/mcp"
payload = {"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}

req = urllib.request.Request(
    URL,
    data=json.dumps(payload).encode(),
    headers={
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
    },
    method="POST",
)

try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        body = resp.read().decode()
        print(f"HTTP {resp.status}")
        if body.startswith("event:") or "data:" in body[:200]:
            print("Respuesta SSE (primeros 5000 chars):")
            print(body[:5000])
        else:
            data = json.loads(body)
            tools = data.get("result", {}).get("tools", [])
            print(f"Tools disponibles: {len(tools)}")
            for t in tools:
                print(f"  - {t.get('name')}: {t.get('description', '')[:90]}")
except urllib.error.HTTPError as e:
    print(f"HTTP {e.code}: {e.read().decode()[:500]}")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
