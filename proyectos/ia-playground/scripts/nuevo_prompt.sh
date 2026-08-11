#!/usr/bin/env bash
# Crea un prompt nuevo desde la plantilla base.
# Uso: ./scripts/nuevo_prompt.sh titulo_sin_espacios

set -euo pipefail

BASE=~/ia-playground
PLANTILLA="$BASE/plantillas/00_prompt_base.md"
PROMPTS="$BASE/prompts"

if [ $# -eq 0 ]; then
  echo "Uso: $0 nombre_del_prompt"
  echo "Ejemplo: $0 resumir_notas"
  exit 1
fi

NOMBRE="$1"
ARCHIVO="$PROMPTS/${NOMBRE}.md"

if [ -f "$ARCHIVO" ]; then
  echo "⚠️  Ya existe: $ARCHIVO"
  exit 1
fi

cp "$PLANTILLA" "$ARCHIVO"
echo "✅ Prompt creado: $ARCHIVO"
echo "   Ábrelo, rellena las secciones y pruébalo."
