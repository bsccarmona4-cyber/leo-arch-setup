/**
 * ═══════════════════════════════════════════════════════════════
 *  HardwareDetector.js — Calibración de Hardware en Tiempo Real
 *  Módulo ES6 · Three.js r160
 * ═══════════════════════════════════════════════════════════════
 */

export default class HardwareDetector {
  /**
   * Corre un benchmark gráfico rápido (500ms) y analiza las capacidades de WebGL
   * @param {THREE.WebGLRenderer} renderer 
   * @param {Object} THREE - Instancia de Three.js
   * @returns {Promise<{ tier: 'high'|'medium'|'low', isMobile: boolean, estimatedFps: number }>}
   */
  static run(renderer, THREE) {
    return new Promise((resolve) => {
      // 1. Detectar si es dispositivo móvil por userAgent y capacidades táctiles
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || 
                       (navigator.maxTouchPoints > 0 && window.innerWidth < 1024);
      
      const maxTextureSize = renderer.capabilities.maxTextureSize || 2048;
      const isWebGL2 = renderer.capabilities.isWebGL2;
      
      // 2. Escena temporal de benchmark
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0c10);
      
      const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 10);
      camera.position.z = 2.5;
      
      // Torus complex para forzar un poco la GPU en 500ms
      const geo = new THREE.TorusKnotGeometry(0.5, 0.18, 120, 18);
      const mat = new THREE.MeshNormalMaterial({ flatShading: true });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      
      let frames = 0;
      const startTime = performance.now();
      
      function renderLoop() {
        const now = performance.now();
        const elapsed = now - startTime;
        
        if (elapsed >= 500) {
          const fps = Math.round((frames * 1000) / elapsed);
          
          // Clasificación de Tiers
          // TIER LOW: Dispositivo móvil, límites de textura reducidos o menos de 35 fps en benchmark
          // TIER MEDIUM: WebGL 1, texturas medianas, o menos de 55 fps
          // TIER HIGH: PC de escritorio potente con WebGL 2 y fps estables >= 55
          let tier = 'high';
          if (isMobile || maxTextureSize <= 4096 || fps < 35) {
            tier = 'low';
          } else if (maxTextureSize <= 8192 || !isWebGL2 || fps < 55) {
            tier = 'medium';
          }
          
          // Liberar recursos de Three.js
          geo.dispose();
          mat.dispose();
          scene.remove(mesh);
          
          resolve({
            tier,
            isMobile,
            estimatedFps: fps
          });
          return;
        }
        
        mesh.rotation.x += 0.08;
        mesh.rotation.y += 0.08;
        renderer.render(scene, camera);
        frames++;
        
        requestAnimationFrame(renderLoop);
      }
      
      renderLoop();
    });
  }
}
