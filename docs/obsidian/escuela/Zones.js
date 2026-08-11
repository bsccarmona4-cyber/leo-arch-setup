/**
 * ═══════════════════════════════════════════════════════════════
 *  Zones.js — Geometrías Orgánicas y Texturas Procedurales
 *  Three.js r160 · Módulo ES6
 * ═══════════════════════════════════════════════════════════════
 */

import * as THREE from 'three';
import TheVisitor from './TheVisitor.js';

// ── GENERADOR DE TEXTURAS PBR PROCEDURALES (Canvas) ──
function createNoiseTexture(size, fn) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(size, size);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const x = (i / 4) % size;
    const y = Math.floor((i / 4) / size);
    const v = fn(x / size, y / size);
    imgData.data[i] = v;
    imgData.data[i + 1] = v;
    imgData.data[i + 2] = v;
    imgData.data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.NoColorSpace; // Para bump/roughness
  return tex;
}

// ── DEFORMADOR GEOMÉTRICO ORGANIZADOR DE IMPERFECCIONES HUMANAS ──
function makeOrganicGeometry(geometry, config = {}) {
  const pos = geometry.attributes.position;
  if (!pos) return geometry;
  
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);
  
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    
    // 1. Ruido/jitter de alta frecuencia sutil
    if (config.jitter) {
      x += (Math.sin(x * 500.0) * 0.5) * config.jitter;
      y += (Math.cos(y * 500.0) * 0.5) * config.jitter;
      z += (Math.sin(z * 500.0) * 0.5) * config.jitter;
    }
    
    // 2. Pandeo (sagging) debido a gravedad
    if (config.sagAmount) {
      if (config.sagDir === 'y') {
        const dx = (x - center.x) / (size.x / 2 || 1);
        const dz = (z - center.z) / (size.z / 2 || 1);
        const factor = Math.max(0, 1.0 - dx * dx) * Math.max(0, 1.0 - dz * dz);
        y -= config.sagAmount * factor;
      } else if (config.sagDir === 'z') {
        const dx = (x - center.x) / (size.x / 2 || 1);
        const dy = (y - center.y) / (size.y / 2 || 1);
        const factor = Math.max(0, 1.0 - dx * dx) * Math.max(0, 1.0 - dy * dy);
        z -= config.sagAmount * factor;
      }
    }
    
    // 3. Curvatura rústica o desalineación (crooked columns/wood posts)
    if (config.crooked) {
      const s = config.seed || 0.0;
      if (config.isCylinder) {
        // Desviar eje longitudinal (Y es altura)
        const bendX = Math.sin((y + s) * 1.5) * 0.08 + Math.cos((y + s) * 3.2) * 0.03;
        const bendZ = Math.cos((y + s) * 1.3) * 0.08 + Math.sin((y + s) * 2.8) * 0.03;
        x += bendX;
        z += bendZ;
        
        // Grosor orgánico variable
        const thickness = 1.0 + Math.sin((y + s) * 8.0) * 0.04 + Math.cos((y + s) * 20.0) * 0.015;
        x *= thickness;
        z *= thickness;
      } else {
        // Ondulaciones en planos (paredes)
        const wave = Math.sin(x * 0.4) * Math.cos(y * 0.4) * 0.04 + Math.sin(x * 2.0) * 0.01;
        z += wave;
      }
    }
    
    // 4. Suelo irregular (bumpy terrain)
    if (config.bumpyGround) {
      const bump = Math.sin(x * 0.15) * Math.cos(y * 0.15) * 0.35 + 
                   Math.sin(x * 0.5) * Math.sin(y * 0.5) * 0.12 + 
                   Math.cos(x * 1.2 + y * 0.8) * 0.04;
      z += bump;
    }
    
    pos.setX(i, x);
    pos.setY(i, y);
    pos.setZ(i, z);
  }
  
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

// ── HELPER: LÁMPARA INDUSTRIAL DETALLADA ──
function createIndustrialLamp(metalMat) {
  const group = new THREE.Group();
  
  const socketGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.15, 8);
  const socket = new THREE.Mesh(socketGeo, metalMat);
  socket.position.y = 0.075;
  socket.castShadow = true;
  group.add(socket);
  
  const shadeGeo = new THREE.CylinderGeometry(0.06, 0.28, 0.18, 12, 1, true);
  const shade = new THREE.Mesh(shadeGeo, metalMat);
  shade.position.y = -0.09;
  shade.castShadow = true;
  group.add(shade);
  
  const bulbGeo = new THREE.SphereGeometry(0.045, 8, 8);
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffddaa });
  const bulb = new THREE.Mesh(bulbGeo, bulbMat);
  bulb.position.y = -0.09;
  group.add(bulb);
  
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.8 });
  const wire1 = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.22, 0.28), wireMat);
  wire1.position.y = -0.15;
  wire1.rotation.x = Math.PI / 2;
  group.add(wire1);
  const wire2 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.01), wireMat);
  wire2.position.y = -0.15;
  wire2.rotation.x = Math.PI / 2;
  group.add(wire2);
  
  return group;
}

// ── HELPER: CABLE ELÉCTRICO COLGANTE (CATENARIA 3D EN UN GRUPO) ──
function createHangingCable(start, end, sag = 0.25) {
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  mid.y -= sag;
  const curve = new THREE.CatmullRomCurve3([start, mid, end]);
  const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.008, 5, false);
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x0f0f12, roughness: 0.9 });
  const cable = new THREE.Mesh(tubeGeo, cableMat);
  cable.castShadow = true;
  return cable;
}

// ── HELPER: TUBERÍA DE METAL EXPUESTA CON ABRAZADERAS ──
function createExposedPipe(length, metalMat) {
  const group = new THREE.Group();
  
  const pipeGeo = new THREE.CylinderGeometry(0.03, 0.03, length, 8);
  const pipe = new THREE.Mesh(pipeGeo, metalMat);
  pipe.rotation.x = Math.PI / 2;
  pipe.castShadow = true;
  pipe.receiveShadow = true;
  group.add(pipe);
  
  const clampMat = new THREE.MeshStandardMaterial({ color: 0x1f2022, roughness: 0.7, metalness: 0.8 });
  const clampGeo = new THREE.BoxGeometry(0.08, 0.08, 0.03);
  const step = 3.0;
  for (let z = -length / 2 + 0.5; z <= length / 2 - 0.5; z += step) {
    const clamp = new THREE.Mesh(clampGeo, clampMat);
    clamp.position.set(0, 0, z);
    clamp.castShadow = true;
    group.add(clamp);
  }
  
  return group;
}

// ── HELPER: PUERTA 3D DETALLADA CON POMO DE LATÓN ──
function createDetailed3DDoor(width, height, colorMat, frameMat) {
  const group = new THREE.Group();
  
  const frameThick = 0.08;
  const frameDepth = 0.15;
  
  const frameL = new THREE.Mesh(new THREE.BoxGeometry(frameThick, height + frameThick/2, frameDepth), frameMat);
  frameL.position.set(-width/2 - frameThick/2, (height + frameThick/2)/2, 0);
  frameL.castShadow = true;
  frameL.receiveShadow = true;
  group.add(frameL);
  
  const frameR = new THREE.Mesh(new THREE.BoxGeometry(frameThick, height + frameThick/2, frameDepth), frameMat);
  frameR.position.set(width/2 + frameThick/2, (height + frameThick/2)/2, 0);
  frameR.castShadow = true;
  frameR.receiveShadow = true;
  group.add(frameR);
  
  const frameTop = new THREE.Mesh(new THREE.BoxGeometry(width + frameThick * 2, frameThick, frameDepth), frameMat);
  frameTop.position.set(0, height + frameThick/2, 0);
  frameTop.castShadow = true;
  frameTop.receiveShadow = true;
  group.add(frameTop);
  
  const doorGeo = makeOrganicGeometry(new THREE.BoxGeometry(width - 0.01, height - 0.01, 0.05, 4, 10, 2), { crooked: true, jitter: 0.002 });
  const doorPanel = new THREE.Mesh(doorGeo, colorMat);
  doorPanel.position.set(0, height/2, 0);
  doorPanel.castShadow = true;
  doorPanel.receiveShadow = true;
  group.add(doorPanel);
  
  const trimMat = colorMat;
  const trimW = width * 0.35;
  const trimH = height * 0.36;
  const trimDepth = 0.012;
  
  const yCoords = [height * 0.28, height * 0.72];
  const xCoords = [-width * 0.22, width * 0.22];
  
  for (let zSign of [-1, 1]) {
    for (let y of yCoords) {
      for (let x of xCoords) {
        const trim = new THREE.Mesh(new THREE.BoxGeometry(trimW, trimH, trimDepth), trimMat);
        trim.position.set(x, y, zSign * 0.026);
        trim.castShadow = true;
        group.add(trim);
      }
    }
  }
  
  const knobStemMat = new THREE.MeshStandardMaterial({ color: 0xc5a059, metalness: 1.0, roughness: 0.15 });
  const knobStem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.06), knobStemMat);
  knobStem.rotation.x = Math.PI / 2;
  knobStem.position.set(width/2 - 0.12, height * 0.48, 0.05);
  knobStem.castShadow = true;
  group.add(knobStem);
  
  const knobSphereGeo = new THREE.SphereGeometry(0.032, 12, 12);
  const knobSphereMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 1.0, roughness: 0.08 });
  const knobSphere = new THREE.Mesh(knobSphereGeo, knobSphereMat);
  knobSphere.position.set(width/2 - 0.12, height * 0.48, 0.08);
  knobSphere.castShadow = true;
  group.add(knobSphere);

  const knobStemBack = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.06), knobStemMat);
  knobStemBack.rotation.x = Math.PI / 2;
  knobStemBack.position.set(width/2 - 0.12, height * 0.48, -0.05);
  knobStemBack.castShadow = true;
  group.add(knobStemBack);

  const knobSphereBack = new THREE.Mesh(knobSphereGeo, knobSphereMat);
  knobSphereBack.position.set(width/2 - 0.12, height * 0.48, -0.08);
  knobSphereBack.castShadow = true;
  group.add(knobSphereBack);
  
  return group;
}

// ── HELPER: PISTA ESCRITA EN SANGRE EN PARED (Plano 3D transparente) ──
function createBloodCluePlane(width, height, text, size = 32) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // Fondo transparente
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Texto estilo sangre chorreante
  ctx.font = `italic bold ${size}px 'Courier New', monospace`;
  ctx.fillStyle = '#8b0000'; // Rojo sangre oscuro
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  ctx.shadowColor = 'rgba(40, 0, 0, 0.9)';
  ctx.shadowBlur = 4;
  
  // Dibujar el texto
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  
  // Añadir escurrimientos y gotas de sangre aleatorias
  ctx.fillStyle = '#6b0000';
  for (let i = 0; i < 6; i++) {
    const dropX = canvas.width / 2 + (Math.random() - 0.5) * 320;
    const dropY = canvas.height / 2 + (Math.random() - 0.5) * 50 + 10;
    const radius = 2 + Math.random() * 4;
    ctx.beginPath();
    ctx.arc(dropX, dropY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Cola del escurrimiento cayendo hacia abajo
    ctx.fillRect(dropX - radius/3, dropY, radius*0.6, 20 + Math.random()*30);
  }
  
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    transparent: true,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false // Evitar Z-fighting
  });
  
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  return mesh;
}

// Mapas de Relieve (Bump Maps) procedimentales
const fabricBump = createNoiseTexture(256, (u, v) => {
  // Patrón de hilo entrelazado (Weave pattern)
  return (Math.sin(u * 500) * Math.sin(v * 500) * 0.5 + 0.5) * 60 + Math.random() * 20;
});
fabricBump.repeat.set(20, 10);

const woodBump = createNoiseTexture(512, (u, v) => {
  // Ancient wood with deep grain, fissures, and rough knots
  const grain = Math.sin(u * 120 + Math.sin(v * 40) * 15);
  const crack = Math.random() < 0.03 ? -100 : 0; // deep fissures
  const fiber = Math.random() * 30;
  return Math.min(255, Math.max(0, 128 + grain * 60 + crack + fiber));
});
woodBump.repeat.set(2, 10);

const stuccoBump = createNoiseTexture(512, (u, v) => {
  // Ultra-detailed granular stucco noise with pores
  const baseNoise = Math.sin(u * 800) * Math.sin(v * 800) * 80;
  const pores = Math.random() < 0.07 ? -90 : 0;
  const noise = baseNoise + pores + Math.random() * 40;
  return Math.min(255, Math.max(0, 128 + noise));
});
stuccoBump.repeat.set(12, 12);

const roofTileBump = createNoiseTexture(512, (u, v) => {
  // Tile pattern: 12 tiles in u-direction, repeat in v-direction
  const tileIndex = Math.floor(u * 12);
  const localU = (u * 12) - tileIndex;
  const tileCurve = Math.sin(localU * Math.PI) * 140;
  const grain = Math.random() * 30;
  return Math.min(255, Math.max(0, tileCurve + grain + 50));
});
roofTileBump.repeat.set(1, 4);

const dirtBump = createNoiseTexture(512, (u, v) => {
  // Detailed porous soil texture
  const grain = Math.random() * 200;
  const pores = Math.random() < 0.08 ? -60 : 0;
  return Math.min(255, Math.max(0, grain + pores));
});
dirtBump.repeat.set(10, 10);

// Paleta Original Vibrante
export const COLORS = {
  tentRed: 0x8b1a1a,       // Lona de la carpa
  woodFloor: 0xc4a062,     // Suelo madera/arena
  woodPost: 0x5a3a2a,      // Postes de madera
  wallDark: 0x2e3440,      // Paredes pasillo
  floorDark: 0x2a2a3a,     // Suelo pasillo
  mazeWall: 0xc4a030,      // Laberinto amarillo
  mazeFloor: 0xd4b040,     // Laberinto amarillo piso
  // Zona 4: El Exterior Falso
  skyBlue: 0x87CEEB,       // Cielo pintado
  skyTop: 0x4A90D9,        // Cielo parte alta
  grassGreen: 0x4a7c3f,    // Pasto
  hillGreen: 0x5a8c4f,     // Colinas
  redDoor: 0xaa1111,       // Puerta roja
  toyPink: 0xe8a0b4,       // Casa juguete rosa
  toyBlue: 0x7db8d9,       // Casa juguete azul
  toyYellow: 0xe8d44d,     // Casa juguete amarilla
  toyGreen: 0x7cc47c,      // Casa juguete verde
  toyLavender: 0xb8a0d9,   // Casa juguete lavanda
  crimeInterior: 0x1a0a0a, // Interior podrido
  bloodRed: 0x5a0a0a       // Manchas de sangre
};

const createOrganicMaterial = (color, bumpMap, bumpScale = 0.05, roughness = 0.9, transparent = false, opacity = 1.0) => {
  return new THREE.MeshStandardMaterial({
    color: color,
    roughness: roughness,
    metalness: 0.1,
    bumpMap: bumpMap,
    bumpScale: bumpScale,
    side: THREE.DoubleSide,
    transparent: transparent,
    opacity: opacity
  });
};

/**
 * ─────────────────────────────────────────────────────────────
 *  ZONA 1: La Carpa Roja (Techo cónico, caída de tela, orgánico)
 * ─────────────────────────────────────────────────────────────
 */
export function createZone1() {
  const group = new THREE.Group();
  group.name = "Zone1_Tower";

  const tentMat = createOrganicMaterial(COLORS.tentRed, fabricBump, 0.08, 0.9, true, 0.95);
  const floorPlanksTex = createDetailedWoodPlanksTexture();
  floorPlanksTex.repeat.set(6, 6);
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorPlanksTex,
    bumpMap: dirtBump,
    bumpScale: 0.04,
    roughness: 0.92,
    metalness: 0.05
  });
  const postMat = createOrganicMaterial(COLORS.woodPost, woodBump, 0.1);

  // 1. Piso circular (deformado para terreno irregular)
  const floorGeo = makeOrganicGeometry(new THREE.CircleGeometry(25, 64), { bumpyGround: true });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.1;
  floor.receiveShadow = true;
  group.add(floor);

  // 2. Paredes de tela (Cilindro deformado con arrugas y hundimientos)
  const wallGeo = new THREE.CylinderGeometry(14, 14, 5, 32, 16, true);
  const wallPos = wallGeo.attributes.position;
  const wallIdx = wallGeo.index;
  const doorAngle = Math.PI / 8;
  const doorHalfWidth = 0.3; // medio ancho angular de la puerta
  // Marcar vértices que están en el hueco de la puerta
  const keep = new Array(wallPos.count).fill(true);
  for (let i = 0; i < wallPos.count; i++) {
    const x = wallPos.getX(i);
    const z = wallPos.getZ(i);
    const angle = Math.atan2(x, z);
    // Hueco: ángulo cerca de doorAngle, en toda la altura
    if (Math.abs(angle - doorAngle) < doorHalfWidth || Math.abs(angle - doorAngle + 2*Math.PI) < doorHalfWidth || Math.abs(angle - doorAngle - 2*Math.PI) < doorHalfWidth) {
      keep[i] = false;
    }
    
    // Tensión entre los 8 postes
    const sag = Math.sin(angle * 8) * 0.4;
    const y = wallPos.getY(i);
    const weight = Math.cos((y / 2.5) * (Math.PI / 2));
    
    wallPos.setX(i, x + Math.sin(angle) * sag * weight);
    wallPos.setZ(i, z + Math.cos(angle) * sag * weight);
  }
  // Reconstruir índice sin triángulos que usen vértices marcados
  const newIndices = [];
  for (let i = 0; i < wallIdx.count; i += 3) {
    const a = wallIdx.getX(i);
    const b = wallIdx.getX(i + 1);
    const c = wallIdx.getX(i + 2);
    if (keep[a] && keep[b] && keep[c]) {
      newIndices.push(a, b, c);
    }
  }
  wallGeo.setIndex(newIndices);
  wallGeo.computeVertexNormals();
  const walls = new THREE.Mesh(wallGeo, tentMat);
  walls.position.y = 2.5;
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(walls);

  // 3. Techo Cónico de Tela
  const roofGeo = new THREE.ConeGeometry(14.5, 4, 32, 8, true);
  const roofPos = roofGeo.attributes.position;
  for (let i = 0; i < roofPos.count; i++) {
    const x = roofPos.getX(i);
    const y = roofPos.getY(i);
    const z = roofPos.getZ(i);
    const angle = Math.atan2(x, z);
    const sag = Math.sin(angle * 8) * 0.3; // tela cae entre postes
    const weight = 1.0 - Math.abs(y / 2.0); // Cede más abajo, tenso arriba
    roofPos.setX(i, x + Math.sin(angle) * sag * weight);
    roofPos.setZ(i, z + Math.cos(angle) * sag * weight);
  }
  roofGeo.computeVertexNormals();
  const roof = new THREE.Mesh(roofGeo, tentMat);
  roof.position.y = 7.0; // 5 + 4/2
  roof.castShadow = true;
  roof.receiveShadow = true;
  group.add(roof);

  // 4. Postes de madera (deformados rústicamente con subdivisiones y cuerdas enrolladas)
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0x907c65, roughness: 0.95, bumpMap: fabricBump, bumpScale: 0.03 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const px = Math.sin(a) * 13.5;
    const pz = Math.cos(a) * 13.5;

    const postGeo = makeOrganicGeometry(new THREE.CylinderGeometry(0.15, 0.25, 5.5, 16, 12), { crooked: true, isCylinder: true, seed: i * 12.3 });
    const p = new THREE.Mesh(postGeo, postMat);
    p.position.set(px, 2.75, pz);
    p.castShadow = true;
    p.receiveShadow = true;
    group.add(p);

    // Cuerdas enrolladas en cada poste en 3 alturas distintas
    const heights = [1.2, 2.7, 4.3];
    heights.forEach(h => {
      for (let r = 0; r < 3; r++) {
        const ropeGeo = new THREE.TorusGeometry(0.23, 0.015, 6, 12);
        const rope = new THREE.Mesh(ropeGeo, ropeMat);
        rope.position.set(px + (Math.sin(h+r)*0.01), h + r * 0.03, pz + (Math.cos(h+r)*0.01));
        rope.rotation.x = Math.PI / 2 + (Math.sin(r)*0.08);
        rope.rotation.y = Math.cos(r)*0.08;
        rope.castShadow = true;
        group.add(rope);
      }
    });
  }

  // 5. Vigas de tensión horizontales que conectan los topes de los postes
  for (let i = 0; i < 8; i++) {
    const a1 = (i / 8) * Math.PI * 2;
    const a2 = ((i + 1) / 8) * Math.PI * 2;
    
    const p1 = new THREE.Vector3(Math.sin(a1) * 13.5, 5.1, Math.cos(a1) * 13.5);
    const p2 = new THREE.Vector3(Math.sin(a2) * 13.5, 5.1, Math.cos(a2) * 13.5);
    
    const dist = p1.distanceTo(p2);
    const beamGeo = makeOrganicGeometry(new THREE.BoxGeometry(0.12, 0.18, dist + 0.2, 4, 2, 8), { crooked: true, jitter: 0.005 });
    const beam = new THREE.Mesh(beamGeo, postMat);
    
    beam.position.copy(p1).add(p2).multiplyScalar(0.5);
    beam.lookAt(p2);
    beam.castShadow = true;
    beam.receiveShadow = true;
    group.add(beam);
  }

  return group;
}

/**
 * ─────────────────────────────────────────────────────────────
 *  ZONA 2: Pasillos (Diseño complejo de paredes segmentadas y techo)
 * ─────────────────────────────────────────────────────────────
 */
export function createZone2(excludeRedDoor = false) {
  const pasillo = new THREE.Group();
  pasillo.name = "Zone2_Hallway";

  const wallTex = createBloodyConcreteTexture(512, false);
  wallTex.repeat.set(4, 1);
  const pasMat = new THREE.MeshStandardMaterial({
    map: wallTex,
    roughness: 0.9,
    metalness: 0.05,
    bumpMap: stuccoBump,
    bumpScale: 0.04
  });

  const floorTilesTex = createDetailedTilesTexture();
  floorTilesTex.repeat.set(10, 1);
  const pasSueloMat = new THREE.MeshStandardMaterial({
    map: floorTilesTex,
    roughness: 0.95,
    metalness: 0.05,
    bumpMap: dirtBump,
    bumpScale: 0.03
  });

  // Suelo súper largo para pasillo principal (ligeramente irregular)
  const pasSueloGeo = makeOrganicGeometry(new THREE.PlaneGeometry(80, 4, 32, 4), { jitter: 0.015 });
  const pasSuelo = new THREE.Mesh(pasSueloGeo, pasSueloMat);
  pasSuelo.rotation.x = -Math.PI / 2;
  pasSuelo.position.y = -0.1;
  pasSuelo.receiveShadow = true;
  pasillo.add(pasSuelo);

  // Rama del suelo que va hacia la puerta (ligeramente irregular)
  const branchSueloGeo = makeOrganicGeometry(new THREE.PlaneGeometry(2, 11, 4, 10), { jitter: 0.015 });
  const branchSuelo = new THREE.Mesh(branchSueloGeo, pasSueloMat);
  branchSuelo.rotation.x = -Math.PI / 2;
  branchSuelo.position.set(0, -0.1, -7.5);
  branchSuelo.receiveShadow = true;
  pasillo.add(branchSuelo);

  // Techo pasillo principal (pandeo central por gravedad)
  const pasTechoGeo = makeOrganicGeometry(new THREE.PlaneGeometry(80, 4, 32, 4), { sagAmount: 0.12, sagDir: 'y' });
  const pasTecho = new THREE.Mesh(pasTechoGeo, pasMat);
  pasTecho.rotation.x = Math.PI / 2;
  pasTecho.position.y = 3.5;
  pasTecho.receiveShadow = true;
  pasillo.add(pasTecho);

  // Techo pasillo lateral (pandeo central por gravedad)
  const branchTechoGeo = makeOrganicGeometry(new THREE.PlaneGeometry(2, 11, 4, 10), { sagAmount: 0.10, sagDir: 'y' });
  const branchTecho = new THREE.Mesh(branchTechoGeo, pasMat);
  branchTecho.rotation.x = Math.PI / 2;
  branchTecho.position.set(0, 3.5, -7.5);
  branchTecho.receiveShadow = true;
  pasillo.add(branchTecho);

  // Paredes pasillo principal y rodapiés (zócalos)
  const zocaloMat = new THREE.MeshStandardMaterial({ color: 0x18100c, roughness: 0.8 });
  for (let z of [-2, 2]) {
    const segments = z < 0
      ? [[-40, -10.5], [-9.5, -5.5], [-4.5, -1.0], [1.0, 4.5], [5.5, 9.5], [10.5, 40]]
      : [[-40, -10.5], [-9.5, -5.5], [-4.5, -0.5], [0.5, 4.5], [5.5, 9.5], [10.5, 40]];

    for (let seg of segments) {
      const w = seg[1] - seg[0];
      const px = seg[0] + w / 2;
      const wallGeo = makeOrganicGeometry(new THREE.PlaneGeometry(w, 3.6, Math.max(2, Math.floor(w * 2)), 6), { crooked: true });
      const m = new THREE.Mesh(wallGeo, pasMat);
      m.position.set(px, 1.7, z);
      if (z > 0) m.rotation.y = Math.PI;
      m.castShadow = true;
      m.receiveShadow = true;
      pasillo.add(m);

      // Rodapié tridimensional a la base del muro
      const zocaloGeo = new THREE.BoxGeometry(w, 0.12, 0.04);
      const zocalo = new THREE.Mesh(zocaloGeo, zocaloMat);
      zocalo.position.set(px, 0.06, z + (z < 0 ? 0.02 : -0.02));
      zocalo.castShadow = true;
      zocalo.receiveShadow = true;
      pasillo.add(zocalo);
    }
  }

  // Paredes del pasillo lateral en x = -1 y x = 1 (onduladas e imperfectas)
  const branchWallGeo = makeOrganicGeometry(new THREE.PlaneGeometry(11, 3.6, 20, 6), { crooked: true });
  
  const branchWallLeft = new THREE.Mesh(branchWallGeo, pasMat);
  branchWallLeft.position.set(-1, 1.7, -7.5);
  branchWallLeft.rotation.y = Math.PI / 2;
  branchWallLeft.castShadow = true;
  branchWallLeft.receiveShadow = true;
  pasillo.add(branchWallLeft);

  const branchWallRight = new THREE.Mesh(branchWallGeo, pasMat);
  branchWallRight.position.set(1, 1.7, -7.5);
  branchWallRight.rotation.y = -Math.PI / 2;
  branchWallRight.castShadow = true;
  branchWallRight.receiveShadow = true;
  pasillo.add(branchWallRight);

  // Rodapiés para el pasillo lateral
  const zocaloBranchL = new THREE.Mesh(new THREE.BoxGeometry(11, 0.12, 0.04), zocaloMat);
  zocaloBranchL.position.set(-0.98, 0.06, -7.5);
  zocaloBranchL.rotation.y = Math.PI / 2;
  zocaloBranchL.castShadow = true;
  pasillo.add(zocaloBranchL);
  
  const zocaloBranchR = new THREE.Mesh(new THREE.BoxGeometry(11, 0.12, 0.04), zocaloMat);
  zocaloBranchR.position.set(0.98, 0.06, -7.5);
  zocaloBranchR.rotation.y = Math.PI / 2;
  zocaloBranchR.castShadow = true;
  pasillo.add(zocaloBranchR);

  // Vigas transversales estructurales en el techo
  const beamMat = new THREE.MeshStandardMaterial({ color: 0x222428, roughness: 0.85 });
  const beamGeo = makeOrganicGeometry(new THREE.BoxGeometry(0.25, 0.2, 4.0, 4, 2, 2), { crooked: true, jitter: 0.005 });
  for (let bx = -36; bx <= 36; bx += 6) {
    if (bx === 0) continue; // dejar libre la intersección
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(bx, 3.4, 0);
    beam.castShadow = true;
    pasillo.add(beam);
  }

  // Cañerías metálicas oxidadas superiores
  const pipeMetalMat = new THREE.MeshStandardMaterial({ color: 0x6e361c, roughness: 0.4, metalness: 0.8 });
  const pipeL = createExposedPipe(80, pipeMetalMat);
  pipeL.position.set(0, 3.2, -1.92);
  pasillo.add(pipeL);
  
  const pipeR = createExposedPipe(80, pipeMetalMat);
  pipeR.position.set(0, 3.2, 1.92);
  pasillo.add(pipeR);

  // Luces de techo: portalámparas y cables colgantes
  const lampMetalMat = new THREE.MeshStandardMaterial({ color: 0x151618, roughness: 0.8, metalness: 0.6 });
  const lampCoords = [-30, -15, 0, 15, 30];
  lampCoords.forEach(lx => {
    const lamp = createIndustrialLamp(lampMetalMat);
    lamp.position.set(lx, 3.4, 0);
    pasillo.add(lamp);
  });
  
  for (let i = 0; i < lampCoords.length - 1; i++) {
    const pStart = new THREE.Vector3(lampCoords[i], 3.4, 0);
    const pEnd = new THREE.Vector3(lampCoords[i+1], 3.4, 0);
    const cable = createHangingCable(pStart, pEnd, 0.25);
    pasillo.add(cable);
  }

  // ── PUERTA ROJA 3D DETALLADA al final del branch corridor ──
  if (!excludeRedDoor) {
    const redDoorMat = new THREE.MeshStandardMaterial({
      color: COLORS.redDoor,
      roughness: 0.55,
      metalness: 0.15,
      bumpMap: woodBump,
      bumpScale: 0.05
    });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x180c0c, roughness: 0.85 });
    
    // Crear puerta 3D detallada con paneles y perillas
    const redDoor3D = createDetailed3DDoor(1.8, 2.8, redDoorMat, frameMat);
    redDoor3D.position.set(0, 0, -13);
    redDoor3D.name = 'RedDoor_Z4';
    pasillo.add(redDoor3D);
  }

  // Paredes extremos en X (cierre negro de ancho completo 4m que se difumina con la niebla)
  const endMatBlack = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.DoubleSide
  });
  for (let side of [-1, 1]) {
    const endWall = new THREE.Mesh(new THREE.PlaneGeometry(4, 3.6), endMatBlack);
    endWall.position.set(side * 40, 1.7, 0);
    endWall.rotation.y = side < 0 ? 0 : Math.PI;
    pasillo.add(endWall);
  }

  return pasillo;
}

/**
 * ─────────────────────────────────────────────────────────────
 *  ZONA 3: Laberinto Backrooms (Generado con proceduralidad visual)
 * ─────────────────────────────────────────────────────────────
 */
export function createZone3() {
  const back = new THREE.Group();
  back.name = "Zone3_Maze";

  const bkMat = createOrganicMaterial(COLORS.mazeWall, dirtBump, 0.15);
  const bkSueloMat = createOrganicMaterial(COLORS.mazeFloor, dirtBump, 0.08);

  const bkSuelo = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), bkSueloMat);
  bkSuelo.rotation.x = -Math.PI / 2;
  bkSuelo.position.y = -0.1;
  bkSuelo.receiveShadow = true;
  back.add(bkSuelo);

  // Semilla fija para consistencia
  let rng = 42;
  function random() {
    rng = (rng * 16807) % 2147483647;
    return (rng - 1) / 2147483646;
  }

  for (let gx = -9; gx <= 9; gx += 6) {
    for (let gz = -9; gz <= 9; gz += 6) {
      if (random() > 0.4) {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), bkMat);
        m.position.set(gx + 3, 1.5, gz);
        m.castShadow = true;
        m.receiveShadow = true;
        back.add(m);
      }
      if (random() > 0.4) {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), bkMat);
        m.position.set(gx, 1.5, gz + 3);
        m.rotation.y = Math.PI / 2;
        m.castShadow = true;
        m.receiveShadow = true;
        back.add(m);
      }
    }
  }

  return back;
}

// ── TEXTURAS PROCEDURALES PARA ZONA 4 ──

function createSkyTexture(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Gradiente de cielo
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#4A90D9');
  grad.addColorStop(0.3, '#6AAFE6');
  grad.addColorStop(0.6, '#87CEEB');
  grad.addColorStop(0.85, '#B0E0F0');
  grad.addColorStop(1.0, '#D4EFFC');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Nubes pintadas a mano (estilo brocha gruesa)
  function paintCloud(cx, cy, radiusX, radiusY, opacity) {
    ctx.save();
    ctx.globalAlpha = opacity;
    // Nube base
    for (let i = 0; i < 8; i++) {
      const ox = (Math.random() - 0.5) * radiusX * 1.5;
      const oy = (Math.random() - 0.5) * radiusY * 0.8;
      const rx = radiusX * (0.4 + Math.random() * 0.6);
      const ry = radiusY * (0.3 + Math.random() * 0.5);
      const cloudGrad = ctx.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, rx);
      cloudGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      cloudGrad.addColorStop(0.4, 'rgba(245, 248, 255, 0.6)');
      cloudGrad.addColorStop(1, 'rgba(240, 245, 255, 0.0)');
      ctx.fillStyle = cloudGrad;
      ctx.beginPath();
      ctx.ellipse(cx + ox, cy + oy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Brochazos visibles para que se note que está "pintado"
    ctx.globalAlpha = opacity * 0.3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3 + Math.random() * 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const sx = cx - radiusX * 0.5 + Math.random() * radiusX;
      const sy = cy - radiusY * 0.3 + Math.random() * radiusY * 0.6;
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(
        sx + radiusX * 0.3 * (Math.random() - 0.5),
        sy + radiusY * 0.2 * (Math.random() - 0.5),
        sx + radiusX * 0.5 * Math.random(),
        sy + radiusY * 0.15 * (Math.random() - 0.5)
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  // Distribuir varias nubes
  const cloudPositions = [
    [width * 0.15, height * 0.2, 120, 50, 0.8],
    [width * 0.45, height * 0.12, 150, 60, 0.9],
    [width * 0.75, height * 0.25, 100, 40, 0.7],
    [width * 0.3, height * 0.4, 90, 35, 0.5],
    [width * 0.6, height * 0.35, 130, 50, 0.6],
    [width * 0.85, height * 0.15, 80, 30, 0.75],
    [width * 0.1, height * 0.45, 70, 25, 0.4],
  ];
  cloudPositions.forEach(c => paintCloud(c[0], c[1], c[2], c[3], c[4]));

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function createGrassTexture(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base verde
  ctx.fillStyle = '#4a7c3f';
  ctx.fillRect(0, 0, size, size);

  // Variación de briznas
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const len = 2 + Math.random() * 5;
    const hue = 90 + Math.random() * 40;
    const light = 25 + Math.random() * 25;
    ctx.strokeStyle = `hsl(${hue}, 50%, ${light}%)`;
    ctx.lineWidth = 0.5 + Math.random();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 2, y - len);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(30, 30);
  return tex;
}

function createCrimeInteriorTexture(variant) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Pared podrida de fondo
  const bgColors = ['#1a0f0a', '#15100d', '#1c0e08', '#120b0b', '#0f0a0e'];
  ctx.fillStyle = bgColors[variant % bgColors.length];
  ctx.fillRect(0, 0, 256, 256);

  // Manchas de humedad y deterioro
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 5 + Math.random() * 25;
    const stainGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
    stainGrad.addColorStop(0, `rgba(${20 + Math.random() * 30}, ${Math.random() * 15}, ${Math.random() * 10}, 0.6)`);
    stainGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = stainGrad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Manchas de sangre
  ctx.fillStyle = 'rgba(90, 10, 10, 0.7)';
  for (let i = 0; i < 8; i++) {
    const sx = Math.random() * 256;
    const sy = 120 + Math.random() * 136;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 3 + Math.random() * 12, 2 + Math.random() * 8, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Chorros de sangre que bajan por la pared
  ctx.strokeStyle = 'rgba(80, 5, 5, 0.5)';
  ctx.lineWidth = 1 + Math.random() * 3;
  for (let i = 0; i < 4; i++) {
    const startX = Math.random() * 256;
    const startY = 60 + Math.random() * 80;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    let cx = startX;
    let cy = startY;
    for (let s = 0; s < 5; s++) {
      cx += (Math.random() - 0.5) * 10;
      cy += 15 + Math.random() * 20;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  // Rayones de arañazos en la pared
  if (variant % 2 === 0) {
    ctx.strokeStyle = 'rgba(60, 40, 30, 0.4)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const sx = 50 + Math.random() * 160;
      const sy = 30 + Math.random() * 100;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 20 + Math.random() * 40, sy + 30 + Math.random() * 60);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

/**
 * Crea una casa de juguete tamaño real con interior de crimen visible por ventanas.
 * @param {number} color - Color exterior de la casa
 * @param {number} variant - Variante del interior (0-4)
 * @returns {THREE.Group}
 */
function createToyHouse(color, variant, isRedDoorHouse = false) {
  const house = new THREE.Group();
  house.name = `ToyHouse_${variant}`;

  const houseW = 5;   // ancho
  const houseD = 5;   // profundidad
  const wallH = 3.2;  // alto paredes
  const roofH = 2.0;  // alto del techo triangular

  const wallMat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.85,
    metalness: 0.05,
    bumpMap: stuccoBump,
    bumpScale: 0.08,
    side: THREE.DoubleSide
  });

  const interiorTex = createCrimeInteriorTexture(variant);
  const interiorMat = new THREE.MeshStandardMaterial({
    map: interiorTex,
    roughness: 0.95,
    metalness: 0.0,
    side: THREE.DoubleSide
  });

  // ── Paredes exteriores ──
  // Pared frontal (con puerta sellada y ventana)
  const frontGroup = new THREE.Group();

  // Panel izquierdo de la pared frontal
  const frontL = new THREE.Mesh(new THREE.PlaneGeometry(1.2, wallH), wallMat);
  frontL.position.set(-1.9, wallH / 2, houseD / 2);
  frontGroup.add(frontL);

  // Panel sobre la puerta
  const frontOverDoor = new THREE.Mesh(new THREE.PlaneGeometry(1.2, wallH - 2.5), wallMat);
  frontOverDoor.position.set(-0.9, wallH - (wallH - 2.5) / 2, houseD / 2);
  frontGroup.add(frontOverDoor);

  // Puerta sellada (un panel oscuro con tablones cruzados) - solo si no es la casa con la puerta roja
  if (!isRedDoorHouse) {
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x3a2515, roughness: 0.9, side: THREE.DoubleSide });
    const sealedDoor = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.5), doorMat);
    sealedDoor.position.set(-0.9, 1.25, houseD / 2 + 0.01);
    frontGroup.add(sealedDoor);

    // Tablones cruzados sobre la puerta
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.85 });
    const board1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.04), boardMat);
    board1.position.set(-0.9, 1.6, houseD / 2 + 0.03);
    board1.rotation.z = 0.35;
    frontGroup.add(board1);
    const board2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.04), boardMat);
    board2.position.set(-0.9, 1.2, houseD / 2 + 0.03);
    board2.rotation.z = -0.3;
    frontGroup.add(board2);
  }

  // Panel derecho de la pared frontal (con hueco para ventana)
  // Debajo de la ventana
  const frontRBottom = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.0), wallMat);
  frontRBottom.position.set(1.1, 0.5, houseD / 2);
  frontGroup.add(frontRBottom);
  // Encima de la ventana
  const frontRTop = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.8), wallMat);
  frontRTop.position.set(1.1, wallH - 0.4, houseD / 2);
  frontGroup.add(frontRTop);
  // Lado izquierdo de la ventana
  const frontRSideL = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 1.4), wallMat);
  frontRSideL.position.set(0.35, 1.7, houseD / 2);
  frontGroup.add(frontRSideL);
  // Lado derecho de la ventana
  const frontRSideR = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 1.4), wallMat);
  frontRSideR.position.set(1.85, 1.7, houseD / 2);
  frontGroup.add(frontRSideR);

  // Extremo derecho
  const frontFarR = new THREE.Mesh(new THREE.PlaneGeometry(0.5, wallH), wallMat);
  frontFarR.position.set(2.25, wallH / 2, houseD / 2);
  frontGroup.add(frontFarR);

  // Ventana frontal (vidrio sucio transparente)
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x8899aa,
    transparent: true,
    opacity: 0.3,
    roughness: 0.1,
    metalness: 0.1,
    side: THREE.DoubleSide
  });
  const frontWindow = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), windowMat);
  frontWindow.position.set(1.1, 1.7, houseD / 2 + 0.01);
  frontGroup.add(frontWindow);

  // Marco de ventana
  const wFrameMat = new THREE.MeshStandardMaterial({ color: 0xd0d0d0, roughness: 0.7 });
  const wFrameH = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.05, 0.06), wFrameMat);
  wFrameH.position.set(1.1, 1.7, houseD / 2 + 0.02);
  frontGroup.add(wFrameH);
  const wFrameV = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.5, 0.06), wFrameMat);
  wFrameV.position.set(1.1, 1.7, houseD / 2 + 0.02);
  frontGroup.add(wFrameV);

  house.add(frontGroup);

  // Pared trasera (sólida)
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(houseW, wallH), wallMat);
  backWall.position.set(0, wallH / 2, -houseD / 2);
  backWall.rotation.y = Math.PI;
  house.add(backWall);

  // Pared izquierda (con ventana)
  const leftGroup = new THREE.Group();
  const leftBottom = new THREE.Mesh(new THREE.PlaneGeometry(houseD, 1.0), wallMat);
  leftBottom.position.set(-houseW / 2, 0.5, 0);
  leftBottom.rotation.y = Math.PI / 2;
  leftGroup.add(leftBottom);
  const leftTop = new THREE.Mesh(new THREE.PlaneGeometry(houseD, 0.8), wallMat);
  leftTop.position.set(-houseW / 2, wallH - 0.4, 0);
  leftTop.rotation.y = Math.PI / 2;
  leftGroup.add(leftTop);
  const leftSideL = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), wallMat);
  leftSideL.position.set(-houseW / 2, 1.7, -1.9);
  leftSideL.rotation.y = Math.PI / 2;
  leftGroup.add(leftSideL);
  const leftSideR = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), wallMat);
  leftSideR.position.set(-houseW / 2, 1.7, 1.9);
  leftSideR.rotation.y = Math.PI / 2;
  leftGroup.add(leftSideR);
  // Ventana izquierda
  const leftWin = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), windowMat);
  leftWin.position.set(-houseW / 2 + 0.01, 1.7, 0);
  leftWin.rotation.y = Math.PI / 2;
  leftGroup.add(leftWin);
  // Marco
  const lwH = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 1.3), wFrameMat);
  lwH.position.set(-houseW / 2 + 0.02, 1.7, 0);
  leftGroup.add(lwH);
  const lwV = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.5, 0.05), wFrameMat);
  lwV.position.set(-houseW / 2 + 0.02, 1.7, 0);
  leftGroup.add(lwV);
  house.add(leftGroup);

  // Pared derecha (sólida)
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(houseD, wallH), wallMat);
  rightWall.position.set(houseW / 2, wallH / 2, 0);
  rightWall.rotation.y = -Math.PI / 2;
  house.add(rightWall);

  // ── Suelo interior (podrido) ──
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1008, roughness: 0.95, side: THREE.DoubleSide });
  const houseFloor = new THREE.Mesh(new THREE.PlaneGeometry(houseW - 0.1, houseD - 0.1), floorMat);
  houseFloor.rotation.x = -Math.PI / 2;
  houseFloor.position.y = 0.01;
  house.add(houseFloor);

  // ── Paredes interiores (textura de crimen) ──
  const inBackWall = new THREE.Mesh(new THREE.PlaneGeometry(houseW - 0.2, wallH - 0.1), interiorMat);
  inBackWall.position.set(0, wallH / 2, -houseD / 2 + 0.05);
  house.add(inBackWall);
  const inRightWall = new THREE.Mesh(new THREE.PlaneGeometry(houseD - 0.2, wallH - 0.1), interiorMat);
  inRightWall.position.set(houseW / 2 - 0.05, wallH / 2, 0);
  inRightWall.rotation.y = Math.PI / 2;
  house.add(inRightWall);
  const inLeftWall = new THREE.Mesh(new THREE.PlaneGeometry(houseD - 0.2, wallH - 0.1), interiorMat);
  inLeftWall.position.set(-houseW / 2 + 0.05, wallH / 2, 0);
  inLeftWall.rotation.y = -Math.PI / 2;
  house.add(inLeftWall);
  const inFrontWall = new THREE.Mesh(new THREE.PlaneGeometry(houseW - 0.2, wallH - 0.1), interiorMat);
  inFrontWall.position.set(0, wallH / 2, houseD / 2 - 0.05);
  inFrontWall.rotation.y = Math.PI;
  house.add(inFrontWall);

  // ── Objetos interiores de crimen ──
  // Silla volcada
  const chairMat = new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: 0.9 });
  const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.5), chairMat);
  chairSeat.position.set(0.3, 0.45, -0.8);
  chairSeat.rotation.z = 1.2; // volcada
  chairSeat.rotation.y = 0.5;
  house.add(chairSeat);
  // Pata de silla
  for (let cp of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45), chairMat);
    leg.position.set(0.3 + cp[0] * 0.3, 0.22, -0.8 + cp[1] * 0.3);
    leg.rotation.z = 1.2;
    house.add(leg);
  }

  // Mesa rota
  const tableMat = new THREE.MeshStandardMaterial({ color: 0x2a1808, roughness: 0.9 });
  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 0.7), tableMat);
  tableTop.position.set(-0.5, 0.75, 0.5);
  tableTop.rotation.z = 0.08;
  house.add(tableTop);
  // Una pata rota (inclinada)
  const tLeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.75), tableMat);
  tLeg1.position.set(-1.0, 0.35, 0.2);
  house.add(tLeg1);
  const tLeg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.75), tableMat);
  tLeg2.position.set(0.0, 0.35, 0.8);
  house.add(tLeg2);
  const tLeg3 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5), tableMat);
  tLeg3.position.set(-1.0, 0.25, 0.8);
  tLeg3.rotation.z = 0.4; // rota/inclinada
  house.add(tLeg3);

  // Silueta humana en el suelo (plano oscuro que simula un cuerpo)
  if (variant < 3) {
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0a0505,
      roughness: 1.0,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    const bodyShape = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1.6), bodyMat);
    bodyShape.rotation.x = -Math.PI / 2;
    bodyShape.position.set(0.8 * (variant === 0 ? 1 : -1), 0.02, -1.0 + variant * 0.5);
    bodyShape.rotation.z = 0.3 * (variant - 1);
    house.add(bodyShape);
  }

  // Luz interior tenue (rojo enfermizo)
  const interiorLight = new THREE.PointLight(0xff2200, 0.4, 8);
  interiorLight.position.set(0, 2.5, 0);
  interiorLight.castShadow = false;
  house.add(interiorLight);

  // ── Techo triangular ──
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-houseW / 2 - 0.3, 0);
  roofShape.lineTo(0, roofH);
  roofShape.lineTo(houseW / 2 + 0.3, 0);
  roofShape.lineTo(-houseW / 2 - 0.3, 0);

  const roofExtrudeSettings = { depth: houseD + 0.6, bevelEnabled: false };
  const roofGeo = new THREE.ExtrudeGeometry(roofShape, roofExtrudeSettings);
  const roofColors = [0xaa3333, 0x3355aa, 0x33aa55, 0xaa8833, 0x8833aa];
  const roofMat = new THREE.MeshStandardMaterial({
    color: roofColors[variant % roofColors.length],
    roughness: 0.8,
    bumpMap: roofTileBump,
    bumpScale: 0.15,
    side: THREE.DoubleSide
  });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(0, wallH, -houseD / 2 - 0.3);
  house.add(roof);

  // Techo interior (cierre)
  const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x1a1510, roughness: 0.95, side: THREE.DoubleSide });
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(houseW - 0.1, houseD - 0.1), ceilingMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = wallH - 0.05;
  house.add(ceiling);



  // Shadow config for all meshes in house
  house.traverse(child => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return house;
}

// ── HELPER: CERCA DE ESTACAS DE MADERA PROCEDURAL ──
function createPicketFence(length) {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x6e5233, roughness: 0.9, bumpMap: woodBump, bumpScale: 0.04 });
  
  const railGeo = new THREE.BoxGeometry(0.04, 0.05, length);
  const rail1 = new THREE.Mesh(railGeo, woodMat);
  rail1.position.set(0, 0.25, 0);
  rail1.castShadow = true;
  group.add(rail1);
  const rail2 = new THREE.Mesh(railGeo, woodMat);
  rail2.position.set(0, 0.70, 0);
  rail2.castShadow = true;
  group.add(rail2);
  
  const picketGeo = new THREE.BoxGeometry(0.07, 0.95, 0.02);
  const step = 0.22;
  for (let z = -length/2 + 0.1; z <= length/2 - 0.1; z += step) {
    const picket = new THREE.Mesh(picketGeo, woodMat);
    picket.position.set(0.03, 0.47, z + (Math.random()-0.5)*0.02);
    picket.rotation.z = (Math.random() - 0.5) * 0.05;
    picket.rotation.y = (Math.random() - 0.5) * 0.08;
    picket.castShadow = true;
    picket.receiveShadow = true;
    group.add(picket);
  }
  
  return group;
}

/**
 * ─────────────────────────────────────────────────────────────
 *  ZONA 4: El Exterior Falso
 *  Un cuarto gigante con paredes pintadas como cielo,
 *  casas de juguete con interiores de crimen, colinas,
 *  y objetos con distorsiones de la realidad.
 * ─────────────────────────────────────────────────────────────
 */
export function createZone4() {
  const zone = new THREE.Group();
  zone.name = 'Zone4_FakeExterior';

  const roomW = 120;
  const roomD = 120;
  const roomH = 25;

  // ── Soportes y andamios de madera visibles detrás de las paredes de cielo (cerca de la entrada, z = 60) ──
  const scaffoldMat = new THREE.MeshStandardMaterial({ color: 0x4a2a1a, roughness: 0.85, bumpMap: woodBump, bumpScale: 0.08 });
  const braceGeo = makeOrganicGeometry(new THREE.BoxGeometry(0.12, 0.12, 4.0, 2, 2, 4), { crooked: true, jitter: 0.005 });
  const postVertGeo = makeOrganicGeometry(new THREE.CylinderGeometry(0.08, 0.08, 6.0, 8, 4), { crooked: true, isCylinder: true });
  for (let sx = -8; sx <= 8; sx += 4) {
    if (Math.abs(sx) < 2) continue; // no obstruir entrada
    const post = new THREE.Mesh(postVertGeo, scaffoldMat);
    post.position.set(sx, 3.0, roomD / 2 + 0.3);
    post.castShadow = true;
    zone.add(post);
    
    const brace = new THREE.Mesh(braceGeo, scaffoldMat);
    brace.position.set(sx, 1.8, roomD / 2 + 1.2);
    brace.rotation.x = 0.5;
    brace.castShadow = true;
    zone.add(brace);
  }

  // ── Cerca de estacas de madera en el terreno ──
  const fence1 = createPicketFence(18);
  fence1.position.set(10, 0.0, -10);
  zone.add(fence1);

  const fence2 = createPicketFence(12);
  fence2.position.set(20, 0.0, -5);
  fence2.rotation.y = Math.PI / 2;
  zone.add(fence2);

  const fence3 = createPicketFence(15);
  fence3.position.set(-15, 0.0, -22);
  zone.add(fence3);


  // ── Textura de cielo para las paredes ──
  const skyTex = createSkyTexture(1024, 512);
  const skyMat = new THREE.MeshStandardMaterial({
    map: skyTex,
    roughness: 0.95,
    metalness: 0.0,
    side: THREE.DoubleSide
  });

  // ── Suelo de pasto (irregular/ondulado) ──
  const grassTex = createGrassTexture(512);
  const grassMat = new THREE.MeshStandardMaterial({
    map: grassTex,
    color: COLORS.grassGreen,
    roughness: 0.9,
    metalness: 0.0
  });
  const floorGeo = makeOrganicGeometry(new THREE.PlaneGeometry(roomW, roomD, 40, 40), { bumpyGround: true });
  const floor = new THREE.Mesh(floorGeo, grassMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.1;
  floor.receiveShadow = true;
  zone.add(floor);

  // ── Paredes del cuarto (cielo pintado con leves deformaciones de paneles) ──
  // Pared norte (fondo, -Z)
  const wallNorthGeo = makeOrganicGeometry(new THREE.PlaneGeometry(roomW, roomH, 20, 6), { crooked: true });
  const wallNorth = new THREE.Mesh(wallNorthGeo, skyMat);
  wallNorth.position.set(0, roomH / 2, -roomD / 2);
  zone.add(wallNorth);

  // Pared sur (+Z) — tiene la entrada desde el pasillo
  // Panel izquierdo
  const southLGeo = makeOrganicGeometry(new THREE.PlaneGeometry(roomW / 2 - 1.2, roomH, 15, 6), { crooked: true });
  const southL = new THREE.Mesh(southLGeo, skyMat);
  southL.position.set(-roomW / 4 - 0.6, roomH / 2, roomD / 2);
  southL.rotation.y = Math.PI;
  zone.add(southL);
  // Panel derecho
  const southRGeo = makeOrganicGeometry(new THREE.PlaneGeometry(roomW / 2 - 1.2, roomH, 15, 6), { crooked: true });
  const southR = new THREE.Mesh(southRGeo, skyMat);
  southR.position.set(roomW / 4 + 0.6, roomH / 2, roomD / 2);
  southR.rotation.y = Math.PI;
  zone.add(southR);
  // Panel encima de la entrada
  const southTopGeo = makeOrganicGeometry(new THREE.PlaneGeometry(2.4, roomH - 3.6, 2, 4), { crooked: true });
  const southTop = new THREE.Mesh(southTopGeo, skyMat);
  southTop.position.set(0, 3.6 + (roomH - 3.6) / 2, roomD / 2);
  southTop.rotation.y = Math.PI;
  zone.add(southTop);

  // Pared este (+X)
  const wallEastGeo = makeOrganicGeometry(new THREE.PlaneGeometry(roomD, roomH, 20, 6), { crooked: true });
  const wallEast = new THREE.Mesh(wallEastGeo, skyMat);
  wallEast.position.set(roomW / 2, roomH / 2, 0);
  wallEast.rotation.y = -Math.PI / 2;
  zone.add(wallEast);

  // Pared oeste (-X)
  const wallWestGeo = makeOrganicGeometry(new THREE.PlaneGeometry(roomD, roomH, 20, 6), { crooked: true });
  const wallWest = new THREE.Mesh(wallWestGeo, skyMat);
  wallWest.position.set(-roomW / 2, roomH / 2, 0);
  wallWest.rotation.y = Math.PI / 2;
  zone.add(wallWest);

  // ── Techo (azul claro para completar la ilusión) ──
  const ceilingMat = new THREE.MeshStandardMaterial({
    color: 0xB0E0F0,
    roughness: 0.95,
    side: THREE.DoubleSide
  });
  const ceilingGeo = makeOrganicGeometry(new THREE.PlaneGeometry(roomW, roomD, 20, 20), { sagAmount: 0.8, sagDir: 'y' });
  const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = roomH;
  zone.add(ceiling);

  // ── Colinas decorativas ──
  const hillMat = new THREE.MeshStandardMaterial({
    color: COLORS.hillGreen,
    roughness: 0.85,
    bumpMap: dirtBump,
    bumpScale: 0.04
  });

  const hillConfigs = [
    { x: -30, z: -25, rx: 12, rz: 14, h: 3.5 },
    { x: 25, z: -35, rx: 18, rz: 15, h: 4.0 },
    { x: -15, z: 20, rx: 10, rz: 12, h: 2.5 },
    { x: 35, z: 15, rx: 16, rz: 13, h: 3.0 },
    { x: -40, z: -45, rx: 14, rz: 11, h: 3.2 },
    { x: 10, z: -50, rx: 20, rz: 16, h: 4.5 },
    { x: -20, z: -40, rx: 8, rz: 9, h: 2.0 },
  ];

  hillConfigs.forEach(cfg => {
    const hillGeo = new THREE.SphereGeometry(1, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    hillGeo.scale(cfg.rx, cfg.h, cfg.rz);
    const hill = new THREE.Mesh(hillGeo, hillMat);
    hill.position.set(cfg.x, -0.1, cfg.z);
    hill.receiveShadow = true;
    hill.castShadow = true;
    zone.add(hill);
  });

  // ── Casas de juguete tamaño real ──
  const houseColors = [COLORS.toyPink, COLORS.toyBlue, COLORS.toyYellow, COLORS.toyGreen, COLORS.toyLavender];
  const housePositions = [
    { x: -20, z: -10, rot: 0.3 },
    { x: 15, z: -20, rot: -0.5 },
    { x: -35, z: -35, rot: 1.2 },
    { x: 30, z: 5, rot: 2.8 },
    { x: -5, z: -45, rot: 0.8 },
  ];

  const houses = [];
  housePositions.forEach((pos, i) => {
    // La casa en el índice 1 (la azul) tendrá la puerta roja dinámica
    const isRedDoorHouse = (i === 1);
    const h = createToyHouse(houseColors[i], i, isRedDoorHouse);
    h.position.set(pos.x, 0, pos.z);
    h.rotation.y = pos.rot;
    zone.add(h);
    houses.push(h);
  });

  // ── OBJETOS DISTORSIONADOS DE LA REALIDAD ──

  // 1. Árbol boca abajo (raíces hacia arriba)
  const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3a2a, roughness: 0.9, bumpMap: woodBump, bumpScale: 0.1 });
  const treeLeafMat = new THREE.MeshStandardMaterial({ color: 0x2a6a1a, roughness: 0.8 });

  const upsideDownTree = new THREE.Group();
  upsideDownTree.name = 'UpsideDownTree';
  // Tronco
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 4, 8), treeTrunkMat);
  trunk.position.y = 2;
  upsideDownTree.add(trunk);
  // Copa (abajo, como si las hojas estuvieran en el suelo)
  const foliage = new THREE.Mesh(new THREE.SphereGeometry(2.5, 12, 10), treeLeafMat);
  foliage.scale.set(1, 0.6, 1);
  foliage.position.y = -0.3;
  upsideDownTree.add(foliage);
  // Raíces (arriba, retorcidas)
  for (let r = 0; r < 5; r++) {
    const rootAngle = (r / 5) * Math.PI * 2;
    const rootGeo = new THREE.CylinderGeometry(0.03, 0.08, 1.5, 6);
    const root = new THREE.Mesh(rootGeo, treeTrunkMat);
    root.position.set(Math.cos(rootAngle) * 0.3, 4.5, Math.sin(rootAngle) * 0.3);
    root.rotation.z = Math.cos(rootAngle) * 0.5;
    root.rotation.x = Math.sin(rootAngle) * 0.5;
    upsideDownTree.add(root);
  }
  upsideDownTree.position.set(8, 0, -15);
  zone.add(upsideDownTree);

  // 2. Banca de parque flotante
  const benchMat = new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.8, bumpMap: woodBump, bumpScale: 0.08 });
  const floatingBench = new THREE.Group();
  floatingBench.name = 'FloatingBench';
  // Asiento
  const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 0.5), benchMat);
  benchSeat.position.y = 0;
  floatingBench.add(benchSeat);
  // Respaldo
  const benchBack = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 0.08), benchMat);
  benchBack.position.set(0, 0.3, -0.22);
  benchBack.rotation.x = -0.1;
  floatingBench.add(benchBack);
  // Patas (terminan en el aire)
  const benchLegMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6, metalness: 0.4 });
  for (let lx of [-0.8, 0.8]) {
    for (let lz of [-0.18, 0.18]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45), benchLegMat);
      leg.position.set(lx, -0.25, lz);
      floatingBench.add(leg);
    }
  }
  floatingBench.position.set(-10, 0.35, -30); // Flotando a 35cm del suelo
  zone.add(floatingBench);

  // 3. Buzón de correos gigante (3m de alto)
  const giantMailbox = new THREE.Group();
  giantMailbox.name = 'GiantMailbox';
  const mailboxMat = new THREE.MeshStandardMaterial({ color: 0x2255cc, roughness: 0.5 });
  // Cuerpo del buzón
  const mailBody = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 1.0), mailboxMat);
  mailBody.position.y = 2.25;
  giantMailbox.add(mailBody);
  // Tapa semicircular
  const mailTop = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.0, 16, 1, false, 0, Math.PI), mailboxMat);
  mailTop.rotation.z = Math.PI / 2;
  mailTop.rotation.y = Math.PI / 2;
  mailTop.position.y = 3.5;
  giantMailbox.add(mailTop);
  // Poste
  const mailPost = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.0), new THREE.MeshStandardMaterial({ color: 0x444444 }));
  mailPost.position.y = 0.5;
  giantMailbox.add(mailPost);
  // Ranura
  const slotMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.05), slotMat);
  slot.position.set(0, 2.8, 0.52);
  giantMailbox.add(slot);
  giantMailbox.position.set(40, 0, -20);
  zone.add(giantMailbox);

  // 4. Reloj procedural con manecillas girando al revés
  const clockGroup = new THREE.Group();
  clockGroup.name = 'BackwardsClock';
  // Cuerpo del reloj (poste + cara circular)
  const clockPostMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5, metalness: 0.3 });
  const clockPost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.5), clockPostMat);
  clockPost.position.y = 1.75;
  clockGroup.add(clockPost);
  // Cara del reloj
  const clockFaceMat = new THREE.MeshStandardMaterial({ color: 0xf0f0e8, roughness: 0.6, side: THREE.DoubleSide });
  const clockFace = new THREE.Mesh(new THREE.CircleGeometry(0.6, 32), clockFaceMat);
  clockFace.position.set(0, 3.6, 0.05);
  clockGroup.add(clockFace);
  // Borde del reloj
  const clockRimGeo = new THREE.TorusGeometry(0.6, 0.04, 8, 32);
  const clockRim = new THREE.Mesh(clockRimGeo, clockPostMat);
  clockRim.position.set(0, 3.6, 0.05);
  clockGroup.add(clockRim);
  // Marcas de horas
  for (let h = 0; h < 12; h++) {
    const angle = (h / 12) * Math.PI * 2;
    const markLen = h % 3 === 0 ? 0.1 : 0.05;
    const markGeo = new THREE.BoxGeometry(0.02, markLen, 0.01);
    const mark = new THREE.Mesh(markGeo, clockPostMat);
    const r = 0.5;
    mark.position.set(Math.sin(angle) * r, 3.6 + Math.cos(angle) * r, 0.07);
    mark.rotation.z = -angle;
    clockGroup.add(mark);
  }
  // Manecilla de hora (animada al revés en el game loop) — almacenada en userData
  const hourHandMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.3, 0.015), hourHandMat);
  hourHand.geometry.translate(0, 0.15, 0);
  hourHand.position.set(0, 3.6, 0.08);
  clockGroup.add(hourHand);
  // Manecilla de minuto
  const minuteHand = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.42, 0.012), hourHandMat);
  minuteHand.geometry.translate(0, 0.21, 0);
  minuteHand.position.set(0, 3.6, 0.09);
  clockGroup.add(minuteHand);
  // Centro
  const clockCenter = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), hourHandMat);
  clockCenter.position.set(0, 3.6, 0.1);
  clockGroup.add(clockCenter);

  clockGroup.position.set(-25, 0, -5);
  zone.add(clockGroup);

  // Guardar referencias para animación
  zone.userData.clockHourHand = hourHand;
  zone.userData.clockMinuteHand = minuteHand;

  // 5. Farola que emite oscuridad
  const darkLampGroup = new THREE.Group();
  darkLampGroup.name = 'DarknessLamp';
  const lampPostMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5, metalness: 0.4 });
  const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 5), lampPostMat);
  lampPole.position.y = 2.5;
  darkLampGroup.add(lampPole);
  // Brazo curvado
  const lampArm = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.05), lampPostMat);
  lampArm.position.set(0.4, 5.0, 0);
  lampArm.rotation.z = -0.15;
  darkLampGroup.add(lampArm);
  // Farol (caja con vidrio negro)
  const lanternMat = new THREE.MeshStandardMaterial({ color: 0x050505, emissive: 0x000000, roughness: 0.3 });
  const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.35), lanternMat);
  lantern.position.set(0.8, 4.85, 0);
  darkLampGroup.add(lantern);
  // "Luz negra" — un volumen de oscuridad alrededor
  const darkSphereMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide
  });
  const darkSphere = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 16), darkSphereMat);
  darkSphere.position.set(0.8, 4.85, 0);
  darkLampGroup.add(darkSphere);

  darkLampGroup.position.set(20, 0, -40);
  zone.add(darkLampGroup);

  // 6. Sombra que no corresponde — plano oscuro con forma de animal junto a un poste normal
  const shadowGroup = new THREE.Group();
  shadowGroup.name = 'WrongShadow';
  
  // Poste simple con micro-porosidad
  const sPostMat = new THREE.MeshStandardMaterial({ 
    color: 0x888888, 
    roughness: 0.85,
    bumpMap: woodBump,
    bumpScale: 0.02
  });
  const sPost = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 2), sPostMat);
  sPost.position.y = 1;
  shadowGroup.add(sPost);
  
  // La "sombra" del poste es una silueta humana (plano en el suelo)
  const wrongShadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  });
  const wrongShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 2.2), wrongShadowMat);
  wrongShadow.rotation.x = -Math.PI / 2;
  wrongShadow.position.set(1.2, 0.01, 0);
  shadowGroup.add(wrongShadow);
  shadowGroup.position.set(-45, 0, -15);
  zone.add(shadowGroup);

  // Guardar referencia de casas para colisiones
  zone.userData.houses = houses;
  zone.userData.housePositions = housePositions;
  zone.userData.roomW = roomW;
  zone.userData.roomD = roomD;
  zone.userData.floatingBench = floatingBench;

  // Shadow config
  zone.traverse(child => {
    if (child.isMesh && !child.material.transparent) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return zone;
}

// ── TEXTURAS PROCEDURALES PARA ZONA 4 ──

function createBloodyConcreteTexture(size = 512, withBlood = true) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // 1. Base gris oscuro de concreto con grano
  ctx.fillStyle = '#1e2024';
  ctx.fillRect(0, 0, size, size);
  
  // Ruido de película analógica (para grano fino fotorrealista)
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 22;
    const pore = Math.random() < 0.04 ? -28 : 0;
    data[i]     = Math.max(0, Math.min(255, data[i] + noise + pore));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise + pore));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise + pore));
  }
  ctx.putImageData(imgData, 0, 0);

  // 2. Oclusión ambiental horneada (baked shadows superior e inferior)
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, 'rgba(10, 10, 12, 0.45)');
  grad.addColorStop(0.25, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(0.75, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(1, 'rgba(10, 10, 12, 0.6)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // 3. Humedad y suciedad verdosa/oscura
  for (let k = 0; k < 15; k++) {
    const cx = Math.random() * size;
    const cy = Math.random() * size;
    const r = 30 + Math.random() * 50;
    const radialGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    radialGrad.addColorStop(0, 'rgba(8, 14, 11, 0.45)');
    radialGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radialGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Fisuras finas (Micro-cracks)
  ctx.strokeStyle = 'rgba(12, 12, 14, 0.55)';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    let cx = Math.random() * size;
    let cy = Math.random() * size;
    ctx.moveTo(cx, cy);
    for (let j = 0; j < 5; j++) {
      cx += (Math.random() - 0.5) * 35;
      cy += 20 + Math.random() * 35;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  // 5. Manchas y chorretes de sangre seca (rojo vino) si se requiere
  if (withBlood) {
    for (let k = 0; k < 12; k++) {
      const bx = Math.random() * size;
      const by = Math.random() * size;
      const br = 4 + Math.random() * 12;
      
      const bloodGrad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      bloodGrad.addColorStop(0, 'rgba(60, 4, 4, 0.9)');
      bloodGrad.addColorStop(0.6, 'rgba(40, 2, 2, 0.7)');
      bloodGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bloodGrad;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
      
      // Chorretes verticales
      if (Math.random() > 0.4) {
        ctx.fillStyle = 'rgba(38, 2, 2, 0.75)';
        const length = 10 + Math.random() * 30;
        const width = 1 + Math.random() * 3;
        ctx.fillRect(bx - width / 2, by, width, length);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createStripedTapestryTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // Base blanca sucia/amarillenta
  ctx.fillStyle = '#bfae9a';
  ctx.fillRect(0, 0, 128, 256);
  
  // Rayas rojas circo
  ctx.fillStyle = '#631212';
  ctx.fillRect(0, 0, 32, 256);
  ctx.fillRect(64, 0, 32, 256);
  
  // Grano fino de fibra de tela
  const imgData = ctx.getImageData(0, 0, 128, 256);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 15;
    data[i]     = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);
  
  // Manchas marrones de humedad y moho (baked ambient degradation)
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * 128;
    const y = Math.random() * 256;
    const r = 12 + Math.random() * 18;
    const stainGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
    stainGrad.addColorStop(0, 'rgba(40, 20, 5, 0.35)');
    stainGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = stainGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

function createRustyMetalTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // Hierro base
  ctx.fillStyle = '#282b2e';
  ctx.fillRect(0, 0, 256, 256);
  
  // Grano metálico y micro-imperfecciones
  const imgData = ctx.getImageData(0, 0, 256, 256);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 18;
    data[i]     = Math.max(0, Math.min(255, data[i] + n));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
  }
  ctx.putImageData(imgData, 0, 0);
  
  // Picaduras de óxido naranja/marrón
  for (let i = 0; i < 35; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 3 + Math.random() * 12;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(120, 50, 10, 0.85)'); 
    g.addColorStop(0.5, 'rgba(180, 85, 20, 0.55)'); 
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createMirrorTexture() {
  const canvas = document.createElement('canvas');
  const size = 512; // Mayor resolución para ver gotas finas
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // 1. Base gris plata reflectante
  ctx.fillStyle = '#65696e';
  ctx.fillRect(0, 0, size, size);
  
  // 2. Desgaste y óxido de plata en los bordes y esquinas (ennegrecimiento de espejo viejo)
  for (let i = 0; i < 90; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = (0.75 + Math.random() * 0.25) * (size / 2);
    const x = size / 2 + Math.cos(angle) * dist;
    const y = size / 2 + Math.sin(angle) * dist;
    const r = 10 + Math.random() * 25;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(10, 10, 12, 0.9)');
    g.addColorStop(0.5, 'rgba(20, 20, 22, 0.5)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 3. Vaho/Niebla en los bordes y zonas condensadas
  for (let i = 0; i < 25; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 60 + Math.random() * 100;
    const vahoGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
    vahoGrad.addColorStop(0, 'rgba(235, 238, 242, 0.45)');
    vahoGrad.addColorStop(1, 'rgba(235, 238, 242, 0)');
    ctx.fillStyle = vahoGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 4. Escurrimientos de agua verticales (goteo)
  ctx.strokeStyle = 'rgba(245, 248, 252, 0.55)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    let sx = 50 + Math.random() * (size - 100);
    let sy = 50 + Math.random() * (size / 2);
    ctx.moveTo(sx, sy);
    const length = 40 + Math.random() * 120;
    for (let currY = sy; currY < sy + length; currY += 15) {
      sx += (Math.random() - 0.5) * 1.5; // leve zigzag natural del agua
      ctx.lineTo(sx, currY);
    }
    ctx.stroke();
    
    // Gota al final del escurrimiento
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(sx, sy + length, 2.0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Gotas de condensación individuales con relieve (sombra abajo/derecha, luz arriba/izquierda)
  for (let i = 0; i < 300; i++) {
    const gx = Math.random() * size;
    const gy = Math.random() * size;
    const gr = 1.5 + Math.random() * 3.5;
    
    // Sombra de la gota
    ctx.fillStyle = 'rgba(10, 15, 20, 0.4)';
    ctx.beginPath();
    ctx.arc(gx + 0.8, gy + 0.8, gr, 0, Math.PI * 2);
    ctx.fill();
    
    // Cuerpo transparente de la gota
    ctx.fillStyle = 'rgba(210, 220, 230, 0.25)';
    ctx.beginPath();
    ctx.arc(gx, gy, gr, 0, Math.PI * 2);
    ctx.fill();
    
    // Brillo de luz reflejada (top-left)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(gx - gr * 0.35, gy - gr * 0.35, gr * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 6. Rayones finos en el vidrio
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    const sx = Math.random() * size;
    const sy = Math.random() * size;
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + (Math.random() - 0.5) * 50, sy + (Math.random() - 0.5) * 50);
    ctx.stroke();
  }
  
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

function createDetailedWoodPlanksTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Base madera de carpa vieja
  ctx.fillStyle = '#9b763e';
  ctx.fillRect(0, 0, size, size);
  
  // Dibujar 8 tablones horizontales
  const plankH = size / 8;
  for (let p = 0; p < 8; p++) {
    const py = p * plankH;
    
    // Variación de color entre tablones
    ctx.fillStyle = p % 2 === 0 ? '#9b763e' : '#8a6733';
    ctx.fillRect(0, py, size, plankH);
    
    // Vetas de la madera
    ctx.strokeStyle = 'rgba(60, 40, 15, 0.3)';
    ctx.lineWidth = 1.2;
    for (let v = 0; v < 5; v++) {
      ctx.beginPath();
      let currY = py + Math.random() * plankH;
      ctx.moveTo(0, currY);
      for (let x = 0; x <= size; x += 40) {
        currY += (Math.random() - 0.5) * 4.0;
        ctx.lineTo(x, currY);
      }
      ctx.stroke();
    }
    
    // Nudos en la madera ocasionales
    if (Math.random() > 0.4) {
      const kx = Math.random() * size;
      const ky = py + plankH * 0.5;
      const kr = 4 + Math.random() * 8;
      ctx.strokeStyle = 'rgba(50, 30, 10, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(kx, ky, kr, 0, Math.PI * 2);
      ctx.stroke();
      
      // Espirales alrededor del nudo
      ctx.beginPath();
      ctx.arc(kx, ky, kr * 2.0, 0.2, Math.PI * 1.8);
      ctx.stroke();
    }
    
    // Sombras de contacto horneadas en las ranuras (grout)
    ctx.fillStyle = 'rgba(15, 10, 5, 0.8)';
    ctx.fillRect(0, py, size, 3);
    ctx.fillRect(0, py + plankH - 3, size, 3);
  }
  
  // Grano fino y suciedad/desgaste general
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 18;
    data[i]     = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);
  
  // Manchas de humedad y barro/polvo
  for (let s = 0; s < 12; s++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 20 + Math.random() * 40;
    const stain = ctx.createRadialGradient(x, y, 0, x, y, r);
    stain.addColorStop(0, 'rgba(40, 20, 5, 0.35)');
    stain.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = stain;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createDetailedTilesTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Base concrete dark floor
  ctx.fillStyle = '#202226';
  ctx.fillRect(0, 0, size, size);
  
  // Dibujar 4x4 baldosas de hormigón (líneas de rejilla)
  const tileSize = size / 4;
  ctx.strokeStyle = 'rgba(10, 8, 5, 0.95)';
  ctx.lineWidth = 4.0;
  
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * tileSize);
    ctx.lineTo(size, i * tileSize);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(i * tileSize, 0);
    ctx.lineTo(i * tileSize, size);
    ctx.stroke();
  }
  
  // Sombras y oclusión ambiental horneadas en los bordes interiores de cada baldosa
  for (let tx = 0; tx < 4; tx++) {
    for (let ty = 0; ty < 4; ty++) {
      const px = tx * tileSize;
      const py = ty * tileSize;
      
      const g = ctx.createLinearGradient(px, py, px, py + tileSize);
      g.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
      g.addColorStop(0.18, 'rgba(0, 0, 0, 0)');
      g.addColorStop(0.82, 'rgba(0, 0, 0, 0)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
      ctx.fillStyle = g;
      ctx.fillRect(px, py, tileSize, tileSize);
      
      const gHoriz = ctx.createLinearGradient(px, py, px + tileSize, py);
      gHoriz.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
      gHoriz.addColorStop(0.18, 'rgba(0, 0, 0, 0)');
      gHoriz.addColorStop(0.82, 'rgba(0, 0, 0, 0)');
      gHoriz.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
      ctx.fillStyle = gHoriz;
      ctx.fillRect(px, py, tileSize, tileSize);
    }
  }
  
  // Grietas finas detalladas en el concreto
  for (let c = 0; c < 5; c++) {
    ctx.strokeStyle = 'rgba(12, 12, 14, 0.6)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    let cx = Math.random() * size;
    let cy = Math.random() * size;
    ctx.moveTo(cx, cy);
    for (let j = 0; j < 5; j++) {
      cx += (Math.random() - 0.5) * 35;
      cy += (Math.random() - 0.5) * 35;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }
  
  // Ruido de película analógica (grano fino de sensor)
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 15;
    data[i]     = Math.max(0, Math.min(255, data[i] + n));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
  }
  ctx.putImageData(imgData, 0, 0);
  
  // Manchas de humedad y filtraciones oscuras
  for (let s = 0; s < 12; s++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 20 + Math.random() * 45;
    const stain = ctx.createRadialGradient(x, y, 0, x, y, r);
    stain.addColorStop(0, 'rgba(10, 14, 12, 0.5)');
    stain.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = stain;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// ── ZONA 5: CAMERINOS Y ALMACÉN DEL CIRCO SUBTERRÁNEO ──

export function createZone5() {
  const zone = new THREE.Group();
  zone.name = 'Zone5_CircusBasement';

  // ── Texturas Compartidas ──
  const wallTex = createBloodyConcreteTexture(512);
  wallTex.repeat.set(4, 2);
  const floorTilesTex = createDetailedTilesTexture();
  floorTilesTex.repeat.set(2, 25);

  // ── Materiales PBR Compartidos ──
  const concreteMat = new THREE.MeshStandardMaterial({
    map: wallTex,
    roughness: 0.9,
    metalness: 0.1,
    side: THREE.DoubleSide
  });

  const wallColdMat = new THREE.MeshStandardMaterial({
    map: wallTex,
    color: 0x7da8b5, // Tono azul/verde de clínica morgue
    roughness: 0.9,
    metalness: 0.15,
    side: THREE.DoubleSide
  });

  const wallDarkMat = new THREE.MeshStandardMaterial({
    map: wallTex,
    color: 0x553838, // Rojo/oscuro tétrico de pesadilla
    roughness: 0.95,
    metalness: 0.05,
    side: THREE.DoubleSide
  });

  const wallFloor5Mat = new THREE.MeshStandardMaterial({
    map: wallTex,
    color: 0x300d0d, // Rojo sangre profundo
    roughness: 0.95,
    metalness: 0.05,
    side: THREE.DoubleSide
  });

  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTilesTex,
    roughness: 0.95,
    metalness: 0.05,
    bumpMap: dirtBump,
    bumpScale: 0.03
  });

  const ceilingMat = new THREE.MeshStandardMaterial({
    color: 0x08080c,
    roughness: 0.95
  });

  const woodPostMat = new THREE.MeshStandardMaterial({
    color: 0x221610,
    roughness: 0.88,
    bumpMap: woodBump,
    bumpScale: 0.03
  });

  const metalMat = new THREE.MeshStandardMaterial({
    map: createRustyMetalTexture(),
    metalness: 0.82,
    roughness: 0.35,
    bumpMap: dirtBump,
    bumpScale: 0.02
  });

  const redPaintMat = new THREE.MeshStandardMaterial({
    color: 0x730e0e,
    roughness: 0.7
  });

  const zocaloConcreteMat = new THREE.MeshStandardMaterial({
    color: 0x141417,
    roughness: 0.9,
    metalness: 0.1
  });

  const lampMetalMat = new THREE.MeshStandardMaterial({
    color: 0x151618,
    roughness: 0.8,
    metalness: 0.6
  });

  const wireMat = new THREE.MeshStandardMaterial({
    color: 0x050505
  });

  const flickeringLights = [];
  const swingingGroups = [];

  // Helper para construir el layout base de un piso
  function buildFloorBase(yOffset, wallMaterial) {
    const floorGroup = new THREE.Group();

    // 1. Suelo pasillo principal
    const floorGeo = makeOrganicGeometry(new THREE.PlaneGeometry(2.4, 70, 6, 30), { jitter: 0.005 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -0.1 + yOffset, -10);
    floor.receiveShadow = true;
    floorGroup.add(floor);

    // 2. Techo pasillo principal
    const ceilingGeo = makeOrganicGeometry(new THREE.PlaneGeometry(2.4, 70, 6, 30), { sagAmount: 0.1, sagDir: 'y' });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 3.2 + yOffset, -10);
    floorGroup.add(ceiling);

    // 3. Paredes del pasillo principal
    const segmentsL = [
      { start: 25, end: 14 },
      { start: 10, end: -25 },
      { start: -30, end: -40 }
    ];
    segmentsL.forEach(s => {
      const len = s.start - s.end;
      const posZ = s.start - len / 2;
      const segWallGeo = makeOrganicGeometry(new THREE.PlaneGeometry(len, 3.2, Math.max(2, Math.floor(len * 2)), 6), { crooked: true });
      const m = new THREE.Mesh(segWallGeo, wallMaterial);
      m.position.set(-1.2, 1.6 + yOffset, posZ);
      m.rotation.y = Math.PI / 2;
      floorGroup.add(m);
    });

    const segmentsR = [
      { start: 25, end: -15 },
      { start: -19, end: -40 }
    ];
    segmentsR.forEach(s => {
      const len = s.start - s.end;
      const posZ = s.start - len / 2;
      const segWallGeo = makeOrganicGeometry(new THREE.PlaneGeometry(len, 3.2, Math.max(2, Math.floor(len * 2)), 6), { crooked: true });
      const m = new THREE.Mesh(segWallGeo, wallMaterial);
      m.position.set(1.2, 1.6 + yOffset, posZ);
      m.rotation.y = -Math.PI / 2;
      floorGroup.add(m);
    });

    const backWallGeo = makeOrganicGeometry(new THREE.PlaneGeometry(2.4, 3.2, 4, 6), { crooked: true });
    const backWall = new THREE.Mesh(backWallGeo, wallMaterial);
    backWall.position.set(0, 1.6 + yOffset, 25);
    backWall.rotation.y = Math.PI;
    floorGroup.add(backWall);

    // 4. Camerino 1
    const r1FloorGeo = makeOrganicGeometry(new THREE.PlaneGeometry(2.8, 4, 6, 6), { jitter: 0.01 });
    const r1Floor = new THREE.Mesh(r1FloorGeo, floorMat);
    r1Floor.rotation.x = -Math.PI / 2;
    r1Floor.position.set(-2.6, -0.1 + yOffset, 12);
    floorGroup.add(r1Floor);

    const r1CeilingGeo = makeOrganicGeometry(new THREE.PlaneGeometry(2.8, 4, 6, 6), { sagAmount: 0.1, sagDir: 'y' });
    const r1Ceiling = new THREE.Mesh(r1CeilingGeo, ceilingMat);
    r1Ceiling.rotation.x = Math.PI / 2;
    r1Ceiling.position.set(-2.6, 3.2 + yOffset, 12);
    floorGroup.add(r1Ceiling);

    const r1WallWest = new THREE.Mesh(new THREE.PlaneGeometry(4, 3.2), wallMaterial);
    r1WallWest.position.set(-4, 1.6 + yOffset, 12);
    r1WallWest.rotation.y = Math.PI / 2;
    floorGroup.add(r1WallWest);

    const r1WallNorth = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 3.2), wallMaterial);
    r1WallNorth.position.set(-2.6, 1.6 + yOffset, 14);
    floorGroup.add(r1WallNorth);

    const r1WallSouth = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 3.2), wallMaterial);
    r1WallSouth.position.set(-2.6, 1.6 + yOffset, 10);
    r1WallSouth.rotation.y = Math.PI;
    floorGroup.add(r1WallSouth);

    // 5. Camerino 2
    const r2FloorGeo = makeOrganicGeometry(new THREE.PlaneGeometry(2.8, 4, 6, 6), { jitter: 0.01 });
    const r2Floor = new THREE.Mesh(r2FloorGeo, floorMat);
    r2Floor.rotation.x = -Math.PI / 2;
    r2Floor.position.set(2.6, -0.1 + yOffset, -17);
    floorGroup.add(r2Floor);

    const r2CeilingGeo = makeOrganicGeometry(new THREE.PlaneGeometry(2.8, 4, 6, 6), { sagAmount: 0.1, sagDir: 'y' });
    const r2Ceiling = new THREE.Mesh(r2CeilingGeo, ceilingMat);
    r2Ceiling.rotation.x = Math.PI / 2;
    r2Ceiling.position.set(2.6, 3.2 + yOffset, -17);
    floorGroup.add(r2Ceiling);

    const r2WallEast = new THREE.Mesh(new THREE.PlaneGeometry(4, 3.2), wallMaterial);
    r2WallEast.position.set(4, 1.6 + yOffset, -17);
    r2WallEast.rotation.y = -Math.PI / 2;
    floorGroup.add(r2WallEast);

    const r2WallNorth = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 3.2), wallMaterial);
    r2WallNorth.position.set(2.6, 1.6 + yOffset, -15);
    floorGroup.add(r2WallNorth);

    const r2WallSouth = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 3.2), wallMaterial);
    r2WallSouth.position.set(2.6, 1.6 + yOffset, -19);
    r2WallSouth.rotation.y = Math.PI;
    floorGroup.add(r2WallSouth);

    // 6. Almacén 3
    const r3FloorGeo = makeOrganicGeometry(new THREE.PlaneGeometry(3.8, 5, 6, 6), { jitter: 0.012 });
    const r3Floor = new THREE.Mesh(r3FloorGeo, floorMat);
    r3Floor.rotation.x = -Math.PI / 2;
    r3Floor.position.set(-3.1, -0.1 + yOffset, -27.5);
    floorGroup.add(r3Floor);

    const r3CeilingGeo = makeOrganicGeometry(new THREE.PlaneGeometry(3.8, 5, 6, 6), { sagAmount: 0.12, sagDir: 'y' });
    const r3Ceiling = new THREE.Mesh(r3CeilingGeo, ceilingMat);
    r3Ceiling.rotation.x = Math.PI / 2;
    r3Ceiling.position.set(-3.1, 3.2 + yOffset, -27.5);
    floorGroup.add(r3Ceiling);

    const r3WallWest = new THREE.Mesh(new THREE.PlaneGeometry(5, 3.2), wallMaterial);
    r3WallWest.position.set(-5, 1.6 + yOffset, -27.5);
    r3WallWest.rotation.y = Math.PI / 2;
    floorGroup.add(r3WallWest);

    const r3WallNorth = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 3.2), wallMaterial);
    r3WallNorth.position.set(-3.1, 1.6 + yOffset, -25);
    floorGroup.add(r3WallNorth);

    const r3WallSouth = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 3.2), wallMaterial);
    r3WallSouth.position.set(-3.1, 1.6 + yOffset, -30);
    r3WallSouth.rotation.y = Math.PI;
    floorGroup.add(r3WallSouth);

    // 7. Habitación Final
    const endRoomFloorGeo = makeOrganicGeometry(new THREE.PlaneGeometry(6, 15, 12, 18), { jitter: 0.015 });
    const endRoomFloor = new THREE.Mesh(endRoomFloorGeo, floorMat);
    endRoomFloor.rotation.x = -Math.PI / 2;
    endRoomFloor.position.set(0, -0.1 + yOffset, -47.5);
    floorGroup.add(endRoomFloor);

    const endRoomCeilingGeo = makeOrganicGeometry(new THREE.PlaneGeometry(6, 15, 12, 18), { sagAmount: 0.15, sagDir: 'y' });
    const endRoomCeiling = new THREE.Mesh(endRoomCeilingGeo, ceilingMat);
    endRoomCeiling.rotation.x = Math.PI / 2;
    endRoomCeiling.position.set(0, 4.0 + yOffset, -47.5);
    floorGroup.add(endRoomCeiling);

    const endWallNorth = new THREE.Mesh(new THREE.PlaneGeometry(6, 4.0), wallMaterial);
    endWallNorth.position.set(0, 2.0 + yOffset, -55);
    floorGroup.add(endWallNorth);

    const endWallWest = new THREE.Mesh(new THREE.PlaneGeometry(15, 4.0), wallMaterial);
    endWallWest.position.set(-3, 2.0 + yOffset, -47.5);
    endWallWest.rotation.y = Math.PI / 2;
    floorGroup.add(endWallWest);

    const endWallEast = new THREE.Mesh(new THREE.PlaneGeometry(15, 4.0), wallMaterial);
    endWallEast.position.set(3, 2.0 + yOffset, -47.5);
    endWallEast.rotation.y = -Math.PI / 2;
    floorGroup.add(endWallEast);

    const endWallSouthL = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 4.0), wallMaterial);
    endWallSouthL.position.set(-2.1, 2.0 + yOffset, -40);
    endWallSouthL.rotation.y = Math.PI;
    floorGroup.add(endWallSouthL);

    const endWallSouthR = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 4.0), wallMaterial);
    endWallSouthR.position.set(2.1, 2.0 + yOffset, -40);
    endWallSouthR.rotation.y = Math.PI;
    floorGroup.add(endWallSouthR);

    // Tapices rotos decorativos
    const tapestryTex = createStripedTapestryTexture();
    const tapestryMat = new THREE.MeshStandardMaterial({
      map: tapestryTex,
      roughness: 0.9,
      transparent: true,
      side: THREE.DoubleSide
    });

    const tap1 = new THREE.Mesh(makeOrganicGeometry(new THREE.PlaneGeometry(1.6, 3.0, 10, 20), { crooked: true }), tapestryMat);
    tap1.position.set(-2.95, 1.8 + yOffset, -44);
    tap1.rotation.y = Math.PI / 2;
    floorGroup.add(tap1);

    const tap2 = new THREE.Mesh(makeOrganicGeometry(new THREE.PlaneGeometry(1.6, 3.0, 10, 20), { crooked: true }), tapestryMat);
    tap2.position.set(2.95, 1.8 + yOffset, -50);
    tap2.rotation.y = -Math.PI / 2;
    floorGroup.add(tap2);

    return floorGroup;
  }

  // ── GENERACIÓN DE CADA PISO CON SUS ACERTIJOS Y DETALLES ──
  for (let floorNum = 1; floorNum <= 5; floorNum++) {
    const yOffset = (floorNum - 1) * 15.0;

    // Determinar material de pared según el piso
    let wallMatToUse = concreteMat;
    if (floorNum === 2) wallMatToUse = wallColdMat;
    else if (floorNum === 4) wallMatToUse = wallDarkMat;
    else if (floorNum === 5) wallMatToUse = wallFloor5Mat;

    // Crear el layout del piso y agregarlo
    const base = buildFloorBase(yOffset, wallMatToUse);
    zone.add(base);

    // ── ILUMINACIÓN DEL PISO ──
    const bulbZCoords = [18, -4, -22, -35];
    const floorLightsColor = floorNum === 4 ? 0xff3333 : (floorNum === 2 ? 0x90ffaa : 0xffaa44);
    const floorLightsIntensity = floorNum === 4 ? 0.9 : (floorNum === 5 ? 0.3 : 0.8);

    bulbZCoords.forEach((zVal, idx) => {
      const bulbGroup = new THREE.Group();
      const ceilingY = (zVal === -4) ? 1.1 : 3.2;
      const wireLen = (ceilingY === 1.1) ? 0.15 : 0.8;

      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, wireLen, 6), wireMat);
      wire.position.y = -wireLen / 2;
      wire.castShadow = true;
      bulbGroup.add(wire);

      const lamp = createIndustrialLamp(lampMetalMat);
      lamp.position.y = -wireLen;
      bulbGroup.add(lamp);

      const l = new THREE.PointLight(floorLightsColor, floorLightsIntensity, 12);
      l.position.set(0, -wireLen - 0.09, 0);
      l.castShadow = true;
      l.shadow.bias = -0.002;
      bulbGroup.add(l);
      flickeringLights.push(l);

      bulbGroup.position.set(0, ceilingY + yOffset, zVal);
      zone.add(bulbGroup);
      swingingGroups.push(bulbGroup);
    });

    // Luz del final
    const endLightColor = floorNum === 5 ? 0xff1111 : 0xffaa44;
    const endLight = new THREE.PointLight(endLightColor, 1.2, 10);
    endLight.position.set(0, 3.8 + yOffset, -52);
    endLight.castShadow = true;
    zone.add(endLight);
    flickeringLights.push(endLight);

    // Luz ambiental local tenue
    const localAmb = new THREE.PointLight(floorNum === 5 ? 0x050101 : 0x111122, 0.2, 30);
    localAmb.position.set(0, 2 + yOffset, -15);
    zone.add(localAmb);

    // ── PROPS Y ACERTIJOS ESPECÍFICOS DE CADA PISO ──
    if (floorNum === 1) {
      // PISO 1: Almacén de Circo
      // Tocador interactivo (bloqueado con código 815)
      const deskGroup = new THREE.Group();
      deskGroup.name = 'desk_floor1';
      
      const desk = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.75, 1.6), woodPostMat);
      desk.position.set(0, 0.375, 0);
      desk.castShadow = true;
      deskGroup.add(desk);

      // Cajón simulado que sobresale un poco
      const drawer = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.15, 0.5), metalMat);
      drawer.position.set(0.02, 0.2, 0);
      drawer.name = 'desk_drawer_floor1';
      deskGroup.add(drawer);

      const deskMirror = new THREE.Mesh(new THREE.CircleGeometry(0.4, 12), new THREE.MeshStandardMaterial({
        color: 0x777777,
        roughness: 0.1,
        metalness: 0.9,
        side: THREE.DoubleSide
      }));
      deskMirror.position.set(0.05, 1.3, 0);
      deskMirror.rotation.y = Math.PI / 2;
      deskGroup.add(deskMirror);

      deskGroup.position.set(-3.5, yOffset, 12);
      zone.add(deskGroup);

      // Silla de madera tirada
      const chair = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.4), woodPostMat);
      seat.position.y = 0.45;
      chair.add(seat);
      const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.45, 0.4), woodPostMat);
      backrest.position.set(-0.18, 0.675, 0);
      chair.add(backrest);
      for (let i = 0; i < 4; i++) {
        const lx = (i % 2 === 0 ? 0.16 : -0.16);
        const lz = (i < 2 ? 0.16 : -0.16);
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45), woodPostMat);
        leg.position.set(lx, 0.225, lz);
        chair.add(leg);
      }
      chair.position.set(-2.5, yOffset, 11.5);
      chair.rotation.set(1.2, 0.5, -0.4);
      zone.add(chair);

      // Podio y monociclo en Almacén 3
      const unicycle = new THREE.Group();
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.035, 6, 20), metalMat);
      wheel.position.y = 0.32;
      unicycle.add(wheel);
      const frame = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.7), metalMat);
      frame.position.y = 0.65;
      unicycle.add(frame);
      const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.12), woodPostMat);
      saddle.position.y = 1.05;
      unicycle.add(saddle);
      unicycle.position.set(-4.5, yOffset, -28.5);
      unicycle.rotation.set(0.1, 0.2, 0.45);
      zone.add(unicycle);

      const podium = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 0.55, 8), redPaintMat);
      podium.position.set(-3.0, 0.275 + yOffset, -26.5);
      zone.add(podium);

      // Pistas de sangre
      const clue1 = createBloodCluePlane(2.5, 0.6, "LA CLAVE ESTA DETRAS DEL CORTADOR", 20);
      clue1.position.set(-3.98, 1.8 + yOffset, 12);
      clue1.rotation.y = Math.PI / 2;
      zone.add(clue1);

      const clue2 = createBloodCluePlane(3.5, 0.8, "MIS RUEDAS CORTARON 8 VIDAS, 1 ENTE Y 5 PAYASOS", 16);
      clue2.position.set(-4.98, 1.8 + yOffset, -27.5);
      clue2.rotation.y = Math.PI / 2;
      zone.add(clue2);

    } else if (floorNum === 2) {
      // PISO 2: Enfermería de Payasos (azul-verde)
      // Camilla quirúrgica metálica ensangrentada
      const stretcher = new THREE.Group();
      stretcher.name = 'stretcher_floor2';
      
      const bed = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 2.2), metalMat);
      bed.position.y = 0.8;
      stretcher.add(bed);

      // Patas
      for (let i = 0; i < 4; i++) {
        const lx = (i % 2 === 0 ? 0.35 : -0.35);
        const lz = (i < 2 ? 0.9 : -0.9);
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8), metalMat);
        leg.position.set(lx, 0.4, lz);
        stretcher.add(leg);
      }

      // Almohada ensangrentada
      const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.4), redPaintMat);
      pillow.position.set(0, 0.88, 0.8);
      stretcher.add(pillow);

      stretcher.position.set(-2.6, yOffset, 12);
      zone.add(stretcher);

      // Jaula 3D con fusible y candado en Camerino 2
      const cage = new THREE.Group();
      cage.name = 'cage_floor2';

      // Postes y barras
      for (let cx of [-0.6, 0.6]) {
        for (let cz of [-0.6, 0.6]) {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 6), metalMat);
          post.position.set(cx, 0.7, cz);
          cage.add(post);
        }
      }
      for (let b = -0.4; b <= 0.4; b += 0.2) {
        const barL = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.4, 6), metalMat);
        barL.position.set(-0.6, 0.7, b);
        cage.add(barL);
        const barR = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.4, 6), metalMat);
        barR.position.set(0.6, 0.7, b);
        cage.add(barR);
        const barB = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.4, 6), metalMat);
        barB.position.set(b, 0.7, -0.6);
        cage.add(barB);
        if (b < -0.1 || b > 0.1) {
          const barF = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.4, 6), metalMat);
          barF.position.set(b, 0.7, 0.6);
          cage.add(barF);
        }
      }
      const topPlate = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.04, 1.3), metalMat);
      topPlate.position.y = 1.4;
      cage.add(topPlate);

      // Candado interactivo
      const padlock = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.05), metalMat);
      padlock.position.set(0, 0.7, 0.6);
      padlock.name = 'padlock_floor2';
      cage.add(padlock);

      // Fusible verde brillante inside the cage
      const fuse = new THREE.Group();
      fuse.name = 'green_fuse_item';
      
      const fuseBody = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.16), new THREE.MeshStandardMaterial({
        color: 0x33ff33,
        emissive: 0x11aa11,
        emissiveIntensity: 0.8,
        roughness: 0.2
      }));
      fuseBody.rotation.x = Math.PI / 2;
      fuse.add(fuseBody);

      const cap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.037, 0.037, 0.03), metalMat);
      cap1.position.z = 0.08;
      cap1.rotation.x = Math.PI / 2;
      fuse.add(cap1);
      const cap2 = new THREE.Mesh(new THREE.CylinderGeometry(0.037, 0.037, 0.03), metalMat);
      cap2.position.z = -0.08;
      cap2.rotation.x = Math.PI / 2;
      fuse.add(cap2);

      const fuseLight = new THREE.PointLight(0x00ff00, 0.6, 1.5);
      fuseLight.position.y = 0.1;
      fuse.add(fuseLight);

      fuse.position.set(0, 0.1, 0);
      cage.add(fuse);

      cage.position.set(2.6, yOffset, -17);
      zone.add(cage);

      // Caja de fusibles vacía en el pasillo
      const fuseBox = new THREE.Group();
      fuseBox.name = 'fusebox_floor2';
      const boxB = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.35, 0.25), metalMat);
      fuseBox.add(boxB);
      
      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.15, 0.08), zocaloConcreteMat);
      slot.position.set(-0.04, 0, 0);
      fuseBox.add(slot);

      fuseBox.position.set(1.15, 1.6 + yOffset, -38);
      zone.add(fuseBox);

      // Pista de sangre
      const clue = createBloodCluePlane(3.8, 0.9, "PACIENTE CERO: INGRESO EN 1948 A LOS 16 ANOS. FALLECIO EN 1982. ¿EDAD?", 14);
      clue.position.set(3.98, 1.8 + yOffset, -17);
      clue.rotation.y = -Math.PI / 2;
      zone.add(clue);

    } else if (floorNum === 3) {
      // PISO 3: Celdas de Fieras (código teclado 364)
      // 3 celdas/jaulas en el pasillo principal con cuerpos y cadenas
      function buildHallwayCage(x, z) {
        const hCage = new THREE.Group();
        for (let cx of [-0.5, 0.5]) {
          for (let cz of [-0.5, 0.5]) {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.6), metalMat);
            post.position.set(cx, 0.8, cz);
            hCage.add(post);
          }
        }
        for (let b = -0.3; b <= 0.3; b += 0.15) {
          const barL = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.6), metalMat);
          barL.position.set(-0.5, 0.8, b);
          hCage.add(barL);
          const barR = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.6), metalMat);
          barR.position.set(0.5, 0.8, b);
          hCage.add(barR);
          const barB = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.6), metalMat);
          barB.position.set(b, 0.8, -0.5);
          hCage.add(barB);
          const barF = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.6), metalMat);
          barF.position.set(b, 0.8, 0.5);
          hCage.add(barF);
        }
        hCage.position.set(x, yOffset, z);
        return hCage;
      }

      // Jaula 1 (x = -0.9, z = 5) - 2 cuerpos, 1 cadena
      const c1 = buildHallwayCage(-0.9, 5);
      const b1_1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.3, 4, 8), redPaintMat);
      b1_1.position.set(-0.1, 0.15, -0.15);
      b1_1.rotation.set(0.3, 0.5, 1.2);
      c1.add(b1_1);
      const b1_2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.3, 4, 8), redPaintMat);
      b1_2.position.set(0.15, 0.15, 0.1);
      b1_2.rotation.set(-0.5, -0.2, 0.8);
      c1.add(b1_2);
      const ch1 = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.2), metalMat);
      ch1.position.set(0.2, 1.0, 0.2);
      c1.add(ch1);
      zone.add(c1);

      // Jaula 2 (x = 0.9, z = -5) - 1 cuerpo, 2 cadenas
      const c2 = buildHallwayCage(0.9, -5);
      const b2_1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.3, 4, 8), redPaintMat);
      b2_1.position.set(0, 0.15, 0);
      b2_1.rotation.set(0.9, 0.9, 0.9);
      c2.add(b2_1);
      const ch2_1 = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.0), metalMat);
      ch2_1.position.set(-0.2, 1.1, -0.2);
      c2.add(ch2_1);
      const ch2_2 = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.8), metalMat);
      ch2_2.position.set(0.2, 1.2, 0.15);
      c2.add(ch2_2);
      zone.add(c2);

      // Jaula 3 (x = -0.9, z = -15) - 3 cuerpos, 1 cadena
      const c3 = buildHallwayCage(-0.9, -15);
      for (let i = 0; i < 3; i++) {
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.28, 4, 8), redPaintMat);
        body.position.set(-0.2 + i * 0.18, 0.15, -0.2 + i * 0.18);
        body.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
        c3.add(body);
      }
      const ch3 = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.1), metalMat);
      ch3.position.set(0, 1.05, 0);
      c3.add(ch3);
      zone.add(c3);

      // Digital keypad next to the elevator
      const keypad = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 0.04), zocaloConcreteMat);
      keypad.position.set(1.02, 1.5 + yOffset, -53.8);
      keypad.name = 'keypad_floor3';
      zone.add(keypad);

      // Pista de sangre en Camerino 1
      const clue = createBloodCluePlane(3.2, 0.8, "EL PRECIO DE LA ENTRADA ES CELDAS / CUERPOS / CADENAS", 15);
      clue.position.set(-3.98, 1.8 + yOffset, 12);
      clue.rotation.y = Math.PI / 2;
      zone.add(clue);

    } else if (floorNum === 4) {
      // PISO 4: Pasadizo de Maniquíes (rojo, altar y muñeco)
      // 8 maniquíes en el pasillo bloqueando caminos sutiles
      const mannequinPositions = [
        { x: 0.0, z: 18, rotY: Math.PI },
        { x: -0.8, z: 8, rotY: Math.PI / 2 },
        { x: 0.8, z: 0, rotY: -Math.PI / 2 },
        { x: -0.5, z: -8, rotY: 0 },
        { x: 0.6, z: -18, rotY: Math.PI / 3 },
        { x: -0.7, z: -24, rotY: -Math.PI / 4 },
        { x: 1.8, z: -43, rotY: -Math.PI / 2 },
        { x: -1.8, z: -47, rotY: Math.PI / 2 }
      ];

      mannequinPositions.forEach((pos, idx) => {
        try {
          const mannequin = new TheVisitor();
          mannequin.name = 'VisitorMannequin';
          mannequin.position.set(pos.x, yOffset, pos.z);
          mannequin.rotation.y = pos.rotY;

          // Poner extremidades en poses creepys
          const lShoulder = mannequin.getPart('leftShoulder');
          const rShoulder = mannequin.getPart('rightShoulder');
          const lHip = mannequin.getPart('leftHip');
          const rHip = mannequin.getPart('rightHip');

          if (lShoulder) lShoulder.rotation.set(0.5 + Math.random() * 0.5, 0, -0.2 - Math.random() * 0.3);
          if (rShoulder) rShoulder.rotation.set(-0.3 - Math.random() * 0.4, 0, 0.2 + Math.random() * 0.3);
          if (lHip) lHip.rotation.x = -0.1 - Math.random() * 0.2;
          if (rHip) rHip.rotation.x = 0.1 + Math.random() * 0.2;

          zone.add(mannequin);
        } catch (e) {
          console.error("Error creating mannequin", e);
        }
      });

      // 3 cofres en Almacén 3
      function buildChest(x, z, scale, name) {
        const chest = new THREE.Group();
        chest.name = name;

        const baseC = new THREE.Mesh(new THREE.BoxGeometry(0.6 * scale, 0.45 * scale, 0.45 * scale), woodPostMat);
        baseC.position.y = 0.225 * scale;
        baseC.castShadow = true;
        chest.add(baseC);

        const lid = new THREE.Mesh(new THREE.BoxGeometry(0.62 * scale, 0.1 * scale, 0.47 * scale), metalMat);
        lid.position.y = 0.475 * scale;
        chest.add(lid);

        chest.position.set(x, yOffset, z);
        return chest;
      }

      const chSmall = buildChest(-4.2, -27.5, 0.7, 'chest_small_floor4');
      zone.add(chSmall);
      
      const chMed = buildChest(-3.4, -27.5, 1.0, 'chest_med_floor4');
      zone.add(chMed);

      const chBig = buildChest(-2.4, -27.5, 1.3, 'chest_big_floor4');
      zone.add(chBig);

      // Altar de piedra en la habitación final
      const altar = new THREE.Group();
      altar.name = 'altar_floor4';

      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 1.0, 8), concreteMat);
      pillar.position.y = 0.5;
      pillar.castShadow = true;
      altar.add(pillar);

      const bowl = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 8, 12), metalMat);
      bowl.position.y = 1.015;
      bowl.rotation.x = Math.PI / 2;
      altar.add(bowl);

      const fireLight = new THREE.PointLight(0xff7700, 0.0, 8.0);
      fireLight.position.set(0, 1.3, 0);
      fireLight.name = 'altarFireLight';
      altar.add(fireLight);

      altar.position.set(0, yOffset, -48);
      zone.add(altar);

      // Pistas de sangre
      const clue1 = createBloodCluePlane(3.5, 0.6, "EL CORDERO DUERME EN EL COFRE DEL MEDIO", 18);
      clue1.position.set(-4.98, 1.8 + yOffset, -27.5);
      clue1.rotation.y = Math.PI / 2;
      zone.add(clue1);

      const clue2 = createBloodCluePlane(3.5, 0.6, "DALE FUEGO PARA QUE SUS OJOS SE ABRAN", 18);
      clue2.position.set(-2.98, 2.0 + yOffset, -48);
      clue2.rotation.y = Math.PI / 2;
      zone.add(clue2);

    } else if (floorNum === 5) {
      // PISO 5: Camerino de Espejos Final (original)
      const mirrorGroup = new THREE.Group();
      mirrorGroup.name = 'FinalMirror';
      
      const frameGeo = makeOrganicGeometry(new THREE.BoxGeometry(1.8, 2.6, 0.1, 8, 8, 2), { crooked: true, jitter: 0.004 });
      const mirrorFrame = new THREE.Mesh(frameGeo, woodPostMat);
      mirrorFrame.position.set(0, 1.3, 0);
      mirrorFrame.castShadow = true;
      mirrorGroup.add(mirrorFrame);

      const mirrorGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.3), new THREE.MeshStandardMaterial({
        map: createMirrorTexture(),
        roughness: 0.1,
        metalness: 0.9,
        side: THREE.DoubleSide
      }));
      mirrorGlass.position.set(0, 1.3, 0.06);
      mirrorGroup.add(mirrorGlass);

      mirrorGroup.position.set(0, yOffset, -54.8);
      zone.add(mirrorGroup);
    }

    // Puertas y paneles de ascensor en Pisos 1-4
    if (floorNum < 5) {
      const elevatorGroup = new THREE.Group();
      elevatorGroup.name = 'Elevator_Floor' + floorNum;

      const fL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.0, 0.2), metalMat);
      fL.position.set(-1.0, 1.5, 0);
      elevatorGroup.add(fL);

      const fR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.0, 0.2), metalMat);
      fR.position.set(1.0, 1.5, 0);
      elevatorGroup.add(fR);

      const fT = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 0.2), metalMat);
      fT.position.set(0, 3.0, 0);
      elevatorGroup.add(fT);

      const dL = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.9, 0.05), metalMat);
      dL.position.set(-0.45, 1.45, -0.05);
      dL.name = 'ElevatorDoorLeft';
      elevatorGroup.add(dL);

      const dR = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.9, 0.05), metalMat);
      dR.position.set(0.45, 1.45, -0.05);
      dR.name = 'ElevatorDoorRight';
      elevatorGroup.add(dR);

      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.05), metalMat);
      panel.position.set(1.15, 1.5, 0.05);
      panel.name = 'ElevatorPanel';
      elevatorGroup.add(panel);

      const statusLight = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
      statusLight.position.set(1.15, 1.6, 0.09);
      statusLight.name = 'ElevatorStatusLight';
      elevatorGroup.add(statusLight);

      elevatorGroup.position.set(0, yOffset, -54.8);
      zone.add(elevatorGroup);
    }
  }

  // Almacenar referencias útiles
  zone.userData.flickeringLights = flickeringLights;
  zone.userData.swingingGroups = swingingGroups;
  zone.userData.mirrorPos = new THREE.Vector3(0, 1.6, 60.0 - 54.8);

  zone.traverse(child => {
    if (child.isMesh && !child.material.transparent) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return zone;
}


