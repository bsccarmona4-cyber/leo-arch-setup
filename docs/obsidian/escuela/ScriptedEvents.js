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
