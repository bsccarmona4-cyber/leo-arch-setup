#!/usr/bin/env python3
"""Consulta read-only: cuenta + créditos de Bloom. No gasta créditos."""
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

URL = "https://www.trybloom.ai/api/mcp"
METHODS = [
    ("bloom_get_account", {}),
    ("bloom_list_workspaces", {}),
    ("bloom_check_credits", {}),
]

for i, (method, params) in enumerate(METHODS, start=1):
    payload = {
        "jsonrpc": "2.0",
        "id": i,
        "method": "tools/call",
        "params": {"name": method, "arguments": params},
    }
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
            if body.startswith("event:") or "data:" in body[:200]:
                # Extraer el JSON de cada línea data:
                lines = [l[5:].strip() for l in body.splitlines() if l.startswith("data:")]
                data = json.loads(lines[-1]) if lines else {}
            else:
                data = json.loads(body)
            result = data.get("result", data)
            print(f"\n=== {method} ===")
            print(json.dumps(result, indent=2, ensure_ascii=False)[:1200])
    except urllib.error.HTTPError as e:
        print(f"\n=== {method} === HTTP {e.code}: {e.read().decode()[:300]}")
    except Exception as e:
        print(f"\n=== {method} === ERROR: {type(e).__name__}: {e}")
