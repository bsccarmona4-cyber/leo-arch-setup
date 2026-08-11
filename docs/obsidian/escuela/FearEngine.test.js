/**
 * Tests para FearEngine
 * Ejecutar con: node FearEngine.test.js
 */

import FearEngine from './FearEngine.js';

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

function approx(a, b, epsilon = 0.0001) {
  return Math.abs(a - b) < epsilon;
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 1: Inicialización');
{
  const engine = new FearEngine();
  assert(engine.getFear() === 0.0, 'Miedo inicial es 0.0');
  assert(!engine.isPaused(), 'No está pausado al inicio');
  const state = engine.getState();
  assert(!state.isMoving, 'No se está moviendo');
  assert(!state.isLookingAtMonster, 'No está mirando al monstruo');
  assert(!state.isInDarkZone, 'No está en zona oscura');
  assert(!state.isNearLight, 'No está cerca de luz');
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 2: Acumulación de miedo — jugador quieto (+0.02/s)');
{
  const engine = new FearEngine();
  engine.update(1.0); // 1 segundo quieto
  assert(approx(engine.getFear(), 0.02), `Miedo = ${engine.getFear()} ≈ 0.02`);

  engine.update(1.0); // 2 segundos total
  assert(approx(engine.getFear(), 0.04), `Miedo = ${engine.getFear()} ≈ 0.04`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 3: Mirando al monstruo (+0.05/s adicional)');
{
  const engine = new FearEngine();
  engine.setLookAngle(0); // mirando directo, ángulo 0
  engine.update(1.0);
  // idle(0.02) + looking(0.05) = 0.07
  assert(approx(engine.getFear(), 0.07), `Miedo = ${engine.getFear()} ≈ 0.07`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 4: Zona sin luz (+0.01/s adicional)');
{
  const engine = new FearEngine();
  engine.setInDarkZone(true);
  engine.update(1.0);
  // idle(0.02) + dark(0.01) = 0.03
  assert(approx(engine.getFear(), 0.03), `Miedo = ${engine.getFear()} ≈ 0.03`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 5: Moviéndose (−0.01/s, sin idle)');
{
  const engine = new FearEngine();
  engine.setFear(0.5);
  engine.setMoving(true);
  engine.update(1.0);
  // no idle, moving(-0.01) = -0.01
  assert(approx(engine.getFear(), 0.49), `Miedo = ${engine.getFear()} ≈ 0.49`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 6: Cerca de luz (−0.03/s)');
{
  const engine = new FearEngine();
  engine.setFear(0.5);
  engine.setMoving(true);
  engine.setNearLight(true);
  engine.update(1.0);
  // no idle, moving(-0.01) + nearLight(-0.03) = -0.04
  assert(approx(engine.getFear(), 0.46), `Miedo = ${engine.getFear()} ≈ 0.46`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 7: Clamp 0–1');
{
  const engine = new FearEngine();
  engine.setFear(1.5);
  assert(engine.getFear() === 1.0, 'Clamped a 1.0');

  engine.setFear(-0.5);
  assert(engine.getFear() === 0.0, 'Clamped a 0.0');
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 8: Threshold callbacks');
{
  const engine = new FearEngine();
  let triggered = false;
  let receivedFear = null;
  let receivedThreshold = null;

  engine.onFearThreshold(0.05, (fear, threshold) => {
    triggered = true;
    receivedFear = fear;
    receivedThreshold = threshold;
  });

  engine.update(2.0); // idle 2s → 0.04, no cruza 0.05
  assert(!triggered, 'No se dispara antes del umbral');

  engine.update(1.0); // idle 3s → 0.06, cruza 0.05
  assert(triggered, 'Se dispara al cruzar umbral');
  assert(receivedThreshold === 0.05, `Threshold = ${receivedThreshold}`);
  assert(approx(receivedFear, 0.06), `Fear al cruzar = ${receivedFear}`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 9: Threshold re-disparo tras bajar');
{
  const engine = new FearEngine();
  let triggerCount = 0;

  engine.onFearThreshold(0.05, () => { triggerCount++; });

  engine.update(3.0); // → 0.06, cruza
  assert(triggerCount === 1, 'Primer disparo');

  engine.update(1.0); // → 0.08, no re-dispara
  assert(triggerCount === 1, 'No re-dispara sin bajar');

  // Bajar manualmente debajo del umbral
  engine.setFear(0.03);
  engine.update(2.0); // → 0.03 + 0.04 = 0.07, cruza de nuevo
  assert(triggerCount === 2, 'Re-dispara tras bajar');
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 10: EventEmitter — on/off/once');
{
  const engine = new FearEngine();
  const events = [];

  const handler = (fear) => events.push(fear);
  engine.on('fearChanged', handler);

  engine.update(1.0);
  assert(events.length === 1, 'Evento emitido');

  engine.off('fearChanged', handler);
  engine.update(1.0);
  assert(events.length === 1, 'Evento no emitido tras off()');

  let onceCount = 0;
  engine.once('fearChanged', () => { onceCount++; });
  engine.update(1.0);
  engine.update(1.0);
  assert(onceCount === 1, 'once() solo dispara una vez');
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 11: maxFear / noFear events');
{
  const engine = new FearEngine();
  let maxHit = false;
  let noHit = false;

  engine.on('maxFear', () => { maxHit = true; });
  engine.on('noFear', () => { noHit = true; });

  engine.setFear(0.99);
  engine.update(1.0); // +0.02 → clamped a 1.0
  assert(maxHit, 'maxFear emitido');

  engine.setFear(0.005);
  engine.setMoving(true);
  engine.setNearLight(true);
  engine.update(1.0); // -0.04 → clamped a 0.0
  assert(noHit, 'noFear emitido');
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 12: Pause / Resume');
{
  const engine = new FearEngine();
  engine.update(1.0); // 0.02
  engine.pause();
  engine.update(5.0); // debería ignorar
  assert(approx(engine.getFear(), 0.02), `Pausado: miedo = ${engine.getFear()} ≈ 0.02`);

  engine.resume();
  engine.update(1.0);
  assert(approx(engine.getFear(), 0.04), `Reanudado: miedo = ${engine.getFear()} ≈ 0.04`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 13: Reset');
{
  const engine = new FearEngine();
  engine.setFear(0.8);
  engine.setMoving(true);
  engine.setInDarkZone(true);
  engine.reset();

  assert(engine.getFear() === 0.0, 'Miedo reseteado a 0');
  const s = engine.getState();
  assert(!s.isMoving && !s.isInDarkZone, 'Estado reseteado');
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 14: Serialize / Deserialize');
{
  const engine = new FearEngine();
  engine.setFear(0.42);
  engine.setMoving(true);
  engine.setInDarkZone(true);

  const data = engine.serialize();
  const engine2 = new FearEngine();
  engine2.deserialize(data);

  assert(approx(engine2.getFear(), 0.42), `Deserializado: fear = ${engine2.getFear()}`);
  assert(engine2.getState().isMoving === true, 'Deserializado: isMoving');
  assert(engine2.getState().isInDarkZone === true, 'Deserializado: isInDarkZone');
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 15: lookAngle threshold');
{
  const engine = new FearEngine(); // threshold = PI/6 ≈ 0.524 rad
  engine.setLookAngle(Math.PI / 8); // dentro del umbral
  assert(engine.getState().isLookingAtMonster === true, 'Dentro de umbral → mirando');

  engine.setLookAngle(Math.PI / 3); // fuera del umbral
  assert(engine.getState().isLookingAtMonster === false, 'Fuera de umbral → no mirando');

  engine.setLookAngle(null); // sin monstruo
  assert(engine.getState().isLookingAtMonster === false, 'null → no mirando');
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 16: toString()');
{
  const engine = new FearEngine();
  engine.setFear(0.42);
  engine.setMoving(true);
  const str = engine.toString();
  assert(str.includes('42.0%'), `toString contiene porcentaje: ${str}`);
  assert(str.includes('MOV'), `toString contiene MOV: ${str}`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 17: Escenario completo — peor caso');
{
  const engine = new FearEngine();
  // Jugador quieto, en la oscuridad, mirando al monstruo
  engine.setInDarkZone(true);
  engine.setLookAngle(0);
  engine.update(1.0);
  // idle(0.02) + looking(0.05) + dark(0.01) = 0.08/s
  assert(approx(engine.getFear(), 0.08), `Peor caso 1s: ${engine.getFear()} ≈ 0.08`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 18: Escenario completo — mejor caso');
{
  const engine = new FearEngine();
  engine.setFear(0.5);
  // Moviéndose + cerca de luz
  engine.setMoving(true);
  engine.setNearLight(true);
  engine.update(1.0);
  // moving(-0.01) + nearLight(-0.03) = -0.04/s
  assert(approx(engine.getFear(), 0.46), `Mejor caso 1s: ${engine.getFear()} ≈ 0.46`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 19: Config personalizada');
{
  const engine = new FearEngine({ idleRate: 0.1, initialFear: 0.5 });
  engine.update(1.0);
  assert(approx(engine.getFear(), 0.6), `Custom idle rate: ${engine.getFear()} ≈ 0.6`);
}

// ─────────────────────────────────────────────────────────────
console.log('\n🧪 Test 20: stateChanged events');
{
  const engine = new FearEngine();
  const changes = [];
  engine.on('stateChanged', (change) => changes.push(change));

  engine.setMoving(true);
  engine.setInDarkZone(true);
  engine.setNearLight(true);

  assert(changes.length === 3, `3 stateChanged events: ${changes.length}`);
  assert(changes[0].property === 'isMoving', 'Primer cambio: isMoving');

  // Repetir mismo valor no dispara evento
  engine.setMoving(true);
  assert(changes.length === 3, 'Sin duplicados');
}

// ═══════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(50));
console.log(`  Resultados: ${passed} pasaron, ${failed} fallaron`);
console.log('═'.repeat(50) + '\n');

process.exit(failed > 0 ? 1 : 0);
