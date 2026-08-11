/**
 * ═══════════════════════════════════════════════════════════════
 *  FearEngine — Sistema de miedo para juegos de terror
 *  Clase ES6 · Lógica pura · Sin dependencias de Three.js
 * ═══════════════════════════════════════════════════════════════
 *
 *  Tasas de miedo (por segundo):
 *    ▲ +0.02  jugador quieto (idle)
 *    ▲ +0.05  mirando directamente al monstruo
 *    ▲ +0.01  en zona sin luz
 *    ▼ −0.01  jugador en movimiento
 *    ▼ −0.03  cerca de fuente de luz
 *
 *  API pública:
 *    getFear()                        → float 0.0–1.0
 *    onFearThreshold(value, callback) → this
 *    on(event, callback)              → this   (EventEmitter)
 *    off(event, callback)             → this
 *
 *  Eventos emitidos:
 *    'fearChanged'      → (currentFear)
 *    'thresholdCrossed' → ({ threshold, fear })
 *    'stateChanged'     → ({ property, value })
 *    'maxFear'          → ()
 *    'noFear'           → ()
 *    'reset'            → ()
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────
//  EventEmitter ligero
// ─────────────────────────────────────────────────────────────

class EventEmitter {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._listeners = new Map();
  }

  /**
   * Suscribe un callback a un evento.
   * @param {string} event
   * @param {Function} callback
   * @returns {this}
   */
  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);
    return this;
  }

  /**
   * Suscribe un callback que se ejecuta solo una vez.
   * @param {string} event
   * @param {Function} callback
   * @returns {this}
   */
  once(event, callback) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      callback.apply(this, args);
    };
    wrapper._original = callback;
    return this.on(event, wrapper);
  }

  /**
   * Elimina un callback de un evento.
   * @param {string} event
   * @param {Function} callback
   * @returns {this}
   */
  off(event, callback) {
    const listeners = this._listeners.get(event);
    if (!listeners) return this;

    listeners.delete(callback);
    // También buscar wrappers de once()
    for (const fn of listeners) {
      if (fn._original === callback) {
        listeners.delete(fn);
        break;
      }
    }
    return this;
  }

  /**
   * Elimina todos los listeners de un evento (o todos si no se pasa evento).
   * @param {string} [event]
   * @returns {this}
   */
  removeAllListeners(event) {
    if (event) {
      this._listeners.delete(event);
    } else {
      this._listeners.clear();
    }
    return this;
  }

  /**
   * Emite un evento con los argumentos dados.
   * @param {string} event
   * @param  {...any} args
   * @returns {this}
   */
  emit(event, ...args) {
    const listeners = this._listeners.get(event);
    if (!listeners || listeners.size === 0) return this;

    for (const callback of [...listeners]) {
      callback(...args);
    }
    return this;
  }

  /**
   * Devuelve la cantidad de listeners para un evento.
   * @param {string} event
   * @returns {number}
   */
  listenerCount(event) {
    const listeners = this._listeners.get(event);
    return listeners ? listeners.size : 0;
  }
}

// ─────────────────────────────────────────────────────────────
//  FearEngine
// ─────────────────────────────────────────────────────────────

class FearEngine extends EventEmitter {
  /**
   * @param {Object} [config]
   * @param {number} [config.idleRate=0.02]           Tasa de aumento por estar quieto (/s)
   * @param {number} [config.lookingAtMonsterRate=0.05] Tasa de aumento por mirar al monstruo (/s)
   * @param {number} [config.darkZoneRate=0.01]       Tasa de aumento en zonas sin luz (/s)
   * @param {number} [config.movingRate=0.01]         Tasa de reducción por moverse (/s)
   * @param {number} [config.nearLightRate=0.03]      Tasa de reducción por estar cerca de luz (/s)
   * @param {number} [config.lookAngleThreshold=Math.PI/6] Ángulo máx para considerar "mirando al monstruo" (rad)
   * @param {number} [config.initialFear=0.0]         Miedo inicial
   */
  constructor(config = {}) {
    super();

    // ── Miedo actual ──
    /** @private */
    this._fear = Math.max(0, Math.min(1, config.initialFear ?? 0.0));

    // ── Tasas por segundo ──
    /** @private */
    this._rates = Object.freeze({
      idle:              config.idleRate             ?? 0.02,
      lookingAtMonster:  config.lookingAtMonsterRate ?? 0.05,
      darkZone:          config.darkZoneRate         ?? 0.01,
      moving:            config.movingRate           ?? 0.01,
      nearLight:         config.nearLightRate        ?? 0.03,
    });

    // ── Umbral de ángulo de visión al monstruo (radianes) ──
    /** @private */
    this._lookAngleThreshold = config.lookAngleThreshold ?? (Math.PI / 6); // 30°

    // ── Estado del jugador ──
    /** @private */
    this._state = {
      isMoving:            false,
      isLookingAtMonster:  false,
      isInDarkZone:        false,
      isNearLight:         false,
      lookAngle:           null,   // ángulo al monstruo (rad), null = sin monstruo
    };

    // ── Thresholds ──
    /** @private @type {Map<number, Set<Function>>} */
    this._thresholds = new Map();

    /** @private @type {Set<number>} — umbrales ya cruzados (evita disparar dos veces) */
    this._crossedThresholds = new Set();

    // ── Timing ──
    /** @private */
    this._lastUpdateTime = null;

    /** @private — pausar toda la acumulación */
    this._paused = false;
  }

  // ═══════════════════════════════════════════════════════════
  //  API pública — Lectura
  // ═══════════════════════════════════════════════════════════

  /**
   * Devuelve el nivel de miedo actual (0.0 – 1.0).
   * @returns {number}
   */
  getFear() {
    return this._fear;
  }

  /**
   * Devuelve el estado interno del jugador (copia).
   * @returns {Object}
   */
  getState() {
    return { ...this._state };
  }

  /**
   * ¿Está el motor pausado?
   * @returns {boolean}
   */
  isPaused() {
    return this._paused;
  }

  // ═══════════════════════════════════════════════════════════
  //  API pública — Escritura
  // ═══════════════════════════════════════════════════════════

  /**
   * Fija el miedo directamente (clamped 0–1).
   * @param {number} value
   * @returns {this}
   */
  setFear(value) {
    const prev = this._fear;
    this._fear = clamp01(value);
    if (this._fear !== prev) {
      this.emit('fearChanged', this._fear);
      this._checkThresholds(prev);
    }
    return this;
  }

  /**
   * Registra un callback que se ejecuta cuando el miedo cruza un umbral
   * de abajo hacia arriba. Se re-dispara si el miedo baja y vuelve a subir.
   *
   * @param {number} value   Umbral (0.0 – 1.0)
   * @param {Function} callback  (currentFear, threshold) => void
   * @returns {this}
   */
  onFearThreshold(value, callback) {
    if (value < 0 || value > 1) {
      throw new RangeError(`Threshold debe estar entre 0 y 1, recibido: ${value}`);
    }
    if (!this._thresholds.has(value)) {
      this._thresholds.set(value, new Set());
    }
    this._thresholds.get(value).add(callback);
    return this;
  }

  /**
   * Elimina un callback de un umbral específico.
   * @param {number} value
   * @param {Function} callback
   * @returns {this}
   */
  offFearThreshold(value, callback) {
    const cbs = this._thresholds.get(value);
    if (cbs) {
      cbs.delete(callback);
      if (cbs.size === 0) this._thresholds.delete(value);
    }
    return this;
  }

  // ═══════════════════════════════════════════════════════════
  //  State setters — Informar al motor del estado del jugador
  // ═══════════════════════════════════════════════════════════

  /**
   * Indica si el jugador se está moviendo.
   * @param {boolean} moving
   * @returns {this}
   */
  setMoving(moving) {
    const was = this._state.isMoving;
    this._state.isMoving = !!moving;
    if (was !== this._state.isMoving) {
      this.emit('stateChanged', { property: 'isMoving', value: this._state.isMoving });
    }
    return this;
  }

  /**
   * Proporciona el ángulo (en radianes) entre la dirección del jugador
   * y la dirección hacia el monstruo. `null` si no hay monstruo visible.
   *
   * Si |ángulo| ≤ lookAngleThreshold → el jugador "mira directamente" al monstruo.
   *
   * @param {number|null} angleRad
   * @returns {this}
   */
  setLookAngle(angleRad) {
    this._state.lookAngle = angleRad;
    const wasLooking = this._state.isLookingAtMonster;
    this._state.isLookingAtMonster =
      angleRad !== null && Math.abs(angleRad) <= this._lookAngleThreshold;

    if (wasLooking !== this._state.isLookingAtMonster) {
      this.emit('stateChanged', {
        property: 'isLookingAtMonster',
        value: this._state.isLookingAtMonster,
      });
    }
    return this;
  }

  /**
   * Indica si el jugador se encuentra en una zona sin luz.
   * @param {boolean} inDark
   * @returns {this}
   */
  setInDarkZone(inDark) {
    const was = this._state.isInDarkZone;
    this._state.isInDarkZone = !!inDark;
    if (was !== this._state.isInDarkZone) {
      this.emit('stateChanged', { property: 'isInDarkZone', value: this._state.isInDarkZone });
    }
    return this;
  }

  /**
   * Indica si el jugador está cerca de una fuente de luz.
   * @param {boolean} nearLight
   * @returns {this}
   */
  setNearLight(nearLight) {
    const was = this._state.isNearLight;
    this._state.isNearLight = !!nearLight;
    if (was !== this._state.isNearLight) {
      this.emit('stateChanged', { property: 'isNearLight', value: this._state.isNearLight });
    }
    return this;
  }

  // ═══════════════════════════════════════════════════════════
  //  Loop de actualización
  // ═══════════════════════════════════════════════════════════

  /**
   * Actualiza el nivel de miedo. Llamar cada frame.
   *
   * @param {number} [deltaTime] — Tiempo transcurrido en segundos.
   *   Si se omite, se calcula automáticamente con `performance.now()`.
   * @returns {this}
   */
  update(deltaTime) {
    if (this._paused) return this;

    // ── Calcular delta si no se proporcionó ──
    if (deltaTime === undefined) {
      const now = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
      if (this._lastUpdateTime === null) {
        this._lastUpdateTime = now;
        return this;
      }
      deltaTime = now - this._lastUpdateTime;
      this._lastUpdateTime = now;
    }

    if (deltaTime <= 0) return this;

    // ── Acumular tasa neta ──
    const previousFear = this._fear;
    let netRate = 0;

    // — Incrementos —
    if (!this._state.isMoving) {
      netRate += this._rates.idle;            // +0.02/s quieto
    }
    if (this._state.isLookingAtMonster) {
      netRate += this._rates.lookingAtMonster; // +0.05/s mirando
    }
    if (this._state.isInDarkZone) {
      netRate += this._rates.darkZone;         // +0.01/s oscuridad
    }

    // — Decrementos —
    if (this._state.isMoving) {
      netRate -= this._rates.moving;           // −0.01/s moviéndose
    }
    if (this._state.isNearLight) {
      netRate -= this._rates.nearLight;        // −0.03/s cerca de luz
    }

    // ── Aplicar ──
    this._fear = clamp01(this._fear + netRate * deltaTime);

    // ── Emitir eventos ──
    if (this._fear !== previousFear) {
      this.emit('fearChanged', this._fear);
      this._checkThresholds(previousFear);

      if (this._fear >= 1.0 && previousFear < 1.0) {
        this.emit('maxFear');
      }
      if (this._fear <= 0.0 && previousFear > 0.0) {
        this.emit('noFear');
      }
    }

    return this;
  }

  // ═══════════════════════════════════════════════════════════
  //  Control del motor
  // ═══════════════════════════════════════════════════════════

  /**
   * Pausa la acumulación de miedo. `update()` no modifica el valor.
   * @returns {this}
   */
  pause() {
    this._paused = true;
    this._lastUpdateTime = null;
    return this;
  }

  /**
   * Reanuda la acumulación de miedo.
   * @returns {this}
   */
  resume() {
    this._paused = false;
    this._lastUpdateTime = null; // fuerza recalcular delta
    return this;
  }

  /**
   * Reinicia todo el estado a valores iniciales.
   * @returns {this}
   */
  reset() {
    this._fear = 0.0;
    this._state.isMoving = false;
    this._state.isLookingAtMonster = false;
    this._state.isInDarkZone = false;
    this._state.isNearLight = false;
    this._state.lookAngle = null;
    this._crossedThresholds.clear();
    this._lastUpdateTime = null;
    this._paused = false;
    this.emit('fearChanged', 0.0);
    this.emit('reset');
    return this;
  }

  // ═══════════════════════════════════════════════════════════
  //  Serialización (para save/load)
  // ═══════════════════════════════════════════════════════════

  /**
   * Serializa el estado actual para guardado.
   * @returns {Object}
   */
  serialize() {
    return {
      fear: this._fear,
      state: { ...this._state },
      paused: this._paused,
    };
  }

  /**
   * Restaura estado desde un objeto serializado.
   * @param {Object} data
   * @returns {this}
   */
  deserialize(data) {
    if (data.fear !== undefined) this._fear = clamp01(data.fear);
    if (data.state) Object.assign(this._state, data.state);
    if (data.paused !== undefined) this._paused = data.paused;
    this._lastUpdateTime = null;
    this._crossedThresholds.clear();
    this.emit('fearChanged', this._fear);
    return this;
  }

  // ═══════════════════════════════════════════════════════════
  //  Debug
  // ═══════════════════════════════════════════════════════════

  /**
   * Snapshot legible del motor para depuración.
   * @returns {string}
   */
  toString() {
    const pct = (this._fear * 100).toFixed(1);
    const flags = [
      this._state.isMoving           ? 'MOV'  : 'IDLE',
      this._state.isLookingAtMonster ? 'LOOK' : '----',
      this._state.isInDarkZone       ? 'DARK' : '----',
      this._state.isNearLight        ? 'LIT'  : '----',
    ].join(' ');
    return `[FearEngine ${pct}% | ${flags}${this._paused ? ' | PAUSED' : ''}]`;
  }

  // ═══════════════════════════════════════════════════════════
  //  Internos
  // ═══════════════════════════════════════════════════════════

  /**
   * Verifica y dispara callbacks de umbrales.
   * @private
   * @param {number} previousFear
   */
  _checkThresholds(previousFear) {
    for (const [threshold, callbacks] of this._thresholds) {
      const crossedUpward = previousFear < threshold && this._fear >= threshold;
      const fellBelow     = this._fear < threshold;

      if (crossedUpward && !this._crossedThresholds.has(threshold)) {
        this._crossedThresholds.add(threshold);
        for (const cb of [...callbacks]) {
          cb(this._fear, threshold);
        }
        this.emit('thresholdCrossed', { threshold, fear: this._fear });
      } else if (fellBelow) {
        // Permitir re-disparo si el miedo baja y vuelve a subir
        this._crossedThresholds.delete(threshold);
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
//  Utilidades
// ─────────────────────────────────────────────────────────────

/** @param {number} v  @returns {number} */
function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

// ─────────────────────────────────────────────────────────────
//  Exports
// ─────────────────────────────────────────────────────────────

export { FearEngine, EventEmitter };
export default FearEngine;
