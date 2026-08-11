// Configuration and coordinates of the UPVT Campus Map based on the real-world satellite layout.
// Map bounds are 2400 x 1800 px.
// REAL CAREERS: Informática, Mecatrónica, Industrial, Biotecnología, Mecánica Automotriz, Energía, Negocios Internacionales

export const CAMPUS_LAYOUT = {
  mapWidth: 2400,
  mapHeight: 1800,
  
  // Base background color (Semi-arid highland green — Toluca valley at 2,600m altitude)
  bgColor: 0x4a7a3a,
  
  // Player starting position (outside the Main Entrance roundabout)
  spawnPoint: {
    x: 540,
    y: 1650
  },

  // Estacionamiento
  parkingLot: {
    x: 1000,
    y: 1100,
    w: 300,
    h: 240,
    color: 0x555555, // Dark asphalt
    spotSpacing: 40
  },

  // Canchas Deportivas area and lawn background
  sportsFields: {
    x: 1350,
    y: 870,
    w: 220,
    h: 300,
    color: 0x2a5f8f, // Court blue
    greenGrassColor: 0x3a8a40 // Sports lawn
  },

  // Invernaderos / Biotecnología (Secondary landmark decoration)
  greenhouses: {
    x: 100,
    y: 900,
    w: 120,
    h: 220,
    color: 0x2a9a4a // Greenhouse green glass
  },

  // 7 Zones detailed configuration (positions, colliders and teleport targets)
  zones: {
    G: {
      letter: 'G',
      name: 'Entrada Principal y Plaza de la Identidad',
      x: 540,
      y: 1480,
      solidW: 120,
      solidH: 120,
      shape: 'círculo',
      teleportX: 540,
      teleportY: 1480,
      color: 0x888888, // Concrete gray guardhouse
      avatar: '👮'
    },
    E: {
      letter: 'E',
      name: 'Edificio A - Rectoría y Administración',
      x: 540,
      y: 1050,
      solidW: 300,
      solidH: 180,
      shape: 'u-shape',
      teleportX: 540,
      teleportY: 1140,
      color: 0xe8e4e0, // White concrete
      avatar: '👨‍💼'
    },
    F: {
      letter: 'F',
      name: 'Edificios F y G - Deportes y Canchas',
      x: 1350,
      y: 870,
      solidW: 220,
      solidH: 300,
      shape: 'rectangle',
      teleportX: 1350,
      teleportY: 1020,
      color: 0xd0ccc8, // Light gray concrete
      avatar: '⚽'
    },
    B: {
      letter: 'B',
      name: 'Edificio B - Aulas y Jardín Central',
      x: 1080,
      y: 720,
      solidW: 200,
      solidH: 150,
      shape: 'rectangle',
      teleportX: 1080,
      teleportY: 795,
      color: 0xe8e4e0, // White concrete
      avatar: '🔧'
    },
    C: {
      letter: 'C',
      name: 'CID - Centro de Información y Documentación',
      x: 820,
      y: 720,
      solidW: 200,
      solidH: 150,
      shape: 'rectangle',
      teleportX: 820,
      teleportY: 795,
      color: 0xe8e4e0, // White concrete
      avatar: '📚'
    },
    D: {
      letter: 'D',
      name: 'Edificio D - Laboratorios y Talleres',
      x: 300,
      y: 720,
      solidW: 180,
      solidH: 220,
      shape: 'rectangle',
      teleportX: 300,
      teleportY: 830,
      color: 0xd8d4d0, // Slightly darker gray
      avatar: '🔬'
    },
    A: {
      letter: 'A',
      name: 'Edificios H e I - Complejo Académico Norte',
      x: 650,
      y: 220,
      solidW: 240,
      solidH: 160,
      shape: 'double-wing',
      teleportX: 650,
      teleportY: 300,
      color: 0xe8e4e0, // White concrete
      avatar: '💻',
      wing1: { x: 440, y: 220, w: 220, h: 160, label: 'Edificio H - Aulas Especializadas' },
      wing2: { x: 860, y: 220, w: 220, h: 160, label: 'Edificio I - Aulas y Vestíbulo' }
    }
  },

  // Caminos / Senderos
  roads: [
    { type: 'diagonal', nodes: [
      { x1: 540, y1: 1480, x2: 540, y2: 1140, w: 60 }, // Entrada to Edificio Principal front
      { x1: 540, y1: 1140, x2: 540, y2: 830,  w: 60 }, // Principal to Central Plaza junction
      { x1: 540, y1: 830,  x2: 300, y2: 830,  w: 60 }, // Plaza junction to Laboratorios path
      { x1: 300, y1: 830,  x2: 300, y2: 720,  w: 60 }, // Laboratorios entry pad
      { x1: 540, y1: 830,  x2: 650, y2: 300,  w: 60 }  // Central Plaza to Academic Norte A/B
    ]},
    
    // Connects Central Plaza to the right (Biblioteca, Docencia B, Estacionamiento, Canchas)
    { type: 'straight', x1: 540, y1: 830, x2: 820, y2: 830, w: 60 },   // Plaza to Biblioteca walkway
    { type: 'straight', x1: 820, y1: 830, x2: 1080, y2: 830, w: 60 },  // Biblioteca to Docencia B walkway
    { type: 'straight', x1: 1080, y1: 830, x2: 1350, y2: 830, w: 60 }, // Docencia B to Sports Courts walkway
    { type: 'straight', x1: 1350, y1: 830, x2: 1350, y2: 870, w: 60 }  // Sports Courts entry pad
  ],

  // Trees coordinate list scatters on earth lawns
  trees: [
    // Border boundaries
    { x: 100, y: 150, r: 24 }, { x: 180, y: 120, r: 22 }, { x: 260, y: 140, r: 20 },
    { x: 1100, y: 120, r: 25 }, { x: 1180, y: 100, r: 24 }, { x: 1260, y: 130, r: 18 },
    { x: 2200, y: 200, r: 25 }, { x: 2280, y: 250, r: 22 }, { x: 2320, y: 180, r: 24 },
    { x: 100, y: 1600, r: 25 }, { x: 180, y: 1650, r: 20 }, { x: 260, y: 1580, r: 22 },
    
    // Around northern academic buildings (A)
    { x: 240, y: 200, r: 20 }, { x: 280, y: 280, r: 19 },
    { x: 1080, y: 180, r: 22 }, { x: 1140, y: 260, r: 20 },
    { x: 650, y: 100, r: 24 }, { x: 700, y: 100, r: 25 },
    
    // West/Invernaderos surroundings
    { x: 100, y: 440, r: 18 }, { x: 140, y: 780, r: 22 }, { x: 250, y: 500, r: 24 },
    
    // In between buildings
    { x: 150, y: 680, r: 20 }, { x: 180, y: 840, r: 22 },
    { x: 680, y: 480, r: 22 }, { x: 720, y: 550, r: 20 },
    { x: 680, y: 680, r: 24 }, { x: 720, y: 740, r: 19 },
    
    // Around administrative building (E)
    { x: 300, y: 1100, r: 25 }, { x: 340, y: 1200, r: 22 },
    { x: 760, y: 1120, r: 24 }, { x: 800, y: 1240, r: 20 },
    
    // Near Docencia B and Estacionamiento
    { x: 1220, y: 700, r: 20 }, { x: 1260, y: 760, r: 22 },
    { x: 920, y: 980, r: 25 }, { x: 960, y: 1040, r: 18 },
    
    // Surrounding sports courts (F)
    { x: 1420, y: 640, r: 24 }, { x: 1480, y: 700, r: 25 },
    { x: 1480, y: 1100, r: 20 }, { x: 1510, y: 1220, r: 22 },
    
    // Southern entrance (G)
    { x: 380, y: 1400, r: 24 }, { x: 420, y: 1480, r: 20 },
    { x: 700, y: 1420, r: 22 }, { x: 740, y: 1500, r: 25 }
  ],

  // Benches lining the paths
  benches: [
    { x: 500, y: 1300 }, { x: 500, y: 1200 }, { x: 510, y: 750 }, { x: 510, y: 610 },
    { x: 680, y: 800 }, { x: 940, y: 800 }, { x: 1310, y: 1130 }, { x: 1250, y: 1130 }
  ]
};
