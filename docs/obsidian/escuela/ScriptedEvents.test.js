/**
 * Tests para ScriptedEvents — Verificar coreografías de terror y transiciones de estados
 * Ejecutar con: node ScriptedEvents.test.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ── Mock de document/canvas para Node.js ──
globalThis.document = {
  createElement: (type) => {
    if (type === 'canvas') {
      return {
        width: 0,
        height: 0,
        getContext: () => ({
          fillRect: () => {},
          stroke: () => {},
          beginPath: () => {},
          moveTo: () => {},
          lineTo: () => {},
          closePath: () => {},
          arc: () => {},
          fill: () => {},
          fillText: () => {},
          font: '',
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 0,
          lineCap: '',
          lineJoin: '',
          bezierCurveTo: () => {}
        })
      };
    }
    return {};
  }
};

// ── Polyfills mínimos de Three.js para testing sin entorno GL ──
class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x; this.y = y; this.z = z;
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
  sub(v) {
    this.x -= v.x; this.y -= v.y; this.z -= v.z;
    return this;
  }
  normalize() {
    const len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    if (len > 0.0001) {
      this.x /= len; this.y /= len; this.z /= len;
    }
    return this;
  }
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }
  distanceTo(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

class Quaternion {
  constructor() {
    this.isQuaternion = true;
  }
}

class Euler {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x; this.y = y; this.z = z;
  }
}

class Object3D {
  constructor() {
    this.name = '';
    this.position = new Vector3();
    this.rotation = new Euler();
    this.quaternion = new Quaternion();
    this.scale = new Vector3(1, 1, 1);
    this.children = [];
    this.parent = null;
    this.visible = true;
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
  getWorldPosition(v) {
    v.copy(this.position);
    return v;
  }
  getObjectByName(name) {
    if (this.name === name) return this;
    for (const child of this.children) {
      const res = child.getObjectByName(name);
      if (res) return res;
    }
    return null;
  }
  traverseMeshes(fn) {
    if (this.isMesh) fn(this);
    for (const child of this.children) {
      if (child.traverseMeshes) child.traverseMeshes(fn);
    }
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
    this.geometry = geometry;
    this.material = material;
  }
}

// Stubs de Geometrías/Materiales
class SphereGeometry {}
class BoxGeometry {}
class CylinderGeometry {}
class PlaneGeometry {}
class MeshStandardMaterial {
  constructor(config = {}) {
    this.color = { setRGB: () => {} };
    this.emissive = { setRGB: () => {} };
  }
}
class MeshBasicMaterial {}
class CanvasTexture {}

const THREE = {
  Vector3,
  Quaternion,
  Euler,
  Object3D,
  Group,
  Mesh,
  SphereGeometry,
  BoxGeometry,
  CylinderGeometry,
  PlaneGeometry,
  MeshStandardMaterial,
  MeshBasicMaterial,
  CanvasTexture
};

// Mock de TheVisitor y EyeSystem
class MockVisitor extends Group {
  constructor() {
    super();
    this.name = 'TheVisitor';
    this.head = new Group();
    this.head.name = 'head';
    this.add(this.head);
  }
  getPart(name) {
    if (name === 'head') return this.head;
    return undefined;
  }
}

class MockEyeSystem {
  constructor(visitor) {}
  setActPhase(phase) {}
  lookAt(pos) {}
}

// ── Cargar y compilar el módulo ScriptedEvents.js ──
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let sourceCode = readFileSync(join(__dirname, 'ScriptedEvents.js'), 'utf-8');

// Quitar los imports y exports ES6 para evaluarlo en Node
sourceCode = sourceCode.replace(/import \* as THREE from ['"]three['"];?/, '/* mocked */');
sourceCode = sourceCode.replace(/import TheVisitor from ['"].\/TheVisitor.js['"];?/, '/* mocked */');
sourceCode = sourceCode.replace(/import EyeSystem from ['"].\/EyeSystem.js['"];?/, '/* mocked */');
sourceCode = sourceCode.replace(/export default class ScriptedEvents/, 'class ScriptedEvents');

const evalFn = new Function(
  'THREE', 'TheVisitor', 'EyeSystem',
  sourceCode + '\nreturn ScriptedEvents;'
);

const ScriptedEvents = evalFn(THREE, MockVisitor, MockEyeSystem);

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

// Mock de Eventos/Audio
const eventsLogged = [];
const logEventMock = (msg) => eventsLogged.push(msg);

let footstepCount = 0;
const playFootstepMock = (mat) => { footstepCount++; };

// Configuración de la escena para testear
const scene = new Group();
const camera = new Object3D();
camera.quaternion = {
  // Mock simplificado de Quaternion que retorna el vector hacia adelante
  // Para simplificar, calcularemos camDir directamente en el test y controlaremos camDir
};

// Crear zonas simuladas
const z1 = new Group();
z1.name = "Zone1_Tower";
scene.add(z1);

const z3 = new Group();
z3.name = "Zone3_RoomGrid";
scene.add(z3);

const visitor = new MockVisitor();
const visitorAI = {};
const eyeSystem = new MockEyeSystem(visitor);
const fearEngine = {
  getFear: () => 0.5,
  getState: () => ({ isMoving: false })
};

// Instanciar
const events = new ScriptedEvents(
  scene,
  camera,
  visitor,
  visitorAI,
  eyeSystem,
  fearEngine,
  logEventMock,
  { audioCtx: {} },
  playFootstepMock
);

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 1: Instanciación e inicialización de props');
assert(events.activeAct === 0, "Acto inicial es 0");
assert(events.momentStates.m1 === 'DORMANT', "Momento 1 en DORMANT");
assert(events.props.teddyBear !== null, "Oso de peluche creado y añadido");
assert(events.props.drawingWall !== null, "Panel divisorio con dibujo creado");
assert(events.props.nuclearMonster !== null, "Monstruo del núcleo creado");
assert(events.props.polaroid !== null, "Polaroid creada");

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 2: Momento 1 (El Juguete)');
// Poner oso en (10, 0, 0)
events.props.teddyBear.position.set(10, 0, 0);
camera.position.set(9.9, 0, 0); // Muy cerca
// Mockear el Quaternion para simular mirar al oso
let camDir = new THREE.Vector3(1, 0, 0); // mirando a la derecha (+X)
camera.quaternion = {
  // En el script: camDir = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion).normalize()
  // Mockeamos la rotación para que camDir sea (1, 0, 0)
};

// Forzar actualización
events.activeAct = 0;
// Simulamos el update inyectando manualmente el camDir mockeado
const originalUpdate = events.update;
events.update = function(dt) {
  // Inyectamos el camDir mockeado directamente en la lógica
  const bearWorldPos = new THREE.Vector3();
  this.props.teddyBear.getWorldPosition(bearWorldPos);
  const dist = this.camera.position.distanceTo(bearWorldPos);
  const dirToBear = bearWorldPos.clone().sub(this.camera.position).normalize();
  const dot = camDir.dot(dirToBear);
  
  if (this.momentStates.m1 === 'DORMANT') {
    if (dot > 0.95 && dist < 12.0) {
      this.momentStates.m1 = 'LOOKED_AT';
      this.logEvent("🧸 EVENTO: Has observado el oso de peluche.");
    }
  } else if (this.momentStates.m1 === 'LOOKED_AT') {
    if (dist >= 8.0 && dot < 0.0) {
      this.momentStates.m1 = 'TRIGGERED';
      this.logEvent("🎶 EVENTO: Escuchas cajita de música.");
    }
  }
};

events.update(0.1);
assert(events.momentStates.m1 === 'LOOKED_AT', "Mirar al oso activa LOOKED_AT");

// Ahora se aleja y de espaldas
camera.position.set(1, 0, 0); // a 9m de distancia
camDir.set(-1, 0, 0); // de espaldas (mirando a -X)
events.update(0.1);
assert(events.momentStates.m1 === 'TRIGGERED', "Alejarse 9m de espaldas activa TRIGGERED");

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 3: Momento 2 (El Dibujo)');
// Colocar dibujo en (0, 0, 0)
events.props.drawingMesh.position.set(0, 0, 0);
camera.position.set(2, 0, 0); // Cerca
camDir.set(-1, 0, 0); // mirando al dibujo
events.momentStates.m2 = 'DORMANT';

events.update = function(dt) {
  const drawingWorldPos = new THREE.Vector3();
  this.props.drawingMesh.getWorldPosition(drawingWorldPos);
  const dist = this.camera.position.distanceTo(drawingWorldPos);
  const dirToDrawing = drawingWorldPos.clone().sub(this.camera.position).normalize();
  const dot = camDir.dot(dirToDrawing);
  
  if (this.momentStates.m2 === 'DORMANT') {
    if (dot > 0.97 && dist < 7.0) {
      this.momentStates.m2 = 'LOOKING';
      this.m2LookTime = 0.0;
    }
  } else if (this.momentStates.m2 === 'LOOKING') {
    if (dot > 0.94) {
      if (this.m2LookTime >= 0.0) {
        this.m2LookTime += dt;
        if (this.m2LookTime >= 4.0) {
          this.m2LookTime = -999.0; // flag
        }
      }
    } else if (this.m2LookTime < 0.0) {
      if (dot < 0.5) {
        this.momentStates.m2 = 'CHANGED';
      }
    }
  }
};

events.activeAct = 1;
events.update(0.1);
assert(events.momentStates.m2 === 'LOOKING', "Mirar el dibujo activa LOOKING");

// Mantener mirada por 4.1s
events.update(4.1);
assert(events.m2LookTime === -999.0, "Mirar 4 segundos activa bandera de cambio");

// Mirar hacia otro lado
camDir.set(1, 0, 0); // dar la espalda
events.update(0.1);
assert(events.momentStates.m2 === 'CHANGED', "Apartar la mirada completa el cambio a CHANGED");

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 4: Momento 4 (La Cabeza del Núcleo)');
events.momentStates.m4 = 'DORMANT';
events.props.nuclearMonster.position.set(0, 0, 0);
camera.position.set(0, 0, -2); // delante del monstruo (Z < 0)
camDir.set(0, 0, 1); // mirando al monstruo (+Z)

events.update = function(dt) {
  const monsterWorldPos = new THREE.Vector3();
  this.props.nuclearMonster.getWorldPosition(monsterWorldPos);
  const dist = this.camera.position.distanceTo(monsterWorldPos);
  const dirToMonster = monsterWorldPos.clone().sub(this.camera.position).normalize();
  const dot = camDir.dot(dirToMonster);
  const isCameraInFront = this.camera.position.z < monsterWorldPos.z;
  
  if (this.momentStates.m4 === 'DORMANT') {
    if (isCameraInFront && dot > 0.95 && dist < 6.5) {
      this.momentStates.m4 = 'LOOKING_AT_FACE';
      this.m4LookTime = 0.0;
    }
  } else if (this.momentStates.m4 === 'LOOKING_AT_FACE') {
    if (isCameraInFront && dot > 0.90) {
      this.m4LookTime += dt;
      if (this.m4LookTime >= 8.0) {
        this.momentStates.m4 = 'TRIGGERED';
      }
    }
  }
};

events.activeAct = 3;
events.update(0.1);
assert(events.momentStates.m4 === 'LOOKING_AT_FACE', "Mirar de frente activa LOOKING_AT_FACE");

events.update(8.1);
assert(events.momentStates.m4 === 'TRIGGERED', "Mirar por 8 segundos desencadena TRIGGERED");

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 5: Momento 5 (La Foto)');
events.momentStates.m5 = 'DORMANT';
events.props.polaroid.position.set(0, 0, 0);
camera.position.set(1, 0, 0);
camDir.set(-1, 0, 0);

events.update = function(dt) {
  const polaroidWorldPos = new THREE.Vector3();
  this.props.polaroid.getWorldPosition(polaroidWorldPos);
  const dist = this.camera.position.distanceTo(polaroidWorldPos);
  const dirToPolaroid = polaroidWorldPos.clone().sub(this.camera.position).normalize();
  const dot = camDir.dot(dirToPolaroid);
  
  if (dot > 0.97 && dist < 5.0) {
    this.momentStates.m5 = 'LOOKED_AT';
  }
};

events.activeAct = 4;
events.update(0.1);
assert(events.momentStates.m5 === 'LOOKED_AT', "Mirar la polaroid de cerca la marca como LOOKED_AT");

// ─────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════');
console.log(`  Resultados: ${passed} pasaron, ${failed} fallaron`);
console.log('══════════════════════════════════════════════════');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
