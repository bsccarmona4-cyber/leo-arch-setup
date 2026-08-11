import { UPVT_DATA, UPVT_QUIZZES } from './data.js';
import { CampusGameScene } from './game.js';

// Safe localStorage parsing to prevent syntax crash loops
function getSavedVisitedZones() {
  try {
    const raw = localStorage.getItem('upvt_visited_zones');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }
    }
  } catch (err) {
    console.warn("Resetting corrupted visited zones:", err);
    localStorage.removeItem('upvt_visited_zones');
  }
  return new Set();
}

function getSavedSolvedQuizzes() {
  try {
    const raw = localStorage.getItem('upvt_solved_quizzes');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }
    }
  } catch (err) {
    console.warn("Resetting corrupted solved quizzes:", err);
    localStorage.removeItem('upvt_solved_quizzes');
  }
  return new Set();
}

function getSavedEquippedMerch() {
  try {
    const raw = localStorage.getItem('upvt_equipped_merch');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }
    }
  } catch (err) {
    console.warn("Resetting corrupted equipped merch:", err);
    localStorage.removeItem('upvt_equipped_merch');
  }
  return new Set();
}

// Global state
window.gameApp = {
  userRole: 'prospecto',
  userName: 'Explorador',
  visitedZones: getSavedVisitedZones(),
  solvedQuizzes: getSavedSolvedQuizzes(),
  equippedMerch: getSavedEquippedMerch(),
  currentZone: null,
  activeTab: 'general',
  dialogueQueue: [],
  dialogueIndex: 0,
  phaserInstance: null,
  gameScene: null,
  completedTour: localStorage.getItem('upvt_tour_completed') === 'true'
};

// Initialize UI when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  // Bind globally to solve circular dependency crashes in ES Modules
  window.showDialogue = showDialogue;
  window.openBuildingPanel = openBuildingPanel;
  window.startQuiz = startQuiz;

  setupCharacterSelection();
  setupBuildingPanel();
  setupSearchEngine();
  setupCongratsModal();
  setupKeyboardCloseHandlers();
  setupMerchSystem();
  setupQuizSystem();
  
  // Handle tactile Action Button trigger
  const actionBtn = document.getElementById('action-btn');
  if (actionBtn) {
    actionBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.gameApp.gameScene) {
        window.gameApp.gameScene.executeInteraction();
      }
    });
    actionBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.gameApp.gameScene) {
        window.gameApp.gameScene.executeInteraction();
      }
    });
  }
  
  // Update HUD values from localStorage if already saved
  updateMissionProgress();
  updateMerchCounter();
});

// 1. CHARACTER SELECTION
function setupCharacterSelection() {
  const cards = document.querySelectorAll('.character-card');
  const startBtn = document.getElementById('start-game-btn');
  const nameInput = document.getElementById('username-input');

  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      window.gameApp.userRole = card.getAttribute('data-role');
    });
  });

  // Enable/disable start button based on name input
  nameInput.addEventListener('input', () => {
    startBtn.disabled = nameInput.value.trim() === '';
  });

  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const rawName = nameInput.value.trim();
    window.gameApp.userName = rawName || 'Explorador';
    
    // Call the required startGame() function
    startGame();
  });
}

// Dedicated startGame wrapper to manage state and init
function startGame() {
  const userName = window.gameApp.userName;
  const userRole = getRoleDisplayName(window.gameApp.userRole);

  // Save character choice to localStorage in the requested format
  localStorage.setItem('upvt_explorer_choice', JSON.stringify({
    rol: userRole,
    nombre: userName
  }));
  
  // Lock scroll bar on page body and document element once game starts
  document.body.classList.add('game-started');
  document.documentElement.classList.add('game-started');
  
  // Hide start screen overlay
  const startScreen = document.getElementById('start-screen');
  startScreen.classList.add('hidden');
  
  // Show HUD
  const hud = document.getElementById('hud-overlay');
  hud.style.display = 'flex';
  
  // Update HUD tags
  document.getElementById('hud-username-span').textContent = userName;
  document.getElementById('hud-role-span').textContent = userRole;
  document.getElementById('hud-avatar').textContent = getRoleAvatar(window.gameApp.userRole);

  // Initialize the Phaser Game Scene
  initPhaserGame();

  // Trigger welcoming dialogue
  triggerWelcomeDialogue();
}

function getRoleDisplayName(role) {
  return 'Invitado';
}

function getRoleAvatar(role) {
  const avatars = {
    prospecto: '🟢',
    estudiante: '🟠',
    docente: '🔵',
    visitante: '🔴'
  };
  return avatars[role] || '🟢';
}

// 2. 3D THREE.JS INITIALIZATION
function initPhaserGame() {
  window.gameApp.gameScene = new CampusGameScene();
  window.gameApp.gameScene.init();
}

// 3. DIALOGUE SYSTEM
export function showDialogue(speaker, avatar, lines, onComplete = null) {
  window.gameApp.dialogueQueue = lines;
  window.gameApp.dialogueIndex = 0;
  
  const container = document.getElementById('dialogue-container');
  const speakerEl = document.getElementById('dialogue-speaker');
  const portraitEl = document.getElementById('dialogue-portrait');
  
  speakerEl.textContent = speaker;
  portraitEl.textContent = avatar;
  
  container.classList.add('visible');
  
  // Render first line
  renderDialogueLine();
  
  // Next button click handler
  const nextBtn = document.getElementById('dialogue-next-btn');
  // Remove old event listeners
  const newNextBtn = nextBtn.cloneNode(true);
  nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
  
  newNextBtn.addEventListener('click', () => {
    window.gameApp.dialogueIndex++;
    if (window.gameApp.dialogueIndex < window.gameApp.dialogueQueue.length) {
      renderDialogueLine();
    } else {
      // Finished all lines
      container.classList.remove('visible');
      if (onComplete) onComplete();
    }
  });
}

let typewriterInterval = null;
function renderDialogueLine() {
  const textEl = document.getElementById('dialogue-text');
  const line = window.gameApp.dialogueQueue[window.gameApp.dialogueIndex];
  
  // Clear typewriter
  clearInterval(typewriterInterval);
  textEl.textContent = '';
  
  let i = 0;
  typewriterInterval = setInterval(() => {
    if (i < line.length) {
      textEl.textContent += line[i];
      i++;
    } else {
      clearInterval(typewriterInterval);
    }
  }, 18); // Fast typing effect
}

function triggerWelcomeDialogue() {
  const name = window.gameApp.userName;
  const lines = [
    `¡Hola, ${name}! Bienvenido al campus virtual de la Universidad Politécnica del Valle de Toluca.`,
    'Has ingresado como Invitado de Honor para explorar libremente el campus en 3D.',
    'Tu misión es realizar el "Tour de Bienvenida". Visita al menos 5 edificios ingresando en 3D para desbloquear tu Credencial Digital.',
    'Usa las teclas W, A, S, D, flechas o simplemente haz click en el suelo para caminar. ¡Disfruta el recorrido!'
  ];

  setTimeout(() => {
    window.showDialogue('Oficial de Entrada', '👮', lines);
  }, 1000);
}

// 4. BUILDING SLIDE-IN DETAIL PANEL
function setupBuildingPanel() {
  const panel = document.getElementById('building-panel');
  const closeBtn = document.getElementById('panel-close-btn');
  const tabs = document.querySelectorAll('.tab-btn');
  
  closeBtn.addEventListener('click', () => {
    panel.classList.remove('visible');
    window.gameApp.currentZone = null;
    
    // Resume game scene controls focus
    if (window.gameApp.gameScene) {
      window.gameApp.gameScene.input.keyboard.enabled = true;
    }
  });

  // Tab switching logic
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      switchPanelTab(targetTab);
    });
  });
}

function switchPanelTab(tabName) {
  window.gameApp.activeTab = tabName;
  
  // Set tab buttons active
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    if (tab.getAttribute('data-tab') === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Set panes active
  const panes = document.querySelectorAll('.tab-pane');
  panes.forEach(pane => {
    if (pane.id === `pane-${tabName}`) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });
}

export function openBuildingPanel(zoneLetter) {
  const zoneData = UPVT_DATA.zonas[zoneLetter];
  if (!zoneData) return;
  
  window.gameApp.currentZone = zoneLetter;
  
  // Mark as visited in missions
  markZoneAsVisited(zoneLetter);

  // Set Header data
  document.getElementById('panel-zone-letter').textContent = zoneLetter;
  document.getElementById('panel-title-text').textContent = zoneData.nombre;
  document.getElementById('panel-subtitle-text').textContent = zoneData.subtitulo;

  // 1. POPULATE GENERAL
  document.getElementById('pane-general-desc').textContent = zoneData.descripcion;
  document.getElementById('pane-general-day').textContent = zoneData.diaAqui;

  // 2. POPULATE SERVICIOS
  const servicesList = document.getElementById('pane-servicios-list');
  servicesList.innerHTML = '';
  zoneData.servicios.forEach(service => {
    const div = document.createElement('div');
    div.className = 'service-item';
    div.innerHTML = `
      <span class="service-icon-bullet">🔹</span>
      <span class="service-text">${service}</span>
    `;
    servicesList.appendChild(div);
  });

  // 3. POPULATE DIRECTORIO
  const dirList = document.getElementById('pane-directorio-list');
  dirList.innerHTML = '';
  zoneData.directorio.forEach(person => {
    const card = document.createElement('div');
    card.className = 'directory-card';
    card.innerHTML = `
      <div class="dir-puesto">${person.puesto}</div>
      <div class="dir-nombre">${person.nombre}</div>
      <div class="dir-contacto">${person.contacto}</div>
    `;
    dirList.appendChild(card);
  });

  // 4. POPULATE SPECIALIZED CAREERS OR INFO TAB
  const careersList = document.getElementById('pane-carreras-list');
  careersList.innerHTML = '';
  
  if (zoneLetter === 'A') {
    // Show Careers accordion
    UPVT_DATA.carreras.forEach((carrera, index) => {
      const item = document.createElement('div');
      item.className = 'career-accordion-item';
      
      const tsuHtml = carrera.tsu ? `<div class="career-badge-tsu">TSU en ${carrera.tsu}</div>` : '';
      
      item.innerHTML = `
        <div class="career-accordion-header" data-index="${index}">
          <span class="career-accordion-title">${carrera.nombre}</span>
          <span class="career-accordion-arrow">▼</span>
        </div>
        <div class="career-accordion-content" id="career-content-${index}">
          ${tsuHtml}
          <p class="panel-paragraph" style="font-size:0.875rem; margin-bottom:0.75rem;">${carrera.descripcion}</p>
          <div style="font-size: 0.8rem; color: var(--color-accent); font-weight: 500;">
            Enfoque: ${carrera.enfoque}
          </div>
        </div>
      `;
      careersList.appendChild(item);
    });
    
    // Accordion interaction
    const headers = careersList.querySelectorAll('.career-accordion-header');
    headers.forEach(header => {
      header.addEventListener('click', () => {
        const idx = header.getAttribute('data-index');
        const content = document.getElementById(`career-content-${idx}`);
        const arrow = header.querySelector('.career-accordion-arrow');
        
        const isActive = content.classList.contains('active');
        
        // Collapse all others
        careersList.querySelectorAll('.career-accordion-content').forEach(c => c.classList.remove('active'));
        careersList.querySelectorAll('.career-accordion-arrow').forEach(a => a.textContent = '▼');
        
        if (!isActive) {
          content.classList.add('active');
          arrow.textContent = '▲';
        }
      });
    });
  } else if (zoneLetter === 'C') {
    // Show Scholarships in Zone C
    const title = document.createElement('h4');
    title.className = 'day-here-title';
    title.innerHTML = '📋 Becas Disponibles (Promedio Min. 8.00)';
    title.style.marginBottom = '1rem';
    careersList.appendChild(title);

    UPVT_DATA.becas.forEach(beca => {
      const item = document.createElement('div');
      item.className = 'directory-card';
      item.style.marginBottom = '0.75rem';
      item.innerHTML = `
        <div class="dir-puesto" style="color:var(--color-primary-light);">${beca.requisito}</div>
        <div class="dir-nombre" style="font-size:1rem;">${beca.nombre}</div>
        <div class="dir-contacto" style="margin-top:0.25rem;">${beca.descripcion}</div>
      `;
      careersList.appendChild(item);
    });
  } else if (zoneLetter === 'F') {
    // Show extracurricular activities in Zone F
    const title = document.createElement('h4');
    title.className = 'day-here-title';
    title.innerHTML = '⚽ Talleres y Formación Integral';
    title.style.marginBottom = '1rem';
    careersList.appendChild(title);

    const divDeportes = document.createElement('div');
    divDeportes.className = 'service-item';
    divDeportes.style.marginBottom = '0.75rem';
    divDeportes.innerHTML = `
      <div>
        <div style="font-weight:600; color:var(--color-accent); font-size:0.95rem; margin-bottom:0.3rem;">Deportes</div>
        <div style="font-size:0.85rem; line-height:1.4;">${UPVT_DATA.extracurriculares.deportes.join(', ')}</div>
      </div>
    `;
    careersList.appendChild(divDeportes);

    const divCultura = document.createElement('div');
    divCultura.className = 'service-item';
    divCultura.style.marginBottom = '0.75rem';
    divCultura.innerHTML = `
      <div>
        <div style="font-weight:600; color:var(--color-accent); font-size:0.95rem; margin-bottom:0.3rem;">Actividades Culturales</div>
        <div style="font-size:0.85rem; line-height:1.4;">${UPVT_DATA.extracurriculares.culturales.join(', ')}</div>
      </div>
    `;
    careersList.appendChild(divCultura);

    const divCert = document.createElement('div');
    divCert.className = 'service-item';
    divCert.innerHTML = `
      <div>
        <div style="font-weight:600; color:var(--color-accent); font-size:0.95rem; margin-bottom:0.3rem;">Certificaciones Académicas</div>
        <div style="font-size:0.85rem; line-height:1.4;">${UPVT_DATA.extracurriculares.certificaciones.join(', ')}</div>
      </div>
    `;
    careersList.appendChild(divCert);
  } else {
    // General info card for other buildings
    const card = document.createElement('div');
    card.className = 'day-here-card';
    card.innerHTML = `
      <div class="day-here-title">🏛️ Modelo Educativo UPVT</div>
      <p class="panel-paragraph" style="font-size:0.9rem; line-height:1.5; margin-bottom:0;">
        ${UPVT_DATA.modeloEducativo}
        <br><br>
        <b>Ubicación:</b> ${UPVT_DATA.direccion}
        <br><br>
        <b>Contacto:</b> Tel. ${UPVT_DATA.telefono}
      </p>
    `;
    careersList.appendChild(card);
  }

  // Open the panel
  switchPanelTab('general');
  document.getElementById('building-panel').classList.add('visible');
  
  // Pause Phaser keyboard controls so user can type in the panel search if they want
  if (window.gameApp.gameScene) {
    window.gameApp.gameScene.input.keyboard.enabled = false;
  }
}

// 5. MISSION TRACKER
function markZoneAsVisited(zoneLetter) {
  if (window.gameApp.visitedZones.has(zoneLetter)) return;
  
  window.gameApp.visitedZones.add(zoneLetter);
  localStorage.setItem('upvt_visited_zones', JSON.stringify(Array.from(window.gameApp.visitedZones)));
  
  updateMissionProgress();
  
  // Check if player unlocked the badge (5 zones visited)
  if (window.gameApp.visitedZones.size >= 5 && !window.gameApp.completedTour) {
    window.gameApp.completedTour = true;
    localStorage.setItem('upvt_tour_completed', 'true');
    
    // Show Congratulations screen after 1.5 seconds so panel transition is completed first
    setTimeout(() => {
      triggerConfettiAndCongrats();
    }, 1200);
  }
}

function updateMissionProgress() {
  const size = window.gameApp.visitedZones.size;
  const target = 5;
  const progressPercent = Math.min((size / target) * 100, 100);
  
  document.getElementById('mission-bar-fill').style.width = `${progressPercent}%`;
  document.getElementById('mission-counter-label').textContent = `${size}/${target}`;
  
  if (size >= 5) {
    document.getElementById('mission-counter-label').style.color = 'var(--color-accent)';
  } else {
    document.getElementById('mission-counter-label').style.color = 'white';
  }
}

// 6. SEARCH ENGINE
function setupSearchEngine() {
  const searchInput = document.getElementById('hud-search');
  const dropdown = document.getElementById('search-dropdown');

  // Build searchable tags
  const searchIndex = [];

  // Add zones
  Object.keys(UPVT_DATA.zonas).forEach(letter => {
    const z = UPVT_DATA.zonas[letter];
    searchIndex.push({ type: 'zone', letter: letter, label: `Edificio ZONA ${letter} (${z.nombre})`, desc: z.subtitulo });
  });

  // Add careers (all route to Zone A)
  UPVT_DATA.carreras.forEach(c => {
    searchIndex.push({ type: 'zone', letter: 'A', label: c.nombre, desc: `Carrera Profesional (Complejo Académico Norte)` });
  });

  // Add scholarships (route to Zone C)
  UPVT_DATA.becas.forEach(b => {
    searchIndex.push({ type: 'zone', letter: 'C', label: `Beca: ${b.nombre}`, desc: `Trámites de beca (Servicios Escolares - CID C)` });
  });

  // Add extracurriculars (route to Zone F)
  UPVT_DATA.extracurriculares.deportes.forEach(d => {
    searchIndex.push({ type: 'zone', letter: 'F', label: `Deporte: ${d}`, desc: `Actividad extracurricular (Canchas Deportivas F)` });
  });
  UPVT_DATA.extracurriculares.culturales.forEach(cu => {
    searchIndex.push({ type: 'zone', letter: 'F', label: `Cultural: ${cu}`, desc: `Taller cultural (Áreas Deportivas y Culturales F)` });
  });
  searchIndex.push({ type: 'zone', letter: 'C', label: `Idiomas: Inglés, Francés, Alemán, Chino, Japonés, Italiano`, desc: `Centro de Idiomas (CID - Biblioteca)` });

  // Add key staff
  UPVT_DATA.directorio.forEach(p => {
    let letter = 'B'; // default
    if (p.oficina.includes('CID') || p.oficina.includes('Biblioteca') || p.oficina.includes('Escolares')) letter = 'C';
    if (p.oficina.includes('Edificio A') || p.oficina.includes('Rectoría') || p.oficina.includes('Vinculación')) letter = 'E';
    if (p.oficina.includes('Edificio H') || p.oficina.includes('Edificio I') || p.oficina.includes('Norte')) letter = 'A';
    if (p.oficina.includes('Edificio D') || p.oficina.includes('Laboratorios') || p.oficina.includes('TI')) letter = 'D';
    if (p.oficina.includes('Edificio F') || p.oficina.includes('Deportes')) letter = 'F';
    if (p.oficina.includes('Acceso') || p.oficina.includes('Seguridad')) letter = 'G';
    searchIndex.push({ type: 'zone', letter: letter, label: `${p.puesto}: ${p.nombre}`, desc: `Directorio Institucional (ZONA ${letter})` });
  });

  searchInput.addEventListener('input', () => {
    const val = searchInput.value.trim().toLowerCase();
    dropdown.innerHTML = '';
    
    if (val.length < 2) {
      dropdown.classList.remove('visible');
      return;
    }

    const matches = searchIndex.filter(item => 
      item.label.toLowerCase().includes(val) || 
      item.desc.toLowerCase().includes(val)
    ).slice(0, 5); // Limit 5 results

    if (matches.length > 0) {
      matches.forEach(m => {
        const div = document.createElement('div');
        div.className = 'search-result-item';
        div.innerHTML = `
          <span class="search-result-title">${m.label}</span>
          <span class="search-result-desc">${m.desc}</span>
        `;
        div.addEventListener('click', () => {
          dropdown.classList.remove('visible');
          searchInput.value = '';
          
          // Execute navigation in game
          navigateToZone(m.letter);
        });
        dropdown.appendChild(div);
      });
      dropdown.classList.add('visible');
    } else {
      dropdown.classList.remove('visible');
    }
  });

  // Hide dropdown when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      dropdown.classList.remove('visible');
    }
  });
}

function navigateToZone(letter) {
  // 1. Pan camera / move player in Phaser scene
  if (window.gameApp.gameScene) {
    window.gameApp.gameScene.teleportPlayerToZone(letter);
  }
  // 2. Open building slide-in panel
  openBuildingPanel(letter);
}

// 7. CONGRATS CREDENTIAL MODAL
function setupCongratsModal() {
  const modal = document.getElementById('congrats-modal');
  const closeBtn = document.getElementById('btn-modal-close');
  const restartBtn = document.getElementById('btn-modal-restart');

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('visible');
  });

  restartBtn.addEventListener('click', () => {
    modal.classList.remove('visible');
    
    // Clear localStorage values
    localStorage.removeItem('upvt_visited_zones');
    localStorage.removeItem('upvt_tour_completed');
    
    // Reset global state
    window.gameApp.visitedZones.clear();
    window.gameApp.completedTour = false;
    
    updateMissionProgress();
    
    // Reload scene or return player to start coordinate
    if (window.gameApp.gameScene) {
      window.gameApp.gameScene.resetPlayerPosition();
    }
    
    // Trigger dialogue
    triggerWelcomeDialogue();
  });

  // Make mini-map trigger badge modal if already completed
  const miniMap = document.getElementById('mini-map-trigger');
  miniMap.addEventListener('click', () => {
    if (window.gameApp.visitedZones.size >= 5) {
      triggerConfettiAndCongrats();
    } else {
      // Just guide player
      const missingCount = 5 - window.gameApp.visitedZones.size;
      const lines = [
        `¡Vas por buen camino! Has visitado ${window.gameApp.visitedZones.size} de 5 edificios requeridos para completar tu recorrido académico.`,
        `Te falta explorar ${missingCount} zona(s) más para obtener tu Credencial de Honor UPVT.`
      ];
      showDialogue('Guía del Campus', '🗺️', lines);
    }
  });
}

function triggerConfettiAndCongrats() {
  const modal = document.getElementById('congrats-modal');
  
  // Set values on credential card
  document.getElementById('card-username').textContent = window.gameApp.userName;
  document.getElementById('card-role').textContent = getRoleDisplayName(window.gameApp.userRole);
  
  const today = new Date();
  const dateStr = today.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  document.getElementById('card-date').textContent = dateStr;

  modal.classList.add('visible');
  
  // Custom simple CSS confetti inside app (without external libraries)
  createConfettiEffect();
}

function createConfettiEffect() {
  const modal = document.getElementById('congrats-modal');
  for (let i = 0; i < 75; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'absolute';
    confetti.style.width = `${Math.random() * 8 + 5}px`;
    confetti.style.height = `${Math.random() * 15 + 8}px`;
    
    // Colorful confetti (institutional colors + gold)
    const colors = ['#006341', '#008f5d', '#bf9b30', '#ffffff', '#ffd700'];
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.top = `-20px`;
    confetti.style.zIndex = '501';
    confetti.style.opacity = Math.random();
    confetti.style.borderRadius = '2px';
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    modal.appendChild(confetti);

    const speed = Math.random() * 3 + 2;
    const wind = Math.random() * 2 - 1;
    let currentTop = -20;
    let currentLeft = parseFloat(confetti.style.left);

    const fallInterval = setInterval(() => {
      currentTop += speed;
      currentLeft += wind;
      
      confetti.style.top = `${currentTop}px`;
      confetti.style.left = `${currentLeft}px`;
      
      if (currentTop > window.innerHeight) {
        clearInterval(fallInterval);
        confetti.remove();
      }
    }, 16);
  }
}

// 8. ESC / KEYBOARD ACCESSIBILITY CLOSES
function setupKeyboardCloseHandlers() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Close Building details panel
      const panel = document.getElementById('building-panel');
      if (panel.classList.contains('visible')) {
        panel.classList.remove('visible');
        window.gameApp.currentZone = null;
        if (window.gameApp.gameScene) {
          window.gameApp.gameScene.input.keyboard.enabled = true;
        }
      }
      
      // Close merch panel
      const merch = document.getElementById('merch-panel');
      if (merch && merch.classList.contains('visible')) {
        merch.classList.remove('visible');
        if (window.gameApp.gameScene) {
          window.gameApp.gameScene.input.keyboard.enabled = true;
        }
      }

      // Close quiz modal
      const quiz = document.getElementById('quiz-modal');
      if (quiz && quiz.classList.contains('visible')) {
        quiz.classList.remove('visible');
        if (window.gameApp.gameScene) {
          window.gameApp.gameScene.input.keyboard.enabled = true;
        }
      }

      // Close congrats modal
      const congrats = document.getElementById('congrats-modal');
      if (congrats.classList.contains('visible')) {
        congrats.classList.remove('visible');
      }

      // Close dialogue
      const dialogue = document.getElementById('dialogue-container');
      if (dialogue.classList.contains('visible')) {
        dialogue.classList.remove('visible');
      }

      // Close unlock splash
      const splash = document.getElementById('merch-unlock-splash');
      if (splash && splash.classList.contains('visible')) {
        splash.classList.remove('visible');
      }
    }
  });
}

// ==========================================
// 9. UPVT MERCH INVENTORY SYSTEM
// ==========================================
function setupMerchSystem() {
  const merchBtn = document.getElementById('merch-hud-btn');
  const merchPanel = document.getElementById('merch-panel');
  const closeBtn = document.getElementById('merch-close-btn');

  if (merchBtn && merchPanel) {
    merchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      merchPanel.classList.toggle('visible');
      
      // Pause keyboard controls if panel is visible
      if (window.gameApp.gameScene) {
        window.gameApp.gameScene.input.keyboard.enabled = !merchPanel.classList.contains('visible');
      }
      
      if (merchPanel.classList.contains('visible')) {
        renderMerchGrid();
      }
    });
  }

  if (closeBtn && merchPanel) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      merchPanel.classList.remove('visible');
      if (window.gameApp.gameScene) {
        window.gameApp.gameScene.input.keyboard.enabled = true;
      }
    });
  }
}

export function updateMerchCounter() {
  const badge = document.getElementById('merch-counter-badge');
  if (badge) {
    badge.textContent = `${window.gameApp.solvedQuizzes.size}/7`;
  }
}

export function renderMerchGrid() {
  const grid = document.getElementById('merch-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const items = [
    { key: 'gafas', name: 'Gafas UPVT', icon: '🕶️', zone: 'G', bName: 'Acceso G' },
    { key: 'mochila', name: 'Mochila UPVT', icon: '🎒', zone: 'E', bName: 'Cafetería E' },
    { key: 'gorra', name: 'Gorra Deportiva UPVT', icon: '🧢', zone: 'F', bName: 'Canchas F' },
    { key: 'chamarra', name: 'Varsity Jacket UPVT', icon: '🧥', zone: 'B', bName: 'Escolares B' },
    { key: 'termo', name: 'Termo Térmico UPVT', icon: '🍵', zone: 'C', bName: 'Biblioteca C' },
    { key: 'audifonos', name: 'Audífonos UPVT', icon: '🎧', zone: 'D', bName: 'Laboratorios D' },
    { key: 'sudadera', name: 'Sudadera UPVT', icon: '🧥', zone: 'A', bName: 'Académico A' }
  ];

  items.forEach(item => {
    const isUnlocked = window.gameApp.solvedQuizzes.has(item.zone);
    const isEquipped = window.gameApp.equippedMerch.has(item.key);

    const card = document.createElement('div');
    card.className = `merch-item-card ${!isUnlocked ? 'locked' : ''} ${isEquipped ? 'equipped' : ''}`;
    
    let btnHtml = '';
    if (!isUnlocked) {
      btnHtml = `<button class="btn-merch-action locked-btn" disabled>Bloqueado</button>`;
    } else if (isEquipped) {
      btnHtml = `<button class="btn-merch-action unequip" data-key="${item.key}">Desequipar</button>`;
    } else {
      btnHtml = `<button class="btn-merch-action equip" data-key="${item.key}">Equipar</button>`;
    }

    card.innerHTML = `
      <span class="merch-item-icon">${item.icon}</span>
      <div class="merch-item-title">${item.name}</div>
      <div class="merch-item-building">Quizz en ${item.bName}</div>
      ${btnHtml}
    `;

    // Bind action button
    const btn = card.querySelector('.btn-merch-action');
    if (isUnlocked && btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleEquipItem(item.key);
      });
    }

    grid.appendChild(card);
  });
}

function toggleEquipItem(itemKey) {
  if (window.gameApp.equippedMerch.has(itemKey)) {
    window.gameApp.equippedMerch.delete(itemKey);
  } else {
    window.gameApp.equippedMerch.add(itemKey);
  }
  
  localStorage.setItem('upvt_equipped_merch', JSON.stringify(Array.from(window.gameApp.equippedMerch)));
  
  // Re-render and update 3D Player Mesh
  renderMerchGrid();
  if (window.gameApp.gameScene) {
    window.gameApp.gameScene.updatePlayerAvatar();
  }
}


// ==========================================
// 10. MINI QUIZ SYSTEM
// ==========================================
let currentQuizZone = null;
let currentQuestionIndex = 0;
let quizQuestions = [];
let quizAnswersCorrect = 0;
let activeUnlockItemKey = null;

function setupQuizSystem() {
  const exitBtn = document.getElementById('quiz-exit-btn');
  const modal = document.getElementById('quiz-modal');

  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      modal.classList.remove('visible');
      if (window.gameApp.gameScene) {
        window.gameApp.gameScene.input.keyboard.enabled = true;
      }
    });
  }

  // Bind unlock splash buttons
  const closeSplashBtn = document.getElementById('btn-unlock-close');
  const equipSplashBtn = document.getElementById('btn-unlock-equip');
  const splash = document.getElementById('merch-unlock-splash');

  if (closeSplashBtn) {
    closeSplashBtn.addEventListener('click', () => {
      splash.classList.remove('visible');
      if (window.gameApp.gameScene) {
        window.gameApp.gameScene.input.keyboard.enabled = true;
      }
    });
  }

  if (equipSplashBtn) {
    equipSplashBtn.addEventListener('click', () => {
      if (activeUnlockItemKey) {
        window.gameApp.equippedMerch.add(activeUnlockItemKey);
        localStorage.setItem('upvt_equipped_merch', JSON.stringify(Array.from(window.gameApp.equippedMerch)));
        if (window.gameApp.gameScene) {
          window.gameApp.gameScene.updatePlayerAvatar();
        }
      }
      splash.classList.remove('visible');
      if (window.gameApp.gameScene) {
        window.gameApp.gameScene.input.keyboard.enabled = true;
      }
    });
  }
}

export function startQuiz(zoneLetter) {
  const quizData = UPVT_QUIZZES[zoneLetter];
  if (!quizData) return;

  currentQuizZone = zoneLetter;
  currentQuestionIndex = 0;
  quizQuestions = quizData.preguntas;
  quizAnswersCorrect = 0;
  activeUnlockItemKey = quizData.itemKey;

  // Update header text
  document.getElementById('quiz-building-title').textContent = `Mini Quiz: ${UPVT_DATA.zonas[zoneLetter].nombre}`;
  document.getElementById('quiz-building-prize').textContent = `Premio: ${quizData.premios} ${quizData.itemIcon}`;

  // Pause keyboard focus in 3D game
  if (window.gameApp.gameScene) {
    window.gameApp.gameScene.input.keyboard.enabled = false;
  }

  // Show Modal
  const modal = document.getElementById('quiz-modal');
  modal.classList.add('visible');

  renderQuizQuestion();
}

function renderQuizQuestion() {
  const qData = quizQuestions[currentQuestionIndex];
  const progressText = document.getElementById('quiz-progress-text');
  const progressFill = document.getElementById('quiz-progress-fill');
  const questionText = document.getElementById('quiz-question-text');
  const optionsList = document.getElementById('quiz-options-list');

  progressText.textContent = `Pregunta ${currentQuestionIndex + 1} de ${quizQuestions.length}`;
  progressFill.style.width = `${((currentQuestionIndex) / quizQuestions.length) * 100}%`;
  questionText.textContent = qData.q;

  optionsList.innerHTML = '';
  qData.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option-btn';
    btn.textContent = opt;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleOptionSelected(idx, btn);
    });

    optionsList.appendChild(btn);
  });
}

function handleOptionSelected(selectedIndex, selectedBtn) {
  const qData = quizQuestions[currentQuestionIndex];
  const optionsList = document.getElementById('quiz-options-list');
  const btns = optionsList.querySelectorAll('.quiz-option-btn');

  // Disable all buttons to prevent double clicks
  btns.forEach(b => b.disabled = true);

  if (selectedIndex === qData.answer) {
    selectedBtn.classList.add('correct');
    quizAnswersCorrect++;
    
    // Smooth delay before next question
    setTimeout(() => {
      currentQuestionIndex++;
      if (currentQuestionIndex < quizQuestions.length) {
        renderQuizQuestion();
      } else {
        // Finished Quiz!
        handleQuizSuccess();
      }
    }, 1200);
  } else {
    selectedBtn.classList.add('incorrect');
    
    // Highlight correct answer so student can learn!
    btns[qData.answer].classList.add('correct');

    setTimeout(() => {
      // Close quiz and suggest reviewing info!
      document.getElementById('quiz-modal').classList.remove('visible');
      
      const lines = [
        "¡Vaya! Esa respuesta no es correcta.",
        "Te sugiero leer con cuidado la información del edificio en el panel lateral e intentarlo de nuevo. ¡El merch de la UPVT vale la pena!"
      ];
      showDialogue('Tutor Académico', '👨‍🏫', lines, () => {
        if (window.gameApp.gameScene) {
          window.gameApp.gameScene.input.keyboard.enabled = true;
        }
      });
    }, 1500);
  }
}

function handleQuizSuccess() {
  document.getElementById('quiz-modal').classList.remove('visible');

  // Add to solved quizzes
  window.gameApp.solvedQuizzes.add(currentQuizZone);
  localStorage.setItem('upvt_solved_quizzes', JSON.stringify(Array.from(window.gameApp.solvedQuizzes)));

  // Trigger celebration modal
  const quizData = UPVT_QUIZZES[currentQuizZone];
  document.getElementById('unlock-item-name').textContent = quizData.premios;
  document.getElementById('unlock-item-icon').textContent = quizData.itemIcon;

  updateMerchCounter();

  // Show splash modal
  const splash = document.getElementById('merch-unlock-splash');
  splash.classList.add('visible');

  // Custom mini dialogue congratulating the player
  setTimeout(() => {
    // If they solved all 7 quizzes, give them a grand reward congratulation!
    if (window.gameApp.solvedQuizzes.size === 7) {
      setTimeout(() => {
        const grandLines = [
          "¡INCREÍBLE! Has completado con éxito todos los quizzes de nuestro campus.",
          "Ahora posees la colección completa de Merch Oficial de la UPVT Toluca.",
          "Llevas con orgullo el espíritu de los Halcones de la UPVT. ¡Felicidades, eres un estudiante estrella!"
        ];
        showDialogue('Rectora Silvia Manzur', '👩‍💼', grandLines);
      }, 500);
    }
  }, 1000);
}

