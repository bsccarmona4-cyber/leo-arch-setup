import type { AnalysisResult } from '@/types'
import { MEXICAN_BRANDS } from '@/lib/analyze/brands-mx'

// ── Verdict colors & config ──────────────────────────────────────────────
const VERDICT_CONFIG = {
  fraud: {
    emoji: '🔴',
    label: 'FRAUDE DETECTADO',
    color: '#ef4444',
    bgColor: '#1a0a0a',
    borderColor: '#7f1d1d',
    description: 'Este mensaje es fraudulento. NO des ningún dato personal.',
  },
  suspicious: {
    emoji: '🟡',
    label: 'SOSPECHOSO',
    color: '#eab308',
    bgColor: '#1a1a0a',
    borderColor: '#713f12',
    description: 'Este mensaje tiene señales de alerta. Ten precaución.',
  },
  safe: {
    emoji: '🟢',
    label: 'SEGURO',
    color: '#22c55e',
    bgColor: '#0a1a0a',
    borderColor: '#166534',
    description: 'No se detectaron señales de fraude en este mensaje.',
  },
}

// ── Generate HTML email response ─────────────────────────────────────────
export function generateEmailResponse(analysis: AnalysisResult, originalSubject?: string): string {
  const cfg = VERDICT_CONFIG[analysis.verdict] || VERDICT_CONFIG.safe

  // Find official phone
  let officialPhone: string | null = analysis.officialPhone
  if (!officialPhone && analysis.brandSpoofed) {
    const brand = MEXICAN_BRANDS.find(b => b.name === analysis.brandSpoofed)
    officialPhone = brand?.phone ?? null
  }

  // Build signal list HTML
  const signalItems = analysis.signals
    .map(s => `<tr><td style="padding:4px 8px;color:#9ca3af;font-size:13px;">• ${escapeHtml(s.detail)}</td></tr>`)
    .join('')

  // Build tips
  const tipsHtml = analysis.verdict !== 'safe' ? `
    <div style="margin-top:20px;padding:16px;border-radius:8px;background:#1e1b2e;border:1px solid #3b3363;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#c4b5fd;">💡 ¿Qué hacer?</p>
      <ul style="margin:0;padding-left:20px;color:#9ca3af;font-size:13px;line-height:1.6;">
        <li>No des datos personales ni bancarios</li>
        <li>No hagas clic en ningún link del correo original</li>
        <li>Elimina el correo sospechoso</li>
        ${officialPhone ? `<li>Si tienes dudas, llama directamente a <strong style="color:#e2e8f0;">${escapeHtml(analysis.brandSpoofed || '')}</strong>: <strong style="color:#a78bfa;">${escapeHtml(officialPhone)}</strong></li>` : ''}
        <li>Ningún banco o institución legítima te pedirá contraseñas por correo</li>
      </ul>
    </div>
  ` : ''

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Guardián — Resultado de Análisis</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:580px;margin:0 auto;padding:20px;">

    <!-- Header -->
    <div style="text-align:center;padding:24px 0 16px;">
      <div style="display:inline-block;padding:8px 12px;border-radius:12px;background:linear-gradient(135deg,rgba(124,58,237,0.2),rgba(6,182,212,0.2));border:1px solid rgba(124,58,237,0.3);">
        <span style="font-size:24px;">🛡️</span>
        <span style="font-size:18px;font-weight:700;color:#e2e8f0;margin-left:8px;">Guardián</span>
      </div>
      <p style="margin:8px 0 0;font-size:12px;color:#6b7280;letter-spacing:0.5px;">ANTI-FRAUDE DIGITAL</p>
    </div>

    <!-- Verdict Badge -->
    <div style="text-align:center;margin:16px 0;">
      <div style="display:inline-block;padding:10px 24px;border-radius:50px;background:${cfg.bgColor};border:2px solid ${cfg.borderColor};">
        <span style="font-size:20px;">${cfg.emoji}</span>
        <span style="font-size:16px;font-weight:700;color:${cfg.color};margin-left:8px;letter-spacing:1px;">${cfg.label}</span>
      </div>
    </div>

    <!-- Main Card -->
    <div style="background:#111118;border:1px solid #1e1e2e;border-radius:12px;padding:24px;margin:16px 0;">

      <!-- Score -->
      <div style="text-align:center;margin-bottom:20px;">
        <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Score de riesgo</p>
        <p style="margin:4px 0 0;font-size:36px;font-weight:800;color:${cfg.color};">${analysis.score}/100</p>
      </div>

      <!-- Description -->
      <p style="margin:0 0 16px;font-size:14px;color:#d1d5db;line-height:1.6;text-align:center;">
        ${cfg.description}
      </p>

      ${analysis.llmExplanation ? `
      <!-- LLM Explanation -->
      <div style="padding:14px;border-radius:8px;background:#0d0d15;border:1px solid #1e1e2e;margin:16px 0;">
        <p style="margin:0 0 6px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">📝 Análisis detallado</p>
        <p style="margin:0;font-size:13px;color:#d1d5db;line-height:1.5;">${escapeHtml(analysis.llmExplanation)}</p>
      </div>
      ` : ''}

      ${analysis.brandSpoofed ? `
      <!-- Brand spoofed -->
      <div style="padding:12px;border-radius:8px;background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);margin:12px 0;">
        <p style="margin:0;font-size:12px;color:#6b7280;">Marca suplantada</p>
        <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#a78bfa;">${escapeHtml(analysis.brandSpoofed)}</p>
      </div>
      ` : ''}

      ${analysis.threatType ? `
      <div style="padding:12px;border-radius:8px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);margin:12px 0;">
        <p style="margin:0;font-size:12px;color:#6b7280;">Tipo de amenaza</p>
        <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#fca5a5;">${escapeHtml(analysis.threatType)}</p>
      </div>
      ` : ''}

      ${signalItems ? `
      <!-- Signals -->
      <div style="margin:16px 0;">
        <p style="margin:0 0 8px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">⚡ Señales detectadas</p>
        <table style="width:100%;border-collapse:collapse;">${signalItems}</table>
      </div>
      ` : ''}

      ${tipsHtml}

    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:16px 0;border-top:1px solid #1e1e2e;margin-top:8px;">
      <p style="margin:0 0 4px;font-size:11px;color:#4b5563;">
        Guardián Anti-Fraude Digital — Protegiendo familias mexicanas 🇲🇽
      </p>
      <p style="margin:0;font-size:10px;color:#374151;">
        Este análisis es automático. En caso de duda, contacta a tu banco directamente.
      </p>
    </div>

  </div>
</body>
</html>`
}

// ── Plain text version ───────────────────────────────────────────────────
export function generatePlainTextResponse(analysis: AnalysisResult): string {
  const cfg = VERDICT_CONFIG[analysis.verdict] || VERDICT_CONFIG.safe

  let text = `🛡️ GUARDIÁN — RESULTADO DE ANÁLISIS\n\n`
  text += `${cfg.emoji} ${cfg.label}\n`
  text += `Score: ${analysis.score}/100\n\n`
  text += `${cfg.description}\n\n`

  if (analysis.llmExplanation) {
    text += `📝 Análisis: ${analysis.llmExplanation}\n\n`
  }

  if (analysis.brandSpoofed) {
    text += `🏢 Marca suplantada: ${analysis.brandSpoofed}\n`
  }

  if (analysis.threatType) {
    text += `⚠️ Tipo: ${analysis.threatType}\n`
  }

  if (analysis.signals.length > 0) {
    text += `\n⚡ Señales:\n`
    for (const s of analysis.signals) {
      text += `• ${s.detail}\n`
    }
  }

  if (analysis.verdict !== 'safe') {
    text += `\n💡 ¿Qué hacer?\n`
    text += `• No des datos personales ni bancarios\n`
    text += `• Elimina el correo sospechoso\n`
    if (analysis.officialPhone) {
      text += `• Llama a ${analysis.brandSpoofed ?? 'la institución'}: ${analysis.officialPhone}\n`
    }
    text += `• Ningún banco legítimo pide contraseñas por correo\n`
  }

  text += `\n---\nGuardián Anti-Fraude Digital 🇲🇽`
  return text
}

// ── Helper ───────────────────────────────────────────────────────────────
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
