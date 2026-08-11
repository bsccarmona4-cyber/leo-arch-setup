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
