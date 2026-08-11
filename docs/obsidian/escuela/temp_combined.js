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
/**
 * ═══════════════════════════════════════════════════════════════
 *  TheVisitor — Humanoide Procedural con Primitivas de Three.js
 *  Clase ES6 · Three.js r160 · Sin modelos externos
 * ═══════════════════════════════════════════════════════════════
 *
 *  Altura total: 1.85m
 *  Cabeza: SphereGeometry escalada (0.28, 0.24, 0.26) — oval
 *  Torso: CapsuleGeometry
 *  Brazos: 15% más largos que proporciones humanas normales
 *  Cuello: rotación fija en Z de 0.08 radianes
 *
 *  Jerarquía de joints articulables:
 *
 *  TheVisitor (Group)
 *  └── pelvis (Group)
 *      ├── torso (Mesh · CapsuleGeometry)
 *      ├── neckJoint (Group · rotZ = 0.08)
 *      │   ├── neck (Mesh · CylinderGeometry)
 *      │   └── head (Mesh · SphereGeometry scaled)
 *      ├── leftShoulder (Group)
 *      │   ├── leftUpperArm (Mesh)
 *      │   └── leftElbow (Group)
 *      │       ├── leftForearm (Mesh)
 *      │       └── leftWrist (Group)
 *      │           └── leftHand (Mesh)
 *      ├── rightShoulder (Group)
 *      │   ├── rightUpperArm (Mesh)
 *      │   └── rightElbow (Group)
 *      │       ├── rightForearm (Mesh)
 *      │       └── rightWrist (Group)
 *      │           └── rightHand (Mesh)
 *      ├── leftHip (Group)
 *      │   ├── leftUpperLeg (Mesh)
 *      │   └── leftKnee (Group)
 *      │       ├── leftLowerLeg (Mesh)
 *      │       └── leftAnkle (Group)
 *      │           └── leftFoot (Mesh)
 *      └── rightHip (Group)
 *          ├── rightUpperLeg (Mesh)
 *          └── rightKnee (Group)
 *              ├── rightLowerLeg (Mesh)
 *              └── rightAnkle (Group)
 *                  └── rightFoot (Mesh)
 * ═══════════════════════════════════════════════════════════════
 */

import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────
//  Constantes Antropométricas (metros)
// ─────────────────────────────────────────────────────────────

const PROPORTIONS = Object.freeze({
  // Altura total objetivo
  totalHeight: 1.85,

  // Cabeza (semi-ejes del elipsoide)
  headScaleX: 0.28,
  headScaleY: 0.24,
  headScaleZ: 0.26,

  // Cuello
  neckLength: 0.08,
  neckRadius: 0.045,
  neckRotZ:   0.08,   // radianes, fijo

  // Torso (CapsuleGeometry)
  torsoLength: 0.50,
  torsoRadius: 0.14,

  // Hombros y caderas (distancia del centro al joint)
  shoulderOffsetX: 0.19,
  shoulderOffsetY: 0.21,   // debajo del tope del torso
  hipOffsetX:      0.09,

  // Piernas
  upperLegLength: 0.38,
  upperLegRadius: 0.055,
  lowerLegLength: 0.36,
  lowerLegRadius: 0.040,

  // Pies
  footWidth:  0.09,
  footHeight: 0.05,
  footDepth:  0.22,

  // Brazos — proporciones humanas base × 1.15
  armMultiplier:   1.15,
  baseUpperArm:    0.29,
  baseForearm:     0.254,
  baseHand:        0.12,
  upperArmRadius:  0.035,
  forearmRadius:   0.028,

  // Manos
  handWidth:  0.04,
  handHeight: 0.10,  // se multiplicará por armMultiplier
  handDepth:  0.025,
});

// Proporciones derivadas de brazos (15% más largos)
const ARM = Object.freeze({
  upperArmLength: PROPORTIONS.baseUpperArm  * PROPORTIONS.armMultiplier,  // ≈ 0.334
  forearmLength:  PROPORTIONS.baseForearm   * PROPORTIONS.armMultiplier,  // ≈ 0.292
  handLength:     PROPORTIONS.baseHand      * PROPORTIONS.armMultiplier,  // ≈ 0.138
});

// Alturas absolutas (Y desde el suelo) — verificación
const Y = Object.freeze({
  ground:     0,
  footTop:    PROPORTIONS.footHeight,                                                    // 0.05
  knee:       PROPORTIONS.footHeight + PROPORTIONS.lowerLegLength,                       // 0.41
  hip:        PROPORTIONS.footHeight + PROPORTIONS.lowerLegLength
              + PROPORTIONS.upperLegLength,                                              // 0.79
  neckBase:   PROPORTIONS.footHeight + PROPORTIONS.lowerLegLength
              + PROPORTIONS.upperLegLength + PROPORTIONS.torsoLength,                    // 1.29
  headCenter: PROPORTIONS.footHeight + PROPORTIONS.lowerLegLength
              + PROPORTIONS.upperLegLength + PROPORTIONS.torsoLength
              + PROPORTIONS.neckLength + PROPORTIONS.headScaleY,                         // 1.61
  top:        PROPORTIONS.footHeight + PROPORTIONS.lowerLegLength
              + PROPORTIONS.upperLegLength + PROPORTIONS.torsoLength
              + PROPORTIONS.neckLength + PROPORTIONS.headScaleY * 2,                     // 1.85
});

// ─────────────────────────────────────────────────────────────
//  Materiales por Defecto
// ─────────────────────────────────────────────────────────────

const DEFAULT_MATERIALS = Object.freeze({
  /** Cuerpo principal — carbón húmedo, levemente metálico */
  body: {
    color:     0x1a1a1e,
    roughness: 0.55,
    metalness: 0.12,
    flatShading: true,
  },
  /** Cabeza — tono ligeramente diferente con brillo sutil */
  head: {
    color:     0x1e1e24,
    roughness: 0.40,
    metalness: 0.18,
    flatShading: true,
  },
  /** Extremidades — gris ceniza */
  limb: {
    color:     0x222228,
    roughness: 0.60,
    metalness: 0.10,
    flatShading: true,
  },
  /** Manos/pies — gris plomizo frío */
  extremity: {
    color:     0x2a2a32,
    roughness: 0.70,
    metalness: 0.05,
    flatShading: true,
  },
});

// ─────────────────────────────────────────────────────────────
//  Clase Principal
// ─────────────────────────────────────────────────────────────

export default class TheVisitor extends THREE.Group {

  /**
   * @param {Object} [config]
   * @param {Object} [config.materials]           Overrides parciales por zona (body, head, limb, extremity)
   * @param {number} [config.segmentsDetail=16]   Segmentos radiales para primitivas
   * @param {boolean} [config.castShadow=true]
   * @param {boolean} [config.receiveShadow=true]
   */
  constructor(config = {}) {
    super();
    this.name = 'TheVisitor';

    /** @private */
    this._detail = config.segmentsDetail ?? 16;

    /** @private */
    this._castShadow = config.castShadow ?? true;

    /** @private */
    this._receiveShadow = config.receiveShadow ?? true;

    // ── Crear materiales ──
    /** @private */
    this._materials = this._buildMaterials(config.materials);

    // ── Mapa de partes con nombre para acceso rápido ──
    /** @type {Map<string, THREE.Object3D>} */
    this.parts = new Map();

    // ── Construir el esqueleto ──
    this._build();
  }

  // ═══════════════════════════════════════════════════════════
  //  API Pública
  // ═══════════════════════════════════════════════════════════

  /**
   * Obtiene una parte del cuerpo por nombre semántico.
   * @param {string} name  — e.g. 'head', 'leftElbow', 'torso'
   * @returns {THREE.Object3D|undefined}
   */
  getPart(name) {
    return this.parts.get(name);
  }

  /**
   * Devuelve un array con todos los nombres de partes registradas.
   * @returns {string[]}
   */
  getPartNames() {
    return [...this.parts.keys()];
  }

  /**
   * Devuelve las constantes de proporción utilizadas.
   * @returns {Object}
   */
  getProportions() {
    return { ...PROPORTIONS, arm: { ...ARM }, absoluteY: { ...Y } };
  }

  /**
   * Aplica una función a todas las mallas (útil para cambiar material, etc.)
   * @param {(mesh: THREE.Mesh, name: string) => void} fn
   */
  traverseMeshes(fn) {
    for (const [name, obj] of this.parts) {
      if (obj.isMesh) fn(obj, name);
    }
  }

  /**
   * Resumen de depuración.
   * @returns {string}
   */
  toString() {
    const names = this.getPartNames().join(', ');
    return `[TheVisitor | ${this.parts.size} parts | height=${PROPORTIONS.totalHeight}m]\n  Parts: ${names}`;
  }

  // ═══════════════════════════════════════════════════════════
  //  Construcción Interna
  // ═══════════════════════════════════════════════════════════

  /** @private */
  _buildMaterials(overrides = {}) {
    const mats = {};
    for (const [key, defaults] of Object.entries(DEFAULT_MATERIALS)) {
      const userOverride = overrides[key] || {};
      mats[key] = new THREE.MeshStandardMaterial({ ...defaults, ...userOverride });
    }
    return mats;
  }

  /** @private — Registra una pieza en el mapa y configura sombras */
  _register(name, obj) {
    obj.name = name;
    this.parts.set(name, obj);
    if (obj.isMesh) {
      obj.castShadow = this._castShadow;
      obj.receiveShadow = this._receiveShadow;
    }
    return obj;
  }

  /** @private — Crea una CapsuleGeometry con longitud total (incluyendo caps) */
  _capsule(totalLength, radius, material) {
    const middleLength = Math.max(0, totalLength - 2 * radius);
    const geo = new THREE.CapsuleGeometry(radius, middleLength, 4, this._detail);
    return new THREE.Mesh(geo, material);
  }

  /** @private — Crea un CylinderGeometry */
  _cylinder(height, radiusTop, radiusBottom, material) {
    const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, this._detail);
    return new THREE.Mesh(geo, material);
  }

  /** @private — Crea un BoxGeometry */
  _box(w, h, d, material) {
    const geo = new THREE.BoxGeometry(w, h, d);
    return new THREE.Mesh(geo, material);
  }

  /** @private */
  _build() {
    const P = PROPORTIONS;
    const M = this._materials;

    // ────────────────────────────────────────────
    //  1. PELVIS — Punto de anclaje central
    // ────────────────────────────────────────────
    const pelvis = this._register('pelvis', new THREE.Group());
    pelvis.position.y = Y.hip;
    this.add(pelvis);

    // ────────────────────────────────────────────
    //  2. TORSO — CapsuleGeometry
    // ────────────────────────────────────────────
    const torso = this._register(
      'torso',
      this._capsule(P.torsoLength, P.torsoRadius, M.body)
    );
    // El centro del torso está a mitad de su longitud por encima del pelvis
    torso.position.y = P.torsoLength / 2;
    pelvis.add(torso);

    // ────────────────────────────────────────────
    //  3. CUELLO + CABEZA
    // ────────────────────────────────────────────

    // Joint del cuello — en la parte superior del torso
    const neckJoint = this._register('neckJoint', new THREE.Group());
    neckJoint.position.y = P.torsoLength;
    neckJoint.rotation.z = P.neckRotZ; // ← 0.08 rad, fijo
    pelvis.add(neckJoint);

    // Mesh del cuello
    const neck = this._register(
      'neck',
      this._cylinder(P.neckLength, P.neckRadius, P.neckRadius * 1.1, M.body)
    );
    neck.position.y = P.neckLength / 2;
    neckJoint.add(neck);

    // Cabeza — SphereGeometry escalada (oval)
    const headGeo = new THREE.SphereGeometry(1, this._detail * 2, this._detail);
    const head = this._register('head', new THREE.Mesh(headGeo, M.head));
    head.scale.set(P.headScaleX, P.headScaleY, P.headScaleZ);
    head.position.y = P.neckLength + P.headScaleY; // centro del elipsoide
    neckJoint.add(head);

    // ────────────────────────────────────────────
    //  4. BRAZOS (× 2)
    // ────────────────────────────────────────────
    this._buildArm(pelvis, 'left',  -1, M);
    this._buildArm(pelvis, 'right',  1, M);

    // ────────────────────────────────────────────
    //  5. PIERNAS (× 2)
    // ────────────────────────────────────────────
    this._buildLeg(pelvis, 'left',  -1, M);
    this._buildLeg(pelvis, 'right',  1, M);
  }

  /**
   * @private
   * Construye un brazo completo (hombro → codo → muñeca → mano).
   * @param {THREE.Group} parent
   * @param {'left'|'right'} side
   * @param {number} sign   −1 para izquierda, +1 para derecha
   * @param {Object} M      materiales
   */
  _buildArm(parent, side, sign, M) {
    const P = PROPORTIONS;
    const prefix = side;

    // ── Shoulder Joint ──
    const shoulder = this._register(`${prefix}Shoulder`, new THREE.Group());
    shoulder.position.set(
      sign * P.shoulderOffsetX,
      P.torsoLength - P.shoulderOffsetY,
      0
    );
    parent.add(shoulder);

    // ── Upper Arm ──
    const upperArm = this._register(
      `${prefix}UpperArm`,
      this._capsule(ARM.upperArmLength, P.upperArmRadius, M.limb)
    );
    upperArm.position.y = -ARM.upperArmLength / 2;
    shoulder.add(upperArm);

    // ── Elbow Joint ──
    const elbow = this._register(`${prefix}Elbow`, new THREE.Group());
    elbow.position.y = -ARM.upperArmLength;
    shoulder.add(elbow);

    // ── Forearm ──
    const forearm = this._register(
      `${prefix}Forearm`,
      this._capsule(ARM.forearmLength, P.forearmRadius, M.limb)
    );
    forearm.position.y = -ARM.forearmLength / 2;
    elbow.add(forearm);

    // ── Wrist Joint ──
    const wrist = this._register(`${prefix}Wrist`, new THREE.Group());
    wrist.position.y = -ARM.forearmLength;
    elbow.add(wrist);

    // ── Hand ──
    const hand = this._register(
      `${prefix}Hand`,
      this._box(
        P.handWidth,
        ARM.handLength,
        P.handDepth,
        M.extremity
      )
    );
    hand.position.y = -ARM.handLength / 2;
    wrist.add(hand);
  }

  /**
   * @private
   * Construye una pierna completa (cadera → rodilla → tobillo → pie).
   * @param {THREE.Group} parent
   * @param {'left'|'right'} side
   * @param {number} sign   −1 para izquierda, +1 para derecha
   * @param {Object} M      materiales
   */
  _buildLeg(parent, side, sign, M) {
    const P = PROPORTIONS;
    const prefix = side;

    // ── Hip Joint ──
    const hip = this._register(`${prefix}Hip`, new THREE.Group());
    hip.position.set(sign * P.hipOffsetX, 0, 0);
    parent.add(hip);

    // ── Upper Leg ──
    const upperLeg = this._register(
      `${prefix}UpperLeg`,
      this._capsule(P.upperLegLength, P.upperLegRadius, M.limb)
    );
    upperLeg.position.y = -P.upperLegLength / 2;
    hip.add(upperLeg);

    // ── Knee Joint ──
    const knee = this._register(`${prefix}Knee`, new THREE.Group());
    knee.position.y = -P.upperLegLength;
    hip.add(knee);

    // ── Lower Leg ──
    const lowerLeg = this._register(
      `${prefix}LowerLeg`,
      this._capsule(P.lowerLegLength, P.lowerLegRadius, M.limb)
    );
    lowerLeg.position.y = -P.lowerLegLength / 2;
    knee.add(lowerLeg);

    // ── Ankle Joint ──
    const ankle = this._register(`${prefix}Ankle`, new THREE.Group());
    ankle.position.y = -P.lowerLegLength;
    knee.add(ankle);

    // ── Foot ──
    const foot = this._register(
      `${prefix}Foot`,
      this._box(P.footWidth, P.footHeight, P.footDepth, M.extremity)
    );
    // Pie ligeramente hacia adelante y apoyado en el suelo
    foot.position.set(0, -P.footHeight / 2, P.footDepth * 0.2);
    ankle.add(foot);
  }
}

// ─────────────────────────────────────────────────────────────
//  Exports con nombre para conveniencia
// ─────────────────────────────────────────────────────────────

export { TheVisitor, PROPORTIONS, ARM, Y as ABSOLUTE_Y, DEFAULT_MATERIALS };
/**
 * ═══════════════════════════════════════════════════════════════
 *  EyeSystem — Sistema de Ojos Procedurales para TheVisitor
 *  Clase ES6 · Three.js r160 · Sin modelos externos
 * ═══════════════════════════════════════════════════════════════
 *
 *  Maneja la anatomía de los ojos:
 *  - Esclerótica (sclera): Esfera blanca/gris brillante fija.
 *  - Iris: Esfera aplanada que rota en la superficie de la esclerótica.
 *  - Pupila: Esfera aplanada negra en el centro del iris.
 *
 *  Características:
 *  - lookAt(targetVector3): Rota solo el iris hacia el objetivo, con un límite
 *    estricto de 15 grados de desviación del eje frontal (-Z).
 *  - setActPhase(0-3): Interpola el color del material del iris de negro (0.0)
 *    a rgb(0.35, 0.20, 0.15) (3.0) y su brillo emissive.
 * ═══════════════════════════════════════════════════════════════
 */

import * as THREE from 'three';

export default class EyeSystem {
  /**
   * @param {THREE.Object3D} visitor - Instancia de TheVisitor
   * @param {Object} [config]
   * @param {number} [config.segmentsDetail=16] - Detalle de segmentos de esfera
   * @param {number} [config.scleraColor=0xdedede] - Color base de la esclerótica
   * @param {number} [config.scleraRoughness=0.1] - Rugosidad de la esclerótica
   */
  constructor(visitor, config = {}) {
    this.visitor = visitor;
    this.head = visitor.getPart ? visitor.getPart('head') : visitor.getObjectByName('head');
    
    if (!this.head) {
      throw new Error('EyeSystem: No se encontró la parte "head" en el visitante.');
    }

    this.detail = config.segmentsDetail ?? 16;
    this.currentPhase = 0;

    // Guardar referencia de los ojos creados
    this.eyes = {
      left: null,
      right: null
    };

    // Crear materiales compartidos para el iris y la pupila
    this._buildMaterials(config);

    // Inicializar y acoplar los ojos
    this._initEyes(config);
  }

  /**
   * Inicializa los materiales de los ojos.
   * @private
   */
  _buildMaterials(config) {
    // Esclerótica: gris pálido brillante
    this.scleraMaterial = new THREE.MeshStandardMaterial({
      color: config.scleraColor ?? 0xdedede,
      roughness: config.scleraRoughness ?? 0.1,
      metalness: 0.0,
      flatShading: false,
    });

    // Iris: Color interpolado dinámicamente de negro (fase 0) a rgb(0.35, 0.20, 0.15) (fase 3)
    this.irisMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0, 0, 0),
      emissive: new THREE.Color(0, 0, 0),
      emissiveIntensity: 2.0,
      roughness: 0.2,
      metalness: 0.1,
      flatShading: false,
    });

    // Pupila: Negro mate profundo
    this.pupilMaterial = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.9,
      metalness: 0.0,
      flatShading: false,
    });
  }

  /**
   * Crea y posiciona los ojos en la cabeza del visitante.
   * @private
   */
  _initEyes(config) {
    const headScaleX = 0.28;
    const headScaleY = 0.24;
    const headScaleZ = 0.26;

    // Posiciones en el espacio local de la cabeza
    const eyePositions = {
      left: new THREE.Vector3(-0.28, 0.12, -0.85),
      right: new THREE.Vector3(0.28, 0.12, -0.85)
    };

    // Crear y añadir ambos ojos
    for (const [side, pos] of Object.entries(eyePositions)) {
      // 1. Grupo principal del ojo
      const eyeGroup = new THREE.Group();
      eyeGroup.name = `${side}EyeSystem`;
      eyeGroup.position.copy(pos);
      
      // Contrarrestar la escala de la cabeza para mantener los ojos esféricos y no deformar rotaciones
      eyeGroup.scale.set(1 / headScaleX, 1 / headScaleY, 1 / headScaleZ);

      // 2. Malla de la esclerótica (eyeball white)
      const scleraGeo = new THREE.SphereGeometry(0.025, this.detail, this.detail);
      const scleraMesh = new THREE.Mesh(scleraGeo, this.scleraMaterial);
      scleraMesh.name = `${side}Sclera`;
      eyeGroup.add(scleraMesh);

      // 3. Contenedor móvil para el iris y la pupila (centrado en el origen del ojo)
      const irisContainer = new THREE.Group();
      irisContainer.name = `${side}IrisContainer`;
      eyeGroup.add(irisContainer);

      // 4. Malla del Iris (esfera pequeña aplanada en el eje Z para amoldarse a la superficie)
      const irisGeo = new THREE.SphereGeometry(0.010, this.detail, this.detail);
      const irisMesh = new THREE.Mesh(irisGeo, this.irisMaterial);
      irisMesh.name = `${side}Iris`;
      irisMesh.scale.set(1, 1, 0.3); // Aplanar en Z
      irisMesh.position.set(0, 0, -0.024); // Posicionar en el frente de la esclerótica (radio ~0.025)
      irisContainer.add(irisMesh);

      // 5. Malla de la Pupila (centro negro del iris)
      const pupilGeo = new THREE.SphereGeometry(0.004, this.detail, this.detail);
      const pupilMesh = new THREE.Mesh(pupilGeo, this.pupilMaterial);
      pupilMesh.name = `${side}Pupil`;
      pupilMesh.scale.set(1, 1, 0.3); // Aplanar en Z
      pupilMesh.position.set(0, 0, -0.0248); // Ligeramente por delante del iris para evitar z-fighting
      irisContainer.add(pupilMesh);

      // Añadir el ojo a la cabeza del visitante
      this.head.add(eyeGroup);

      // Registrar referencias para el lookAt y actualizaciones
      this.eyes[side] = {
        group: eyeGroup,
        sclera: scleraMesh,
        irisContainer: irisContainer,
        iris: irisMesh,
        pupil: pupilMesh
      };
    }
  }

  /**
   * Rota el iris de ambos ojos hacia la posición objetivo en espacio de mundo.
   * La rotación se restringe a un cono de 15 grados del eje frontal (-Z).
   * @param {THREE.Vector3} targetVector3 - Posición objetivo en el mundo
   */
  lookAt(targetVector3) {
    if (!targetVector3 || !targetVector3.isVector3) {
      return;
    }

    const forward = new THREE.Vector3(0, 0, -1);
    const maxAngle = 15 * Math.PI / 180; // 15 grados en radianes (~0.2618 rad)

    for (const side of ['left', 'right']) {
      const eye = this.eyes[side];
      if (!eye) continue;

      // Transformar el target al espacio local del grupo del ojo
      const localTarget = targetVector3.clone();
      eye.group.worldToLocal(localTarget);

      const len = localTarget.length();
      if (len < 0.0001) {
        // Si el target coincide con la posición del ojo, mirar al frente
        eye.irisContainer.quaternion.setFromUnitVectors(forward, forward);
        continue;
      }

      // Dirección normalizada hacia el target
      const dirLocal = localTarget.clone().normalize();

      // Calcular el ángulo de desviación con respecto a la frontal
      const angle = forward.angleTo(dirLocal);

      let clampedDir;
      if (angle <= maxAngle) {
        clampedDir = dirLocal;
      } else {
        // Desviación excesiva: proyectar en el plano perpendicular a forward (plano XY local)
        const px = dirLocal.x;
        const py = dirLocal.y;
        const projLen = Math.sqrt(px * px + py * py);

        if (projLen > 0.0001) {
          const nx = px / projLen;
          const ny = py / projLen;

          // Construir el vector con la desviación máxima de 15 grados en la dirección proyectada
          clampedDir = new THREE.Vector3(
            Math.sin(maxAngle) * nx,
            Math.sin(maxAngle) * ny,
            -Math.cos(maxAngle)
          );
          clampedDir.normalize();
        } else {
          // Si el objetivo está directamente detrás (en el eje Z positivo)
          clampedDir = forward.clone();
        }
      }

      // Rota el irisContainer para apuntar el eje -Z hacia clampedDir
      const q = new THREE.Quaternion();
      q.setFromUnitVectors(forward, clampedDir);
      eye.irisContainer.quaternion.copy(q);
    }
  }

  /**
   * Establece la fase de actuación del visitante (0 a 3).
   * Interpola el color del iris de negro (0.0) a rgb(0.35, 0.20, 0.15) (3.0)
   * e influye también en el color emissive del material.
   * @param {number} phase - Fase actual (float o entero, rango 0 - 3)
   */
  setActPhase(phase) {
    const p = Math.max(0, Math.min(3, phase));
    this.currentPhase = p;

    // Normalizar a un factor entre 0.0 y 1.0 para la interpolación lineal
    const t = p / 3.0;

    // Color objetivo en fase 3: rgb(0.35, 0.20, 0.15)
    const targetR = 0.35;
    const targetG = 0.20;
    const targetB = 0.15;

    // Interpolación lineal simple desde negro (0.0, 0.0, 0.0)
    const r = targetR * t;
    const g = targetG * t;
    const b = targetB * t;

    // Actualizar el material compartido
    this.irisMaterial.color.setRGB(r, g, b);
    this.irisMaterial.emissive.setRGB(r, g, b);
  }

  /**
   * Limpia y destruye las geometrías y materiales creados para evitar fugas de memoria.
   */
  dispose() {
    this.scleraMaterial.dispose();
    this.irisMaterial.dispose();
    this.pupilMaterial.dispose();

    for (const side of ['left', 'right']) {
      const eye = this.eyes[side];
      if (eye) {
        eye.sclera.geometry.dispose();
        eye.iris.geometry.dispose();
        eye.pupil.geometry.dispose();
        
        if (eye.group.parent) {
          eye.group.parent.remove(eye.group);
        }
      }
    }
  }
}
/**
 * ═══════════════════════════════════════════════════════════════
 *  VisitorAI — Sistema de IA para TheVisitor
 *  Clase ES6 · Three.js r160 · Sin dependencias de física
 * ═══════════════════════════════════════════════════════════════
 *
 *  Máquina de estados conducida por fearLevel (0.0–1.0):
 *
 *    DORMANT   fear < 0.20  → Inactivo. Sin movimiento. Cabeza al frente.
 *    AWARE     0.20–0.50    → Parado. Cabeza rastrea jugador. Timer 5s.
 *    FOLLOWING 0.50–0.80    → Órbita circular alrededor del jugador.
 *    HUNTING   ≥ 0.80       → Órbita agresiva al radio mínimo.
 *
 *  Arquitectura de movimiento:
 *    ┌── visitor.rotation.y  ──→ Torso (cuerpo completo) — lerp suavizado
 *    └── neckJoint.rotation.y ─→ Head  — lookAt instantáneo, independiente
 *
 *  Velocidad: playerSpeed × 1.12, on/off instantáneo (sin curvas de aceleración).
 *  Trigger:   5 segundos quieto en AWARE → giro brusco de cabeza a ~80°.
 *
 *  Eventos emitidos:
 *    'stateChanged'  { from: string, to: string }
 *    'headTurn'      { angle: number }
 *    'orbitStarted'  ()
 *    'orbitStopped'  ()
 * ═══════════════════════════════════════════════════════════════
 */

import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────
//  EventEmitter ligero (patrón idéntico a FearEngine)
// ─────────────────────────────────────────────────────────────

class EventEmitter {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._listeners = new Map();
  }

  on(event, callback) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(callback);
    return this;
  }

  off(event, callback) {
    const set = this._listeners.get(event);
    if (set) set.delete(callback);
    return this;
  }

  emit(event, ...args) {
    const set = this._listeners.get(event);
    if (set && set.size > 0) for (const fn of [...set]) fn(...args);
    return this;
  }

  listenerCount(event) {
    return (this._listeners.get(event) || { size: 0 }).size;
  }
}

// ─────────────────────────────────────────────────────────────
//  Constantes de estado
// ─────────────────────────────────────────────────────────────

const STATES = Object.freeze({
  DORMANT:   'DORMANT',
  AWARE:     'AWARE',
  FOLLOWING: 'FOLLOWING',
  HUNTING:   'HUNTING',
});

// ─────────────────────────────────────────────────────────────
//  VisitorAI
// ─────────────────────────────────────────────────────────────

export default class VisitorAI extends EventEmitter {

  /** @returns {'DORMANT'} */
  static get DORMANT()   { return STATES.DORMANT; }
  /** @returns {'AWARE'} */
  static get AWARE()     { return STATES.AWARE; }
  /** @returns {'FOLLOWING'} */
  static get FOLLOWING() { return STATES.FOLLOWING; }
  /** @returns {'HUNTING'} */
  static get HUNTING()   { return STATES.HUNTING; }

  /**
   * @param {Object} visitor               Instancia de TheVisitor (Group Three.js)
   * @param {Object} [config]
   * @param {number} [config.orbitRadius=4.0]         Radio orbital en FOLLOWING (m)
   * @param {number} [config.minOrbitRadius=2.0]      Radio orbital en HUNTING (m)
   * @param {number} [config.playerSpeed=2.0]         Velocidad base del jugador (m/s)
   * @param {number} [config.speedMultiplier=1.12]    Multiplicador de velocidad del visitante
   * @param {number} [config.bodyLerpSpeed=3.0]       Factor de suavizado de la rotación del torso (1/s)
   * @param {number} [config.stillThreshold=5.0]      Segundos quieto en AWARE para disparar head turn
   * @param {number} [config.headTurnDuration=0.8]    Duración de la animación de head turn (s)
   * @param {number} [config.headTurnAngle=1.4]       Ángulo máximo del head turn (~80°, rad)
   * @param {Object} [config.thresholds]              Umbrales de miedo para cambios de estado
   * @param {number} [config.thresholds.aware=0.20]
   * @param {number} [config.thresholds.following=0.50]
   * @param {number} [config.thresholds.hunting=0.80]
   */
  constructor(visitor, config = {}) {
    super();

    /** @type {Object} Referencia al humanoide procedural */
    this.visitor = visitor;

    /**
     * @private
     * Joint del cuello — controla la orientación de la cabeza de forma
     * completamente independiente al torso (visitor.rotation.y).
     */
    this._neckJoint = visitor.getPart ? visitor.getPart('neckJoint') : null;

    // ── Configuración ──
    /** @private */ this._orbitRadius    = config.orbitRadius     ?? 4.0;
    /** @private */ this._minOrbitRadius = config.minOrbitRadius  ?? 2.0;
    /** @private */ this._playerSpeed    = config.playerSpeed     ?? 2.0;
    /** @private */ this._speedMult      = config.speedMultiplier ?? 1.12;
    /** @private */ this._bodyLerpSpeed  = config.bodyLerpSpeed   ?? 3.0;
    /** @private */ this._stillThreshold   = config.stillThreshold   ?? 5.0;
    /** @private */ this._headTurnDuration = config.headTurnDuration ?? 0.8;
    /** @private */ this._headTurnAngle    = config.headTurnAngle    ?? 1.4;  // ~80°

    /** @private Umbrales de transición de estado */
    this._thresholds = Object.freeze({
      aware:     config.thresholds?.aware     ?? 0.20,
      following: config.thresholds?.following ?? 0.50,
      hunting:   config.thresholds?.hunting   ?? 0.80,
    });

    // ── Estado de la máquina ──
    /** @private @type {string} */
    this._state = STATES.DORMANT;

    /** @private Ángulo orbital actual (radianes). 0 = este del jugador, crece en CCW. */
    this._orbitAngle = 0;

    /**
     * @private
     * Yaw actual del cuerpo del visitante (rad, convención Three.js rotation.y).
     * Se interpola suavemente hacia el ángulo que apunta al jugador.
     */
    this._bodyYaw = visitor.rotation?.y ?? 0;

    // ── Timers ──
    /** @private Segundos en estado quieto (solo AWARE). */
    this._stillTimer = 0;

    /** @private ¿Animación de head turn activa? */
    this._headTurnActive = false;

    /** @private Tiempo transcurrido en la animación de head turn (s). */
    this._headTurnTimer = 0;

    /**
     * @private
     * Dirección del giro actual: +1 (derecha) o -1 (izquierda).
     * Alterna en cada disparo del head turn.
     */
    this._headTurnSide = 1;

    // ── Vectores reutilizables — evitar GC pressure por frame ──
    /** @private */ this._vPlayerPos = new THREE.Vector3();
    /** @private */ this._vOrbPos   = new THREE.Vector3();
  }

  // ═══════════════════════════════════════════════════════════
  //  API pública
  // ═══════════════════════════════════════════════════════════

  /**
   * Estado actual de la máquina de estados.
   * @returns {'DORMANT'|'AWARE'|'FOLLOWING'|'HUNTING'}
   */
  getState() { return this._state; }

  /**
   * Ángulo orbital actual en radianes.
   * @returns {number}
   */
  getOrbitAngle() { return this._orbitAngle; }

  /**
   * Radio de órbita efectivo según el estado actual.
   * @returns {number}
   */
  getEffectiveRadius() {
    return this._state === STATES.HUNTING ? this._minOrbitRadius : this._orbitRadius;
  }

  /**
   * Tiempo (en segundos) que el visitante lleva quieto en estado AWARE.
   * Se resetea al cambiar de estado o al dispararse el head turn.
   * @returns {number}
   */
  getStillTimer() { return this._stillTimer; }

  /**
   * Posiciona el visitante en un ángulo orbital de inicio.
   * Útil para inicializar antes de que el jugador empiece a moverse.
   * @param {number} angle Ángulo en radianes (0 = derecha del jugador)
   * @returns {this}
   */
  setOrbitAngle(angle) {
    this._orbitAngle = angle;
    return this;
  }

  /**
   * Actualiza la velocidad base del jugador en tiempo de ejecución.
   * @param {number} speed Velocidad en m/s
   * @returns {this}
   */
  setPlayerSpeed(speed) {
    this._playerSpeed = Math.max(0, speed);
    return this;
  }

  /**
   * Loop principal — llamar cada frame desde requestAnimationFrame.
   *
   * @param {number} dt                   Delta de tiempo (segundos). Ignorado si > 0.5.
   * @param {number} fearLevel            Nivel de miedo actual del FearEngine (0.0–1.0)
   * @param {THREE.Vector3} playerPosition Posición del jugador en el espacio mundo
   */
  update(dt, fearLevel, playerPosition) {
    // Proteger contra spikes de dt (p.ej. pestaña en segundo plano)
    if (dt <= 0 || dt > 0.5) return;

    this._vPlayerPos.copy(playerPosition);

    // 1. Gestionar transiciones de estado según fearLevel
    this._updateState(fearLevel);

    // 2. Movimiento orbital (solo en FOLLOWING / HUNTING)
    const isMoving = this._state === STATES.FOLLOWING || this._state === STATES.HUNTING;
    this._updateMovement(dt, isMoving);

    // 3. Orientación del torso — lerp suavizado hacia el jugador
    this._updateBodyOrientation(dt);

    // 4. Head lookAt independiente — inmediato, sin lerp
    if (!this._headTurnActive) {
      this._updateHeadLookAt();
    }

    // 5. Animación de head turn (si está activa)
    if (this._headTurnActive) {
      this._animateHeadTurn(dt);
    }
  }

  /**
   * Descripción de depuración.
   * @returns {string}
   */
  toString() {
    return `[VisitorAI | ${this._state}` +
           ` | orbit=${this._orbitAngle.toFixed(2)}rad` +
           ` | still=${this._stillTimer.toFixed(1)}s` +
           ` | bodyYaw=${this._bodyYaw.toFixed(2)}rad]`;
  }

  // ═══════════════════════════════════════════════════════════
  //  Internos — Máquina de estados
  // ═══════════════════════════════════════════════════════════

  /** @private */
  _updateState(fearLevel) {
    const newState = this._computeTargetState(fearLevel);
    if (newState === this._state) return;

    const wasMoving = this._state === STATES.FOLLOWING || this._state === STATES.HUNTING;
    const willMove  = newState   === STATES.FOLLOWING || newState   === STATES.HUNTING;
    const prev = this._state;

    this._state = newState;
    this._stillTimer = 0;

    if (!wasMoving && willMove)  this.emit('orbitStarted');
    if (wasMoving  && !willMove) this.emit('orbitStopped');

    this.emit('stateChanged', { from: prev, to: newState });
  }

  /** @private */
  _computeTargetState(fearLevel) {
    if (fearLevel >= this._thresholds.hunting)   return STATES.HUNTING;
    if (fearLevel >= this._thresholds.following) return STATES.FOLLOWING;
    if (fearLevel >= this._thresholds.aware)     return STATES.AWARE;
    return STATES.DORMANT;
  }

  // ═══════════════════════════════════════════════════════════
  //  Internos — Movimiento orbital
  // ═══════════════════════════════════════════════════════════

  /**
   * @private
   * Aplica movimiento orbital alrededor del jugador.
   * Velocidad instantánea (on/off) — sin curvas de aceleración ni deceleración.
   *
   * Cálculo:
   *   angularSpeed = (playerSpeed × speedMultiplier) / orbitRadius
   *   orbitAngle  += angularSpeed × dt
   *   position.x  = player.x + cos(orbitAngle) × radius
   *   position.z  = player.z + sin(orbitAngle) × radius
   */
  _updateMovement(dt, isMoving) {
    if (isMoving) {
      const radius      = this.getEffectiveRadius();
      const linearSpeed = this._playerSpeed * this._speedMult;

      // Velocidad angular instantánea — SIN lerp
      const angularSpeed = linearSpeed / radius;
      this._orbitAngle += angularSpeed * dt;

      // Posición orbital en el plano XZ (Y = 0, nivel del suelo)
      this._vOrbPos.set(
        this._vPlayerPos.x + Math.cos(this._orbitAngle) * radius,
        0,
        this._vPlayerPos.z + Math.sin(this._orbitAngle) * radius
      );

      // Aplicar directamente — sin lerp (velocidad on/off instantánea)
      this.visitor.position.copy(this._vOrbPos);
      this._stillTimer = 0;

    } else if (this._state === STATES.AWARE) {
      // En AWARE: acumular el contador de quietud para el head turn
      this._stillTimer += dt;

      if (this._stillTimer >= this._stillThreshold && !this._headTurnActive) {
        this._stillTimer = 0;
        this._triggerHeadTurn();
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  Internos — Orientación del torso
  // ═══════════════════════════════════════════════════════════

  /**
   * @private
   * Rota el grupo raíz del visitante (torso) hacia el jugador con un lerp suavizado.
   * Solo activo en estados ≥ AWARE. En DORMANT el cuerpo no cambia de orientación.
   *
   * Fórmula (Three.js rotation.y apunta al target):
   *   targetYaw = atan2(-dx, -dz)   donde dx, dz es la dirección mundo hacia el jugador
   */
  _updateBodyOrientation(dt) {
    if (this._state === STATES.DORMANT) return;

    const dx = this._vPlayerPos.x - this.visitor.position.x;
    const dz = this._vPlayerPos.z - this.visitor.position.z;
    if (dx * dx + dz * dz < 0.0001) return;

    // atan2(-dx, -dz): convención Three.js para que rotation.y=0 apunte a -Z (forward local)
    const targetYaw = Math.atan2(-dx, -dz);
    this._bodyYaw = _lerpAngle(this._bodyYaw, targetYaw, Math.min(1, dt * this._bodyLerpSpeed));
    this.visitor.rotation.y = this._bodyYaw;
  }

  // ═══════════════════════════════════════════════════════════
  //  Internos — Head lookAt independiente del torso
  // ═══════════════════════════════════════════════════════════

  /**
   * @private
   * Rota el neckJoint para que la cabeza apunte DIRECTAMENTE al jugador.
   * SIN lerp — inmediato, frame a frame.
   *
   * La cabeza puede "adelantarse" al cuerpo: aunque el torso esté interpolando
   * lentamente, los ojos y la cabeza apuntan exactamente al objetivo en cada frame.
   *
   * Matemáticas (convertir dirección mundo → espacio local del cuerpo):
   *   localDx = dx × cos(bodyYaw) - dz × sin(bodyYaw)
   *   localDz = dx × sin(bodyYaw) + dz × cos(bodyYaw)
   *   headYaw = atan2(-localDx, -localDz)  ← misma convención Three.js
   */
  _updateHeadLookAt() {
    if (!this._neckJoint) return;

    if (this._state === STATES.DORMANT) {
      // En DORMANT: cabeza vuelve a posición neutral
      this._neckJoint.rotation.y = 0;
      this._neckJoint.rotation.z = 0.08; // Preservar el tilt fijo
      return;
    }

    const dx = this._vPlayerPos.x - this.visitor.position.x;
    const dz = this._vPlayerPos.z - this.visitor.position.z;
    if (dx * dx + dz * dz < 0.0001) return;

    const bodyYaw = this.visitor.rotation.y;

    // Dirección al jugador en el espacio local del cuerpo (Ry(-bodyYaw) × worldDir)
    const localDx = dx * Math.cos(bodyYaw) - dz * Math.sin(bodyYaw);
    const localDz = dx * Math.sin(bodyYaw) + dz * Math.cos(bodyYaw);

    // Ángulo del neckJoint en espacio local del cuerpo
    const headYaw = Math.atan2(-localDx, -localDz);

    // Aplicar DIRECTAMENTE — sin lerp, independiente del torso
    this._neckJoint.rotation.y = headYaw;
    this._neckJoint.rotation.z = 0.08; // Preservar el tilt fijo de 0.08 rad
  }

  // ═══════════════════════════════════════════════════════════
  //  Internos — Head Turn Trigger (5 segundos quieto → giro brusco)
  // ═══════════════════════════════════════════════════════════

  /** @private Inicia la animación del giro brusco de cabeza. */
  _triggerHeadTurn() {
    this._headTurnActive = true;
    this._headTurnTimer  = 0;
    // Alternar la dirección lateral en cada disparo (izquierda ↔ derecha)
    this._headTurnSide = this._headTurnSide === 1 ? -1 : 1;
    this.emit('headTurn', { angle: this._headTurnAngle * this._headTurnSide });
  }

  /**
   * @private
   * Anima el giro brusco usando una curva asimétrica:
   *   - 40% del tiempo: rampa rápida hacia el ángulo pico
   *   - 60% del tiempo: retorno gradual a la posición neutral
   *
   * @param {number} dt
   */
  _animateHeadTurn(dt) {
    if (!this._neckJoint) { this._headTurnActive = false; return; }

    this._headTurnTimer += dt;
    const progress = Math.min(1, this._headTurnTimer / this._headTurnDuration);

    let headYaw;
    if (progress < 0.4) {
      // Rampa rápida: 0 → pico
      headYaw = this._headTurnAngle * this._headTurnSide * (progress / 0.4);
    } else {
      // Retorno gradual: pico → 0
      headYaw = this._headTurnAngle * this._headTurnSide * (1 - (progress - 0.4) / 0.6);
    }

    this._neckJoint.rotation.y = headYaw;
    this._neckJoint.rotation.z = 0.08;

    if (progress >= 1) {
      this._headTurnActive = false;
      this._headTurnTimer  = 0;
    }
  }
}

// ─────────────────────────────────────────────────────────────
//  Utilidades internas
// ─────────────────────────────────────────────────────────────

/**
 * Interpolación de ángulos por el camino más corto.
 * Evita el salto de 0 → 2π cuando se cruza la frontera.
 *
 * @param {number} current  Ángulo actual (rad)
 * @param {number} target   Ángulo objetivo (rad)
 * @param {number} t        Factor de lerp (0–1)
 * @returns {number}
 */
function _lerpAngle(current, target, t) {
  let diff = target - current;
  while (diff >  Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return current + diff * t;
}

export { VisitorAI, STATES };
/**
 * ═══════════════════════════════════════════════════════════════
 *  ScriptedEvents.js — Gestor de Eventos Scripteados e Interactivos
 *  Three.js r160 · Módulo ES6 · Coreografías de Terror
 * ═══════════════════════════════════════════════════════════════
 */

import * as THREE from 'three';
import TheVisitor from './TheVisitor.js';
import EyeSystem from './EyeSystem.js';

// ─────────────────────────────────────────────────────────────
//  Funciones Auxiliares para Generar Texturas Procedimentales
// ─────────────────────────────────────────────────────────────

/** Genera el dibujo infantil en un canvas 2D */
function createCrayonDrawing(turned = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Fondo de papel arrugado beige
  ctx.fillStyle = '#eae5d8';
  ctx.fillRect(0, 0, 512, 512);
  
  // Textura de papel arrugado
  ctx.strokeStyle = 'rgba(0,0,0,0.04)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 512, 0);
    ctx.lineTo(Math.random() * 512, 512);
    ctx.stroke();
  }
  
  // Dibujar la carpa (Zona 1) con crayón rojo
  ctx.strokeStyle = '#c94c4c';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  ctx.moveTo(100, 380);
  ctx.lineTo(256, 120);
  ctx.lineTo(412, 380);
  ctx.closePath();
  ctx.stroke();
  
  // Garabatos dentro de la carpa
  ctx.strokeStyle = 'rgba(201, 76, 76, 0.25)';
  ctx.lineWidth = 4;
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    ctx.moveTo(180 + Math.random() * 150, 220 + Math.random() * 140);
    ctx.lineTo(180 + Math.random() * 150, 220 + Math.random() * 140);
    ctx.stroke();
  }
  
  // Dibujar figura pequeña (jugador) en crayón azul
  ctx.strokeStyle = '#4c8fc9';
  ctx.lineWidth = 5;
  // Cabeza
  ctx.beginPath();
  ctx.arc(200, 310, 10, 0, Math.PI * 2);
  ctx.stroke();
  // Cuerpo
  ctx.beginPath();
  ctx.moveTo(200, 320);
  ctx.lineTo(200, 355);
  // Brazos
  ctx.moveTo(185, 335);
  ctx.lineTo(215, 335);
  // Piernas
  ctx.moveTo(200, 355);
  ctx.lineTo(188, 375);
  ctx.moveTo(200, 355);
  ctx.lineTo(212, 375);
  ctx.stroke();
  
  // Dibujar figura alta (The Visitor) en crayón negro
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 5.5;
  const headX = 290;
  const headY = 220;
  
  // Cabeza
  ctx.beginPath();
  ctx.arc(headX, headY, 14, 0, Math.PI * 2);
  ctx.stroke();
  // Cuerpo
  ctx.beginPath();
  ctx.moveTo(headX, headY + 14);
  ctx.lineTo(headX, headY + 80);
  ctx.stroke();
  // Brazos extremadamente largos
  ctx.beginPath();
  ctx.moveTo(headX, headY + 24);
  ctx.bezierCurveTo(headX - 40, headY + 40, headX - 60, headY + 100, headX - 55, headY + 150);
  ctx.moveTo(headX, headY + 24);
  ctx.bezierCurveTo(headX + 45, headY + 40, headX + 65, headY + 100, headX + 60, headY + 150);
  ctx.stroke();
  // Piernas
  ctx.beginPath();
  ctx.moveTo(headX, headY + 80);
  ctx.lineTo(headX - 18, headY + 155);
  ctx.moveTo(headX, headY + 80);
  ctx.lineTo(headX + 18, headY + 155);
  ctx.stroke();
  
  // Dibujar cara del monstruo
  ctx.fillStyle = '#1a1a1a';
  if (turned) {
    // Cabeza girada mirando a la figura pequeña
    ctx.beginPath();
    ctx.arc(headX - 7, headY - 2, 2.5, 0, Math.PI * 2);
    ctx.arc(headX - 2, headY - 3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Sonrisa inquietante
    ctx.beginPath();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.2;
    ctx.arc(headX - 5, headY + 6, 4, 0, Math.PI, true);
    ctx.stroke();
  } else {
    // Mirada al frente
    ctx.beginPath();
    ctx.arc(headX - 4, headY - 1, 2, 0, Math.PI * 2);
    ctx.arc(headX + 4, headY - 1, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Boca plana neutra
    ctx.beginPath();
    ctx.moveTo(headX - 5, headY + 6);
    ctx.lineTo(headX + 5, headY + 6);
    ctx.stroke();
  }
  
  // Nota infantil
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.font = '22px Courier New, monospace';
  ctx.fillText("él me ve", 80, 80);
  
  return canvas;
}

/** Genera la foto polaroid en un canvas 2D */
function createPolaroidDrawing() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // Marco blanco
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(0, 0, 256, 256);
  
  // Zona de foto
  ctx.fillStyle = '#dfd9cc';
  ctx.fillRect(16, 16, 224, 180);
  
  // Carpa en la foto
  ctx.strokeStyle = 'rgba(180, 60, 60, 0.4)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(60, 160);
  ctx.lineTo(128, 50);
  ctx.lineTo(196, 160);
  ctx.closePath();
  ctx.stroke();
  
  // Niño
  ctx.strokeStyle = '#285888';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(95, 125, 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(95, 131);
  ctx.lineTo(95, 150);
  ctx.moveTo(87, 138);
  ctx.lineTo(103, 138);
  ctx.moveTo(95, 150);
  ctx.lineTo(88, 165);
  ctx.moveTo(95, 150);
  ctx.lineTo(102, 165);
  ctx.stroke();
  
  // Monstruo borroso (multi-pasadas transparentes desplazadas)
  ctx.strokeStyle = 'rgba(15, 15, 15, 0.08)';
  ctx.lineWidth = 3.5;
  const headX = 145;
  const headY = 85;
  
  for (let i = 0; i < 8; i++) {
    const ox = (Math.random() - 0.5) * 8;
    const oy = (Math.random() - 0.5) * 8;
    
    // Cabeza
    ctx.beginPath();
    ctx.arc(headX + ox, headY + oy, 10, 0, Math.PI * 2);
    ctx.stroke();
    // Cuerpo
    ctx.beginPath();
    ctx.moveTo(headX + ox, headY + 10 + oy);
    ctx.lineTo(headX + ox, headY + 55 + oy);
    ctx.stroke();
    // Brazos largos
    ctx.beginPath();
    ctx.moveTo(headX + ox, headY + 18 + oy);
    ctx.bezierCurveTo(headX - 25 + ox, headY + 28 + oy, headX - 45 + ox, headY + 68 + oy, headX - 40 + ox, headY + 105 + oy);
    ctx.moveTo(headX + ox, headY + 18 + oy);
    ctx.bezierCurveTo(headX + 25 + ox, headY + 28 + oy, headX + 45 + ox, headY + 68 + oy, headX + 40 + ox, headY + 105 + oy);
    ctx.stroke();
  }
  
  // Texto polaroid
  ctx.fillStyle = '#666';
  ctx.font = '12px Courier New, monospace';
  ctx.fillText("Recuerdo...", 28, 220);
  
  return canvas;
}

// ─────────────────────────────────────────────────────────────
//  Síntesis Procedural de Audio Novedosa
// ─────────────────────────────────────────────────────────────

/** Reproduce una melodía de cajita de música (3 notas) */
function playMusicBox(audioCtx, audioLimiter = null) {
  if (!audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    // Notas: Mi6 (1318.51 Hz), Sol6 (1567.98 Hz), Si6 (1975.53 Hz)
    const notes = [1318.51, 1567.98, 1975.53];
    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.32;
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gainNode.gain.setValueAtTime(0.001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.18, startTime + 0.006);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 1.4);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      if (audioLimiter) {
        const id = `music_box_${idx}_${Math.random()}`;
        audioLimiter.register(id, 4, gainNode, 0.18);
        setTimeout(() => audioLimiter.unregister(id), 1500 + idx * 320);
      }
      
      osc.start(startTime);
      osc.stop(startTime + 1.5);
    });
  } catch (e) {
    console.warn("No se pudo reproducir sonido de cajita de música:", e);
  }
}

/** Reproduce un gemido gutural ahogado espacializado en 3D */
function playChokedMoan(audioCtx, position, audioLimiter = null) {
  if (!audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    
    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(0.30, now + 1.3);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);
    
    // Panner espacializador
    const panner = audioCtx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 3.0;
    panner.maxDistance = 50.0;
    
    if (panner.positionX) {
      panner.positionX.setValueAtTime(position.x, now);
      panner.positionY.setValueAtTime(position.y, now);
      panner.positionZ.setValueAtTime(position.z, now);
    } else {
      panner.setPosition(position.x, position.y, position.z);
    }
    
    // 1. Cuerdas vocales: oscilador diente de sierra muy grave
    const osc = audioCtx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(70, now);
    osc.frequency.linearRampToValueAtTime(62, now + 1.4); // pérdida de tono al ahogarse
    
    const vocalFilter = audioCtx.createBiquadFilter();
    vocalFilter.type = 'lowpass';
    vocalFilter.frequency.setValueAtTime(200, now);
    vocalFilter.Q.value = 5.0; // resonante
    
    // 2. Ruido sibilante de respiración
    const bufferSize = audioCtx.sampleRate * 2.0;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(320, now);
    noiseFilter.Q.value = 2.5;
    
    // Conectar nodos
    osc.connect(vocalFilter);
    vocalFilter.connect(masterGain);
    
    noiseNode.connect(noiseFilter);
    noiseFilter.connect(masterGain);
    
    masterGain.connect(panner);
    panner.connect(audioCtx.destination);
    
    if (audioLimiter) {
      const id = `choked_moan_${Math.random()}`;
      audioLimiter.register(id, 4, masterGain, 0.30);
      setTimeout(() => audioLimiter.unregister(id), 2000);
    }
    
    // Iniciar
    osc.start(now);
    osc.stop(now + 2.0);
    noiseNode.start(now);
    noiseNode.stop(now + 2.0);
  } catch (e) {
    console.warn("No se pudo reproducir sonido de gemido:", e);
  }
}

// ─────────────────────────────────────────────────────────────
//  Clase Principal Gestora de Eventos
// ─────────────────────────────────────────────────────────────

export default class ScriptedEvents {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   * @param {TheVisitor} visitor - El visitante principal orbital
   * @param {VisitorAI} visitorAI - El controlador de la IA principal
   * @param {EyeSystem} eyeSystem - El sistema ocular del visitante principal
   * @param {FearEngine} fearEngine - Motor de miedo del juego
   * @param {Function} logEventFn - Función para imprimir en la consola HUD
   * @param {Object} [audioGlobals] - Objeto para acceder/compartir variables de Web Audio
   * @param {Function} [playFootstepFn] - Función externa para reproducir pasos
   */
  constructor(scene, camera, visitor, visitorAI, eyeSystem, fearEngine, logEventFn, audioGlobals = {}, playFootstepFn = null) {
    this.scene = scene;
    this.camera = camera;
    this.visitor = visitor;
    this.visitorAI = visitorAI;
    this.eyeSystem = eyeSystem;
    this.fearEngine = fearEngine;
    this.logEvent = logEventFn;
    this.audioGlobals = audioGlobals;
    this.playFootstep = playFootstepFn;
    
    // Cronología
    this.activeAct = 0; // Acto 0 a 4 (4 = Final)
    this.currentTime = 0.0; // segundos
    this.isTimeRunning = true;
    
    // Estados de los Momentos
    this.momentStates = {
      m1: 'DORMANT',   // 'DORMANT', 'LOOKED_AT', 'TRIGGERED'
      m2: 'DORMANT',   // 'DORMANT', 'LOOKING', 'CHANGED'
      m3: 'DORMANT',   // 'DORMANT', 'TRIGGERED'
      m4: 'DORMANT',   // 'DORMANT', 'LOOKING_AT_FACE', 'TRIGGERED'
      m5: 'DORMANT'    // 'DORMANT', 'LOOKED_AT'
    };
    
    // Timers de estados internos
    this.m2LookTime = 0.0;
    this.m4LookTime = 0.0;
    
    // Referencias a Props 3D
    this.props = {
      teddyBear: null,
      drawingWall: null,
      drawingMesh: null,
      drawingTexture: null,
      nuclearMonster: null,
      nuclearMouth: null,
      nuclearEyeSystem: null,
      polaroid: null
    };
    
    this.initProps();
  }
  
  /** Inicializa y añade todos los objetos 3D necesarios para las coreografías */
  initProps() {
    const brownMat = new THREE.MeshStandardMaterial({ color: 0x5a3e2e, roughness: 0.9, flatShading: true });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf0edf5, roughness: 0.8, flatShading: true });
    
    // ─────────────────────────────────────────────────────────────
    //  MOMENTO 1: Oso de Peluche (Zona 1 local: -3, 0.25, 4 => world: -48, 0.25, 4)
    // ─────────────────────────────────────────────────────────────
    const bear = new THREE.Group();
    bear.name = "TeddyBear";
    
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), brownMat);
    body.castShadow = true;
    bear.add(body);
    
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 8), brownMat);
    head.position.y = 0.26;
    head.castShadow = true;
    bear.add(head);
    
    const snout = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), whiteMat);
    snout.position.set(0, 0.23, 0.14);
    head.add(snout);
    
    const lEar = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), brownMat);
    lEar.position.set(-0.12, 0.38, 0.05);
    bear.add(lEar);
    
    const rEar = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), brownMat);
    rEar.position.set(0.12, 0.38, 0.05);
    bear.add(rEar);
    
    const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.2), brownMat);
    lArm.position.set(-0.25, 0.08, 0.05);
    lArm.rotation.z = Math.PI / 4;
    bear.add(lArm);
    
    const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.2), brownMat);
    rArm.position.set(0.25, 0.08, 0.05);
    rArm.rotation.z = -Math.PI / 4;
    bear.add(rArm);
    
    const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.22), brownMat);
    lLeg.position.set(-0.14, -0.20, 0.12);
    lLeg.rotation.x = -Math.PI / 3;
    bear.add(lLeg);
    
    const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.22), brownMat);
    rLeg.position.set(0.14, -0.20, 0.12);
    rLeg.rotation.x = -Math.PI / 3;
    bear.add(rLeg);
    
    // Posicionarlo en Zona 1
    bear.position.set(-3.0, 0.24, 4.0); // y=0.24 para tocar el suelo
    this.props.teddyBear = bear;
    
    // Buscar la Zona 1 por su nombre e insertarlo para heredar matrices y luces
    const z1 = this.scene.getObjectByName("Zone1_Tower");
    if (z1) z1.add(bear);
    
    // ─────────────────────────────────────────────────────────────
    //  MOMENTO 2: Camerino con Dibujo Infantil (Zona 1 local: 6, 2, -6 => world: -39, 2, -6)
    // ─────────────────────────────────────────────────────────────
    const partition = new THREE.Group();
    partition.name = "DressingRoomWall";
    
    // Pared divisoria del camerino (offset)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x2e3440, roughness: 0.95, flatShading: true });
    const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 4, 3), wallMat);
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    partition.add(wallMesh);
    
    // El dibujo infantil de crayón montado en la pared
    this.props.drawingTexture = new THREE.CanvasTexture(createCrayonDrawing(false));
    const paperMat = new THREE.MeshStandardMaterial({ 
      map: this.props.drawingTexture, 
      roughness: 0.8,
      metalness: 0.0
    });
    const drawingMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.9), paperMat);
    drawingMesh.position.set(0.06, 0.2, 0); // Ligeramente en la superficie del panel
    drawingMesh.rotation.y = Math.PI / 2; // Orientado hacia el centro del pasillo/cuba
    drawingMesh.castShadow = true;
    partition.add(drawingMesh);
    
    partition.position.set(6.0, 2.0, -6.0);
    this.props.drawingWall = partition;
    this.props.drawingMesh = drawingMesh;
    if (z1) z1.add(partition);
    
    // ─────────────────────────────────────────────────────────────
    //  MOMENTO 4: Monstruo del Núcleo (Zona 3 local: 0, 0, 0 => world: 45, 0, 0)
    //  - Mirando hacia -Z (de espaldas a la entrada usual)
    // ─────────────────────────────────────────────────────────────
    this.props.nuclearMonster = new TheVisitor();
    this.props.nuclearMonster.position.set(45.0, 0.0, 0.0);
    this.props.nuclearMonster.rotation.y = 0.0; // Mira directamente hacia -Z
    
    // Instanciar sus ojos propios
    this.props.nuclearEyeSystem = new EyeSystem(this.props.nuclearMonster);
    this.props.nuclearEyeSystem.setActPhase(1.8); // ojos encendidos misteriosamente
    
    // Añadir ranura de boca a la cabeza
    const headPart = this.props.nuclearMonster.getPart('head');
    if (headPart) {
      const mouthGeo = new THREE.BoxGeometry(0.12, 0.02, 0.04);
      const mouthMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      this.props.nuclearMouth = new THREE.Mesh(mouthGeo, mouthMat);
      this.props.nuclearMouth.name = "mouth";
      this.props.nuclearMouth.position.set(0, -0.4, -0.92); // Frente de la cabeza, parte baja
      this.props.nuclearMouth.scale.y = 2.0; // Boca abierta
      headPart.add(this.props.nuclearMouth);
    }
    
    this.scene.add(this.props.nuclearMonster);
    
    // ─────────────────────────────────────────────────────────────
    //  MOMENTO 5: Polaroid de la Infancia (Zona 3 local: -3, 0.015, 3 => world: 42, 0.015, 3)
    // ─────────────────────────────────────────────────────────────
    const polaroidTex = new THREE.CanvasTexture(createPolaroidDrawing());
    const polaroidMat = new THREE.MeshStandardMaterial({
      map: polaroidTex,
      roughness: 0.6,
      metalness: 0.1
    });
    const polaroidMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.005, 0.28), polaroidMat);
    polaroidMesh.name = "PolaroidPhoto";
    polaroidMesh.position.set(-3.0, 0.015, 3.0);
    polaroidMesh.rotation.y = Math.PI / 6; // ligeramente rotada en el suelo
    
    this.props.polaroid = polaroidMesh;
    const z3 = this.scene.getObjectByName("Zone3_RoomGrid");
    if (z3) z3.add(polaroidMesh);
  }
  
  /** Actualiza la lógica de eventos y cronología
   * @param {number} dt - delta time
   */
  update(dt) {
    if (this.isTimeRunning) {
      this.currentTime += dt;
    }
    
    // Posiciones absolutas de mundo
    const bearWorldPos = new THREE.Vector3();
    if (this.props.teddyBear) this.props.teddyBear.getWorldPosition(bearWorldPos);
    
    const drawingWorldPos = new THREE.Vector3();
    if (this.props.drawingMesh) this.props.drawingMesh.getWorldPosition(drawingWorldPos);
    
    const monsterWorldPos = new THREE.Vector3();
    if (this.props.nuclearMonster) this.props.nuclearMonster.getWorldPosition(monsterWorldPos);
    
    const polaroidWorldPos = new THREE.Vector3();
    if (this.props.polaroid) this.props.polaroid.getWorldPosition(polaroidWorldPos);
    
    // Dirección y vector frontal de la cámara
    const camDir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion).normalize();
    
    // ─────────────────────────────────────────────────────────────
    //  MOMENTO 1: El Juguete (Acto 0, Minuto 2)
    // ─────────────────────────────────────────────────────────────
    if (this.activeAct === 0 && this.momentStates.m1 !== 'TRIGGERED') {
      const dist = this.camera.position.distanceTo(bearWorldPos);
      const dirToBear = bearWorldPos.clone().sub(this.camera.position).normalize();
      const dot = camDir.dot(dirToBear);
      
      if (this.momentStates.m1 === 'DORMANT') {
        // Si el jugador lo mira de cerca
        if (dot > 0.95 && dist < 12.0) {
          this.momentStates.m1 = 'LOOKED_AT';
          this.logEvent("🧸 EVENTO: Has observado el oso de peluche tirado en la carpa.");
        }
      } else if (this.momentStates.m1 === 'LOOKED_AT') {
        // Se aleja y da la espalda
        if (dist >= 8.0 && dot < 0.0) {
          this.momentStates.m1 = 'TRIGGERED';
          // Sonido cajita de música (3 notas)
          playMusicBox(this.audioGlobals.audioCtx || window.audioCtx, this.audioGlobals.audioLimiter);
          this.logEvent("🎶 EVENTO: Escuchas una melodía de cajita de música (3 notas) detrás de ti.");
        }
      }
    }
    
    // ─────────────────────────────────────────────────────────────
    //  MOMENTO 2: El Dibujo (Acto 1, Minuto 8)
    // ─────────────────────────────────────────────────────────────
    if (this.activeAct === 1 && this.momentStates.m2 !== 'CHANGED') {
      const dist = this.camera.position.distanceTo(drawingWorldPos);
      const dirToDrawing = drawingWorldPos.clone().sub(this.camera.position).normalize();
      const dot = camDir.dot(dirToDrawing);
      
      if (this.momentStates.m2 === 'DORMANT') {
        if (dot > 0.97 && dist < 7.0) {
          this.momentStates.m2 = 'LOOKING';
          this.m2LookTime = 0.0;
          this.logEvent("🎨 EVENTO: Estás observando el dibujo infantil en la pared...");
        }
      } else if (this.momentStates.m2 === 'LOOKING') {
        if (dot > 0.94) {
          this.m2LookTime += dt;
          if (this.m2LookTime >= 4.0) {
            // Se marca para actualización tras 4 segundos continuos de contemplación
            this.m2LookTime = -999.0; // Bloqueo de incremento
            this.logEvent("🎨 EVENTO: El dibujo emana algo inquietante. Sientes que debes mirar hacia otro lado.");
          }
        } else if (this.m2LookTime < 0.0) {
          // El jugador aparta la mirada (dot es bajo) -> El dibujo cambia
          if (dot < 0.5) {
            this.momentStates.m2 = 'CHANGED';
            
            // Redibujar textura del canvas con cabeza girada
            const changedCanvas = createCrayonDrawing(true);
            if (this.props.drawingTexture) {
              this.props.drawingTexture.image = changedCanvas;
              this.props.drawingTexture.needsUpdate = true;
            }
            this.logEvent("😱 EVENTO: Volteas la mirada. El dibujo en la pared ha cambiado: ¡La figura alta te mira!");
          }
        } else {
          // Si aparta la mirada antes de 4s, se reinicia el trigger
          this.momentStates.m2 = 'DORMANT';
        }
      }
    }
    
    // ─────────────────────────────────────────────────────────────
    //  MOMENTO 3: Los Pasos (Acto 2, Minuto 18)
    // ─────────────────────────────────────────────────────────────
    // (Este evento se ejecuta al desactivar movimiento en index.html, manejado por callback directo)
    
    // ─────────────────────────────────────────────────────────────
    //  MOMENTO 4: La Cabeza (Acto 3, Encuentro con Monstruo del Núcleo)
    // ─────────────────────────────────────────────────────────────
    if (this.activeAct === 3 && this.momentStates.m4 !== 'TRIGGERED' && this.props.nuclearMonster && this.props.nuclearMonster.visible) {
      const dist = this.camera.position.distanceTo(monsterWorldPos);
      const dirToMonster = monsterWorldPos.clone().sub(this.camera.position).normalize();
      const dot = camDir.dot(dirToMonster);
      
      // El monstruo mira a -Z. Su rostro apunta a -Z.
      // Si la cámara está en la parte delantera (Z relativo es menor, por ejemplo, camera.z < monster.z - 0.2)
      const isCameraInFront = this.camera.position.z < monsterWorldPos.z;
      
      if (this.momentStates.m4 === 'DORMANT') {
        if (isCameraInFront && dot > 0.95 && dist < 6.5) {
          this.momentStates.m4 = 'LOOKING_AT_FACE';
          this.m4LookTime = 0.0;
          this.logEvent("💀 EVENTO: Estás cara a cara con TheVisitor. Sus ojos están abiertos y su boca ligeramente desencajada.");
        }
      } else if (this.momentStates.m4 === 'LOOKING_AT_FACE') {
        if (isCameraInFront && dot > 0.90) {
          this.m4LookTime += dt;
          
          // Ojos siguen a la cámara de forma local
          if (this.props.nuclearEyeSystem) {
            this.props.nuclearEyeSystem.lookAt(this.camera.position);
          }
          
          if (this.m4LookTime >= 8.0) {
            this.momentStates.m4 = 'TRIGGERED';
            
            // Cerrar la boca repentinamente
            if (this.props.nuclearMouth) {
              this.props.nuclearMouth.scale.y = 0.0;
            }
            
             // Sonido de gemido/respiración ahogada y fallida
             playChokedMoan(this.audioGlobals.audioCtx || window.audioCtx, monsterWorldPos, this.audioGlobals.audioLimiter);
            this.logEvent("🔊 EVENTO: El monstruo cierra la boca emitiendo un estertor sofocado... y se disipa.");
            
            // Desaparecer en la oscuridad
            let opacity = 1.0;
            const fadeInterval = setInterval(() => {
              opacity -= 0.1;
              this.props.nuclearMonster.traverseMeshes((mesh) => {
                mesh.material.transparent = true;
                mesh.material.opacity = opacity;
              });
              if (opacity <= 0.0) {
                clearInterval(fadeInterval);
                this.props.nuclearMonster.visible = false;
              }
            }, 50);
          }
        } else {
          // Si el jugador rompe el contacto visual a la cara, se pausa/reinicia el timer
          this.momentStates.m4 = 'DORMANT';
        }
      }
    }
    
    // ─────────────────────────────────────────────────────────────
    //  MOMENTO 5: La Foto (Final del juego / 30 segundos antes)
    // ─────────────────────────────────────────────────────────────
    if (this.activeAct === 4 && this.momentStates.m5 !== 'LOOKED_AT') {
      const dist = this.camera.position.distanceTo(polaroidWorldPos);
      const dirToPolaroid = polaroidWorldPos.clone().sub(this.camera.position).normalize();
      const dot = camDir.dot(dirToPolaroid);
      
      if (dot > 0.97 && dist < 5.0) {
        this.momentStates.m5 = 'LOOKED_AT';
        this.logEvent("📸 EVENTO: Observas la foto Polaroid en el suelo. Eres tú de niño en la carpa, y al lado... una sombra borrosa.");
      }
    }
  }
  
  /** Dispara un evento manualmente forzando estados y moviendo la cámara al objetivo 
   * @param {number} number - Número de evento (1 a 5)
   * @param {THREE.Vector3} cameraTargetPos - Vector donde lerpear la cámara
   * @param {THREE.Vector3} controlsTargetPos - Objetivo de los OrbitControls
   */
  triggerEventManually(number, cameraTargetPos, controlsTargetPos) {
    if (!this.audioGlobals.audioCtx) {
      this.logEvent("⚠️ Haz clic en el canvas o interactúa primero para inicializar el AudioContext.");
      return;
    }
    
    this.logEvent(`🚀 EVENTO MANUAL: Disparando Coreografía del Momento ${number}`);
    
    if (number === 1) {
      // Forzar Acto 0
      this.activeAct = 0;
      this.momentStates.m1 = 'LOOKED_AT';
      
      // Enfocar cámara al oso
      const bearPos = new THREE.Vector3();
      if (this.props.teddyBear) this.props.teddyBear.getWorldPosition(bearPos);
      
      cameraTargetPos.set(bearPos.x, bearPos.y + 1.2, bearPos.z + 1.8);
      controlsTargetPos.copy(bearPos);
      
      // Simular que el jugador se aleja y voltea
      setTimeout(() => {
        cameraTargetPos.set(bearPos.x, bearPos.y + 3.0, bearPos.z + 8.5); // alejado
        // Rotar cámara de espaldas (mirando hacia el lado opuesto en Z)
        setTimeout(() => {
          this.camera.lookAt(new THREE.Vector3(bearPos.x, bearPos.y, bearPos.z + 20));
          this.momentStates.m1 = 'TRIGGERED';
          playMusicBox(this.audioGlobals.audioCtx || window.audioCtx, this.audioGlobals.audioLimiter);
          this.logEvent("🎶 EVENTO (Manual): El oso suena detrás de ti (Cajita de música).");
        }, 800);
      }, 1000);
      
    } else if (number === 2) {
      this.activeAct = 1;
      this.momentStates.m2 = 'LOOKING';
      this.m2LookTime = 0.0;
      
      // Enfocar panel de dibujo
      const dwPos = new THREE.Vector3();
      if (this.props.drawingMesh) this.props.drawingMesh.getWorldPosition(dwPos);
      
      cameraTargetPos.set(dwPos.x + 1.8, dwPos.y, dwPos.z);
      controlsTargetPos.copy(dwPos);
      
      // Cambiar dibujo a los 4 segundos
      setTimeout(() => {
        this.logEvent("🎨 EVENTO (Manual): Los 4 segundos expiran. El dibujo se actualiza al mirar al lado.");
        // Rotar cámara para mirar al lado
        cameraTargetPos.set(dwPos.x + 2.0, dwPos.y + 0.5, dwPos.z + 2.0);
        setTimeout(() => {
          this.momentStates.m2 = 'CHANGED';
          const changedCanvas = createCrayonDrawing(true);
          if (this.props.drawingTexture) {
            this.props.drawingTexture.image = changedCanvas;
            this.props.drawingTexture.needsUpdate = true;
          }
          // Volver a enfocar el dibujo
          cameraTargetPos.set(dwPos.x + 1.8, dwPos.y, dwPos.z);
          controlsTargetPos.copy(dwPos);
          this.logEvent("😱 EVENTO (Manual): ¡El dibujo ha mutado!");
        }, 1000);
      }, 4000);
      
    } else if (number === 3) {
      this.activeAct = 2;
      this.momentStates.m3 = 'TRIGGERED';
      
      // El jugador detiene su movimiento
      this.logEvent("👣 EVENTO (Manual): Te detienes en el pasillo... Escuchas pasos adicionales.");
      
      // Simular reproducción de los 2 pasos fantasmas
      const now = this.audioGlobals.audioCtx.currentTime;
      if (this.playFootstep) {
        // Paso 1 (550ms después)
        setTimeout(() => {
          this.playFootstep('wood');
          this.logEvent("👣 PASO GHOST 1 (atrás)");
        }, 550);
        // Paso 2 (1100ms después)
        setTimeout(() => {
          this.playFootstep('wood');
          this.logEvent("👣 PASO GHOST 2 (atrás)");
        }, 1100);
      }
      
    } else if (number === 4) {
      this.activeAct = 3;
      this.momentStates.m4 = 'LOOKING_AT_FACE';
      this.m4LookTime = 0.0;
      
      // Reiniciar visibilidad del monstruo si desapareció antes
      if (this.props.nuclearMonster) {
        this.props.nuclearMonster.visible = true;
        this.props.nuclearMonster.traverseMeshes((mesh) => {
          mesh.material.transparent = false;
          mesh.material.opacity = 1.0;
        });
      }
      if (this.props.nuclearMouth) {
        this.props.nuclearMouth.scale.y = 2.0; // Boca abierta
      }
      
      const monPos = new THREE.Vector3();
      if (this.props.nuclearMonster) this.props.nuclearMonster.getWorldPosition(monPos);
      
      // Frente del monstruo es en -Z (ya que mira hacia -Z)
      cameraTargetPos.set(monPos.x, monPos.y + 1.6, monPos.z - 2.5); // delante de él
      controlsTargetPos.set(monPos.x, monPos.y + 1.6, monPos.z);
      
      // Esperar 8 segundos cara a cara
      setTimeout(() => {
        this.momentStates.m4 = 'TRIGGERED';
        if (this.props.nuclearMouth) {
          this.props.nuclearMouth.scale.y = 0.0; // Cerrar boca
        }
        playChokedMoan(this.audioGlobals.audioCtx || window.audioCtx, monPos, this.audioGlobals.audioLimiter);
        this.logEvent("🔊 EVENTO (Manual): TheVisitor cierra la boca, emite gemido ahogado y desaparece.");
        
        let opacity = 1.0;
        const fadeInterval = setInterval(() => {
          opacity -= 0.1;
          this.props.nuclearMonster.traverseMeshes((mesh) => {
            mesh.material.transparent = true;
            mesh.material.opacity = opacity;
          });
          if (opacity <= 0.0) {
            clearInterval(fadeInterval);
            this.props.nuclearMonster.visible = false;
          }
        }, 50);
      }, 8000);
      
    } else if (number === 5) {
      this.activeAct = 4;
      this.momentStates.m5 = 'LOOKED_AT';
      
      const polPos = new THREE.Vector3();
      if (this.props.polaroid) this.props.polaroid.getWorldPosition(polPos);
      
      cameraTargetPos.set(polPos.x, polPos.y + 0.8, polPos.z + 0.5);
      controlsTargetPos.copy(polPos);
      this.logEvent("📸 EVENTO (Manual): Examinas la foto Polaroid tirada en el suelo.");
    }
  }
}
/**
 * ═══════════════════════════════════════════════════════════════
 *  Zones.js — Geometrías de Zona para Escenario 3D
 *  Three.js r160 · Módulo ES6
 * ═══════════════════════════════════════════════════════════════
 */

import * as THREE from 'three';

// Paleta de colores planos premium (Estilo Nórdico / Industrial Oscuro)
export const COLORS = {
  floor: 0x1e222b,         // Gris carbón oscuro
  wall: 0x2e3440,          // Gris pizarra
  wallAccent: 0x3b4252,    // Gris azulado
  coneRoof: 0x434c5e,      // Pizarra claro
  door: 0xd08770,          // Naranja óxido/arcilla (contraste)
  zone1Cylinder: 0x4c566a, // Acero templado
  gridFloor: 0x1b1f27      // Fondo rejilla oscuro
};

// Materiales estándar con acabado mate
const createMaterial = (color) => {
  return new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.85,
    metalness: 0.15,
    flatShading: true
  });
};

/**
 * ─────────────────────────────────────────────────────────────
 *  ZONA 1: Torre Octogonal (Cilindro + Techo Cónico)
 *  - Cilindro de 8 lados, radio 14m, altura 5m
 *  - Techo cónico de 4m de altura extra
 * ─────────────────────────────────────────────────────────────
 */
export function createZone1() {
  const group = new THREE.Group();
  group.name = "Zone1_Tower";

  const cylinderMaterial = createMaterial(COLORS.zone1Cylinder);
  const roofMaterial = createMaterial(COLORS.coneRoof);
  const floorMaterial = createMaterial(COLORS.floor);

  // 1. Piso de la Torre
  const floorGeo = new THREE.CylinderGeometry(14, 14, 0.2, 8);
  const floorMesh = new THREE.Mesh(floorGeo, floorMaterial);
  floorMesh.position.y = -0.1;
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // 2. Cilindro principal (8 lados, radio 14, altura 5)
  // Usamos openEnded = true para que sea hueco por dentro (permitiendo entrar)
  const cylinderGeo = new THREE.CylinderGeometry(14, 14, 5, 8, 1, true);
  const cylinderMesh = new THREE.Mesh(cylinderGeo, cylinderMaterial);
  cylinderMesh.position.y = 2.5; // Centrado en Y
  cylinderMesh.castShadow = true;
  cylinderMesh.receiveShadow = true;
  group.add(cylinderMesh);

  // 3. Techo Cónico (radio 14, altura 4, 8 lados)
  const coneGeo = new THREE.ConeGeometry(14, 4, 8, 1, true);
  const coneMesh = new THREE.Mesh(coneGeo, roofMaterial);
  // El cilindro mide 5m de alto (y va de 0 a 5). El cono mide 4m de alto, su centro está a 2m del inicio de su base.
  // Por tanto, la posición Y del centro del cono es 5m + 2m = 7m.
  coneMesh.position.y = 7;
  coneMesh.castShadow = true;
  group.add(coneMesh);

  // 4. Postes instanciados de soporte (x8)
  const poleGeo = new THREE.CylinderGeometry(0.12, 0.12, 5, 8);
  const poleMat = createMaterial(COLORS.zone1Cylinder);
  const polesMesh = new THREE.InstancedMesh(poleGeo, poleMat, 8);
  polesMesh.castShadow = true;
  polesMesh.receiveShadow = true;
  polesMesh.name = "Poles";
  
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = Math.cos(angle) * 13.5;
    const z = Math.sin(angle) * 13.5;
    const matrix = new THREE.Matrix4().makeTranslation(x, 2.5, z);
    polesMesh.setMatrixAt(i, matrix);
  }
  group.add(polesMesh);

  // 5. Tablones de gradas instanciados (x40)
  const plankGeo = new THREE.BoxGeometry(6.0, 0.08, 0.35);
  const plankMat = createMaterial(COLORS.coneRoof);
  const gradasMesh = new THREE.InstancedMesh(plankGeo, plankMat, 40);
  gradasMesh.castShadow = true;
  gradasMesh.receiveShadow = true;
  gradasMesh.name = "Gradas";

  let idx = 0;
  for (let r = 0; r < 5; r++) {
    const R = 9.5 + r * 0.7; // radio creciente
    const H = 0.2 + r * 0.4; // altura escalonada
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.cos(angle) * R;
      const z = Math.sin(angle) * R;
      
      const matrix = new THREE.Matrix4();
      const pos = new THREE.Vector3(x, H, z);
      // Rotar tangencialmente
      const rot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle + Math.PI / 2);
      const scale = new THREE.Vector3(1, 1, 1);
      matrix.compose(pos, rot, scale);
      
      gradasMesh.setMatrixAt(idx++, matrix);
    }
  }
  group.add(gradasMesh);

  return group;
}

/**
 * ─────────────────────────────────────────────────────────────
 *  ZONA 2: Pasillo con Puertas
 *  - Box de 30 x 3.5 x 4m
 *  - 10 puertas (5 a cada lado, 1m ancho x 2.5m alto) independientes
 * ─────────────────────────────────────────────────────────────
 */
export function createZone2() {
  const group = new THREE.Group();
  group.name = "Zone2_Corridor";

  const wallMaterial = createMaterial(COLORS.wall);
  const floorMaterial = createMaterial(COLORS.floor);
  const doorMaterial = createMaterial(COLORS.door);

  const length = 30;
  const width = 3.5;
  const height = 4;

  // 1. Suelo del pasillo
  const floorGeo = new THREE.BoxGeometry(length, 0.1, width);
  const floorMesh = new THREE.Mesh(floorGeo, floorMaterial);
  floorMesh.position.y = -0.05;
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // 2. Techo del pasillo
  const ceilingGeo = new THREE.BoxGeometry(length, 0.1, width);
  const ceilingMesh = new THREE.Mesh(ceilingGeo, floorMaterial);
  ceilingMesh.position.y = height + 0.05;
  group.add(ceilingMesh);

  // Guardamos las puertas en un array dentro del grupo para interactuar con ellas
  group.userData.doors = [];

  // Posiciones de las puertas a lo largo del eje X (-10, -5, 0, 5, 10)
  const doorXPositions = [-10, -5, 0, 5, 10];
  const doorW = 1.0;
  const doorH = 2.5;
  const doorT = 0.1; // Grosor de la puerta

  // Construcción de paredes laterales con huecos para las puertas
  // Lado Z positivo (z = 1.75) y Lado Z negativo (z = -1.75)
  const zSides = [width / 2, -width / 2];

  zSides.forEach((zPos, sideIndex) => {
    const isPositiveZ = zPos > 0;
    
    // Paneles de pared entre las puertas
    // Son 6 paneles de pared para tapar los huecos que no son puertas
    const wallSegments = [
      { start: -15, end: -10.5 },
      { start: -9.5, end: -5.5 },
      { start: -4.5, end: -0.5 },
      { start: 0.5, end: 4.5 },
      { start: 5.5, end: 9.5 },
      { start: 10.5, end: 15 }
    ];

    wallSegments.forEach(seg => {
      const segW = seg.end - seg.start;
      const segX = seg.start + segW / 2;
      const wallGeo = new THREE.BoxGeometry(segW, height, 0.1);
      const wallMesh = new THREE.Mesh(wallGeo, wallMaterial);
      wallMesh.position.set(segX, height / 2, zPos);
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      group.add(wallMesh);
    });

    // Paneles de pared sobre las puertas (de Y = 2.5 a 4.0, altura = 1.5m)
    doorXPositions.forEach(xPos => {
      const overDoorGeo = new THREE.BoxGeometry(doorW, height - doorH, 0.1);
      const overDoorMesh = new THREE.Mesh(overDoorGeo, wallMaterial);
      // Su centro está en Y = 2.5 + (1.5 / 2) = 3.25
      overDoorMesh.position.set(xPos, doorH + (height - doorH) / 2, zPos);
      overDoorMesh.castShadow = true;
      overDoorMesh.receiveShadow = true;
      group.add(overDoorMesh);
    });

    // 10 Puertas (Mesh independiente)
    doorXPositions.forEach((xPos, doorIndex) => {
      const doorGeo = new THREE.BoxGeometry(doorW, doorH, doorT);
      const doorMesh = new THREE.Mesh(doorGeo, doorMaterial);
      doorMesh.position.set(xPos, doorH / 2, zPos);
      doorMesh.castShadow = true;
      
      // Metadatos útiles para gameplay o interacción
      doorMesh.name = `Door_${isPositiveZ ? 'Left' : 'Right'}_${doorIndex}`;
      doorMesh.userData = {
        isOpen: false,
        initialY: doorH / 2,
        initialX: xPos,
        initialZ: zPos,
        slideDirection: isPositiveZ ? 1 : -1,
        width: doorW
      };

      group.add(doorMesh);
      group.userData.doors.push(doorMesh);
    });
  });

  // Métodos de utilidad para abrir y cerrar puertas mediante deslizamiento o rotación
  group.setDoorOpen = function(index, openStatus) {
    const door = group.userData.doors[index];
    if (!door) return;
    
    door.userData.isOpen = openStatus;
    // Si está abierta, la desplazamos hacia el lado (eje X)
    if (openStatus) {
      door.position.x = door.userData.initialX + door.userData.width * 0.9;
    } else {
      door.position.x = door.userData.initialX;
    }
  };

  return group;
}

/**
 * ─────────────────────────────────────────────────────────────
 *  ZONA 3: Grid de Habitaciones
 *  - Grid 4x4 de habitaciones de 6 x 6 x 3m
 *  - Paredes removibles individualmente para generar pasillos
 * ─────────────────────────────────────────────────────────────
 */
export function createZone3() {
  const group = new THREE.Group();
  group.name = "Zone3_RoomGrid";

  const wallMaterial = createMaterial(COLORS.wallAccent);
  const floorMaterial = createMaterial(COLORS.gridFloor);

  const roomSize = 6.0;
  const roomHeight = 3.0;
  const wallThickness = 0.2;

  // 1. Suelo dividido en 16 baldosas para Portal Culling
  group.userData.floors = [];
  const tileGeo = new THREE.BoxGeometry(roomSize, 0.1, roomSize);
  for (let row = 0; row < 4; row++) {
    const zPos = -9 + row * roomSize;
    for (let col = 0; col < 4; col++) {
      const xPos = -9 + col * roomSize;
      const tileMesh = new THREE.Mesh(tileGeo, floorMaterial);
      tileMesh.position.set(xPos, -0.05, zPos);
      tileMesh.receiveShadow = true;
      tileMesh.name = `Floor_${col}_${row}`;
      group.add(tileMesh);
      group.userData.floors.push(tileMesh);
    }
  }

  // Guardamos las paredes en mapas indexados para poder removerlas dinámicamente
  // Las paredes se separan en:
  // - "hWalls" (horizontales, paralelas al eje X)
  // - "vWalls" (verticales, paralelas al eje Z)
  group.userData.hWalls = new Map();
  group.userData.vWalls = new Map();

  // El grid 4x4 tiene 5 líneas de paredes horizontales y 5 líneas de paredes verticales.
  // Cada línea tiene 4 segmentos de pared (de longitud roomSize).

  // Generar paredes Horizontales (paralelas al eje X)
  // z index va de 0 a 4. x index va de 0 a 3.
  for (let z = 0; z <= 4; z++) {
    const zPos = -12 + z * roomSize; // Centrado en la rejilla (-12, -6, 0, 6, 12)
    for (let x = 0; x < 4; x++) {
      const xPos = -9 + x * roomSize; // Centrado en el segmento (-9, -3, 3, 9)

      const wallGeo = new THREE.BoxGeometry(roomSize, roomHeight, wallThickness);
      const wallMesh = new THREE.Mesh(wallGeo, wallMaterial);
      wallMesh.position.set(xPos, roomHeight / 2, zPos);
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;

      const wallId = `H_${x}_${z}`;
      wallMesh.name = wallId;
      group.add(wallMesh);
      group.userData.hWalls.set(wallId, wallMesh);
    }
  }

  // Generar paredes Verticales (paralelas al eje Z)
  // x index va de 0 a 4. z index va de 0 a 3.
  for (let x = 0; x <= 4; x++) {
    const xPos = -12 + x * roomSize; // Centrado en la rejilla (-12, -6, 0, 6, 12)
    for (let z = 0; z < 4; z++) {
      const zPos = -9 + z * roomSize; // Centrado en el segmento (-9, -3, 3, 9)

      const wallGeo = new THREE.BoxGeometry(wallThickness, roomHeight, roomSize);
      const wallMesh = new THREE.Mesh(wallGeo, wallMaterial);
      wallMesh.position.set(xPos, roomHeight / 2, zPos);
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;

      const wallId = `V_${x}_${z}`;
      wallMesh.name = wallId;
      group.add(wallMesh);
      group.userData.vWalls.set(wallId, wallMesh);
    }
  }

  /**
   * Remueve o añade una pared específica de la escena.
   * @param {string} type - 'H' (horizontal) o 'V' (vertical)
   * @param {number} col - Índice de columna
   * @param {number} row - Índice de fila
   * @param {boolean} visible - Estado de la pared
   */
  group.setWallState = function(type, col, row, visible) {
    const wallId = `${type}_${col}_${row}`;
    const wallMap = type === 'H' ? group.userData.hWalls : group.userData.vWalls;
    const wall = wallMap.get(wallId);

    if (wall) {
      if (visible) {
        if (!group.children.includes(wall)) {
          group.add(wall);
        }
      } else {
        group.remove(wall);
      }
    }
  };

  /**
   * Remueve un conjunto predeterminado de paredes para crear un laberinto/pasaje interno
   */
  group.generateDefaultPassages = function() {
    // Lista de paredes horizontales y verticales a remover para crear un camino conectado
    const wallsToRemove = [
      // Horizontales
      { type: 'H', col: 0, row: 1 },
      { type: 'H', col: 1, row: 2 },
      { type: 'H', col: 2, row: 1 },
      { type: 'H', col: 3, row: 3 },
      { type: 'H', col: 1, row: 3 },
      
      // Verticales
      { type: 'V', col: 1, row: 0 },
      { type: 'V', col: 2, row: 2 },
      { type: 'V', col: 3, row: 1 },
      { type: 'V', col: 2, row: 3 },
      { type: 'V', col: 1, row: 2 },
    ];

    wallsToRemove.forEach(w => {
      group.setWallState(w.type, w.col, w.row, false);
    });
  };

  return group;
}
