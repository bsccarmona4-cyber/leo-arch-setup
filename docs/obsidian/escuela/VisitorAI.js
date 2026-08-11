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

      // Posición orbital en el plano XZ (preservando altura Y)
      this._vOrbPos.set(
        this._vPlayerPos.x + Math.cos(this._orbitAngle) * radius,
        this.visitor.position.y,
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
