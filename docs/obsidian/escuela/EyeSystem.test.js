/**
 * Tests para EyeSystem — Verificar anatomía, interpolación de color y límites de rotación
 * Ejecutar con: node EyeSystem.test.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ── Polyfills de Three.js necesarios para testing sin entorno GL ──

class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.isVector3 = true;
  }
  set(x, y, z) {
    this.x = x; this.y = y; this.z = z;
    return this;
  }
  copy(v) {
    this.x = v.x; this.y = v.y; this.z = v.z;
    return this;
  }
  clone() {
    return new Vector3(this.x, this.y, this.z);
  }
  normalize() {
    const len = this.length();
    if (len > 0.0001) {
      this.x /= len; this.y /= len; this.z /= len;
    }
    return this;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }
  angleTo(v) {
    const d = this.length() * v.length();
    if (d === 0) return 0;
    const theta = this.dot(v) / d;
    return Math.acos(Math.max(-1, Math.min(1, theta)));
  }
}

class Quaternion {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x; this.y = y; this.z = z; this.w = w;
  }
  copy(q) {
    this.x = q.x; this.y = q.y; this.z = q.z; this.w = q.w;
    return this;
  }
  setFromUnitVectors(vFrom, vTo) {
    let r = vFrom.dot(vTo) + 1;
    if (r < 0.0001) {
      r = 0;
      if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
        this.x = -vFrom.y; this.y = vFrom.x; this.z = 0; this.w = r;
      } else {
        this.x = 0; this.y = -vFrom.z; this.z = vFrom.y; this.w = r;
      }
    } else {
      this.x = vFrom.y * vTo.z - vFrom.z * vTo.y;
      this.y = vFrom.z * vTo.x - vFrom.x * vTo.z;
      this.z = vFrom.x * vTo.y - vFrom.y * vTo.x;
      this.w = r;
    }
    const len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    if (len > 0) {
      this.x /= len; this.y /= len; this.z /= len; this.w /= len;
    }
    return this;
  }
}

class Euler {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x; this.y = y; this.z = z;
  }
}

class Color {
  constructor(r = 0, g = 0, b = 0) {
    this.r = r; this.g = g; this.b = b;
  }
  setRGB(r, g, b) {
    this.r = r; this.g = g; this.b = b;
    return this;
  }
}

class FakeGeometry {
  constructor() { this.type = 'FakeGeometry'; }
  dispose() {}
}

class SphereGeometry extends FakeGeometry {
  constructor(radius, wSeg, hSeg) {
    super();
    this.type = 'SphereGeometry';
    this.radius = radius;
  }
}

class MeshStandardMaterial {
  constructor(params = {}) {
    this.color = params.color || new Color(1, 1, 1);
    this.emissive = params.emissive || new Color(0, 0, 0);
    this.roughness = params.roughness ?? 0.5;
    this.metalness = params.metalness ?? 0.0;
  }
  dispose() {}
}

class Object3D {
  constructor() {
    this.name = '';
    this.position = new Vector3();
    this.rotation = new Euler();
    this.scale = new Vector3(1, 1, 1);
    this.quaternion = new Quaternion();
    this.children = [];
    this.parent = null;
    this.isMesh = false;
  }
  add(child) {
    child.parent = this;
    this.children.push(child);
    return this;
  }
  remove(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parent = null;
    }
    return this;
  }
  getObjectByName(name) {
    if (this.name === name) return this;
    for (const child of this.children) {
      const found = child.getObjectByName(name);
      if (found) return found;
    }
    return undefined;
  }
  worldToLocal(vector) {
    // Simular worldToLocal restando la traslación y escala del objeto
    // (Útil para simular coordenadas de espacio local del ojo)
    vector.x = (vector.x - this.position.x) / this.scale.x;
    vector.y = (vector.y - this.position.y) / this.scale.y;
    vector.z = (vector.z - this.position.z) / this.scale.z;
    return vector;
  }
}

class Group extends Object3D {
  constructor() {
    super();
    this.isGroup = true;
  }
}

class Mesh extends Object3D {
  constructor(geometry, material) {
    super();
    this.isMesh = true;
    this.geometry = geometry || new FakeGeometry();
    this.material = material || {};
  }
}

// ── Inyección del test harness para simular módulos ES6 ──

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let sourceCode = readFileSync(join(__dirname, 'EyeSystem.js'), 'utf-8');

// Reemplazar imports
sourceCode = sourceCode.replace(/import \* as THREE from ['"]three['"];?/, '/* import replaced by test harness */');

// Reemplazar clases THREE.XXX
sourceCode = sourceCode.replace(/THREE\.Group/g, 'Group');
sourceCode = sourceCode.replace(/THREE\.Mesh/g, 'Mesh');
sourceCode = sourceCode.replace(/THREE\.SphereGeometry/g, 'SphereGeometry');
sourceCode = sourceCode.replace(/THREE\.MeshStandardMaterial/g, 'MeshStandardMaterial');
sourceCode = sourceCode.replace(/THREE\.Vector3/g, 'Vector3');
sourceCode = sourceCode.replace(/THREE\.Quaternion/g, 'Quaternion');
sourceCode = sourceCode.replace(/THREE\.Color/g, 'Color');

// Reemplazar exports
sourceCode = sourceCode.replace(/export default class EyeSystem/, 'class EyeSystem');

const evalFn = new Function(
  'Group', 'Mesh', 'SphereGeometry', 'MeshStandardMaterial', 'Vector3', 'Quaternion', 'Color',
  sourceCode + '\nreturn { EyeSystem };'
);

const { EyeSystem } = evalFn(Group, Mesh, SphereGeometry, MeshStandardMaterial, Vector3, Quaternion, Color);

// ── Test Runner ──

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.error(`  ❌ ${message}`);
  }
}

function approx(a, b, epsilon = 0.001) {
  return Math.abs(a - b) < epsilon;
}

// Helper para simular rotar un vector por un cuaternión
function applyQuaternion(v, q) {
  // q = (x, y, z, w)
  const qx = q.x, qy = q.y, qz = q.z, qw = q.w;
  const vx = v.x, vy = v.y, vz = v.z;

  const ix = qw * vx + qy * vz - qz * vy;
  const iy = qw * vy + qz * vx - qx * vz;
  const iz = qw * vz + qx * vy - qy * vx;
  const iw = -qx * vx - qy * vy - qz * vz;

  return new Vector3(
    ix * qw + iw * -qx + iy * -qz - iz * -qy,
    iy * qw + iw * -qy + iz * -qx - ix * -qz,
    iz * qw + iw * -qz + ix * -qy - iy * -qx
  );
}

// Mock de TheVisitor / Cabeza
const headInstance = new Group();
headInstance.name = 'head';
headInstance.scale.set(0.28, 0.24, 0.26); // Escala original de TheVisitor.js

const mockVisitor = {
  getPart: (name) => {
    if (name === 'head') {
      return headInstance;
    }
    return undefined;
  }
};

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 1: Instanciación e Integración de Ojos');
{
  const head = mockVisitor.getPart('head');
  const eyeSystem = new EyeSystem(mockVisitor);

  assert(head.children.length === 2, `Se añadieron 2 ojos a la cabeza (hijos: ${head.children.length})`);
  
  const leftEyeGroup = head.getObjectByName('leftEyeSystem');
  const rightEyeGroup = head.getObjectByName('rightEyeSystem');

  assert(leftEyeGroup !== undefined, 'Existe leftEyeSystem');
  assert(rightEyeGroup !== undefined, 'Existe rightEyeSystem');

  // Verificar la anatomía del ojo izquierdo
  const leftSclera = leftEyeGroup.getObjectByName('leftSclera');
  const leftIrisContainer = leftEyeGroup.getObjectByName('leftIrisContainer');
  const leftIris = leftIrisContainer.getObjectByName('leftIris');
  const leftPupil = leftIrisContainer.getObjectByName('leftPupil');

  assert(leftSclera !== undefined, 'Esclerótica izquierda creada');
  assert(leftIrisContainer !== undefined, 'Contenedor del iris izquierdo creado');
  assert(leftIris !== undefined, 'Iris izquierdo creado');
  assert(leftPupil !== undefined, 'Pupila izquierda creada');
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 2: Posicionamiento y Contrarrestar Escala (Anti-distortion)');
{
  const eyeSystem = new EyeSystem(mockVisitor);
  const leftEye = eyeSystem.eyes.left.group;
  const rightEye = eyeSystem.eyes.right.group;

  // Comprobar posición local en la cabeza
  assert(approx(leftEye.position.x, -0.28) && approx(leftEye.position.y, 0.12) && approx(leftEye.position.z, -0.85),
    `Posición ojo izquierdo: (${leftEye.position.x}, ${leftEye.position.y}, ${leftEye.position.z}) ≈ (-0.28, 0.12, -0.85)`);
  assert(approx(rightEye.position.x, 0.28) && approx(rightEye.position.y, 0.12) && approx(rightEye.position.z, -0.85),
    `Posición ojo derecho: (${rightEye.position.x}, ${rightEye.position.y}, ${rightEye.position.z}) ≈ (0.28, 0.12, -0.85)`);

  // Comprobar escala inversa
  assert(approx(leftEye.scale.x, 1 / 0.28) && approx(leftEye.scale.y, 1 / 0.24) && approx(leftEye.scale.z, 1 / 0.26),
    `Escala ojo izquierdo cancela la cabeza: (${leftEye.scale.x.toFixed(2)}, ${leftEye.scale.y.toFixed(2)}, ${leftEye.scale.z.toFixed(2)})`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 3: Interpolación del Material del Iris (setActPhase)');
{
  const eyeSystem = new EyeSystem(mockVisitor);
  const mat = eyeSystem.irisMaterial;

  // Fase 0 (Negro completo)
  eyeSystem.setActPhase(0);
  assert(approx(mat.color.r, 0) && approx(mat.color.g, 0) && approx(mat.color.b, 0),
    `Fase 0 - Color: rgb(${mat.color.r.toFixed(2)}, ${mat.color.g.toFixed(2)}, ${mat.color.b.toFixed(2)}) ≈ (0, 0, 0)`);
  assert(approx(mat.emissive.r, 0) && approx(mat.emissive.g, 0) && approx(mat.emissive.b, 0),
    `Fase 0 - Emissive: rgb(${mat.emissive.r.toFixed(2)}, ${mat.emissive.g.toFixed(2)}, ${mat.emissive.b.toFixed(2)}) ≈ (0, 0, 0)`);

  // Fase 1.5 (Mitad del camino)
  eyeSystem.setActPhase(1.5);
  assert(approx(mat.color.r, 0.175) && approx(mat.color.g, 0.10) && approx(mat.color.b, 0.075),
    `Fase 1.5 - Color: rgb(${mat.color.r.toFixed(3)}, ${mat.color.g.toFixed(3)}, ${mat.color.b.toFixed(3)}) ≈ (0.175, 0.10, 0.075)`);

  // Fase 3 ( rgb(0.35, 0.20, 0.15) )
  eyeSystem.setActPhase(3);
  assert(approx(mat.color.r, 0.35) && approx(mat.color.g, 0.20) && approx(mat.color.b, 0.15),
    `Fase 3 - Color: rgb(${mat.color.r.toFixed(2)}, ${mat.color.g.toFixed(2)}, ${mat.color.b.toFixed(2)}) ≈ (0.35, 0.20, 0.15)`);
  assert(approx(mat.emissive.r, 0.35) && approx(mat.emissive.g, 0.20) && approx(mat.emissive.b, 0.15),
    `Fase 3 - Emissive: rgb(${mat.emissive.r.toFixed(2)}, ${mat.emissive.g.toFixed(2)}, ${mat.emissive.b.toFixed(2)}) ≈ (0.35, 0.20, 0.15)`);

  // Límites inferiores y superiores (clampeado)
  eyeSystem.setActPhase(-1);
  assert(approx(mat.color.r, 0), 'Clampeo inferior a 0');
  eyeSystem.setActPhase(5);
  assert(approx(mat.color.r, 0.35), 'Clampeo superior a 3');
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 4: Rotación del Iris y Límite de 15 Grados (lookAt)');
{
  const eyeSystem = new EyeSystem(mockVisitor);
  const leftEye = eyeSystem.eyes.left;

  const forward = new Vector3(0, 0, -1);
  const maxAngleRad = 15 * Math.PI / 180; // ~0.2618

  // Caso A: Mirada frontal directa (Z negativo)
  // Posición del ojo izquierdo en cabeza: (-0.28, 0.12, -0.85).
  // Escala en grupo: (1/0.28, 1/0.24, 1/0.26) => (3.57, 4.16, 3.84)
  // Si target en mundo es igual a posición local de cabeza + algo en -Z:
  // e.g. (-0.28, 0.12, -5.0) en mundo.
  // worldToLocal: localTarget.x = (-0.28 - (-0.28)) / (1/0.28) = 0.
  // localTarget.z = (-5.0 - (-0.85)) / (1/0.26) = -4.15 * 0.26 = -1.079.
  // localTarget = (0, 0, -1.079), que está en el eje frontal.
  
  let target = new Vector3(-0.28, 0.12, -5.0);
  eyeSystem.lookAt(target);
  
  // Vector dirección de la iris después de la rotación:
  let irisDir = applyQuaternion(forward, leftEye.irisContainer.quaternion).normalize();
  let devAngle = forward.angleTo(irisDir);
  assert(approx(devAngle, 0), `Mirada frontal: desviación = ${devAngle.toFixed(4)} rad (esperado: 0)`);

  // Caso B: Objetivo a 5 grados hacia la derecha (dentro del límite de 15)
  // Creamos una dirección local con ángulo de 5 grados:
  const angle5 = 5 * Math.PI / 180;
  // Local target: (sin(5), 0, -cos(5))
  // Para que worldToLocal nos devuelva esto, calculamos el target de mundo correspondiente:
  // targetWorld = pos_ojo + escala_ojo * targetLocal
  const targetLocalB = new Vector3(Math.sin(angle5), 0, -Math.cos(angle5));
  const targetWorldB = new Vector3(
    leftEye.group.position.x + leftEye.group.scale.x * targetLocalB.x,
    leftEye.group.position.y + leftEye.group.scale.y * targetLocalB.y,
    leftEye.group.position.z + leftEye.group.scale.z * targetLocalB.z
  );

  eyeSystem.lookAt(targetWorldB);
  irisDir = applyQuaternion(forward, leftEye.irisContainer.quaternion).normalize();
  devAngle = forward.angleTo(irisDir);
  
  assert(approx(devAngle, angle5), 
    `Desviación 5°: real = ${(devAngle * 180 / Math.PI).toFixed(2)}° (esperado: 5.00°)`);

  // Caso C: Objetivo a 45 grados (excede el límite de 15)
  const angle45 = 45 * Math.PI / 180;
  const targetLocalC = new Vector3(Math.sin(angle45), 0, -Math.cos(angle45));
  const targetWorldC = new Vector3(
    leftEye.group.position.x + leftEye.group.scale.x * targetLocalC.x,
    leftEye.group.position.y + leftEye.group.scale.y * targetLocalC.y,
    leftEye.group.position.z + leftEye.group.scale.z * targetLocalC.z
  );

  eyeSystem.lookAt(targetWorldC);
  irisDir = applyQuaternion(forward, leftEye.irisContainer.quaternion).normalize();
  devAngle = forward.angleTo(irisDir);

  assert(approx(devAngle, maxAngleRad), 
    `Desviación 45°: real limitada a ${(devAngle * 180 / Math.PI).toFixed(2)}° (esperado: 15.00°)`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(50));
console.log(`  Resultados: ${passed} pasaron, ${failed} fallaron`);
console.log('═'.repeat(50) + '\n');

process.exit(failed > 0 ? 1 : 0);
