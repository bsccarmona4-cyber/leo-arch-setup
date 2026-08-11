/**
 * ═══════════════════════════════════════════════════════════════
 *  EyeSystem — Sistema de Ojos Procedurales para TheVisitor
 *  Clase ES6 · Three.js r160 · Sin modelos externos
 * ═══════════════════════════════════════════════════════════════
 *
 *  Maneja la anatomía de los ojos:
 *  - Esclerótica (sclera): Esfera blanca/gris brillante fija.
 *  - Iris: Esfera aplanada que rota en la superficie de la esclerótica.
 *  - Pupila: Esfera aplanada negra en el centro del iris.
 *
 *  Características:
 *  - lookAt(targetVector3): Rota solo el iris hacia el objetivo, con un límite
 *    estricto de 15 grados de desviación del eje frontal (-Z).
 *  - setActPhase(0-3): Interpola el color del material del iris de negro (0.0)
 *    a rgb(0.35, 0.20, 0.15) (3.0) y su brillo emissive.
 * ═══════════════════════════════════════════════════════════════
 */

import * as THREE from 'three';

export default class EyeSystem {
  /**
   * @param {THREE.Object3D} visitor - Instancia de TheVisitor
   * @param {Object} [config]
   * @param {number} [config.segmentsDetail=16] - Detalle de segmentos de esfera
   * @param {number} [config.scleraColor=0xdedede] - Color base de la esclerótica
   * @param {number} [config.scleraRoughness=0.1] - Rugosidad de la esclerótica
   */
  constructor(visitor, config = {}) {
    this.visitor = visitor;
    this.head = visitor.getPart ? visitor.getPart('head') : visitor.getObjectByName('head');
    
    if (!this.head) {
      throw new Error('EyeSystem: No se encontró la parte "head" en el visitante.');
    }

    this.detail = config.segmentsDetail ?? 16;
    this.currentPhase = 0;

    // Guardar referencia de los ojos creados
    this.eyes = {
      left: null,
      right: null
    };

    // Crear materiales compartidos para el iris y la pupila
    this._buildMaterials(config);

    // Inicializar y acoplar los ojos
    this._initEyes(config);
  }

  /**
   * Inicializa los materiales de los ojos.
   * @private
   */
  _buildMaterials(config) {
    // Esclerótica: gris pálido brillante
    this.scleraMaterial = new THREE.MeshStandardMaterial({
      color: config.scleraColor ?? 0xdedede,
      roughness: config.scleraRoughness ?? 0.1,
      metalness: 0.0,
      flatShading: false,
    });

    // Iris: Color interpolado dinámicamente de negro (fase 0) a rgb(0.35, 0.20, 0.15) (fase 3)
    this.irisMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0, 0, 0),
      emissive: new THREE.Color(0, 0, 0),
      emissiveIntensity: 2.0,
      roughness: 0.2,
      metalness: 0.1,
      flatShading: false,
    });

    // Pupila: Negro mate profundo
    this.pupilMaterial = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.9,
      metalness: 0.0,
      flatShading: false,
    });
  }

  /**
   * Crea y posiciona los ojos en la cabeza del visitante.
   * @private
   */
  _initEyes(config) {
    const headScaleX = 0.28;
    const headScaleY = 0.24;
    const headScaleZ = 0.26;

    // Posiciones en el espacio local de la cabeza
    const eyePositions = {
      left: new THREE.Vector3(-0.28, 0.12, -0.85),
      right: new THREE.Vector3(0.28, 0.12, -0.85)
    };

    // Crear y añadir ambos ojos
    for (const [side, pos] of Object.entries(eyePositions)) {
      // 1. Grupo principal del ojo
      const eyeGroup = new THREE.Group();
      eyeGroup.name = `${side}EyeSystem`;
      eyeGroup.position.copy(pos);
      
      // Contrarrestar la escala de la cabeza para mantener los ojos esféricos y no deformar rotaciones
      eyeGroup.scale.set(1 / headScaleX, 1 / headScaleY, 1 / headScaleZ);

      // 2. Malla de la esclerótica (eyeball white)
      const scleraGeo = new THREE.SphereGeometry(0.025, this.detail, this.detail);
      const scleraMesh = new THREE.Mesh(scleraGeo, this.scleraMaterial);
      scleraMesh.name = `${side}Sclera`;
      eyeGroup.add(scleraMesh);

      // 3. Contenedor móvil para el iris y la pupila (centrado en el origen del ojo)
      const irisContainer = new THREE.Group();
      irisContainer.name = `${side}IrisContainer`;
      eyeGroup.add(irisContainer);

      // 4. Malla del Iris (esfera pequeña aplanada en el eje Z para amoldarse a la superficie)
      const irisGeo = new THREE.SphereGeometry(0.010, this.detail, this.detail);
      const irisMesh = new THREE.Mesh(irisGeo, this.irisMaterial);
      irisMesh.name = `${side}Iris`;
      irisMesh.scale.set(1, 1, 0.3); // Aplanar en Z
      irisMesh.position.set(0, 0, -0.024); // Posicionar en el frente de la esclerótica (radio ~0.025)
      irisContainer.add(irisMesh);

      // 5. Malla de la Pupila (centro negro del iris)
      const pupilGeo = new THREE.SphereGeometry(0.004, this.detail, this.detail);
      const pupilMesh = new THREE.Mesh(pupilGeo, this.pupilMaterial);
      pupilMesh.name = `${side}Pupil`;
      pupilMesh.scale.set(1, 1, 0.3); // Aplanar en Z
      pupilMesh.position.set(0, 0, -0.0248); // Ligeramente por delante del iris para evitar z-fighting
      irisContainer.add(pupilMesh);

      // Añadir el ojo a la cabeza del visitante
      this.head.add(eyeGroup);

      // Registrar referencias para el lookAt y actualizaciones
      this.eyes[side] = {
        group: eyeGroup,
        sclera: scleraMesh,
        irisContainer: irisContainer,
        iris: irisMesh,
        pupil: pupilMesh
      };
    }
  }

  /**
   * Rota el iris de ambos ojos hacia la posición objetivo en espacio de mundo.
   * La rotación se restringe a un cono de 15 grados del eje frontal (-Z).
   * @param {THREE.Vector3} targetVector3 - Posición objetivo en el mundo
   */
  lookAt(targetVector3) {
    if (!targetVector3 || !targetVector3.isVector3) {
      return;
    }

    const forward = new THREE.Vector3(0, 0, -1);
    const maxAngle = 15 * Math.PI / 180; // 15 grados en radianes (~0.2618 rad)

    for (const side of ['left', 'right']) {
      const eye = this.eyes[side];
      if (!eye) continue;

      // Transformar el target al espacio local del grupo del ojo
      const localTarget = targetVector3.clone();
      eye.group.worldToLocal(localTarget);

      const len = localTarget.length();
      if (len < 0.0001) {
        // Si el target coincide con la posición del ojo, mirar al frente
        eye.irisContainer.quaternion.setFromUnitVectors(forward, forward);
        continue;
      }

      // Dirección normalizada hacia el target
      const dirLocal = localTarget.clone().normalize();

      // Calcular el ángulo de desviación con respecto a la frontal
      const angle = forward.angleTo(dirLocal);

      let clampedDir;
      if (angle <= maxAngle) {
        clampedDir = dirLocal;
      } else {
        // Desviación excesiva: proyectar en el plano perpendicular a forward (plano XY local)
        const px = dirLocal.x;
        const py = dirLocal.y;
        const projLen = Math.sqrt(px * px + py * py);

        if (projLen > 0.0001) {
          const nx = px / projLen;
          const ny = py / projLen;

          // Construir el vector con la desviación máxima de 15 grados en la dirección proyectada
          clampedDir = new THREE.Vector3(
            Math.sin(maxAngle) * nx,
            Math.sin(maxAngle) * ny,
            -Math.cos(maxAngle)
          );
          clampedDir.normalize();
        } else {
          // Si el objetivo está directamente detrás (en el eje Z positivo)
          clampedDir = forward.clone();
        }
      }

      // Rota el irisContainer para apuntar el eje -Z hacia clampedDir
      const q = new THREE.Quaternion();
      q.setFromUnitVectors(forward, clampedDir);
      eye.irisContainer.quaternion.copy(q);
    }
  }

  /**
   * Establece la fase de actuación del visitante (0 a 3).
   * Interpola el color del iris de negro (0.0) a rgb(0.35, 0.20, 0.15) (3.0)
   * e influye también en el color emissive del material.
   * @param {number} phase - Fase actual (float o entero, rango 0 - 3)
   */
  setActPhase(phase) {
    const p = Math.max(0, Math.min(3, phase));
    this.currentPhase = p;

    // Normalizar a un factor entre 0.0 y 1.0 para la interpolación lineal
    const t = p / 3.0;

    // Color objetivo en fase 3: rgb(0.35, 0.20, 0.15)
    const targetR = 0.35;
    const targetG = 0.20;
    const targetB = 0.15;

    // Interpolación lineal simple desde negro (0.0, 0.0, 0.0)
    const r = targetR * t;
    const g = targetG * t;
    const b = targetB * t;

    // Actualizar el material compartido
    this.irisMaterial.color.setRGB(r, g, b);
    this.irisMaterial.emissive.setRGB(r, g, b);
  }

  /**
   * Limpia y destruye las geometrías y materiales creados para evitar fugas de memoria.
   */
  dispose() {
    this.scleraMaterial.dispose();
    this.irisMaterial.dispose();
    this.pupilMaterial.dispose();

    for (const side of ['left', 'right']) {
      const eye = this.eyes[side];
      if (eye) {
        eye.sclera.geometry.dispose();
        eye.iris.geometry.dispose();
        eye.pupil.geometry.dispose();
        
        if (eye.group.parent) {
          eye.group.parent.remove(eye.group);
        }
      }
    }
  }
}
