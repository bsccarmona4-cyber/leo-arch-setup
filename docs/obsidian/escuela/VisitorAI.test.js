/**
 * Tests para VisitorAI — Verificar máquina de estados, órbitas, triggers y eventos
 * Ejecutar con: node VisitorAI.test.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ── Polyfill mínimo de Three.js para testing sin WebGL ──
class Vector3 {
  constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
  copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
}

class Euler {
  constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
}

class Object3D {
  constructor() {
    this.name = '';
    this.position = new Vector3();
    this.rotation = new Euler();
    this.scale = new Vector3(1, 1, 1);
    this.children = [];
    this.parent = null;
  }
  add(child) {
    child.parent = this;
    this.children.push(child);
    return this;
  }
}

class Group extends Object3D {
  constructor() {
    super();
    this.isGroup = true;
  }
}

const THREE = { Vector3, Euler, Group };

// ── Cargar y compilar el módulo VisitorAI.js ──
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let sourceCode = readFileSync(join(__dirname, 'VisitorAI.js'), 'utf-8');

// Quitar los imports y exports ES6 para evaluarlo en Node
sourceCode = sourceCode.replace(/import \* as THREE from ['"]three['"];?/, '/* mocked */');
sourceCode = sourceCode.replace(/export default class VisitorAI/, 'class VisitorAI');
sourceCode = sourceCode.replace(/export\s*\{[^}]*\};?/g, '');

const evalFn = new Function(
  'THREE',
  sourceCode + '\nreturn { VisitorAI, STATES };'
);

const { VisitorAI, STATES } = evalFn(THREE);

// ── Helper de Mock de TheVisitor ──
class MockVisitor extends Group {
  constructor() {
    super();
    this.name = 'TheVisitor';
    this.neckJoint = new Group();
    this.neckJoint.name = 'neckJoint';
    this.neckJoint.rotation.z = 0.08;
    this.add(this.neckJoint);
  }

  getPart(name) {
    if (name === 'neckJoint') return this.neckJoint;
    return undefined;
  }
}

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

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 1: Instanciación e Inicialización');
{
  const visitor = new MockVisitor();
  const ai = new VisitorAI(visitor);

  assert(ai.getState() === STATES.DORMANT, `Estado inicial esperado DORMANT, obtenido: ${ai.getState()}`);
  assert(ai.getOrbitAngle() === 0, `Ángulo orbital inicial es 0`);
  assert(ai.getStillTimer() === 0, `Timer quieto inicial es 0`);
  assert(ai.getEffectiveRadius() === 4.0, `Radio inicial efectivo es 4.0`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 2: Transiciones de Estado basadas en miedo');
{
  const visitor = new MockVisitor();
  const ai = new VisitorAI(visitor);

  // DORMANT (< 0.20)
  ai.update(0.1, 0.15, new Vector3(0, 0, 0));
  assert(ai.getState() === STATES.DORMANT, 'Mantiene DORMANT con fear = 0.15');

  // AWARE (0.20 - 0.50)
  let stateChangedEmitted = false;
  ai.on('stateChanged', (evt) => {
    if (evt.from === STATES.DORMANT && evt.to === STATES.AWARE) {
      stateChangedEmitted = true;
    }
  });

  ai.update(0.1, 0.25, new Vector3(0, 0, 0));
  assert(ai.getState() === STATES.AWARE, 'Transiciona a AWARE con fear = 0.25');
  assert(stateChangedEmitted, 'Emite evento "stateChanged"');

  // FOLLOWING (0.50 - 0.80)
  let orbitStartedEmitted = false;
  ai.on('orbitStarted', () => { orbitStartedEmitted = true; });

  ai.update(0.1, 0.60, new Vector3(0, 0, 0));
  assert(ai.getState() === STATES.FOLLOWING, 'Transiciona a FOLLOWING con fear = 0.60');
  assert(orbitStartedEmitted, 'Emite evento "orbitStarted"');

  // HUNTING (>= 0.80)
  ai.update(0.1, 0.85, new Vector3(0, 0, 0));
  assert(ai.getState() === STATES.HUNTING, 'Transiciona a HUNTING con fear = 0.85');
  assert(ai.getEffectiveRadius() === 2.0, 'Radio de órbita en HUNTING disminuye a minOrbitRadius = 2.0');
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 3: Movimiento Orbital e Instantáneo');
{
  const visitor = new MockVisitor();
  // Config: orbitRadius = 5.0, playerSpeed = 2.0, speedMultiplier = 1.12
  // linearSpeed = 2.24 m/s. angularSpeed = 2.24 / 5.0 = 0.448 rad/s
  const ai = new VisitorAI(visitor, { orbitRadius: 5.0, playerSpeed: 2.0 });

  // Poner en FOLLOWING con un paso inicial de 0.1s
  ai.update(0.1, 0.60, new Vector3(0, 0, 0));
  
  // Guardar posición inicial de órbita (debe estar en orbitAngle = 0.0448 rad)
  const initAngle = 0.0448;
  const initX = Math.cos(initAngle) * 5.0;
  const initZ = Math.sin(initAngle) * 5.0;
  assert(approx(visitor.position.x, initX) && approx(visitor.position.z, initZ), 
    `Posición órbita inicial tras 0.1s: (${visitor.position.x.toFixed(3)}, ${visitor.position.z.toFixed(3)}) ≈ (${initX.toFixed(3)}, ${initZ.toFixed(3)})`);

  // Avanzar 0.9 segundos más (para completar 1.0s de órbita total)
  // Usamos 3 pasos de 0.3s para no disparar la protección de picos (> 0.5)
  for (let i = 0; i < 3; i++) {
    ai.update(0.3, 0.60, new Vector3(0, 0, 0));
  }
  assert(approx(ai.getOrbitAngle(), 0.448), `Ángulo orbital tras 1s total: ${ai.getOrbitAngle().toFixed(3)} ≈ 0.448 rad`);
  
  const expectedX = Math.cos(0.448) * 5.0;
  const expectedZ = Math.sin(0.448) * 5.0;
  assert(approx(visitor.position.x, expectedX) && approx(visitor.position.z, expectedZ),
    `Posición tras 1s total: (${visitor.position.x.toFixed(3)}, ${visitor.position.z.toFixed(3)}) ≈ (${expectedX.toFixed(3)}, ${expectedZ.toFixed(3)})`);

  // Cambiar velocidad de forma instantánea
  ai.setPlayerSpeed(4.0); // linearSpeed = 4.48. angularSpeed = 4.48 / 5.0 = 0.896 rad/s
  // Avanzar 0.5s en 2 pasos de 0.25s. orbitAngle incrementa por 0.896 * 0.5 = 0.448 rad. Total = 0.896 rad.
  for (let i = 0; i < 2; i++) {
    ai.update(0.25, 0.60, new Vector3(0, 0, 0));
  }
  assert(approx(ai.getOrbitAngle(), 0.896), `Ángulo orbital tras cambio velocidad y 0.5s: ${ai.getOrbitAngle().toFixed(3)} ≈ 0.896 rad`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 4: Rotación del Torso y Cabeza Independiente');
{
  const visitor = new MockVisitor();
  const ai = new VisitorAI(visitor, { bodyLerpSpeed: 10.0 }); // Lerp rápido para pruebas

  // En DORMANT, el torso y la cabeza no se orientan hacia el jugador
  visitor.rotation.y = 0.5;
  visitor.neckJoint.rotation.y = 0;
  ai.update(0.1, 0.10, new Vector3(10, 0, 0)); // Jugador en X = 10 (hacia el este)
  assert(visitor.rotation.y === 0.5, 'En DORMANT torso mantiene su rotación previa');
  assert(visitor.neckJoint.rotation.y === 0, 'En DORMANT cabeza neutral');

  // En AWARE, torso rota hacia el jugador (suavizado) y cabeza rota directamente (inmediato)
  // Jugador en X = 10, Z = 0 (ángulo respecto al visitante en (0,0) es -Math.PI/2 en convención Three.js)
  // Vamos a poner el visitante en (0,0,0) y jugador en (0,0,-10). Dirección hacia el jugador es (0,0,-10),
  // que es ángulo 0 en rotation.y de Three.js (mirando hacia -Z).
  visitor.position.set(0, 0, 0);
  visitor.rotation.y = Math.PI; // Mirando hacia +Z (espalda al jugador)
  
  // Actualizar en AWARE
  ai.update(0.05, 0.30, new Vector3(0, 0, -10));
  
  // Cabeza debe mirar inmediatamente al jugador en (0,0,-10) (yaw local = -visitor.rotation.y)
  // En este frame, rotation.y de torso cambió un poco por el lerp.
  // El ángulo hacia el jugador en coordenadas locales debería hacer que la cabeza apunte a (0,0,-10) en absoluto.
  // Verifiquemos que la suma de rotation.y del torso y rotation.y de la cabeza apunte al jugador
  const totalHeadYaw = visitor.rotation.y + visitor.neckJoint.rotation.y;
  // totalHeadYaw debe ser 0 (o múltiplo de 2pi) para apuntar hacia -Z
  assert(approx(Math.sin(totalHeadYaw), 0.0), `Cabeza apunta directamente a -Z (sin = ${Math.sin(totalHeadYaw).toFixed(3)})`);
  assert(visitor.rotation.y !== Math.PI, 'El torso ha comenzado a rotar (lerp activo)');
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 5: Trigger de 5 segundos quieto en AWARE');
{
  const visitor = new MockVisitor();
  const ai = new VisitorAI(visitor, { stillThreshold: 5.0, headTurnDuration: 1.0 });

  // Poner en AWARE
  ai.update(0.1, 0.30, new Vector3(0, 0, 0));
  assert(ai.getStillTimer() === 0.1, 'Timer de quietud acumula deltaTime');

  // Acumular 4.8s más usando pasos pequeños (16 pasos de 0.3s)
  for (let i = 0; i < 16; i++) {
    ai.update(0.3, 0.30, new Vector3(0, 0, 0));
  }
  assert(approx(ai.getStillTimer(), 4.9), `Timer de quietud en 4.9s: ${ai.getStillTimer().toFixed(2)}`);

  let headTurnEmitted = false;
  let turnAngle = 0;
  ai.on('headTurn', (evt) => {
    headTurnEmitted = true;
    turnAngle = evt.angle;
  });

  // Pasar el umbral de 5.0s con un paso de 0.2s (total 5.1s)
  // Esto también ejecuta el primer paso de animación con dt = 0.2s
  ai.update(0.2, 0.30, new Vector3(0, 0, 0));
  assert(headTurnEmitted, 'Giro brusco de cabeza emitido');
  assert(approx(Math.abs(turnAngle), 1.4), `Ángulo del head turn: ${turnAngle} ≈ ±1.4 rad`);
  assert(ai.getStillTimer() === 0, 'Timer de quietud se resetea a 0');
  assert(approx(visitor.neckJoint.rotation.y, turnAngle * 0.5), `Rotación en rampa (0.2s): ${visitor.neckJoint.rotation.y.toFixed(3)}`);

  // Avanzar 0.2s más (llegando a 0.4s de animación, el pico)
  ai.update(0.2, 0.30, new Vector3(0, 0, 0));
  assert(approx(visitor.neckJoint.rotation.y, turnAngle), `Rotación en el pico (0.4s): ${visitor.neckJoint.rotation.y.toFixed(3)}`);

  // Avanzar 0.3s más (llegando a 0.7s de animación, retorno al 50%)
  ai.update(0.3, 0.30, new Vector3(0, 0, 0));
  assert(approx(visitor.neckJoint.rotation.y, turnAngle * 0.5), `Rotación en retorno (0.7s): ${visitor.neckJoint.rotation.y.toFixed(3)}`);

  // Avanzar 0.3s más (llegando a 1.0s de animación, fin)
  ai.update(0.3, 0.30, new Vector3(0, 0, 0));
  assert(approx(visitor.neckJoint.rotation.y, 0), `Fin animación (1.0s): cabeza vuelve a neutral`);
}

// ═══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(50));
console.log(`  Resultados: ${passed} pasaron, ${failed} fallaron`);
console.log('═'.repeat(50) + '\n');

process.exit(failed > 0 ? 1 : 0);

