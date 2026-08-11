import * as THREE from 'three';
import { CAMPUS_LAYOUT } from './campus-map.js';

// Redirect global bindings to solve circular dependency crashes in ES Modules
const openBuildingPanel = (letter) => {
  if (window.openBuildingPanel) window.openBuildingPanel(letter);
};
const showDialogue = (speaker, avatar, lines) => {
  if (window.showDialogue) window.showDialogue(speaker, avatar, lines);
};

export class CampusGameScene {
  constructor() {
    this.mapWidth = CAMPUS_LAYOUT.mapWidth;
    this.mapHeight = CAMPUS_LAYOUT.mapHeight;
    this.playerSpeed = 7.5;
    
    // Mock keyboard structure to maintain main.js compatibility
    this.input = {
      keyboard: {
        enabled: true
      }
    };
    
    // Core Navigation State
    this.isIndoor = false;
    this.indoorZone = null;
    this.overlappingBuilding = null;
    this.overlappingNPC = null;
    this.overlappingIndoorProp = null;
    this.activePrompt = null;
    this.keyboardEnabled = true;

    // Movement keys
    this.keys = {
      w: false, a: false, s: false, d: false,
      ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false
    };

    this.targetPos = null;
    this.isFastTraveling = false;

    // List of active indoor props
    this.indoorPropsList = [];
    this.indoorColliders = [];
    this.indoorCollidersF1 = [];
    this.indoorCollidersF2 = [];
    this.outdoorTrees = [];
    this.outdoorBuildings = [];
    this.buildingRaycaster = new THREE.Raycaster();
    this.indoorFloor = 1;
  }

  init() {
    const container = document.getElementById('game-canvas-container');
    if (!container) return;
    container.innerHTML = ''; // Clear previous canvas

    // 1. Setup Scene, Camera, and WebGL Renderer
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
    this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.00035);

    const width = container.clientWidth || window.innerWidth || 1280;
    const height = container.clientHeight || window.innerHeight || 720;
    const aspect = width / height;

    this.camera = new THREE.PerspectiveCamera(50, aspect, 1, 5000);
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 2. Scene Separation Groups (Outdoor vs Indoor)
    this.outdoorGroup = new THREE.Group();
    this.scene.add(this.outdoorGroup);

    this.indoorGroup = new THREE.Group();
    this.indoorGroup.visible = false;
    this.scene.add(this.indoorGroup);

    // 3. Setup Outdoor Lights & Shadows
    this.setupLighting();

    // 4. Build Outdoor Terrain, Paths, Buildings, Trees, and Benches
    this.buildTerrain();
    this.buildBuildings();
    this.buildTreesAndBenches();
    this.spawnNPCs();
    this.buildParkingCars();
    this.buildCentralFountain();
    this.buildStreetLamps();

    // 5. Create 3D Player Mesh (spawns outside the gates initially)
    this.createPlayer();

    // 6. Setup Inputs
    this.setupControls();

    // 7. Initial Positions (outside G roundabout roundabout)
    const spawn = CAMPUS_LAYOUT.spawnPoint;
    this.player.position.set(spawn.x, 10, spawn.y);
    this.camera.position.set(spawn.x, 300, spawn.y + 400);

    // 8. Start Game Loop
    this.animate();

    // Handle Window Resizing
    window.addEventListener('resize', () => this.onWindowResize());
  }

  // ==========================================
  // LIGHTING SYSTEM
  // ==========================================
  setupLighting() {
    // Outdoor Daylight
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    this.outdoorGroup.add(ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xfffaed, 0.9);
    this.sunLight.position.set(600, 1200, 400);
    this.sunLight.castShadow = true;
    
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 3500;
    
    const d = 1500;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;

    this.outdoorGroup.add(this.sunLight);

    const hemiLight = new THREE.HemisphereLight(0xe8f4f8, 0xd8c8b0, 0.3);
    this.outdoorGroup.add(hemiLight);
  }

  // ==========================================
  // OUTDOOR BUILDERS
  // ==========================================
  buildTerrain() {
    // Main campus ground — green grass
    const floorGeo = new THREE.PlaneGeometry(this.mapWidth * 1.5, this.mapHeight * 1.5);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x2d7a3a, flatShading: true });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(this.mapWidth / 2, 0, this.mapHeight / 2);
    floor.receiveShadow = true;
    this.outdoorGroup.add(floor);

    const gridHelper = new THREE.GridHelper(3000, 40, 0x267830, 0x267830);
    gridHelper.position.set(this.mapWidth / 2, 0.1, this.mapHeight / 2);
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    this.outdoorGroup.add(gridHelper);

    // Asphalt Parking Lot
    const lot = CAMPUS_LAYOUT.parkingLot;
    const lotGeo = new THREE.PlaneGeometry(lot.w, lot.h);
    const lotMat = new THREE.MeshPhongMaterial({ color: lot.color, flatShading: true, roughness: 0.8 });
    const lotMesh = new THREE.Mesh(lotGeo, lotMat);
    lotMesh.rotation.x = -Math.PI / 2;
    lotMesh.position.set(lot.x + lot.w/2, 0.2, lot.y + lot.h/2);
    lotMesh.receiveShadow = true;
    this.outdoorGroup.add(lotMesh);

    // Parking Lines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });
    const spacing = lot.spotSpacing;
    for (let z = lot.y + 20; z < lot.y + lot.h - 20; z += spacing) {
      const lineLeft = new THREE.Mesh(new THREE.PlaneGeometry(80, 2), lineMat);
      lineLeft.rotation.x = -Math.PI / 2;
      lineLeft.position.set(lot.x + 50, 0.22, z);
      this.outdoorGroup.add(lineLeft);

      const lineRight = new THREE.Mesh(new THREE.PlaneGeometry(80, 2), lineMat);
      lineRight.rotation.x = -Math.PI / 2;
      lineRight.position.set(lot.x + lot.w - 50, 0.22, z);
      this.outdoorGroup.add(lineRight);
    }

    // Roads
    CAMPUS_LAYOUT.roads.forEach(r => {
      if (r.type === 'straight') {
        this.buildRoadMesh(r.x1, r.y1, r.x2, r.y2, r.w);
      } else if (r.type === 'diagonal') {
        r.nodes.forEach(node => {
          this.buildRoadMesh(node.x1, node.y1, node.x2, node.y2, node.w);
        });
      }
    });

    // Sports Fields
    const s = CAMPUS_LAYOUT.sportsFields;
    const grassGeo = new THREE.PlaneGeometry(s.w + 60, s.h + 60);
    const grassMat = new THREE.MeshLambertMaterial({ color: s.greenGrassColor, flatShading: true });
    const grassMesh = new THREE.Mesh(grassGeo, grassMat);
    grassMesh.rotation.x = -Math.PI / 2;
    grassMesh.position.set(s.x + s.w/2, 0.15, s.y + s.h/2);
    grassMesh.receiveShadow = true;
    this.outdoorGroup.add(grassMesh);

    const courtGeo = new THREE.PlaneGeometry(s.w, s.h);
    const courtMat = new THREE.MeshPhongMaterial({ color: s.color, flatShading: true });
    const courtMesh = new THREE.Mesh(courtGeo, courtMat);
    courtMesh.rotation.x = -Math.PI / 2;
    courtMesh.position.set(s.x + s.w/2, 0.2, s.y + s.h/2);
    courtMesh.receiveShadow = true;
    this.outdoorGroup.add(courtMesh);

    const courtLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
    const midLine = new THREE.Mesh(new THREE.PlaneGeometry(s.w, 3), courtLineMat);
    midLine.rotation.x = -Math.PI / 2;
    midLine.position.set(s.x + s.w/2, 0.22, s.y + s.h/2);
    this.outdoorGroup.add(midLine);

    const ringGeo = new THREE.RingGeometry(35, 37, 16);
    const ringMesh = new THREE.Mesh(ringGeo, courtLineMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.set(s.x + s.w/2, 0.22, s.y + s.h/2);
    this.outdoorGroup.add(ringMesh);
  }

  buildRoadMesh(x1, y1, x2, y2, width) {
    const dx = x2 - x1;
    const dz = y2 - y1;
    const length = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz);

    const roadGeo = new THREE.PlaneGeometry(width, length);
    const roadMat = new THREE.MeshPhongMaterial({ color: 0xBDC3C7, roughness: 0.9, flatShading: true });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.rotation.z = angle;
    road.position.set(x1 + dx/2, 0.18, y1 + dz/2);
    road.receiveShadow = true;
    this.outdoorGroup.add(road);
  }

  buildBuildings() {
    const WHITE_CONCRETE = 0xe8e4e0; // Real UPVT white/light gray concrete walls
    const INST_RED = 0x8b2020;       // Real UPVT institutional dark red accent/trim
    const CONCRETE_GRAY = 0x9a9590;  // Standard concrete gray

    Object.keys(CAMPUS_LAYOUT.zones).forEach(letter => {
      const z = CAMPUS_LAYOUT.zones[letter];
      
      if (letter === 'A') {
        // Docencia A is a double-wing building
        this.createBuilding3D(z.wing1.x, z.wing1.y, z.wing1.w, z.wing1.h, 110, WHITE_CONCRETE, z.wing1.label, INST_RED);
        this.createBuilding3D(z.wing2.x, z.wing2.y, z.wing2.w, z.wing2.h, 110, WHITE_CONCRETE, z.wing2.label, INST_RED);
      } else if (letter === 'E') {
        // Edificio E is the large U-shaped Administrative/Rectoría building
        this.createBuilding3D(z.x, z.y + 100, 380, 100, 130, WHITE_CONCRETE, z.name, INST_RED);
        this.createBuilding3D(z.x - 140, z.y - 50, 100, 200, 130, WHITE_CONCRETE, '', INST_RED);
        this.createBuilding3D(z.x + 140, z.y - 50, 100, 200, 130, WHITE_CONCRETE, '', INST_RED);
      } else if (letter === 'G') {
        // Vigilancia
        this.createCircularBuilding3D(z.x, z.y, z.solidW / 2, 70, CONCRETE_GRAY, z.name);
      } else if (letter === 'F') {
        // Centro Deportivo (Gym / canchas area)
        this.createBuilding3D(z.x, z.y, z.solidW, z.solidH, 90, CONCRETE_GRAY, z.name, 0x3b4048);
      } else if (letter === 'D') {
        // Laboratorios Especializados (darker gray accents)
        this.createBuilding3D(z.x, z.y, z.solidW, z.solidH, 110, WHITE_CONCRETE, z.name, CONCRETE_GRAY);
      } else {
        // Other buildings (Docencia B, Biblioteca C)
        this.createBuilding3D(z.x, z.y, z.solidW, z.solidH, 100, WHITE_CONCRETE, z.name, INST_RED);
      }
    });

    const inv = CAMPUS_LAYOUT.greenhouses;
    this.createGreenhouse3D(inv.x + inv.w/2, inv.y + inv.h/2, inv.w, inv.h, 40, inv.color);
  }

  createBuilding3D(x, z, w, d, height, color, labelText, roofColor) {
    const buildingGroup = new THREE.Group();
    
    const geo = new THREE.BoxGeometry(w, height, d);
    const mat = new THREE.MeshPhongMaterial({ color: color, flatShading: true, shininess: 15 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, height / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    buildingGroup.add(mesh);

    // Colored roof slab
    if (roofColor) {
      const roofGeo = new THREE.BoxGeometry(w + 4, 5, d + 4);
      const roofMat = new THREE.MeshPhongMaterial({ color: roofColor, flatShading: true });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(x, height + 2.5, z);
      roof.castShadow = true;
      buildingGroup.add(roof);
    }

    // Concrete base strip
    const baseGeo = new THREE.BoxGeometry(w + 6, 4, d + 6);
    const baseMat = new THREE.MeshPhongMaterial({ color: 0x8a8580, flatShading: true });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(x, 2, z);
    base.receiveShadow = true;
    buildingGroup.add(base);

    // Glowing window blocks on front and back (scaled with height)
    const winMat = new THREE.MeshBasicMaterial({ color: 0xffe8a0 });
    const rowCount = Math.max(2, Math.floor(height / 35));
    const cols = Math.max(2, Math.floor(w / 40));
    const winW = 8;
    const winH = 10;
    for (let r = 0; r < rowCount; r++) {
      const yPos = 15 + r * ((height - 20) / (rowCount));
      for (let c = 0; c < cols; c++) {
        const xOffset = -w/2 + (c + 1) * (w / (cols + 1));
        
        const winF = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), winMat);
        winF.position.set(x + xOffset, yPos, z + d/2 + 0.1);
        buildingGroup.add(winF);

        const winB = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), winMat);
        winB.rotation.y = Math.PI;
        winB.position.set(x + xOffset, yPos, z - d/2 - 0.1);
        buildingGroup.add(winB);
      }
    }

    this.outdoorGroup.add(buildingGroup);
    this.outdoorBuildings.push(buildingGroup);

    if (labelText) {
      this.createBillboardSprite(x, height + 20, z, labelText, this.outdoorGroup);
    }
  }

  createCircularBuilding3D(x, z, radius, height, color, labelText) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const geo = new THREE.CylinderGeometry(radius, radius, height, 16);
    const mat = new THREE.MeshPhongMaterial({ color: color, flatShading: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = height / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    const domeGeo = new THREE.SphereGeometry(radius, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshPhongMaterial({ color: 0xbf9b30, flatShading: true, shininess: 40 });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = height;
    dome.castShadow = true;
    group.add(dome);

    this.outdoorGroup.add(group);

    if (labelText) {
      this.createBillboardSprite(x, height + radius + 15, z, labelText, this.outdoorGroup);
    }
  }

  createGreenhouse3D(x, z, w, d, height, color) {
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: color,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.5,
      flatShading: true,
      side: THREE.DoubleSide
    });

    const cylinderGeo = new THREE.CylinderGeometry(w / 2, w / 2, d, 16, 1, false, 0, Math.PI);
    const greenhouse = new THREE.Mesh(cylinderGeo, glassMat);
    greenhouse.rotation.x = Math.PI / 2;
    greenhouse.rotation.z = Math.PI / 2;
    greenhouse.position.set(x, 0, z);
    greenhouse.castShadow = true;
    this.outdoorGroup.add(greenhouse);

    const ribMat = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true });
    const ribCount = 6;
    const spacing = d / (ribCount - 1);
    for (let i = 0; i < ribCount; i++) {
      const ribGeo = new THREE.TorusGeometry(w / 2 + 0.5, 1.2, 8, 24, Math.PI);
      const rib = new THREE.Mesh(ribGeo, ribMat);
      rib.rotation.y = Math.PI / 2;
      rib.position.set(x, 0, z - d/2 + i * spacing);
      this.outdoorGroup.add(rib);
    }

    this.createBillboardSprite(x, w/2 + 15, z, 'INVERNADEROS (Biotecnología)', this.outdoorGroup);
  }

  createBillboardSprite(x, y, z, text, parentGroup) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'rgba(13, 19, 16, 0.88)';
    ctx.strokeStyle = '#bf9b30';
    ctx.lineWidth = 4;
    
    ctx.beginPath();
    ctx.moveTo(16, 4);
    ctx.lineTo(496, 4);
    ctx.quadraticCurveTo(508, 4, 508, 16);
    ctx.lineTo(508, 112);
    ctx.quadraticCurveTo(508, 124, 496, 124);
    ctx.lineTo(16, 124);
    ctx.quadraticCurveTo(4, 124, 4, 112);
    ctx.lineTo(4, 16);
    ctx.quadraticCurveTo(4, 4, 16, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Space Grotesk, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(x, y, z);
    sprite.scale.set(120, 30, 1);
    
    parentGroup.add(sprite);
  }

  buildTreesAndBenches() {
    const benchSeatMat = new THREE.MeshPhongMaterial({ color: 0xbf9b30, flatShading: true });
    const benchLegMat = new THREE.MeshPhongMaterial({ color: 0x7f8c8d, flatShading: true });

    CAMPUS_LAYOUT.trees.forEach(t => {
      const tree = new THREE.Group();
      tree.position.set(t.x, 0, t.y);

      const trunkGeo = new THREE.CylinderGeometry(2, 3.5, 20, 8);
      const trunkMat = new THREE.MeshPhongMaterial({ color: 0x5c4033, flatShading: true });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 10;
      trunk.castShadow = true;
      tree.add(trunk);

      const colors = [0x1A5C1A, 0x278027, 0x2ecc71];
      const radii = [t.r, t.r * 0.75, t.r * 0.5];
      const heights = [20, 20 + t.r * 0.7, 20 + t.r * 1.3];

      for (let i = 0; i < 3; i++) {
        const leafGeo = new THREE.SphereGeometry(radii[i], 8, 8);
        const leafMat = new THREE.MeshPhongMaterial({ color: colors[i], flatShading: true });
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.y = heights[i];
        leaf.castShadow = true;
        tree.add(leaf);
      }

      this.outdoorGroup.add(tree);
      this.outdoorTrees.push(tree);
    });

    CAMPUS_LAYOUT.benches.forEach(b => {
      const bench = new THREE.Group();
      bench.position.set(b.x, 0.5, b.y);

      const slabGeo = new THREE.BoxGeometry(40, 2, 10);
      const seat = new THREE.Mesh(slabGeo, benchSeatMat);
      seat.position.y = 5;
      seat.castShadow = true;
      bench.add(seat);

      const legGeo = new THREE.BoxGeometry(4, 5, 8);
      const legL = new THREE.Mesh(legGeo, benchLegMat);
      legL.position.set(-16, 2.5, 0);
      legL.castShadow = true;
      bench.add(legL);

      const legR = legL.clone();
      legR.position.x = 16;
      bench.add(legR);

      this.outdoorGroup.add(bench);
    });
  }

  buildParkingCars() {
    const carColors = [0xC0392B, 0x2980B9, 0xF1C40F, 0x7F8C8D, 0x16A085];
    const pk = CAMPUS_LAYOUT.parkingLot;
    
    for (let i = 0; i < 6; i++) {
      const carGroup = new THREE.Group();
      const px = pk.x - pk.w/2 + 40 + i * 48;
      const pz = pk.y - pk.h/2 + 60;
      carGroup.position.set(px, 0, pz);
      
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(22, 6, 12),
        new THREE.MeshPhongMaterial({ color: carColors[i % carColors.length], flatShading: true })
      );
      body.position.y = 4.2;
      body.castShadow = true;
      carGroup.add(body);
      
      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(12, 5, 10),
        new THREE.MeshPhongMaterial({ color: 0x222222, flatShading: true })
      );
      cabin.position.set(-2, 8.5, 0);
      cabin.castShadow = true;
      carGroup.add(cabin);
      
      const wheelGeo = new THREE.CylinderGeometry(2.5, 2.5, 2, 8);
      const wheelMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
      
      const fl = new THREE.Mesh(wheelGeo, wheelMat);
      fl.rotation.x = Math.PI / 2;
      fl.position.set(6, 2.5, 6);
      carGroup.add(fl);
      
      const fr = fl.clone();
      fr.position.z = -6;
      carGroup.add(fr);
      
      const bl = fl.clone();
      bl.position.x = -6;
      carGroup.add(bl);
      
      const br = fr.clone();
      br.position.x = -6;
      carGroup.add(br);
      
      this.outdoorGroup.add(carGroup);
      this.indoorColliders.push({ xMin: px - 12, xMax: px + 12, zMin: pz - 7, zMax: pz + 7 });
    }
  }

  buildCentralFountain() {
    const fountainGroup = new THREE.Group();
    fountainGroup.position.set(680, 0, 880);
    
    const stoneMat = new THREE.MeshPhongMaterial({ color: 0x7F8C8D, flatShading: true });
    const outerRing = new THREE.Mesh(
      new THREE.CylinderGeometry(26, 28, 6, 16),
      stoneMat
    );
    outerRing.position.y = 3;
    outerRing.castShadow = true;
    fountainGroup.add(outerRing);
    
    const waterMat = new THREE.MeshPhongMaterial({ color: 0x3498DB, transparent: true, opacity: 0.8, shininess: 80 });
    const water = new THREE.Mesh(
      new THREE.CylinderGeometry(24, 24, 1, 16),
      waterMat
    );
    water.position.y = 5.2;
    fountainGroup.add(water);
    
    const spout = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 4, 14, 8),
      stoneMat
    );
    spout.position.y = 8;
    fountainGroup.add(spout);
    
    this.fountainJets = [];
    const jetGeo = new THREE.SphereGeometry(1.6, 6, 6);
    const jetMat = new THREE.MeshBasicMaterial({ color: 0x85C1E9, transparent: true, opacity: 0.9 });
    
    for (let i = 0; i < 5; i++) {
      const jet = new THREE.Mesh(jetGeo, jetMat);
      jet.position.set(0, 15 + i * 1.5, 0);
      fountainGroup.add(jet);
      this.fountainJets.push(jet);
    }
    
    this.outdoorGroup.add(fountainGroup);
    this.indoorColliders.push({ xMin: 680 - 28, xMax: 680 + 28, zMin: 880 - 28, zMax: 880 + 28 });
  }

  buildStreetLamps() {
    const lampCoords = [
      { x: 500, z: 1550 },
      { x: 580, z: 1550 },
      { x: 500, z: 1350 },
      { x: 580, z: 1350 },
      { x: 600, z: 1150 },
      { x: 760, z: 1150 },
      { x: 600, z: 950 },
      { x: 760, z: 950 }
    ];
    
    const poleMat = new THREE.MeshPhongMaterial({ color: 0x333333, flatShading: true });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0xF4D03F });
    
    lampCoords.forEach(c => {
      const lampGroup = new THREE.Group();
      lampGroup.position.set(c.x, 0, c.z);
      
      const base = new THREE.Mesh(new THREE.CylinderGeometry(2, 3, 4, 8), poleMat);
      base.position.y = 2;
      lampGroup.add(base);
      
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 30, 6), poleMat);
      pole.position.y = 17;
      pole.castShadow = true;
      lampGroup.add(pole);
      
      const lantern = new THREE.Mesh(new THREE.BoxGeometry(4, 5, 4), glassMat);
      lantern.position.y = 33;
      lampGroup.add(lantern);
      
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 5, 2, 6), poleMat);
      cap.position.y = 36;
      lampGroup.add(cap);
      
      const light = new THREE.PointLight(0xF4D03F, 0.8, 40);
      light.position.y = 33;
      lampGroup.add(light);
      
      this.outdoorGroup.add(lampGroup);
    });
  }

  createPlayer() {
    this.player = new THREE.Group();
    this.scene.add(this.player);

    // Torso body capsule (styled with a cool white collar!)
    const torsoGeo = new THREE.CylinderGeometry(5, 4, 14, 8);
    const torsoMat = new THREE.MeshPhongMaterial({ color: 0x006341, flatShading: true });
    this.torso = new THREE.Mesh(torsoGeo, torsoMat);
    this.torso.position.y = 11;
    this.torso.castShadow = true;
    this.player.add(this.torso);

    // White shirt collar on top of torso for details!
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(4.2, 4.8, 1.2, 8),
      new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true })
    );
    collar.position.set(0, 7.2, 0); // local to torso
    this.torso.add(collar);

    // Head sphere
    const headGeo = new THREE.SphereGeometry(4.5, 16, 16);
    const headMat = new THREE.MeshPhongMaterial({ color: 0xffdbac, flatShading: true });
    this.head = new THREE.Mesh(headGeo, headMat);
    this.head.position.y = 21;
    this.head.castShadow = true;
    this.player.add(this.head);

    // --- DETAILED ANIME FACE ---
    // Eyes: Two cute shiny black boxes with little white highlight details
    const eyeGeo = new THREE.BoxGeometry(0.8, 1.2, 0.5);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    
    this.leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    this.leftEye.position.set(-1.2, 1.0, 3.8);
    this.head.add(this.leftEye);
    
    this.rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    this.rightEye.position.set(1.2, 1.0, 3.8);
    this.head.add(this.rightEye);

    // Eye highlights (white glints to make them look alive!)
    const eyeHighlightGeo = new THREE.BoxGeometry(0.3, 0.3, 0.1);
    const eyeHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    const highlightL = new THREE.Mesh(eyeHighlightGeo, eyeHighlightMat);
    highlightL.position.set(0.2, 0.3, 0.3); // relative to eye
    this.leftEye.add(highlightL);
    
    const highlightR = new THREE.Mesh(eyeHighlightGeo, eyeHighlightMat);
    highlightR.position.set(0.2, 0.3, 0.3); // relative to eye
    this.rightEye.add(highlightR);

    // Smiling Mouth
    const mouthGeo = new THREE.BoxGeometry(1.4, 0.5, 0.4);
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0xc0392b });
    this.mouth = new THREE.Mesh(mouthGeo, mouthMat);
    this.mouth.position.set(0, -1.0, 3.8);
    this.head.add(this.mouth);

    // Blush cheeks (Kawaii look!)
    const blushGeo = new THREE.BoxGeometry(0.9, 0.4, 0.4);
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xffa0a0, transparent: true, opacity: 0.85 });
    
    this.leftBlush = new THREE.Mesh(blushGeo, blushMat);
    this.leftBlush.position.set(-2.2, 0.0, 3.7);
    this.head.add(this.leftBlush);
    
    this.rightBlush = new THREE.Mesh(blushGeo, blushMat);
    this.rightBlush.position.set(2.2, 0.0, 3.7);
    this.head.add(this.rightBlush);

    // --- ANIME STYLIZED HAIR (Low-Poly Blocks) ---
    const hairMat = new THREE.MeshPhongMaterial({ color: 0x3d2314, flatShading: true }); // Cute chestnut brown
    const hairGroup = new THREE.Group();
    
    // Top volume
    const topHair = new THREE.Mesh(new THREE.BoxGeometry(10.2, 3.2, 9.8), hairMat);
    topHair.position.set(0, 3.8, -0.2);
    hairGroup.add(topHair);
    
    // Back hair
    const backHair = new THREE.Mesh(new THREE.BoxGeometry(9.8, 6.5, 3.8), hairMat);
    backHair.position.set(0, 0.5, -3.2);
    hairGroup.add(backHair);
    
    // Sideburns Left
    const sideburnL = new THREE.Mesh(new THREE.BoxGeometry(1.8, 4.5, 2.5), hairMat);
    sideburnL.position.set(-4.4, 0.5, 0.5);
    hairGroup.add(sideburnL);
    
    // Sideburns Right
    const sideburnR = sideburnL.clone();
    sideburnR.position.x = 4.4;
    hairGroup.add(sideburnR);
    
    // Front bangs (spiky and cute!)
    const bangs = new THREE.Mesh(new THREE.BoxGeometry(8.2, 2.2, 2.2), hairMat);
    bangs.position.set(0, 3.2, 3.4);
    hairGroup.add(bangs);
    
    this.head.add(hairGroup);

    // Limbs
    const limbGeo = new THREE.CylinderGeometry(1.2, 1.2, 9, 6);
    const pantsMat = new THREE.MeshPhongMaterial({ color: 0x111e17, flatShading: true });
    const sleeveMat = new THREE.MeshPhongMaterial({ color: 0x006341, flatShading: true });

    this.leftLeg = new THREE.Mesh(limbGeo, pantsMat);
    this.leftLeg.position.set(-2.5, 4.5, 0);
    this.leftLeg.castShadow = true;
    this.player.add(this.leftLeg);

    this.rightLeg = this.leftLeg.clone();
    this.rightLeg.position.x = 2.5;
    this.player.add(this.rightLeg);

    // --- SNEAKERS / SHOES ATTACHMENTS ---
    // Stylish white high-top sneakers with colored soles!
    const shoeBodyGeo = new THREE.BoxGeometry(2.8, 2.2, 4.8);
    const shoeSoleGeo = new THREE.BoxGeometry(3.0, 0.6, 5.0);
    const shoeBodyMat = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true });
    const shoeSoleMat = new THREE.MeshPhongMaterial({ color: 0xe67e22, flatShading: true }); // Cool orange sole

    // Left Sneaker
    const leftSneakerBody = new THREE.Mesh(shoeBodyGeo, shoeBodyMat);
    leftSneakerBody.position.set(0, -4.8, 0.8);
    const leftSneakerSole = new THREE.Mesh(shoeSoleGeo, shoeSoleMat);
    leftSneakerSole.position.set(0, -5.9, 0.8);
    this.leftLeg.add(leftSneakerBody);
    this.leftLeg.add(leftSneakerSole);

    // Right Sneaker
    const rightSneakerBody = new THREE.Mesh(shoeBodyGeo, shoeBodyMat);
    rightSneakerBody.position.set(0, -4.8, 0.8);
    const rightSneakerSole = new THREE.Mesh(shoeSoleGeo, shoeSoleMat);
    rightSneakerSole.position.set(0, -5.9, 0.8);
    this.rightLeg.add(rightSneakerBody);
    this.rightLeg.add(rightSneakerSole);

    this.leftArm = new THREE.Mesh(limbGeo, sleeveMat);
    this.leftArm.position.set(-6.5, 12, 0);
    this.leftArm.castShadow = true;
    this.player.add(this.leftArm);

    this.rightArm = this.leftArm.clone();
    this.rightArm.position.x = 6.5;
    this.player.add(this.rightArm);

    this.attachmentAnchor = new THREE.Group();
    this.player.add(this.attachmentAnchor);

    this.updatePlayerAvatar();
  }

  updatePlayerAvatar() {
    if (!this.attachmentAnchor || !this.torso) return;
    
    // Clear previous accessories
    while(this.attachmentAnchor.children.length > 0){
      this.attachmentAnchor.remove(this.attachmentAnchor.children[0]);
    }

    // Remove briefcase or bag attachments from arms if they exist
    if (this.briefcase && this.rightArm) {
      this.rightArm.remove(this.briefcase);
      this.briefcase = null;
    }

    const role = window.gameApp.userRole;

    // --- 1. DEFAULT ACCESSORIES (If not overridden by equipped merch) ---
    if (role === 'prospecto') {
      // 🟢 Verde: Green Torso + Backpack
      this.torso.material.color.setHex(0x006341);
      
      if (!window.gameApp.equippedMerch.has('mochila')) {
        const backpack = new THREE.Mesh(
          new THREE.BoxGeometry(7, 10, 4.5),
          new THREE.MeshPhongMaterial({ color: 0xe67e22, flatShading: true })
        );
        backpack.position.set(0, 12, -5.5);
        backpack.castShadow = true;
        this.attachmentAnchor.add(backpack);

        // Backpack Straps
        const strapL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 13, 1.2), new THREE.MeshBasicMaterial({ color: 0xe67e22 }));
        strapL.position.set(-2.5, 11, 2.2);
        strapL.rotation.y = 0.1;
        this.attachmentAnchor.add(strapL);
        const strapR = strapL.clone();
        strapR.position.x = 2.5;
        this.attachmentAnchor.add(strapR);
      }

    } else if (role === 'estudiante') {
      // 🟠 Naranja: Orange Torso + Sunglasses
      this.torso.material.color.setHex(0xe67e22);

      if (!window.gameApp.equippedMerch.has('gafas')) {
        const glasses = new THREE.Group();
        glasses.position.set(0, 21.5, 3.8);

        const frame = new THREE.Mesh(new THREE.BoxGeometry(7.2, 1.4, 0.4), new THREE.MeshBasicMaterial({ color: 0xbf9b30 }));
        glasses.add(frame);

        const lensL = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.2, 0.2), new THREE.MeshBasicMaterial({ color: 0x111111 }));
        lensL.position.set(-1.8, 0, 0.2);
        glasses.add(lensL);

        const lensR = lensL.clone();
        lensR.position.x = 1.8;
        glasses.add(lensR);

        this.attachmentAnchor.add(glasses);
      }

    } else if (role === 'docente') {
      // 🔵 Azul: Blue Torso + Graduation Cap
      this.torso.material.color.setHex(0x2980B9);

      const capGroup = new THREE.Group();
      capGroup.position.set(0, 23.5, 0);

      const capBoard = new THREE.Mesh(new THREE.BoxGeometry(11, 0.8, 11), new THREE.MeshPhongMaterial({ color: 0x111e17, flatShading: true }));
      capBoard.rotation.y = Math.PI / 4;
      capGroup.add(capBoard);

      const capSkull = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4, 2, 8), new THREE.MeshPhongMaterial({ color: 0x111e17, flatShading: true }));
      capSkull.position.y = -1;
      capGroup.add(capSkull);

      const tassel = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.5, 0.5), new THREE.MeshBasicMaterial({ color: 0xbf9b30 }));
      tassel.position.set(4, -1, 3);
      capGroup.add(tassel);

      this.attachmentAnchor.add(capGroup);

    } else if (role === 'visitante') {
      // 🔴 Rojo: Red Torso + Shoulder Satchel Bag
      this.torso.material.color.setHex(0xC0392B);

      const bag = new THREE.Mesh(
        new THREE.BoxGeometry(3, 7, 7),
        new THREE.MeshPhongMaterial({ color: 0x5c4033, flatShading: true })
      );
      bag.position.set(5.5, 10, 0);
      bag.castShadow = true;
      this.attachmentAnchor.add(bag);

      const strapGeo = new THREE.BoxGeometry(1.2, 16, 6.2);
      const strap = new THREE.Mesh(strapGeo, new THREE.MeshBasicMaterial({ color: 0x5c4033 }));
      strap.rotation.z = -0.55;
      strap.position.set(0, 11, 0);
      this.attachmentAnchor.add(strap);
    }

    // Set default arm colors to match role torso colors
    const torsoColor = this.torso.material.color;
    if (this.leftArm && this.rightArm) {
      this.leftArm.material.color.copy(torsoColor);
      this.rightArm.material.color.copy(torsoColor);
    }

    // --- 2. MERCH EQUIP OVERRIDES (Renders 3D mesh elements for won items) ---

    // A) Gorra Deportiva UPVT
    if (window.gameApp.equippedMerch.has('gorra')) {
      const cap = new THREE.Group();
      cap.position.set(0, 23.5, 0);

      const crown = new THREE.Mesh(
        new THREE.CylinderGeometry(4.2, 4.5, 2.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x006341, roughness: 0.8 })
      );
      cap.add(crown);

      const visor = new THREE.Mesh(
        new THREE.BoxGeometry(7, 0.4, 5.5),
        new THREE.MeshStandardMaterial({ color: 0xbf9b30, roughness: 0.8 })
      );
      visor.position.set(0, -0.8, 3.8);
      visor.rotation.x = 0.1;
      cap.add(visor);

      this.attachmentAnchor.add(cap);
    }

    // B) Mochila UPVT (Tech Backpack)
    if (window.gameApp.equippedMerch.has('mochila')) {
      const bp = new THREE.Mesh(
        new THREE.BoxGeometry(7.5, 11, 5),
        new THREE.MeshStandardMaterial({ color: 0x006341, roughness: 0.6 })
      );
      bp.position.set(0, 12, -5.8);
      bp.castShadow = true;
      this.attachmentAnchor.add(bp);

      const pocket = new THREE.Mesh(
        new THREE.BoxGeometry(5, 5.5, 1.5),
        new THREE.MeshStandardMaterial({ color: 0xbf9b30, roughness: 0.6 })
      );
      pocket.position.set(0, -2, -3.1);
      bp.add(pocket);

      const strapL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 13, 1.2), new THREE.MeshBasicMaterial({ color: 0x006341 }));
      strapL.position.set(-2.6, 11, 2.2);
      this.attachmentAnchor.add(strapL);
      const strapR = strapL.clone();
      strapR.position.x = 2.6;
      this.attachmentAnchor.add(strapR);
    }

    // C) Gafas Académicas UPVT (Sunglasses)
    if (window.gameApp.equippedMerch.has('gafas')) {
      const glasses = new THREE.Group();
      glasses.position.set(0, 21.5, 3.8);

      const frame = new THREE.Mesh(new THREE.BoxGeometry(7.2, 1.4, 0.4), new THREE.MeshBasicMaterial({ color: 0xbf9b30 }));
      glasses.add(frame);

      const lensL = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.2, 0.2), new THREE.MeshBasicMaterial({ color: 0x111111 }));
      lensL.position.set(-1.8, 0, 0.2);
      glasses.add(lensL);

      const lensR = lensL.clone();
      lensR.position.x = 1.8;
      glasses.add(lensR);

      this.attachmentAnchor.add(glasses);
    }

    // D) Audífonos de Diadema UPVT (Over-ear Headphones)
    if (window.gameApp.equippedMerch.has('audifonos')) {
      const headphones = new THREE.Group();
      headphones.position.set(0, 21, 0);

      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(4.4, 4.4, 1.2, 16, 1, true),
        new THREE.MeshStandardMaterial({ color: 0x111e17, metalness: 0.5 })
      );
      band.rotation.z = Math.PI / 2;
      band.position.y = 2.8;
      headphones.add(band);

      const cupL = new THREE.Mesh(
        new THREE.CylinderGeometry(2.6, 2.6, 1.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x006341, metalness: 0.7, roughness: 0.2 })
      );
      cupL.rotation.z = Math.PI / 2;
      cupL.position.x = -4.3;
      headphones.add(cupL);

      const cushionL = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 2.2, 0.6, 8),
        new THREE.MeshBasicMaterial({ color: 0xbf9b30 })
      );
      cushionL.rotation.z = Math.PI / 2;
      cushionL.position.x = -3.5;
      headphones.add(cushionL);

      const cupR = cupL.clone();
      cupR.position.x = 4.3;
      cupR.rotation.z = -Math.PI / 2;
      headphones.add(cupR);

      const cushionR = cushionL.clone();
      cushionR.position.x = 3.5;
      cushionR.rotation.z = -Math.PI / 2;
      headphones.add(cushionR);

      this.attachmentAnchor.add(headphones);
    }

    // E) Termo Metálico UPVT (waist clip cup)
    if (window.gameApp.equippedMerch.has('termo')) {
      const termo = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.1, 5, 8),
        new THREE.MeshStandardMaterial({ color: 0xbf9b30, metalness: 0.9, roughness: 0.1 })
      );
      termo.position.set(-5.5, 8, 2.5);
      termo.rotation.z = 0.2;
      this.attachmentAnchor.add(termo);

      const lid = new THREE.Mesh(
        new THREE.CylinderGeometry(1.6, 1.6, 1, 8),
        new THREE.MeshStandardMaterial({ color: 0x111e17, metalness: 0.8 })
      );
      lid.position.y = 2.8;
      termo.add(lid);
    }

    // F) Torso Cosmetics (Sudadera Hoodie vs Varsity Chamarra)
    let wornTorsoColor = null;
    let wornArmColor = null;

    if (window.gameApp.equippedMerch.has('sudadera')) {
      wornTorsoColor = 0x006341;
      wornArmColor = 0x006341;

      // Draw 3D hood cap behind the player head
      const hood = new THREE.Mesh(
        new THREE.BoxGeometry(7.2, 5.8, 3.4),
        new THREE.MeshStandardMaterial({ color: 0x006341, roughness: 0.8 })
      );
      hood.position.set(0, 16.5, -3.8);
      this.attachmentAnchor.add(hood);

    } else if (window.gameApp.equippedMerch.has('chamarra')) {
      wornTorsoColor = 0x00422b; // Deep Forest Green Torso
      wornArmColor = 0xffffff;   // White sleeves
    }

    if (wornTorsoColor !== null) {
      this.torso.material.color.setHex(wornTorsoColor);
      if (this.leftArm && this.rightArm) {
        this.leftArm.material.color.setHex(wornArmColor);
        this.rightArm.material.color.setHex(wornArmColor);
      }
    }
  }

  // ==========================================
  // OUTDOOR NPC SPAWNER
  // ==========================================
  spawnNPCs() {
    this.npcsList = [];
    const npcCoords = [
      { letter: 'A', x: 600, z: 320, name: 'Dra. Silvia Manzur', welcome: ['Estimado visitante, es un honor recibirle en el Edificio Académico.', 'Nuestras carreras se enfocan en competencias. Presiona [E] para ingresar y conocer las aulas de Ingeniería.'] },
      { letter: 'B', x: 920, z: 910, name: 'Lic. Laura Manzano', welcome: ['¡Hola! Bienvenido a Servicios Escolares.', 'Presiona [E] para ingresar a la recepción y consultar los requisitos de inscripciones y Becas.'] },
      { letter: 'C', x: 540, z: 800, name: 'Bibliotecario CID', welcome: ['Bienvenidos al Centro de Información y Documentación.', 'Contamos con más de 10,000 tomos físicos. Presiona [E] para entrar a las salas de lectura en 3D.'] },
      { letter: 'D', x: 420, z: 650, name: 'Prof. de Idiomas', welcome: ['Hello! Welcome to UPVT!', 'Presiona [E] para ingresar al Laboratorio de Química y talleres técnicos.'] },
      { letter: 'E', x: 415, z: 1130, name: 'Chefcito Cafetería', welcome: ['¡Hola! ¿Un break de tus clases?', 'Presiona [E] para entrar al Edificio Administrativo y la Cafetería General.'] },
      { letter: 'F', x: 1220, z: 1050, name: 'Entrenador Deportivo', welcome: ['¡Actívate, campeón!', 'Presiona [E] para ingresar a los vestidores y gimnasio de deportes.'] },
      { letter: 'G', x: 485, z: 1490, name: 'Vigilancia Escolar', welcome: ['¡Un gusto saludarle!', 'La seguridad del campus está activa las 24 horas. Presiona [E] para ingresar a la caseta de control escolar.'] }
    ];

    const npcAvatarMap = { A: '👩‍💼', B: '👩‍💻', C: '👨‍🏫', D: '👨‍💼', E: '🧑‍🍳', F: '👨‍🚀', G: '👮' };

    npcCoords.forEach(c => {
      const npc = new THREE.Group();
      npc.position.set(c.x, 0, c.z);

      const torso = new THREE.Mesh(
        new THREE.CylinderGeometry(4.5, 4, 13, 8),
        new THREE.MeshPhongMaterial({ color: 0x8b0000, flatShading: true })
      );
      torso.position.y = 10.5;
      torso.castShadow = true;
      npc.add(torso);

      const head = new THREE.Mesh(
        new THREE.SphereGeometry(4.2, 10, 10),
        new THREE.MeshPhongMaterial({ color: 0xffdbac, flatShading: true })
      );
      head.position.y = 19.5;
      head.castShadow = true;
      npc.add(head);

      this.createBillboardSprite(c.x, 30, c.z, npcAvatarMap[c.letter], this.outdoorGroup);

      this.outdoorGroup.add(npc);

      this.npcsList.push({
        letter: c.letter,
        name: c.name,
        avatar: npcAvatarMap[c.letter],
        welcomeLines: c.welcome,
        mesh: npc
      });
    });
  }

  // ==========================================
  // CONTROLS & BINDINGS SETUP
  // ==========================================
  setupControls() {
    window.addEventListener('keydown', (e) => {
      if (!this.input.keyboard.enabled) return;
      
      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') this.keys.w = true;
      if (k === 's' || e.key === 'ArrowDown') this.keys.s = true;
      if (k === 'a' || e.key === 'ArrowLeft') this.keys.a = true;
      if (k === 'd' || e.key === 'ArrowRight') this.keys.d = true;

      if (k === 'e') {
        this.executeInteraction();
      }
    });

    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') this.keys.w = false;
      if (k === 's' || e.key === 'ArrowDown') this.keys.s = false;
      if (k === 'a' || e.key === 'ArrowLeft') this.keys.a = false;
      if (k === 'd' || e.key === 'ArrowRight') this.keys.d = false;
    });

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // 3D Mouse Orbit and Zoom state
    this.zoomLevel = 1.0;
    this.cameraAngleY = 0.0;
    this.isPointerDragging = false;
    this.pointerStartX = 0;
    this.pointerStartY = 0;
    this.lastPointerX = 0;
    this.hasDraggedSignificant = false;

    window.addEventListener('pointerdown', (e) => {
      if (!this.input.keyboard.enabled) return;
      if (e.target.closest('.interactive-ui')) return;

      this.isPointerDragging = true;
      this.pointerStartX = e.clientX;
      this.pointerStartY = e.clientY;
      this.lastPointerX = e.clientX;
      this.hasDraggedSignificant = false;
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isPointerDragging) return;
      
      const dx = e.clientX - this.pointerStartX;
      const dy = e.clientY - this.pointerStartY;
      if (Math.hypot(dx, dy) > 8) {
        this.hasDraggedSignificant = true;
      }

      const deltaX = e.clientX - this.lastPointerX;
      this.cameraAngleY -= deltaX * 0.006; // Orbit speed factor
      this.lastPointerX = e.clientX;
    });

    window.addEventListener('pointerup', (e) => {
      if (!this.isPointerDragging) return;
      this.isPointerDragging = false;

      // Click to move is triggered only if no significant dragging orbit was performed!
      if (!this.hasDraggedSignificant) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectionPoint = new THREE.Vector3();
        
        if (this.raycaster.ray.intersectPlane(floorPlane, intersectionPoint)) {
          this.targetPos = new THREE.Vector3(intersectionPoint.x, 10, intersectionPoint.z);
          this.spawnTouchRing(intersectionPoint.x, intersectionPoint.z);
        }
      }
    });

    window.addEventListener('wheel', (e) => {
      // Zoom in / out using scroll wheel
      if (e.deltaY > 0) {
        this.zoomLevel = Math.min(3.5, this.zoomLevel + 0.1);
      } else {
        this.zoomLevel = Math.max(0.25, this.zoomLevel - 0.1);
      }
    });
  }

  spawnTouchRing(x, z) {
    const ringGeo = new THREE.RingGeometry(1, 12, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xbf9b30, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.3, z);
    this.scene.add(ring);

    const startTime = performance.now();
    const animateRing = () => {
      const elapsed = (performance.now() - startTime) / 350;
      if (elapsed >= 1.0) {
        this.scene.remove(ring);
        ringGeo.dispose();
        ringMat.dispose();
      } else {
        ring.scale.set(1 + elapsed * 1.5, 1 + elapsed * 1.5, 1);
        ring.material.opacity = 0.8 * (1 - elapsed);
        requestAnimationFrame(animateRing);
      }
    };
    animateRing();
  }

  // ==========================================
  // RPG 3D INTERIOR GENERATOR
  // ==========================================
  enterIndoor(letter) {
    this.fadeTransition(() => {
      this.isIndoor = true;
      this.indoorZone = letter;
      this.indoorFloor = 1; // Start on Ground Floor
      this.targetPos = null;

      // Toggle outdoor scene group and load warm inside layout
      this.outdoorGroup.visible = false;
      this.indoorGroup.visible = true;
      this.scene.background = new THREE.Color(0x1a1e20);

      this.buildIndoorScene(letter);

      // Spawn Player inside (Facing North near exit portal)
      const IW = this.indoorWidth || 600;
      const ID = this.indoorDepth || 400;
      this.player.position.set(IW / 2, 0, ID - 60);
      this.player.rotation.set(0, 0, 0);
      
      // Update follow camera
      this.camera.position.set(IW / 2, 100, ID + 80);
    });
  }

  changeIndoorFloor(floorNumber) {
    this.fadeTransition(() => {
      this.indoorFloor = floorNumber;

      // Clear all indoor models
      while (this.indoorGroup.children.length > 0) {
        this.indoorGroup.remove(this.indoorGroup.children[0]);
      }

      // Rebuild the indoor scene with the new floor configuration
      this.buildIndoorScene(this.indoorZone);

      // Place player near the elevator/stairs portal facing south
      this.player.position.set(45, 10, 75);
      this.player.rotation.set(0, Math.PI, 0);

      // Reset keyboard and pathing target
      this.targetPos = null;
    });
  }

  leaveIndoor() {
    this.fadeTransition(() => {
      this.isIndoor = false;
      const prevZone = this.indoorZone;
      this.indoorZone = null;
      this.targetPos = null;

      this.indoorGroup.visible = false;
      this.outdoorGroup.visible = true;
      this.scene.background = new THREE.Color(0x87CEEB); // Return sky blue background

      // Clear indoor models
      while (this.indoorGroup.children.length > 0) {
        this.indoorGroup.remove(this.indoorGroup.children[0]);
      }

      // Return player to outdoor building gate trigger coordinates
      const z = CAMPUS_LAYOUT.zones[prevZone];
      let gateX = z.x;
      let gateZ = z.y + z.solidH/2 + 30;

      if (prevZone === 'A') {
        gateX = z.x;
        gateZ = z.y + 130;
      } else if (prevZone === 'E') {
        gateX = z.x;
        gateZ = z.y + 195;
      } else if (prevZone === 'G') {
        gateX = z.x;
        gateZ = z.y + 90;
      }

      this.player.position.set(gateX, 10, gateZ);
      this.camera.position.set(gateX, 120, gateZ + 160);
    });
  }

  fadeTransition(onMidpoint) {
    const fade = document.getElementById('screen-fade');
    if (!fade) {
      onMidpoint();
      return;
    }
    fade.style.opacity = '1';
    setTimeout(() => {
      onMidpoint();
      setTimeout(() => {
        fade.style.opacity = '0';
      }, 250);
    }, 450);
  }

  buildIndoorScene(letter) {
    // 1. Initialize lists for multi-floor vertical partition
    this.indoorPropsList = [];
    this.indoorCollidersF1 = [];
    this.indoorCollidersF2 = [];

    // Create separated F2 container group for floor visibility toggling
    this.f2Group = new THREE.Group();
    this.f2Group.name = 'floor2Group';
    this.indoorGroup.add(this.f2Group);

    // Indoor dimensions: 600 x 400 grid (realistic building size)
    const IW = 600; // indoor width
    const ID = 400; // indoor depth
    const F2H = 50; // floor 2 height
    this.indoorWidth = IW;
    this.indoorDepth = ID;
    this.indoorF2Height = F2H;

    // 2. Ground Floor 1 — polished marble tile floor
    const floorGeo = new THREE.PlaneGeometry(IW, ID);
    const floorMat = new THREE.MeshPhongMaterial({ color: 0xccd0d4, roughness: 0.3, flatShading: true });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(IW / 2, 0, ID / 2);
    floor.receiveShadow = true;
    this.indoorGroup.add(floor);

    // Subtle tile grid
    const grid = new THREE.GridHelper(Math.max(IW, ID), 20, 0xb8bcc0, 0xb8bcc0);
    grid.position.set(IW / 2, 0.05, ID / 2);
    grid.material.opacity = 0.15;
    grid.material.transparent = true;
    this.indoorGroup.add(grid);

    // 3. Rich multi-point Lighting
    const amb = new THREE.AmbientLight(0xfff8f0, 0.55);
    this.indoorGroup.add(amb);

    // Ceiling fluorescent-style lights — multiple points for large hall
    const lightPositions = [
      [IW * 0.25, 70, ID * 0.3],
      [IW * 0.75, 70, ID * 0.3],
      [IW * 0.5, 70, ID * 0.6],
      [IW * 0.25, F2H + 70, ID * 0.3],
      [IW * 0.75, F2H + 70, ID * 0.3],
    ];
    lightPositions.forEach(([lx, ly, lz]) => {
      const pt = new THREE.PointLight(0xfff5e0, 0.7, 500);
      pt.position.set(lx, ly, lz);
      pt.castShadow = false; // Performance: skip shadow on fill lights
      this.indoorGroup.add(pt);
    });

    // Main shadow casting light
    const mainLight = new THREE.DirectionalLight(0xfffaed, 0.5);
    mainLight.position.set(IW / 2, 100, ID / 2);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(1024, 1024);
    mainLight.shadow.camera.near = 1;
    mainLight.shadow.camera.far = 200;
    const sd = 350;
    mainLight.shadow.camera.left = -sd;
    mainLight.shadow.camera.right = sd;
    mainLight.shadow.camera.top = sd;
    mainLight.shadow.camera.bottom = -sd;
    this.indoorGroup.add(mainLight);

    // 4. Interior walls — off-white, only left/right/back for visual context (no front wall)
    const wallMat = new THREE.MeshPhongMaterial({ color: 0xf0ece4, flatShading: true });
    const wHeight = 80;
    const wThick = 4;

    // Left wall
    const wallL = new THREE.Mesh(new THREE.BoxGeometry(wThick, wHeight, ID), wallMat);
    wallL.position.set(0, wHeight / 2, ID / 2);
    wallL.receiveShadow = true;
    this.indoorGroup.add(wallL);

    // Right wall
    const wallR = wallL.clone();
    wallR.position.x = IW;
    this.indoorGroup.add(wallR);

    // Back wall (North)
    const wallN = new THREE.Mesh(new THREE.BoxGeometry(IW, wHeight, wThick), wallMat);
    wallN.position.set(IW / 2, wHeight / 2, 0);
    wallN.receiveShadow = true;
    this.indoorGroup.add(wallN);

    // 5. Grand Exit Portal (at south center of building)
    const portalGeo = new THREE.RingGeometry(1, 22, 16);
    const portalMat = new THREE.MeshBasicMaterial({ color: 0xF1C40F, side: THREE.DoubleSide, transparent: true, opacity: 0.65 });
    const portal = new THREE.Mesh(portalGeo, portalMat);
    portal.rotation.x = -Math.PI / 2;
    portal.position.set(IW / 2, 0.2, ID - 30);
    this.indoorGroup.add(portal);

    const exitCylGeo = new THREE.CylinderGeometry(22, 22, 3, 16, 1, true);
    const exitCylMat = new THREE.MeshBasicMaterial({ color: 0xF1C40F, side: THREE.DoubleSide, transparent: true, opacity: 0.2 });
    const exitCyl = new THREE.Mesh(exitCylGeo, exitCylMat);
    exitCyl.position.set(IW / 2, 1.5, ID - 30);
    this.indoorGroup.add(exitCyl);

    this.createBillboardSprite(IW / 2, 25, ID - 30, 'SALIR AL CAMPUS', this.indoorGroup);

    // 6. Multi-floor Platform & Grand Staircase (Zones A-F only)
    if (letter !== 'G') {
      // --- Floor 2 Platform (covers z: 0 → ID*0.6, width = full IW) ---
      const f2Depth = ID * 0.6;
      const f2FloorGeo = new THREE.PlaneGeometry(IW, f2Depth);
      const f2FloorMat = new THREE.MeshPhongMaterial({ color: 0xbcb8b0, roughness: 0.4, flatShading: true });
      const f2Floor = new THREE.Mesh(f2FloorGeo, f2FloorMat);
      f2Floor.rotation.x = -Math.PI / 2;
      f2Floor.position.set(IW / 2, F2H, f2Depth / 2);
      f2Floor.receiveShadow = true;
      f2Floor.castShadow = true;
      this.f2Group.add(f2Floor);

      // Floor 2 grid overlay
      const f2Grid = new THREE.GridHelper(IW, 16, 0xa8a4a0, 0xa8a4a0);
      f2Grid.position.set(IW / 2, F2H + 0.1, f2Depth / 2);
      f2Grid.material.opacity = 0.12;
      f2Grid.material.transparent = true;
      this.f2Group.add(f2Grid);

      // Ceiling slab above F2 (so it looks like a real building)
      const ceilGeo = new THREE.PlaneGeometry(IW, f2Depth);
      const ceilMat = new THREE.MeshPhongMaterial({ color: 0xe8e4e0, flatShading: true, side: THREE.DoubleSide });
      const ceil = new THREE.Mesh(ceilGeo, ceilMat);
      ceil.rotation.x = -Math.PI / 2;
      ceil.position.set(IW / 2, F2H + wHeight, f2Depth / 2);
      this.f2Group.add(ceil);

      // Glass railing at the platform lobby edge
      const railGeo = new THREE.BoxGeometry(IW * 0.7, 12, 3);
      const railMat = new THREE.MeshPhysicalMaterial({ color: 0x88ccdd, transparent: true, opacity: 0.3 });
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(IW / 2, F2H + 6, f2Depth);
      this.f2Group.add(rail);
      this.indoorCollidersF2.push({ xMin: IW * 0.15, xMax: IW * 0.85, zMin: f2Depth - 2, zMax: f2Depth + 2 });

      // Support columns (6 gold columns under F2 deck)
      const pillarGeo = new THREE.CylinderGeometry(4, 4, F2H, 8);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0xbf9b30, metalness: 0.7, roughness: 0.25 });
      const pillarPositions = [
        [40, f2Depth - 10], [IW / 2, f2Depth - 10], [IW - 40, f2Depth - 10],
        [40, 20], [IW - 40, 20]
      ];
      pillarPositions.forEach(([px, pz]) => {
        const p = new THREE.Mesh(pillarGeo, pillarMat);
        p.position.set(px, F2H / 2, pz);
        p.castShadow = true;
        this.indoorGroup.add(p);
      });

      // --- GRAND STAIRCASE (visible, wide, with handrails) ---
      // Located at left side (x: 20→100), rising from z: f2Depth+50 down to z: f2Depth-50
      // From y:0 to y:F2H over ~20 steps
      const stairW = 80;
      const stairSteps = 16;
      const stairStartZ = f2Depth + 60; // bottom of stairs (near lobby)
      const stairEndZ = f2Depth - 20; // top of stairs (on F2 deck edge)
      const stairCenterX = 70;
      const stepDepth = (stairStartZ - stairEndZ) / stairSteps;
      const stepRise = F2H / stairSteps;

      const stepGeo = new THREE.BoxGeometry(stairW, 3, stepDepth + 1);
      const stepMat = new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.5 });
      const stepSideMat = new THREE.MeshStandardMaterial({ color: 0x6b5010, roughness: 0.6 });

      for (let s = 0; s < stairSteps; s++) {
        const step = new THREE.Mesh(stepGeo, stepMat);
        const sz = stairStartZ - s * stepDepth;
        const sy = s * stepRise + stepRise / 2;
        step.position.set(stairCenterX, sy, sz);
        step.castShadow = true;
        step.receiveShadow = true;
        this.indoorGroup.add(step);
      }

      // Stair side walls (risers/stringers)
      const stringerGeo = new THREE.BoxGeometry(3, F2H + 10, stairStartZ - stairEndZ + 10);
      const stringerL = new THREE.Mesh(stringerGeo, stepSideMat);
      stringerL.position.set(stairCenterX - stairW / 2 - 1.5, F2H / 2, (stairStartZ + stairEndZ) / 2);
      this.indoorGroup.add(stringerL);

      const stringerR = stringerL.clone();
      stringerR.position.x = stairCenterX + stairW / 2 + 1.5;
      this.indoorGroup.add(stringerR);

      // Metal handrails
      const handrailMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.1 });

      // Left handrail — series of vertical posts + top rail
      for (let h = 0; h <= 5; h++) {
        const postGeo = new THREE.CylinderGeometry(0.8, 0.8, 12, 6);
        const post = new THREE.Mesh(postGeo, handrailMat);
        const t = h / 5;
        post.position.set(
          stairCenterX - stairW / 2 - 1.5,
          t * F2H + 6,
          stairStartZ - t * (stairStartZ - stairEndZ)
        );
        this.indoorGroup.add(post);
      }
      // Right handrail posts
      for (let h = 0; h <= 5; h++) {
        const postGeo = new THREE.CylinderGeometry(0.8, 0.8, 12, 6);
        const post = new THREE.Mesh(postGeo, handrailMat);
        const t = h / 5;
        post.position.set(
          stairCenterX + stairW / 2 + 1.5,
          t * F2H + 6,
          stairStartZ - t * (stairStartZ - stairEndZ)
        );
        this.indoorGroup.add(post);
      }

      this.createBillboardSprite(stairCenterX, 30, stairStartZ + 15, '↑ ESCALERAS AL PISO 2', this.indoorGroup);

      // Save stair zone bounds for physics
      this.stairBounds = {
        xMin: stairCenterX - stairW / 2 - 5,
        xMax: stairCenterX + stairW / 2 + 5,
        zMin: stairEndZ - 5,
        zMax: stairStartZ + 5,
        yTop: F2H,
        zTop: stairEndZ,
        zBottom: stairStartZ
      };
    } else {
      this.stairBounds = null;
    }

    // 7. Interactive Cognitive Hologram Quiz Pedestal Console
    const consoleY = letter === 'G' ? 0 : F2H;
    const termGroup = new THREE.Group();
    termGroup.position.set(IW / 2, consoleY, ID * 0.35);

    // Metallic Base Plate
    const baseGeo = new THREE.CylinderGeometry(10, 12, 4, 8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x111e17, metalness: 0.8, roughness: 0.2 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 2;
    base.castShadow = true;
    termGroup.add(base);

    // Pillar Column
    const colGeo = new THREE.CylinderGeometry(2.5, 2.5, 18, 8);
    const colMat = new THREE.MeshStandardMaterial({ color: 0xbf9b30, metalness: 0.9, roughness: 0.1 });
    const col = new THREE.Mesh(colGeo, colMat);
    col.position.y = 11;
    col.castShadow = true;
    termGroup.add(col);

    // Angled holographic monitor panel
    const headGeo = new THREE.BoxGeometry(15, 3.5, 11);
    const head = new THREE.Mesh(headGeo, baseMat);
    head.position.set(0, 20.5, 0);
    head.rotation.x = 0.35;
    termGroup.add(head);

    // Wireframe emerald projection beam
    const holoGeo = new THREE.ConeGeometry(7, 14, 4, 1, true);
    const holoMat = new THREE.MeshBasicMaterial({
      color: 0x00ffaa,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      wireframe: true
    });
    const holo = new THREE.Mesh(holoGeo, holoMat);
    holo.position.set(0, 29, 0);
    holo.rotation.x = Math.PI;
    termGroup.add(holo);

    // Spin 3D Hologram brain
    const symGeo = new THREE.IcosahedronGeometry(3.5, 0);
    const symMat = new THREE.MeshBasicMaterial({ color: 0xbf9b30, wireframe: true });
    const sym = new THREE.Mesh(symGeo, symMat);
    sym.position.set(0, 29, 0);
    sym.name = "holoBrain";
    termGroup.add(sym);

    this.indoorGroup.add(termGroup);

    // Pedestal bounds
    const qx = IW / 2, qz = ID * 0.35;
    const activeColliders = consoleY > 20 ? this.indoorCollidersF2 : this.indoorCollidersF1;
    activeColliders.push({ xMin: qx - 14, xMax: qx + 14, zMin: qz - 14, zMax: qz + 14 });

    // Interactive Trigger
    this.indoorPropsList.push({
      x: qx, z: qz + 25, r: 30,
      label: 'RETO ACADÉMICO [E]',
      action: () => {
        if (window.gameApp.solvedQuizzes.has(letter)) {
          const lines = [
            "¡Ya has completado con éxito este quiz y tienes tu premio en la mochila!",
            "Puedes volver a responder las preguntas para repasar tus conocimientos si lo deseas."
          ];
          showDialogue('Terminal de Quizz', '🧠', lines, () => {
            window.startQuiz(letter);
          });
        } else {
          window.startQuiz(letter);
        }
      }
    });

    this.createBillboardSprite(qx, consoleY + 42, qz, 'TERMINAL DE QUIZZ', this.indoorGroup);

    // 8. Build specific Room interior items for BOTH floors simultaneously!
    this.buildIndoorProps(letter);
  }

  buildIndoorProps(letter) {
    const wallMat = new THREE.MeshPhongMaterial({ color: 0xf0ece4, flatShading: true });
    const propMat = new THREE.MeshPhongMaterial({ color: 0xbf9b30, flatShading: true });
    const pcMat = new THREE.MeshPhongMaterial({ color: 0x222222, flatShading: true });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x4ee2ec });
    const woodMat = new THREE.MeshPhongMaterial({ color: 0x8b6914, flatShading: true });

    const f1Y = 0;
    const f2Y = this.indoorF2Height || 50;
    const IW = this.indoorWidth || 600;
    const ID = this.indoorDepth || 400;

    if (letter === 'A') {
      // ZONA A (Edificio Académico - ITI, Mecatrónica, Industrial)
      // ==========================================
      // --- PISO 1: COMPUTO Y ROBÓTICA ---
      // ==========================================
      const divider = new THREE.Mesh(new THREE.BoxGeometry(4, 60, 180), wallMat);
      divider.position.set(150, f1Y + 30, 90);
      this.indoorGroup.add(divider);
      this.indoorCollidersF1.push({ xMin: 147, xMax: 153, zMin: 0, zMax: 180 });

      // Classroom ITI Left: desks with computers
      const columns = 2, rows = 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
          const px = 40 + c * 60;
          const pz = 50 + r * 60;
          this.create3DDeskPC(px, pz, f1Y);
          
          // Spawn sitting student figures at the computer chairs
          this.createStaticFigure(px, f1Y, pz + 10, 'student', true);
        }
      }

      // Whiteboard for ITI
      this.createWhiteboard(70, f1Y + 18, 10, 50, 15, "ITI: Inteligencia Artificial\n- Redes Neuronales");
      
      // ITI Professor standing at the whiteboard
      this.createStaticFigure(40, f1Y, 18, 'professor');

      this.indoorPropsList.push({
        x: 70, z: 80, r: 40,
        label: 'Aulas de Ingeniería (ITI) [E]',
        action: () => { if (this.player.position.y < 25) openBuildingPanel('A'); }
      });

      // Robotics Classroom Right: Mechatronic Arm Workbench
      const table = new THREE.Mesh(new THREE.BoxGeometry(60, 10, 35), new THREE.MeshPhongMaterial({ color: 0x5c4033, flatShading: true }));
      table.position.set(230, f1Y + 5, 80);
      table.castShadow = true;
      this.indoorGroup.add(table);
      this.indoorCollidersF1.push({ xMin: 200, xMax: 260, zMin: 62, zMax: 98 });

      // Articulated robotic arm
      const armGroup = new THREE.Group();
      armGroup.position.set(230, f1Y + 10, 80);
      
      const armBase = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 4, 8), pcMat);
      armGroup.add(armBase);

      const segment1 = new THREE.Mesh(new THREE.BoxGeometry(3, 14, 3), propMat);
      segment1.position.set(0, 7, 0);
      segment1.rotation.z = 0.45;
      armGroup.add(segment1);

      const segment2 = new THREE.Mesh(new THREE.BoxGeometry(2, 11, 2), new THREE.MeshPhongMaterial({ color: 0x8b0000, flatShading: true }));
      segment2.position.set(4, 16, 0);
      segment2.rotation.z = -0.7;
      armGroup.add(segment2);

      this.indoorGroup.add(armGroup);
      
      // Robotics Whiteboard
      this.createWhiteboard(230, f1Y + 18, 10, 50, 15, "Mecatronica: Robotica\n- Automatizacion de Procesos");
      
      // Robotics Professor and student onlooker
      this.createStaticFigure(200, f1Y, 20, 'professor');
      this.createStaticFigure(230, f1Y, 95, 'student', true);

      this.indoorPropsList.push({
        x: 230, z: 110, r: 35,
        label: 'Clases de Robótica y Automatización [E]',
        action: () => { if (this.player.position.y < 25) openBuildingPanel('A'); }
      });

      this.createBillboardSprite(70, f1Y + 32, 10, 'Innovación Digital (P1)', this.indoorGroup);
      this.createBillboardSprite(230, f1Y + 32, 10, 'Mecatrónica / Industrial (P1)', this.indoorGroup);

      // ==========================================
      // --- PISO 2: AULAS TEÓRICAS ---
      // ==========================================
      this.createBillboardSprite(150, f2Y + 36, 10, 'Aulas de Teoría e Ingeniería (P2)', this.indoorGroup);

      // Render classroom study desks
      const deskCoords = [
        { x: 90, z: 80 }, { x: 90, z: 140 },
        { x: 210, z: 80 }, { x: 210, z: 140 }
      ];

      deskCoords.forEach(c => {
        const desk = new THREE.Mesh(new THREE.BoxGeometry(30, 8, 15), woodMat);
        desk.position.set(c.x, f2Y + 4, c.z);
        desk.castShadow = true;
        this.indoorGroup.add(desk);
        this.indoorCollidersF2.push({ xMin: c.x - 16, xMax: c.x + 16, zMin: c.z - 9, zMax: c.z + 9 });

        // Chairs
        const chair = new THREE.Mesh(new THREE.BoxGeometry(8, 10, 8), pcMat);
        chair.position.set(c.x, f2Y + 5, c.z + 10);
        this.indoorGroup.add(chair);

        // Sitting students on Floor 2
        this.createStaticFigure(c.x, f2Y, c.z + 10, 'student', true);
      });

      // Blackboard at the North Wall
      this.createWhiteboard(150, f2Y + 22, 10, 70, 18, "Calculo Diferencial e Integral\n- dy/dx = lim(h->0)...");
      
      // Theoretical Math Professor
      this.createStaticFigure(110, f2Y, 18, 'professor');

      this.indoorPropsList.push({
        x: 150, z: 80, r: 40,
        label: 'Plan de Estudios Académicos [E]',
        action: () => { if (this.player.position.y > 25) openBuildingPanel('A'); }
      });

    } else if (letter === 'B') {
      // ZONA B (Servicios Escolares / Control Escolar)
      // ==========================================
      // --- PISO 1: VENTANILLA DE ATENCIÓN ---
      // ==========================================
      const counter = new THREE.Mesh(new THREE.BoxGeometry(110, 12, 14), woodMat);
      counter.position.set(150, f1Y + 6, 120);
      counter.castShadow = true;
      this.indoorGroup.add(counter);
      this.indoorCollidersF1.push({ xMin: 95, xMax: 205, zMin: 113, zMax: 127 });
      
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(35, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }));
      sign.position.set(150, f1Y + 7, 127.2);
      this.indoorGroup.add(sign);

      // School services whiteboard
      this.createWhiteboard(150, f1Y + 18, 10, 60, 15, "Atencion Escolar\n- Becas, Inscripcion y Tramites");

      // Staff (Guard/Tutor role) standing behind the counter
      this.createStaticFigure(150, f1Y, 110, 'guard');
      
      // Students waiting at the service window
      this.createStaticFigure(120, f1Y, 140, 'student');
      this.createStaticFigure(180, f1Y, 145, 'student');

      // Notice Board
      const board = new THREE.Mesh(new THREE.BoxGeometry(45, 30, 2), woodMat);
      board.position.set(60, f1Y + 25, 4);
      this.indoorGroup.add(board);

      const doc = new THREE.Mesh(new THREE.PlaneGeometry(16, 22), new THREE.MeshBasicMaterial({ color: 0xfffcf0 }));
      doc.position.set(60, f1Y + 25, 5.2);
      this.indoorGroup.add(doc);

      this.indoorPropsList.push({
        x: 60, z: 35, r: 40,
        label: 'Consultar Becas y Boletas [E]',
        action: () => { if (this.player.position.y < 25) openBuildingPanel('B'); }
      });

      this.indoorPropsList.push({
        x: 150, z: 145, r: 45,
        label: 'Iniciar Trámite Escolar [E]',
        action: () => { if (this.player.position.y < 25) openBuildingPanel('B'); }
      });

      // ==========================================
      // --- PISO 2: ASESORÍA Y TUTORÍAS ---
      // ==========================================
      this.createBillboardSprite(150, f2Y + 36, 10, 'Oficinas de Vinculación y Tutorías (P2)', this.indoorGroup);

      // Partition office desks
      const officeCoords = [
        { x: 90, z: 80, label: 'Tutorías' },
        { x: 210, z: 80, label: 'Vinculación' }
      ];

      officeCoords.forEach(o => {
        // Desk
        const desk = new THREE.Mesh(new THREE.BoxGeometry(40, 8, 20), new THREE.MeshPhongMaterial({ color: 0x7f8c8d }));
        desk.position.set(o.x, f2Y + 4, o.z);
        this.indoorGroup.add(desk);
        this.indoorCollidersF2.push({ xMin: o.x - 22, xMax: o.x + 22, zMin: o.z - 11, zMax: o.z + 11 });

        // PC
        const pc = new THREE.Mesh(new THREE.BoxGeometry(8, 7, 2), pcMat);
        pc.position.set(o.x, f2Y + 11, o.z - 4);
        this.indoorGroup.add(pc);

        const scr = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 5.2), screenMat);
        scr.position.set(o.x, f2Y + 11, o.z - 2.9);
        this.indoorGroup.add(scr);

        // Divider Panel
        const divider = new THREE.Mesh(new THREE.BoxGeometry(42, 16, 2), wallMat);
        divider.position.set(o.x, f2Y + 12, o.z - 9);
        this.indoorGroup.add(divider);

        // Academic counselor static figure behind desk
        this.createStaticFigure(o.x, f2Y, o.z - 8, 'professor');
        
        // Student static figure sitting at counselor's desk
        this.createStaticFigure(o.x, f2Y, o.z + 10, 'student', true);

        this.createBillboardSprite(o.x, f2Y + 24, o.z, o.label, this.indoorGroup);
      });

      this.indoorPropsList.push({
        x: 150, z: 90, r: 45,
        label: 'Oficina de Apoyo Estudiantil [E]',
        action: () => { if (this.player.position.y > 25) openBuildingPanel('B'); }
      });

    } else if (letter === 'C') {
      // ZONA C (Biblioteca CID / Salas de Consulta)
      // ==========================================
      // --- PISO 1: ESTUDIO Y ESTANTERÍAS ---
      // ==========================================
      const tbl = new THREE.Mesh(new THREE.BoxGeometry(90, 8, 38), new THREE.MeshPhongMaterial({ color: 0x8b5a2b, flatShading: true }));
      tbl.position.set(150, f1Y + 4, 110);
      tbl.castShadow = true;
      this.indoorGroup.add(tbl);
      this.indoorCollidersF1.push({ xMin: 105, xMax: 195, zMin: 91, zMax: 129 });

      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 6, 6), new THREE.MeshBasicMaterial({ color: 0xbf9b30 }));
      lamp.position.set(150, f1Y + 11, 110);
      this.indoorGroup.add(lamp);

      const glow = new THREE.Mesh(new THREE.SphereGeometry(3.5, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffea88 }));
      glow.position.set(150, f1Y + 14, 110);
      this.indoorGroup.add(glow);

      const bkGeo = new THREE.BoxGeometry(4, 5, 2.5);
      const book1 = new THREE.Mesh(bkGeo, new THREE.MeshPhongMaterial({ color: 0x3498db, flatShading: true }));
      book1.rotation.y = 0.35;
      book1.position.set(130, f1Y + 8.5, 110);
      this.indoorGroup.add(book1);

      const book2 = new THREE.Mesh(bkGeo, new THREE.MeshPhongMaterial({ color: 0xe74c3c, flatShading: true }));
      book2.rotation.y = -0.55;
      book2.position.set(170, f1Y + 8.5, 105);
      this.indoorGroup.add(book2);

      // Bookcases Left and Right
      const bkCaseGeo = new THREE.BoxGeometry(8, 48, 80);
      const leftCase = new THREE.Mesh(bkCaseGeo, woodMat);
      leftCase.position.set(10, f1Y + 24, 80);
      this.indoorGroup.add(leftCase);
      this.indoorCollidersF1.push({ xMin: 0, xMax: 18, zMin: 40, zMax: 120 });

      const stripL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 4, 76), propMat);
      stripL.position.set(14.1, f1Y + 24, 80);
      this.indoorGroup.add(stripL);

      const rightCase = leftCase.clone();
      rightCase.position.x = 290;
      this.indoorGroup.add(rightCase);
      this.indoorCollidersF1.push({ xMin: 282, xMax: 300, zMin: 40, zMax: 120 });

      // Library Whiteboard
      this.createWhiteboard(150, f1Y + 18, 10, 60, 15, "CID: Biblioteca General\n- Fomento a la Lectura");

      // Librarian standing next to left shelf
      this.createStaticFigure(30, f1Y, 80, 'professor');
      
      // Reading students at the grand study desk
      this.createStaticFigure(120, f1Y, 110, 'student', true);
      this.createStaticFigure(180, f1Y, 110, 'student', true);

      this.indoorPropsList.push({
        x: 150, z: 140, r: 45,
        label: 'Revisar Catálogo CID [E]',
        action: () => { if (this.player.position.y < 25) openBuildingPanel('C'); }
      });

      // ==========================================
      // --- PISO 2: BIBLIOTECA DIGITAL ---
      // ==========================================
      this.createBillboardSprite(150, f2Y + 36, 10, 'Hemeroteca y Biblioteca Digital (P2)', this.indoorGroup);

      // Long wooden desk supporting search computers
      const longTable = new THREE.Mesh(new THREE.BoxGeometry(110, 8, 20), woodMat);
      longTable.position.set(150, f2Y + 4, 90);
      this.indoorGroup.add(longTable);
      this.indoorCollidersF2.push({ xMin: 90, xMax: 210, zMin: 78, zMax: 102 });

      // 3 Computer monitors on it
      for (let i = 0; i < 3; i++) {
        const pcX = 110 + i * 40;
        const pc = new THREE.Mesh(new THREE.BoxGeometry(8, 7, 2), pcMat);
        pc.position.set(pcX, f2Y + 11, 90);
        this.indoorGroup.add(pc);

        const scr = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 5.2), screenMat);
        scr.position.set(pcX, f2Y + 11, 91.1);
        this.indoorGroup.add(scr);

        // Sitting students at digital catalog computers
        if (i !== 1) { // i=0 and i=2 sitting
          this.createStaticFigure(pcX, f2Y, 100, 'student', true);
        }
      }

      // Potted foliage / indoor plant
      const plantGroup = new THREE.Group();
      plantGroup.position.set(250, f2Y, 80);
      
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(5, 4, 8, 8), pcMat);
      plantGroup.add(pot);
      
      const leaves = new THREE.Mesh(new THREE.SphereGeometry(7, 6, 6), new THREE.MeshPhongMaterial({ color: 0x008f5d, roughness: 0.9 }));
      leaves.position.y = 8;
      plantGroup.add(leaves);
      this.indoorGroup.add(plantGroup);

      this.indoorPropsList.push({
        x: 150, z: 110, r: 40,
        label: 'Consultar Revistas Digitales [E]',
        action: () => { if (this.player.position.y > 25) openBuildingPanel('C'); }
      });

    } else if (letter === 'D') {
      // ZONA D (Laboratorios / Química e Idiomas)
      // ==========================================
      // --- PISO 1: BIOTECNOLOGÍA Y QUÍMICA ---
      // ==========================================
      const benchL = new THREE.Mesh(new THREE.BoxGeometry(80, 10, 24), new THREE.MeshPhongMaterial({ color: 0x7f8c8d }));
      benchL.position.set(70, f1Y + 5, 100);
      benchL.castShadow = true;
      this.indoorGroup.add(benchL);
      this.indoorCollidersF1.push({ xMin: 30, xMax: 110, zMin: 88, zMax: 112 });

      const benchR = benchL.clone();
      benchR.position.x = 230;
      this.indoorGroup.add(benchR);
      this.indoorCollidersF1.push({ xMin: 190, xMax: 270, zMin: 88, zMax: 112 });

      // Chemistry Lab Whiteboards
      this.createWhiteboard(70, f1Y + 18, 50, 45, 14, "Lab Quimica General\n- H2O + CO2 -> H2CO3");
      this.createWhiteboard(230, f1Y + 18, 50, 45, 14, "Biotecnologia Celular\n- Cultivo de Organos");

      // Scientists wearing lab coat colors (scientist role = green lab coat)
      this.createStaticFigure(50, f1Y, 80, 'scientist');
      this.createStaticFigure(210, f1Y, 80, 'scientist');

      // Student watching lab experiments
      this.createStaticFigure(80, f1Y, 120, 'student');
      this.createStaticFigure(240, f1Y, 120, 'student');

      // Glass chemistry flasks
      const flaskL = new THREE.Mesh(
        new THREE.SphereGeometry(3.5, 8, 8),
        new THREE.MeshPhysicalMaterial({ color: 0x9b59b6, transparent: true, opacity: 0.8, transmission: 0.8, flatShading: true })
      );
      flaskL.position.set(60, f1Y + 12, 100);
      this.indoorGroup.add(flaskL);

      const flaskR = new THREE.Mesh(
        new THREE.SphereGeometry(3.5, 8, 8),
        new THREE.MeshPhysicalMaterial({ color: 0x2ecc71, transparent: true, opacity: 0.8, transmission: 0.8, flatShading: true })
      );
      flaskR.position.set(240, f1Y + 12, 100);
      this.indoorGroup.add(flaskR);

      this.createBillboardSprite(70, f1Y + 22, 100, 'Química General', this.indoorGroup);
      this.createBillboardSprite(230, f1Y + 22, 100, 'Biotecnología Celular', this.indoorGroup);

      this.indoorPropsList.push({
        x: 70, z: 125, r: 40,
        label: 'Prácticas de Biotecnología [E]',
        action: () => { if (this.player.position.y < 25) openBuildingPanel('D'); }
      });

      // ==========================================
      // --- PISO 2: CENTRO DE IDIOMAS ---
      // ==========================================
      // Idiomas Whiteboard
      this.createWhiteboard(150, f2Y + 22, 10, 70, 16, "English Language Center\n- TOEFL & Cambridge Prep");

      // Language Professor and sitting students wearing headphone desks
      this.createStaticFigure(110, f2Y, 18, 'professor');

      // Audio desks rows
      const deskCoords = [
        { x: 90, z: 80 }, { x: 90, z: 130 },
        { x: 210, z: 80 }, { x: 210, z: 130 }
      ];

      deskCoords.forEach(c => {
        const desk = new THREE.Mesh(new THREE.BoxGeometry(26, 8, 16), new THREE.MeshPhongMaterial({ color: 0x7f8c8d }));
        desk.position.set(c.x, f2Y + 4, c.z);
        this.indoorGroup.add(desk);
        this.indoorCollidersF2.push({ xMin: c.x - 14, xMax: c.x + 14, zMin: c.z - 9, zMax: c.z + 9 });

        // Resting Headphone model
        const headp = new THREE.Group();
        headp.position.set(c.x, f2Y + 8.5, c.z);
        
        const band = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.4, 8, 1, true), pcMat);
        band.rotation.z = Math.PI / 2;
        headp.add(band);
        
        const cupL = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.8, 8), propMat);
        cupL.position.set(-2, 0, 0);
        cupL.rotation.z = Math.PI / 2;
        headp.add(cupL);
        
        const cupR = cupL.clone();
        cupR.position.set(2, 0, 0);
        headp.add(cupR);

        this.indoorGroup.add(headp);

        // Sitting student attending English class
        this.createStaticFigure(c.x, f2Y, c.z + 6, 'student', true);
      });

      this.indoorPropsList.push({
        x: 150, z: 100, r: 40,
        label: 'Taller de Certificación de Idiomas [E]',
        action: () => { if (this.player.position.y > 25) openBuildingPanel('D'); }
      });

    } else if (letter === 'E') {
      // ZONA E (Principal / Cafetería y Rectoría)
      // ==========================================
      // --- PISO 1: CAFETERÍA GENERAL ---
      // ==========================================
      // Cafeteria menu board
      this.createWhiteboard(150, f1Y + 22, 10, 60, 16, "Menu Halcones UPVT\n- Comidas, Snacks y Bebidas");

      // Chef standing behind the serving counter
      this.createStaticFigure(150, f1Y, 78, 'chef');

      // Food counter serving desk
      const counter = new THREE.Mesh(new THREE.BoxGeometry(100, 10, 18), woodMat);
      counter.position.set(150, f1Y + 5, 90);
      counter.castShadow = true;
      this.indoorGroup.add(counter);
      this.indoorCollidersF1.push({ xMin: 95, xMax: 205, zMin: 80, zMax: 100 });

      // Low-poly cash register
      const reg = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 8), pcMat);
      reg.position.set(150, f1Y + 12.5, 90);
      this.indoorGroup.add(reg);

      // Dining tables
      const tableCoords = [
        { x: 70, z: 150 }, { x: 230, z: 150 }
      ];

      tableCoords.forEach(t => {
        const tbl = new THREE.Mesh(new THREE.BoxGeometry(26, 6, 26), propMat);
        tbl.position.set(t.x, f1Y + 3, t.z);
        this.indoorGroup.add(tbl);
        this.indoorCollidersF1.push({ xMin: t.x - 14, xMax: t.x + 14, zMin: t.z - 14, zMax: t.z + 14 });

        const leg = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 6, 6), new THREE.MeshStandardMaterial({ color: 0x7f8c8d, metalness: 0.8 }));
        leg.position.set(t.x, f1Y + 3, t.z);
        this.indoorGroup.add(leg);

        // Sitting students eating at cafeteria tables
        this.createStaticFigure(t.x, f1Y, t.z + 8, 'student', true);
      });

      this.indoorPropsList.push({
        x: 150, z: 115, r: 40,
        label: 'Conversar con Chefcito de la Cafetería [E]',
        action: () => { if (this.player.position.y < 25) openBuildingPanel('E'); }
      });

      // ==========================================
      // --- PISO 2: OFICINA DE RECTORÍA ---
      // ==========================================
      // Strategy planning whiteboard
      this.createWhiteboard(150, f2Y + 22, 10, 70, 16, "UPVT Rectoría: Planeacion 2030\n- Desarrollo Academico y Tecnologico");

      // Rector figure standing behind the executive desk
      this.createStaticFigure(150, f2Y, 78, 'professor');
      
      // Visitor student sitting in front of rector desk
      this.createStaticFigure(150, f2Y, 118, 'student', true);

      const exDesk = new THREE.Mesh(new THREE.BoxGeometry(110, 11, 40), woodMat);
      exDesk.position.set(150, f2Y + 5.5, 90);
      exDesk.castShadow = true;
      this.indoorGroup.add(exDesk);
      this.indoorCollidersF2.push({ xMin: 95, xMax: 205, zMin: 70, zMax: 110 });

      // Institutional gold pillars
      const pillarGeo = new THREE.CylinderGeometry(5, 5, 60, 8);
      const pillarL = new THREE.Mesh(pillarGeo, propMat);
      pillarL.position.set(60, f2Y + 30, 30);
      pillarL.castShadow = true;
      this.indoorGroup.add(pillarL);

      const pillarR = pillarL.clone();
      pillarR.position.x = 240;
      this.indoorGroup.add(pillarR);

      this.indoorPropsList.push({
        x: 150, z: 125, r: 45,
        label: 'Hablar con Planeación y Rectoría [E]',
        action: () => { if (this.player.position.y > 25) openBuildingPanel('E'); }
      });

    } else if (letter === 'F') {
      // ZONA F (Canchas y Vestidores)
      // ==========================================
      // --- PISO 1: VESTIDORES Y ACCESOS ---
      // ==========================================
      // Sports Director standing
      this.createStaticFigure(150, f1Y, 80, 'professor');

      const gymnBench = new THREE.Mesh(new THREE.BoxGeometry(80, 5, 12), propMat);
      gymnBench.position.set(150, f1Y + 3, 100);
      this.indoorGroup.add(gymnBench);
      this.indoorCollidersF1.push({ xMin: 110, xMax: 190, zMin: 94, zMax: 106 });

      // Trophy Cabinet
      const cab = new THREE.Mesh(new THREE.BoxGeometry(45, 36, 6), new THREE.MeshPhongMaterial({ color: 0x22362b, flatShading: true }));
      cab.position.set(60, f1Y + 18, 4);
      this.indoorGroup.add(cab);

      const cup = new THREE.Mesh(new THREE.CylinderGeometry(3, 1, 6, 8), propMat);
      cup.position.set(60, f1Y + 18, 5.5);
      this.indoorGroup.add(cup);

      this.createBillboardSprite(150, f1Y + 16, 100, 'Vestidores y Vestíbulo Deportivo', this.indoorGroup);

      this.indoorPropsList.push({
        x: 150, z: 125, r: 40,
        label: 'Consultar Actividades Extracurriculares [E]',
        action: () => { if (this.player.position.y < 25) openBuildingPanel('F'); }
      });

      // ==========================================
      // --- PISO 2: GIMNASIO UNIVERSITARIO ---
      // ==========================================
      // Gym board
      this.createWhiteboard(150, f2Y + 22, 10, 60, 16, "Gimnasio Halcones UPVT\n- Acondicionamiento Fisico y Salud");

      // Coach standing next to dumbbells rack
      this.createStaticFigure(80, f2Y, 80, 'professor');

      // Dumbbells rack
      const rack = new THREE.Mesh(new THREE.BoxGeometry(60, 8, 14), pcMat);
      rack.position.set(80, f2Y + 4, 100);
      this.indoorGroup.add(rack);
      this.indoorCollidersF2.push({ xMin: 48, xMax: 112, zMin: 92, zMax: 108 });

      // Small spherical weight meshes on rack
      for (let i = 0; i < 4; i++) {
        const w = new THREE.Mesh(new THREE.SphereGeometry(2.5, 6, 6), new THREE.MeshBasicMaterial({ color: 0x7f8c8d }));
        w.position.set(56 + i * 16, f2Y + 9.5, 100);
        this.indoorGroup.add(w);
      }

      // Cardio exercise mats on Floor (slabs)
      for (let j = 0; j < 3; j++) {
        const mat = new THREE.Mesh(new THREE.BoxGeometry(15, 0.4, 28), new THREE.MeshBasicMaterial({ color: 0x2980B9 }));
        mat.position.set(160 + j * 30, f2Y + 0.2, 100);
        this.indoorGroup.add(mat);

        // Spawn students sitting/exercising on mats
        this.createStaticFigure(160 + j * 30, f2Y, 100, 'student', true);
      }

      this.indoorPropsList.push({
        x: 150, z: 130, r: 40,
        label: 'Préstamo de Material Deportivo [E]',
        action: () => { if (this.player.position.y > 25) openBuildingPanel('F'); }
      });

    } else if (letter === 'G') {
      // ZONA G (Entrada Principal / Caseta de Seguridad - Single Floor)
      const scr = new THREE.Mesh(new THREE.BoxGeometry(50, 10, 18), new THREE.MeshPhongMaterial({ color: 0x2c3e50, flatShading: true }));
      scr.position.set(150, f1Y + 5, 80);
      this.indoorGroup.add(scr);
      this.indoorCollidersF1.push({ xMin: 125, xMax: 175, zMin: 71, zMax: 89 });

      // Security guard figure watching screens
      this.createStaticFigure(150, f1Y, 95, 'guard');

      // Surveillance Monitor displays
      const mon = new THREE.Mesh(new THREE.PlaneGeometry(32, 20), new THREE.MeshBasicMaterial({ color: 0x27ae60 }));
      mon.position.set(150, f1Y + 24, 3.2);
      this.indoorGroup.add(mon);

      this.createBillboardSprite(150, f1Y + 18, 80, 'Centro de Monitoreo General', this.indoorGroup);

      this.indoorPropsList.push({
        x: 150, z: 110, r: 40,
        label: 'Revisar Mapa General [E]',
        action: () => openBuildingPanel('G')
      });
    }
  }

  create3DDeskPC(x, z, yOffset = 0) {
    // Group desk and PC
    const group = new THREE.Group();
    group.position.set(x, yOffset, z);

    // Desk
    const dMat = new THREE.MeshPhongMaterial({ color: 0x5c4033, flatShading: true });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(32, 8, 14), dMat);
    desk.position.y = 4;
    desk.castShadow = true;
    group.add(desk);

    // PC Monitor
    const pcMat = new THREE.MeshPhongMaterial({ color: 0x111e17, flatShading: true });
    const mon = new THREE.Mesh(new THREE.BoxGeometry(10, 7, 2), pcMat);
    mon.position.set(0, 11, 0);
    mon.castShadow = true;
    group.add(mon);

    // Cyan glowing screen panel
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(9, 6), new THREE.MeshBasicMaterial({ color: 0x4ee2ec }));
    scr.position.set(0, 11, 1.1);
    group.add(scr);

    this.indoorGroup.add(group);
    
    // Save collision box for desk in appropriate list
    const activeColliders = yOffset > 20 ? this.indoorCollidersF2 : this.indoorCollidersF1;
    activeColliders.push({
      xMin: x - 18,
      xMax: x + 18,
      zMin: z - 9,
      zMax: z + 9
    });
  }

  createIndoorBillboard(x, y, z, text) {
    this.createBillboardSprite(x, y, z, text, this.indoorGroup);
  }

  createStaticFigure(x, y, z, role = 'student', isSitting = false) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    let bodyColor = 0x3498db; // student light blue
    if (role === 'professor') bodyColor = 0x9b59b6; // purple professor
    if (role === 'chef') bodyColor = 0xf1f2f6; // white chef
    if (role === 'guard') bodyColor = 0x34495e; // dark security guard
    if (role === 'scientist') bodyColor = 0x1abc9c; // green lab coat scientist

    const bodyMat = new THREE.MeshPhongMaterial({ color: bodyColor, flatShading: true });
    const skinMat = new THREE.MeshPhongMaterial({ color: 0xffdbac, flatShading: true });
    const hairMat = new THREE.MeshPhongMaterial({ color: 0x2c3e50, flatShading: true });

    // Torso
    const bodyHeight = isSitting ? 5 : 9;
    const body = new THREE.Mesh(new THREE.BoxGeometry(5, bodyHeight, 4), bodyMat);
    body.position.y = bodyHeight / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 8), skinMat);
    head.position.y = bodyHeight + 2;
    head.castShadow = true;
    group.add(head);

    // Hair
    const hair = new THREE.Mesh(new THREE.SphereGeometry(2.1, 6, 6), hairMat);
    hair.position.set(0, bodyHeight + 2.5, -0.2);
    group.add(hair);

    // Arm Left
    const armGeo = new THREE.BoxGeometry(1.2, 5, 1.2);
    const armL = new THREE.Mesh(armGeo, bodyMat);
    armL.position.set(-3.1, bodyHeight - 2.5, 0);
    group.add(armL);

    // Arm Right (pointing or idle)
    const armR = armL.clone();
    armR.position.x = 3.1;
    if (role === 'professor') {
      // Pointing up at the board
      armR.rotation.z = Math.PI / 2.5;
      armR.position.set(3.5, bodyHeight - 1, 0.5);
    }
    group.add(armR);

    // Legs
    if (!isSitting) {
      const legGeo = new THREE.BoxGeometry(1.6, 5, 1.6);
      const legL = new THREE.Mesh(legGeo, bodyMat);
      legL.position.set(-1.3, -2.5, 0);
      group.add(legL);

      const legR = legL.clone();
      legR.position.x = 1.3;
      group.add(legR);
    } else {
      // Sitting knees bent forward
      const kneeGeo = new THREE.BoxGeometry(1.6, 1.6, 4);
      const kneeL = new THREE.Mesh(kneeGeo, bodyMat);
      kneeL.position.set(-1.3, 1, 2);
      group.add(kneeL);

      const kneeR = kneeL.clone();
      kneeR.position.x = 1.3;
      group.add(kneeR);
    }

    this.indoorGroup.add(group);
  }

  createWhiteboard(x, y, z, width, height, text) {
    const boardMat = new THREE.MeshPhongMaterial({ color: 0xffffff, roughness: 0.5 });
    const frameMat = new THREE.MeshPhongMaterial({ color: 0x7f8c8d });
    
    // Board mesh
    const board = new THREE.Mesh(new THREE.BoxGeometry(width, height, 1), boardMat);
    board.position.set(x, y, z);
    board.castShadow = true;
    this.indoorGroup.add(board);
    
    // Frame mesh
    const frame = new THREE.Mesh(new THREE.BoxGeometry(width + 2, height + 2, 0.8), frameMat);
    frame.position.set(x, y, z - 0.2);
    frame.castShadow = true;
    this.indoorGroup.add(frame);
    
    // Billboard text centered in front
    this.createIndoorBillboard(x, y + 1, z + 1, text);
  }

  // ==========================================
  // TICK LOOP & ANIMATION ENGINE (60 FPS)
  // ==========================================
  animate() {
    requestAnimationFrame(() => this.animate());

    const time = performance.now();

    // 1. Process Movements
    this.handleMovement(time);

    // 2. Proximity and Touch Interaction Overlaps
    this.handleProximityCheck();

    // 3. Smooth Camera Follow
    this.updateCamera();

    // Animate Central Fountain water jets!
    if (this.fountainJets) {
      const pulseTime = time * 0.005;
      this.fountainJets.forEach((jet, idx) => {
        jet.position.y = 12 + Math.sin(pulseTime + idx * 0.8) * 3;
        const scale = 0.8 + Math.cos(pulseTime + idx * 0.8) * 0.3;
        jet.scale.set(scale, scale, scale);
      });
    }

    // Gentle tree sway wind simulation!
    if (!this.isIndoor && this.outdoorTrees) {
      const swayTime = time * 0.0015;
      this.outdoorTrees.forEach((tree, idx) => {
        tree.rotation.z = Math.sin(swayTime + idx * 0.5) * 0.025;
        tree.rotation.x = Math.cos(swayTime + idx * 0.5) * 0.015;
      });
    }

    // Holographic Quiz Terminal floating console brain animation!
    if (this.isIndoor) {
      const holoBrain = this.indoorGroup.getObjectByName("holoBrain");
      if (holoBrain) {
        holoBrain.rotation.y = time * 0.001;
        holoBrain.rotation.x = time * 0.0005;
        holoBrain.position.y = 29 + Math.sin(time * 0.003) * 1.2;
      }
    }

    // 4. Render
    this.renderer.render(this.scene, this.camera);

    // 5. Update HUD Mini-Map
    this.updateMiniMapBlip();
  }

  handleMovement(time) {
    let moveX = 0;
    let moveZ = 0;

    if (this.keys.w) moveZ = -this.playerSpeed;
    if (this.keys.s) moveZ = this.playerSpeed;
    if (this.keys.a) moveX = -this.playerSpeed;
    if (this.keys.d) moveX = this.playerSpeed;

    if (moveX !== 0 && moveZ !== 0) {
      moveX *= 0.7071;
      moveZ *= 0.7071;
    }

    if (moveX !== 0 || moveZ !== 0) {
      this.targetPos = null;
      
      const nextX = this.player.position.x + moveX;
      const nextZ = this.player.position.z + moveZ;

      if (!this.checkCollisions(nextX, nextZ)) {
        this.player.position.x = nextX;
        this.player.position.z = nextZ;
      }

      const angle = Math.atan2(moveX, moveZ);
      this.player.rotation.y = angle;

      // Skeletal movements
      const swing = Math.sin(time * 0.015) * 0.75;
      this.leftLeg.rotation.x = swing;
      this.rightLeg.rotation.x = -swing;
      this.leftArm.rotation.x = -swing;
      this.rightArm.rotation.x = swing;
      this.torso.position.y = 11 + Math.abs(Math.sin(time * 0.03)) * 1.5;
    } else if (this.targetPos) {
      const dist = Math.hypot(this.targetPos.x - this.player.position.x, this.targetPos.z - this.player.position.z);
      
      if (dist < 8) {
        this.targetPos = null;
        this.resetPlayerPose();
      } else {
        const dx = (this.targetPos.x - this.player.position.x) / dist;
        const dz = (this.targetPos.z - this.player.position.z) / dist;

        const nextX = this.player.position.x + dx * this.playerSpeed;
        const nextZ = this.player.position.z + dz * this.playerSpeed;

        if (!this.checkCollisions(nextX, nextZ)) {
          this.player.position.x = nextX;
          this.player.position.z = nextZ;
          
          const angle = Math.atan2(dx, dz);
          this.player.rotation.y = angle;

          const swing = Math.sin(time * 0.015) * 0.75;
          this.leftLeg.rotation.x = swing;
          this.rightLeg.rotation.x = -swing;
          this.leftArm.rotation.x = -swing;
          this.rightArm.rotation.x = swing;
          this.torso.position.y = 11 + Math.abs(Math.sin(time * 0.03)) * 1.5;
        } else {
          this.targetPos = null;
          this.resetPlayerPose();
        }
      }
    } else {
      this.resetPlayerPose();
      this.head.position.y = 21 + Math.cos(time * 0.003) * 0.45;
      this.torso.scale.set(1, 1 + Math.sin(time * 0.003) * 0.02, 1);
    }

    // Vertical interior positioning for seamless stair climbing & gravity!
    if (this.isIndoor) {
      const px = this.player.position.x;
      const pz = this.player.position.z;
      const f2H = this.indoorF2Height || 50;
      const f2Depth = (this.indoorDepth || 400) * 0.6;
      
      if (this.stairBounds && this.indoorZone !== 'G') {
        const sb = this.stairBounds;
        // Stairs zone — smooth ramp physics
        if (px >= sb.xMin && px <= sb.xMax && pz >= sb.zMin && pz <= sb.zMax) {
          const progress = 1 - (pz - sb.zTop) / (sb.zBottom - sb.zTop);
          const targetY = Math.max(0, Math.min(f2H, progress * f2H));
          this.player.position.y += (targetY - this.player.position.y) * 0.2;
        } 
        // Floor 2 landing platform (z <= f2Depth)
        else if (pz <= f2Depth && this.player.position.y > f2H * 0.4) {
          this.player.position.y += (f2H - this.player.position.y) * 0.2;
        } 
        // Open lobby void or Floor 1 lands: gravity fall!
        else {
          this.player.position.y += (0 - this.player.position.y) * 0.2;
        }
      } else {
        // Caseta G stays on Floor 1
        this.player.position.y += (0 - this.player.position.y) * 0.2;
      }

      // --- FLOOR VISIBILITY TOGGLING ---
      // When player is on Floor 1 (y < f2H * 0.4), hide the F2 platform/deck
      // so it doesn't block the view. Show it when climbing or on Floor 2.
      if (this.f2Group) {
        const onFloor2 = this.player.position.y > f2H * 0.35;
        this.f2Group.visible = onFloor2;
      }
    } else {
      // Outdoor stays on ground level
      this.player.position.y = 0;
    }
  }

  resetPlayerPose() {
    this.leftLeg.rotation.x = 0;
    this.rightLeg.rotation.x = 0;
    this.leftArm.rotation.x = 0;
    this.rightArm.rotation.x = 0;
    this.torso.position.y = 11;
  }

  checkRectOverlap(px, pz, r, rx, rz, rw, rh) {
    const minX1 = px - r;
    const maxX1 = px + r;
    const minZ1 = pz - r;
    const maxZ1 = pz + r;

    const minX2 = rx - rw / 2;
    const maxX2 = rx + rw / 2;
    const minZ2 = rz - rh / 2;
    const maxZ2 = rz + rh / 2;

    return (minX1 < maxX2 && maxX1 > minX2 && minZ1 < maxZ2 && maxZ1 > minZ2);
  }

  // ==========================================
  // BULLETPROOF COLLISIONS ENGINE (INDOOR & OUTDOOR)
  // ==========================================
  checkCollisions(nextX, nextZ) {
    const r = 8; // player hitbox radius

    if (this.isIndoor) {
      // A. INDOOR Collision Check (600 x 400 grid)
      const IW = this.indoorWidth || 600;
      const ID = this.indoorDepth || 400;
      if (nextX < r + 4 || nextX > IW - r - 4 || nextZ < r + 4 || nextZ > ID - r - 4) {
        return true;
      }
      
      // Indoor partitioned walls and counters colliders based on player height
      const f2H = this.indoorF2Height || 50;
      const activeColliders = this.player.position.y > f2H * 0.5 ? this.indoorCollidersF2 : this.indoorCollidersF1;
      for (let i = 0; i < activeColliders.length; i++) {
        const c = activeColliders[i];
        if (nextX > c.xMin - r && nextX < c.xMax + r && nextZ > c.zMin - r && nextZ < c.zMax + r) {
          return true;
        }
      }
      return false;
    } else {
      // B. OUTDOOR Collision Check
      const outR = 15;
      if (nextX < outR || nextX > this.mapWidth - outR || nextZ < outR || nextZ > this.mapHeight - outR) {
        return true;
      }

      for (const key in CAMPUS_LAYOUT.zones) {
        const z = CAMPUS_LAYOUT.zones[key];
        if (key === 'A') {
          if (this.checkRectOverlap(nextX, nextZ, outR, z.wing1.x, z.wing1.y, z.wing1.w, z.wing1.h)) return true;
          if (this.checkRectOverlap(nextX, nextZ, outR, z.wing2.x, z.wing2.y, z.wing2.w, z.wing2.h)) return true;
        } else if (key === 'E') {
          if (this.checkRectOverlap(nextX, nextZ, outR, z.x, z.y + 100, 380, 100)) return true;
          if (this.checkRectOverlap(nextX, nextZ, outR, z.x - 140, z.y - 50, 100, 200)) return true;
          if (this.checkRectOverlap(nextX, nextZ, outR, z.x + 140, z.y - 50, 100, 200)) return true;
        } else if (key === 'G') {
          const dist = Math.hypot(nextX - z.x, nextZ - z.y);
          if (dist < (z.solidW / 2) + outR) return true;
        } else {
          if (this.checkRectOverlap(nextX, nextZ, outR, z.x, z.y, z.solidW, z.solidH)) return true;
        }
      }

      const inv = CAMPUS_LAYOUT.greenhouses;
      if (this.checkRectOverlap(nextX, nextZ, outR, inv.x + inv.w/2, inv.y + inv.h/2, inv.w, inv.h)) return true;

      return false;
    }
  }

  // ==========================================
  // PROXIMITY AND TOUCH ACTIONS SYNC
  // ==========================================
  handleProximityCheck() {
    const px = this.player.position.x;
    const pz = this.player.position.z;

    let nearestBuilding = null;
    let nearestNPC = null;
    let nearestIndoorProp = null;

    if (this.isIndoor) {
      // A. INDOOR Proximity Calculations
      // Check proximity to Exit Portal (center south of building)
      const IW = this.indoorWidth || 600;
      const ID = this.indoorDepth || 400;
      const distToExit = Math.hypot(px - IW / 2, pz - (ID - 30));
      if (distToExit < 40) {
        nearestIndoorProp = {
          name: 'SALIR AL CAMPUS',
          action: () => this.leaveIndoor()
        };
      }

      // Check proximity to specific desk triggers in the room
      this.indoorPropsList.forEach(prop => {
        const dist = Math.hypot(px - prop.x, pz - prop.z);
        if (dist < prop.r) {
          nearestIndoorProp = prop;
        }
      });

      this.overlappingIndoorProp = nearestIndoorProp;
      this.overlappingBuilding = null;
      this.overlappingNPC = null;
    } else {
      // B. OUTDOOR Proximity Calculations
      for (const key in CAMPUS_LAYOUT.zones) {
        const z = CAMPUS_LAYOUT.zones[key];
        let triggerX = z.x;
        let triggerZ = z.y + z.solidH/2 + 20;

        if (key === 'A') {
          triggerX = z.x;
          triggerZ = z.y + 110;
        } else if (key === 'E') {
          triggerX = z.x;
          triggerZ = z.y + 160;
        } else if (key === 'G') {
          triggerX = z.x;
          triggerZ = z.y;
        }

        const dist = Math.hypot(px - triggerX, pz - triggerZ);
        if (dist < 75) {
          nearestBuilding = key;
        }
      }

      this.npcsList.forEach(n => {
        const dist = Math.hypot(px - n.mesh.position.x, pz - n.mesh.position.z);
        if (dist < 55) {
          nearestNPC = n;
        }
      });

      this.overlappingBuilding = nearestBuilding;
      this.overlappingNPC = nearestNPC;
      this.overlappingIndoorProp = null;
    }

    // C. Floating Action Button Content updater
    const actionBtn = document.getElementById('action-btn');
    if (actionBtn) {
      if (this.isIndoor && this.overlappingIndoorProp) {
        actionBtn.style.display = 'block';
        actionBtn.textContent = `${this.overlappingIndoorProp.label || 'INTERACTUAR'} [E]`;
      } else if (!this.isIndoor && (this.overlappingBuilding || this.overlappingNPC)) {
        actionBtn.style.display = 'block';
        const label = this.overlappingBuilding 
          ? `INGRESAR A EDIFICIO ${this.overlappingBuilding}` 
          : `HABLAR CON ${this.overlappingNPC.name.toUpperCase()}`;
        actionBtn.textContent = `${label} [E]`;
      } else {
        actionBtn.style.display = 'none';
      }
    }
  }

  executeInteraction() {
    if (this.isIndoor) {
      // A. INDOOR Interaction
      if (this.overlappingIndoorProp) {
        this.targetPos = null;
        this.overlappingIndoorProp.action();
      }
    } else {
      // B. OUTDOOR Interaction
      if (this.overlappingBuilding) {
        // Walk onto building -> transition to full 3D inside room!
        this.enterIndoor(this.overlappingBuilding);
      } else if (this.overlappingNPC) {
        this.targetPos = null;
        showDialogue(
          `${this.overlappingNPC.name} (${this.overlappingNPC.letter})`,
          this.overlappingNPC.avatar,
          this.overlappingNPC.welcomeLines
        );
      }
    }
  }

  // ==========================================
  // CAMERA FOLLOW ENGINE
  // ==========================================
  updateCamera() {
    if (!this.player) return;

    if (this.isIndoor) {
      // 360 degree orbital zoom indoor camera (larger building halls)
      const D = 180 * this.zoomLevel;
      const H = 130 * this.zoomLevel;
      const targetCamX = this.player.position.x + Math.sin(this.cameraAngleY) * D;
      const targetCamZ = this.player.position.z + Math.cos(this.cameraAngleY) * D;
      const targetCamY = this.player.position.y + H;
      
      this.camera.position.x += (targetCamX - this.camera.position.x) * 0.08;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 0.08;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.08;
      this.camera.lookAt(this.player.position);

      // Restore any remaining transparent outdoor building when entering indoors
      if (this.lastTransparentBuilding) {
        this.lastTransparentBuilding.traverse(child => {
          if (child.isMesh && child.material) {
            child.material.transparent = false;
            child.material.opacity = 1.0;
          }
        });
        this.lastTransparentBuilding = null;
      }
    } else if (this.isFastTraveling) {
      const targetCamX = this.player.position.x;
      const targetCamY = this.player.position.y + 200;
      const targetCamZ = this.player.position.z + 250;

      this.camera.position.x += (targetCamX - this.camera.position.x) * 0.12;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 0.12;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.12;
      this.camera.lookAt(this.player.position);
      
      const dist = Math.hypot(this.camera.position.x - targetCamX, this.camera.position.z - targetCamZ);
      if (dist < 200) {
        this.isFastTraveling = false;
      }
    } else {
      // 360 degree orbital zoom outdoor camera (taller buildings)
      const D = 220 * this.zoomLevel;
      const H = 180 * this.zoomLevel;
      const targetCamX = this.player.position.x + Math.sin(this.cameraAngleY) * D;
      const targetCamZ = this.player.position.z + Math.cos(this.cameraAngleY) * D;
      const targetCamY = this.player.position.y + H;

      this.camera.position.x += (targetCamX - this.camera.position.x) * 0.06;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 0.06;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.06;
      this.camera.lookAt(this.player.position);

      // Dynamic raycast transparency check against outdoor buildings
      const direction = new THREE.Vector3().subVectors(this.player.position, this.camera.position).normalize();
      this.buildingRaycaster.set(this.camera.position, direction);

      const intersects = this.buildingRaycaster.intersectObjects(this.outdoorBuildings, true);
      let hitBuilding = null;

      if (intersects.length > 0) {
        const distanceToPlayer = this.camera.position.distanceTo(this.player.position);
        for (let hit of intersects) {
          if (hit.distance < distanceToPlayer) {
            // Traverse up to find the root building group/mesh in outdoorGroup
            let obj = hit.object;
            while (obj.parent && obj.parent !== this.outdoorGroup && obj.parent !== this.scene) {
              obj = obj.parent;
            }
            hitBuilding = obj;
            break;
          }
        }
      }

      // Update transparent status
      if (this.lastTransparentBuilding && this.lastTransparentBuilding !== hitBuilding) {
        this.lastTransparentBuilding.traverse(child => {
          if (child.isMesh && child.material) {
            child.material.transparent = false;
            child.material.opacity = 1.0;
          }
        });
        this.lastTransparentBuilding = null;
      }

      if (hitBuilding) {
        this.lastTransparentBuilding = hitBuilding;
        hitBuilding.traverse(child => {
          if (child.isMesh && child.material) {
            child.material.transparent = true;
            child.material.opacity = 0.25;
          }
        });
      }
    }
  }

  // ==========================================
  // FAST TRAVEL & RESET APIs
  // ==========================================
  teleportPlayerToZone(letter) {
    if (this.isIndoor) {
      // If player teleports from search bar while indoors, automatically return to outdoor
      this.isIndoor = false;
      this.indoorGroup.visible = false;
      this.outdoorGroup.visible = true;
      this.scene.background = new THREE.Color(0xC8B89A);
      while(this.indoorGroup.children.length > 0) this.indoorGroup.remove(this.indoorGroup.children[0]);
    }

    const target = CAMPUS_LAYOUT.zones[letter];
    if (target && this.player) {
      this.isFastTraveling = true;
      this.targetPos = null;
      this.player.position.set(target.teleportX, 10, target.teleportY);
      this.camera.position.set(target.teleportX - 50, 240, target.teleportY + 280);
    }
  }

  resetPlayerPosition() {
    if (this.isIndoor) {
      this.isIndoor = false;
      this.indoorGroup.visible = false;
      this.outdoorGroup.visible = true;
      this.scene.background = new THREE.Color(0xC8B89A);
      while(this.indoorGroup.children.length > 0) this.indoorGroup.remove(this.indoorGroup.children[0]);
    }

    const spawn = CAMPUS_LAYOUT.spawnPoint;
    if (this.player) {
      this.player.position.set(spawn.x, 10, spawn.y);
      this.player.rotation.set(0, 0, 0);
      this.targetPos = null;
      this.resetPlayerPose();
      
      this.camera.position.set(spawn.x, 300, spawn.y + 400);

      this.updatePlayerAvatar();
    }
  }

  // ==========================================
  // HUDS & RESIZE ENGINE
  // ==========================================
  updateMiniMapBlip() {
    const blip = document.getElementById('mini-map-blip');
    if (blip && this.player) {
      const activeX = this.isIndoor ? 150 : this.player.position.x;
      const activeZ = this.isIndoor ? 150 : this.player.position.z;
      
      const pctX = (activeX / this.mapWidth) * 100;
      const pctY = (activeZ / this.mapHeight) * 100;
      
      blip.style.left = `${pctX}%`;
      blip.style.top = `${pctY}%`;
    }
  }

  onWindowResize() {
    const container = document.getElementById('game-canvas-container');
    if (!container || !this.renderer || !this.camera) return;

    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }
}
