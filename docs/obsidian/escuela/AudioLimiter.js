/**
 * ═══════════════════════════════════════════════════════════════
 *  AudioLimiter.js — Limitador y Gestor de Prioridad de Audio
 *  Módulo ES6 · Web Audio API
 * ═══════════════════════════════════════════════════════════════
 */

export default class AudioLimiter {
  constructor() {
    this.tier = 'high';
    this.channels = [];
    this.maxActive = 4;
  }

  /**
   * Cambia el Tier y actualiza los volúmenes correspondientes
   * @param {string} tier - 'low' | 'medium' | 'high'
   */
  setTier(tier) {
    this.tier = tier;
    this.update();
  }

  /**
   * Registra un nodo de ganancia activo en el limitador.
   * @param {string} id - Identificador del canal (e.g. 'breathing', 'ambient', 'footstep')
   * @param {number} priority - Prioridad (1 = Máxima, 4 = Mínima)
   * @param {GainNode} gainNode - El nodo de ganancia de Web Audio API
   * @param {number} defaultGain - El volumen original/por defecto
   */
  register(id, priority, gainNode, defaultGain = 1.0) {
    this.unregister(id); // Limpiar si ya existe
    
    this.channels.push({
      id,
      priority,
      gainNode,
      defaultGain
    });
    
    this.update();
  }

  /**
   * Remueve un canal del limitador (e.g. al terminar un efecto)
   * @param {string} id 
   */
  unregister(id) {
    this.channels = this.channels.filter(c => c.id !== id);
    this.update();
  }

  /** Enforce de límites si es TIER LOW */
  update() {
    if (this.tier !== 'low') {
      // Restablecer todas a su ganancia por defecto
      this.channels.forEach(c => {
        if (c.gainNode) {
          try {
            c.gainNode.gain.setValueAtTime(c.defaultGain, 0);
          } catch(e) {}
        }
      });
      return;
    }

    // Ordenar por prioridad (menor número = mayor prioridad)
    const sorted = [...this.channels].sort((a, b) => a.priority - b.priority);

    for (let i = 0; i < sorted.length; i++) {
      const channel = sorted[i];
      if (channel.gainNode) {
        try {
          if (i < this.maxActive) {
            // Canal prioritario: reproduce normal
            channel.gainNode.gain.setValueAtTime(channel.defaultGain, 0);
          } else {
            // "Pausa" virtual silenciando la ganancia
            channel.gainNode.gain.setValueAtTime(0.0, 0);
          }
        } catch(e) {}
      }
    }
  }
}
