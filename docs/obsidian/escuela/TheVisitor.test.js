/**
 * Tests para TheVisitor — Verificar geometría, jerarquía y proporciones
 * Ejecutar con: node TheVisitor.test.js
 */

// ── Polyfill mínimo de Three.js para testing sin WebGL ──
// Creamos stubs de las clases de Three.js necesarias para validar
// la lógica de construcción sin necesidad de un contexto GL.

class Vector3 {
  constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
  copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
}

class Euler {
  constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
}

class FakeGeometry { constructor() { this.type = 'FakeGeometry'; } dispose() {} }

class Object3D {
  constructor() {
    this.name = '';
    this.position = new Vector3();
    this.rotation = new Euler();
    this.scale = new Vector3(1, 1, 1);
    this.children = [];
    this.parent = null;
    this.isMesh = false;
    this.userData = {};
    this.castShadow = false;
    this.receiveShadow = false;
  }
  add(child) {
    child.parent = this;
    this.children.push(child);
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
}

class Group extends Object3D { constructor() { super(); this.isGroup = true; } }

class Mesh extends Object3D {
  constructor(geometry, material) {
    super();
    this.isMesh = true;
    this.geometry = geometry || new FakeGeometry();
    this.material = material || {};
  }
}

class SphereGeometry extends FakeGeometry {
  constructor(radius, wSeg, hSeg) {
    super();
    this.type = 'SphereGeometry';
    this.parameters = { radius, widthSegments: wSeg, heightSegments: hSeg };
  }
}

class CapsuleGeometry extends FakeGeometry {
  constructor(radius, length, capSeg, radSeg) {
    super();
    this.type = 'CapsuleGeometry';
    this.parameters = { radius, length, capSegments: capSeg, radialSegments: radSeg };
  }
}

class CylinderGeometry extends FakeGeometry {
  constructor(rTop, rBot, height, radSeg) {
    super();
    this.type = 'CylinderGeometry';
    this.parameters = { radiusTop: rTop, radiusBottom: rBot, height, radialSegments: radSeg };
  }
}

class BoxGeometry extends FakeGeometry {
  constructor(w, h, d) {
    super();
    this.type = 'BoxGeometry';
    this.parameters = { width: w, height: h, depth: d };
  }
}

class MeshStandardMaterial {
  constructor(params = {}) {
    this.isMeshStandardMaterial = true;
    Object.assign(this, params);
  }
}

// Inyectar como módulo global "three"
const THREE = {
  Group, Mesh, Object3D, Vector3, Euler,
  SphereGeometry, CapsuleGeometry, CylinderGeometry, BoxGeometry,
  MeshStandardMaterial,
};

// ── Monkey-patch el import de three ──
// Como no podemos usar importmaps en Node fácilmente, haremos una
// evaluación directa del módulo reescribiendo el import.

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer el código fuente de TheVisitor.js
let sourceCode = readFileSync(join(__dirname, 'TheVisitor.js'), 'utf-8');

// Reemplazar el import de three con nuestro polyfill
sourceCode = sourceCode.replace(
  /import \* as THREE from ['"]three['"];?/,
  '/* import replaced by test harness */'
);
sourceCode = sourceCode.replace(
  /import \* as THREE from ['"]https:\/\/[^'"]+['"];?/,
  '/* import replaced by test harness */'
);

// Reemplazar las referencias a THREE.XXX con nuestras clases globales
sourceCode = sourceCode.replace(/THREE\.Group/g, 'Group');
sourceCode = sourceCode.replace(/THREE\.Mesh/g, 'Mesh');
sourceCode = sourceCode.replace(/THREE\.SphereGeometry/g, 'SphereGeometry');
sourceCode = sourceCode.replace(/THREE\.CapsuleGeometry/g, 'CapsuleGeometry');
sourceCode = sourceCode.replace(/THREE\.CylinderGeometry/g, 'CylinderGeometry');
sourceCode = sourceCode.replace(/THREE\.BoxGeometry/g, 'BoxGeometry');
sourceCode = sourceCode.replace(/THREE\.MeshStandardMaterial/g, 'MeshStandardMaterial');

// Reemplazar export default / export { } con asignaciones
sourceCode = sourceCode.replace(/export default class TheVisitor/, 'class TheVisitor');
sourceCode = sourceCode.replace(/export\s*\{[^}]*\};?/g, '');

// Evaluar el módulo en el contexto actual
const evalFn = new Function(
  'Group', 'Mesh', 'SphereGeometry', 'CapsuleGeometry',
  'CylinderGeometry', 'BoxGeometry', 'MeshStandardMaterial',
  sourceCode + '\nreturn { TheVisitor, PROPORTIONS, ARM, ABSOLUTE_Y: Y, DEFAULT_MATERIALS };'
);

const {
  TheVisitor,
  PROPORTIONS,
  ARM,
  ABSOLUTE_Y,
  DEFAULT_MATERIALS
} = evalFn(
  Group, Mesh, SphereGeometry, CapsuleGeometry,
  CylinderGeometry, BoxGeometry, MeshStandardMaterial
);

// ═══════════════════════════════════════════════════════════════
//  Test Runner
// ═══════════════════════════════════════════════════════════════

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

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 1: Instanciación');
{
  const visitor = new TheVisitor();
  assert(visitor.name === 'TheVisitor', `Nombre: "${visitor.name}"`);
  assert(visitor.children.length > 0, 'Tiene hijos');
  assert(visitor.parts instanceof Map, 'parts es un Map');
  assert(visitor.parts.size > 0, `Tiene ${visitor.parts.size} partes registradas`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 2: Partes semánticas requeridas');
{
  const visitor = new TheVisitor();
  const requiredParts = [
    'pelvis', 'torso',
    'neckJoint', 'neck', 'head',
    'leftShoulder', 'leftUpperArm', 'leftElbow', 'leftForearm', 'leftWrist', 'leftHand',
    'rightShoulder', 'rightUpperArm', 'rightElbow', 'rightForearm', 'rightWrist', 'rightHand',
    'leftHip', 'leftUpperLeg', 'leftKnee', 'leftLowerLeg', 'leftAnkle', 'leftFoot',
    'rightHip', 'rightUpperLeg', 'rightKnee', 'rightLowerLeg', 'rightAnkle', 'rightFoot',
  ];

  for (const name of requiredParts) {
    const part = visitor.getPart(name);
    assert(part !== undefined, `Parte "${name}" existe`);
    assert(part.name === name, `Parte "${name}" tiene nombre correcto: "${part.name}"`);
  }
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 3: Cabeza oval (SphereGeometry escalada)');
{
  const visitor = new TheVisitor();
  const head = visitor.getPart('head');
  assert(head.isMesh, 'head es un Mesh');
  assert(head.geometry.type === 'SphereGeometry', `Geometry: ${head.geometry.type}`);
  assert(approx(head.scale.x, 0.28), `scale.x = ${head.scale.x} ≈ 0.28`);
  assert(approx(head.scale.y, 0.24), `scale.y = ${head.scale.y} ≈ 0.24`);
  assert(approx(head.scale.z, 0.26), `scale.z = ${head.scale.z} ≈ 0.26`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 4: Torso es CapsuleGeometry');
{
  const visitor = new TheVisitor();
  const torso = visitor.getPart('torso');
  assert(torso.isMesh, 'torso es un Mesh');
  assert(torso.geometry.type === 'CapsuleGeometry', `Geometry: ${torso.geometry.type}`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 5: Cuello rotado 0.08 rad en Z');
{
  const visitor = new TheVisitor();
  const neckJoint = visitor.getPart('neckJoint');
  assert(approx(neckJoint.rotation.z, 0.08), `rotation.z = ${neckJoint.rotation.z} ≈ 0.08 rad`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 6: Altura total ≈ 1.85m');
{
  assert(approx(ABSOLUTE_Y.top, 1.85, 0.01),
    `Altura calculada: ${ABSOLUTE_Y.top}m ≈ 1.85m`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 7: Brazos 15% más largos');
{
  const normalUpperArm = 0.29;
  const normalForearm  = 0.254;
  const normalHand     = 0.12;
  const mult = 1.15;

  assert(approx(ARM.upperArmLength, normalUpperArm * mult),
    `UpperArm: ${ARM.upperArmLength.toFixed(4)} ≈ ${(normalUpperArm * mult).toFixed(4)}`);
  assert(approx(ARM.forearmLength, normalForearm * mult),
    `Forearm: ${ARM.forearmLength.toFixed(4)} ≈ ${(normalForearm * mult).toFixed(4)}`);
  assert(approx(ARM.handLength, normalHand * mult),
    `Hand: ${ARM.handLength.toFixed(4)} ≈ ${(normalHand * mult).toFixed(4)}`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 8: Jerarquía correcta (parent-child)');
{
  const visitor = new TheVisitor();

  const head = visitor.getPart('head');
  assert(head.parent.name === 'neckJoint', `head.parent = "${head.parent.name}" (esperado: neckJoint)`);

  const neckJoint = visitor.getPart('neckJoint');
  assert(neckJoint.parent.name === 'pelvis', `neckJoint.parent = "${neckJoint.parent.name}" (esperado: pelvis)`);

  const leftElbow = visitor.getPart('leftElbow');
  assert(leftElbow.parent.name === 'leftShoulder', `leftElbow.parent = "${leftElbow.parent.name}"`);

  const leftHand = visitor.getPart('leftHand');
  assert(leftHand.parent.name === 'leftWrist', `leftHand.parent = "${leftHand.parent.name}"`);

  const leftKnee = visitor.getPart('leftKnee');
  assert(leftKnee.parent.name === 'leftHip', `leftKnee.parent = "${leftKnee.parent.name}"`);

  const rightFoot = visitor.getPart('rightFoot');
  assert(rightFoot.parent.name === 'rightAnkle', `rightFoot.parent = "${rightFoot.parent.name}"`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 9: Simetría izquierda-derecha');
{
  const visitor = new TheVisitor();

  const ls = visitor.getPart('leftShoulder');
  const rs = visitor.getPart('rightShoulder');
  assert(approx(ls.position.x, -rs.position.x),
    `Hombros simétricos: L.x=${ls.position.x}, R.x=${rs.position.x}`);
  assert(approx(ls.position.y, rs.position.y),
    `Hombros misma altura: L.y=${ls.position.y}, R.y=${rs.position.y}`);

  const lh = visitor.getPart('leftHip');
  const rh = visitor.getPart('rightHip');
  assert(approx(lh.position.x, -rh.position.x),
    `Caderas simétricas: L.x=${lh.position.x}, R.x=${rh.position.x}`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 10: Sombras activadas');
{
  const visitor = new TheVisitor();
  const torso = visitor.getPart('torso');
  assert(torso.castShadow === true, 'torso castShadow = true');
  assert(torso.receiveShadow === true, 'torso receiveShadow = true');
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 11: getPart() API');
{
  const visitor = new TheVisitor();
  assert(visitor.getPart('head') !== undefined, 'getPart("head") retorna algo');
  assert(visitor.getPart('nonexistent') === undefined, 'getPart("nonexistent") retorna undefined');
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 12: getPartNames() y traverseMeshes()');
{
  const visitor = new TheVisitor();
  const names = visitor.getPartNames();
  assert(names.length === visitor.parts.size, `getPartNames() tiene ${names.length} entradas`);
  assert(names.includes('head'), 'Incluye "head"');
  assert(names.includes('torso'), 'Incluye "torso"');

  let meshCount = 0;
  visitor.traverseMeshes((mesh, name) => { meshCount++; });
  assert(meshCount > 0, `traverseMeshes encontró ${meshCount} meshes`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 13: toString()');
{
  const visitor = new TheVisitor();
  const str = visitor.toString();
  assert(str.includes('TheVisitor'), `toString contiene "TheVisitor": ${str.split('\n')[0]}`);
  assert(str.includes('1.85'), 'toString contiene altura');
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 14: Joints son Groups, limbs son Meshes');
{
  const visitor = new TheVisitor();
  const joints = ['pelvis', 'neckJoint', 'leftShoulder', 'leftElbow', 'leftWrist',
                   'leftHip', 'leftKnee', 'leftAnkle'];
  const meshes = ['torso', 'neck', 'head', 'leftUpperArm', 'leftForearm', 'leftHand',
                   'leftUpperLeg', 'leftLowerLeg', 'leftFoot'];

  for (const j of joints) {
    const part = visitor.getPart(j);
    assert(part.isGroup === true, `"${j}" es un Group`);
  }
  for (const m of meshes) {
    const part = visitor.getPart(m);
    assert(part.isMesh === true, `"${m}" es un Mesh`);
  }
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 15: Materiales diferenciados');
{
  const visitor = new TheVisitor();
  const headMat = visitor.getPart('head').material;
  const torsoMat = visitor.getPart('torso').material;
  const handMat = visitor.getPart('leftHand').material;

  assert(headMat !== torsoMat, 'head y torso tienen materiales distintos');
  assert(handMat !== torsoMat, 'hand y torso tienen materiales distintos');
}

// ═══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(50));
console.log(`  Resultados: ${passed} pasaron, ${failed} fallaron`);
console.log('═'.repeat(50) + '\n');

process.exit(failed > 0 ? 1 : 0);
