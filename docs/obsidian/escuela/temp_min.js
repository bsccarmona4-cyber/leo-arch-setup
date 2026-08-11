
class EventEmitter {
constructor() {
this._listeners = new Map();
}
on(event, callback) {
if (!this._listeners.has(event)) {
this._listeners.set(event, new Set());
}
this._listeners.get(event).add(callback);
return this;
}
once(event, callback) {
const wrapper = (...args) => {
this.off(event, wrapper);
callback.apply(this, args);
};
wrapper._original = callback;
return this.on(event, wrapper);
}
off(event, callback) {
const listeners = this._listeners.get(event);
if (!listeners) return this;
listeners.delete(callback);
for (const fn of listeners) {
if (fn._original === callback) {
listeners.delete(fn);
break;
}
}
return this;
}
removeAllListeners(event) {
if (event) {
this._listeners.delete(event);
} else {
this._listeners.clear();
}
return this;
}
emit(event, ...args) {
const listeners = this._listeners.get(event);
if (!listeners || listeners.size === 0) return this;
for (const callback of [...listeners]) {
callback(...args);
}
return this;
}
listenerCount(event) {
const listeners = this._listeners.get(event);
return listeners ? listeners.size : 0;
}
}
class FearEngine extends EventEmitter {
constructor(config = {}) {
super();
this._fear = Math.max(0, Math.min(1, config.initialFear ?? 0.0));
this._rates = Object.freeze({
idle:              config.idleRate             ?? 0.02,
lookingAtMonster:  config.lookingAtMonsterRate ?? 0.05,
darkZone:          config.darkZoneRate         ?? 0.01,
moving:            config.movingRate           ?? 0.01,
nearLight:         config.nearLightRate        ?? 0.03,
});
this._lookAngleThreshold = config.lookAngleThreshold ?? (Math.PI / 6);
this._state = {
isMoving:            false,
isLookingAtMonster:  false,
isInDarkZone:        false,
isNearLight:         false,
lookAngle:           null,
};
this._thresholds = new Map();
this._crossedThresholds = new Set();
this._lastUpdateTime = null;
this._paused = false;
}
getFear() {
return this._fear;
}
getState() {
return { ...this._state };
}
isPaused() {
return this._paused;
}
setFear(value) {
const prev = this._fear;
this._fear = clamp01(value);
if (this._fear !== prev) {
this.emit('fearChanged', this._fear);
this._checkThresholds(prev);
}
return this;
}
onFearThreshold(value, callback) {
if (value < 0 || value > 1) {
throw new RangeError(`Threshold debe estar entre 0 y 1, recibido: ${value}`);
}
if (!this._thresholds.has(value)) {
this._thresholds.set(value, new Set());
}
this._thresholds.get(value).add(callback);
return this;
}
offFearThreshold(value, callback) {
const cbs = this._thresholds.get(value);
if (cbs) {
cbs.delete(callback);
if (cbs.size === 0) this._thresholds.delete(value);
}
return this;
}
setMoving(moving) {
const was = this._state.isMoving;
this._state.isMoving = !!moving;
if (was !== this._state.isMoving) {
this.emit('stateChanged', { property: 'isMoving', value: this._state.isMoving });
}
return this;
}
setLookAngle(angleRad) {
this._state.lookAngle = angleRad;
const wasLooking = this._state.isLookingAtMonster;
this._state.isLookingAtMonster =
angleRad !== null && Math.abs(angleRad) <= this._lookAngleThreshold;
if (wasLooking !== this._state.isLookingAtMonster) {
this.emit('stateChanged', {
property: 'isLookingAtMonster',
value: this._state.isLookingAtMonster,
});
}
return this;
}
setInDarkZone(inDark) {
const was = this._state.isInDarkZone;
this._state.isInDarkZone = !!inDark;
if (was !== this._state.isInDarkZone) {
this.emit('stateChanged', { property: 'isInDarkZone', value: this._state.isInDarkZone });
}
return this;
}
setNearLight(nearLight) {
const was = this._state.isNearLight;
this._state.isNearLight = !!nearLight;
if (was !== this._state.isNearLight) {
this.emit('stateChanged', { property: 'isNearLight', value: this._state.isNearLight });
}
return this;
}
update(deltaTime) {
if (this._paused) return this;
if (deltaTime === undefined) {
const now = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
if (this._lastUpdateTime === null) {
this._lastUpdateTime = now;
return this;
}
deltaTime = now - this._lastUpdateTime;
this._lastUpdateTime = now;
}
if (deltaTime <= 0) return this;
const previousFear = this._fear;
let netRate = 0;
if (!this._state.isMoving) {
netRate += this._rates.idle;
}
if (this._state.isLookingAtMonster) {
netRate += this._rates.lookingAtMonster;
}
if (this._state.isInDarkZone) {
netRate += this._rates.darkZone;
}
if (this._state.isMoving) {
netRate -= this._rates.moving;
}
if (this._state.isNearLight) {
netRate -= this._rates.nearLight;
}
this._fear = clamp01(this._fear + netRate * deltaTime);
if (this._fear !== previousFear) {
this.emit('fearChanged', this._fear);
this._checkThresholds(previousFear);
if (this._fear >= 1.0 && previousFear < 1.0) {
this.emit('maxFear');
}
if (this._fear <= 0.0 && previousFear > 0.0) {
this.emit('noFear');
}
}
return this;
}
pause() {
this._paused = true;
this._lastUpdateTime = null;
return this;
}
resume() {
this._paused = false;
this._lastUpdateTime = null;
return this;
}
reset() {
this._fear = 0.0;
this._state.isMoving = false;
this._state.isLookingAtMonster = false;
this._state.isInDarkZone = false;
this._state.isNearLight = false;
this._state.lookAngle = null;
this._crossedThresholds.clear();
this._lastUpdateTime = null;
this._paused = false;
this.emit('fearChanged', 0.0);
this.emit('reset');
return this;
}
serialize() {
return {
fear: this._fear,
state: { ...this._state },
paused: this._paused,
};
}
deserialize(data) {
if (data.fear !== undefined) this._fear = clamp01(data.fear);
if (data.state) Object.assign(this._state, data.state);
if (data.paused !== undefined) this._paused = data.paused;
this._lastUpdateTime = null;
this._crossedThresholds.clear();
this.emit('fearChanged', this._fear);
return this;
}
toString() {
const pct = (this._fear * 100).toFixed(1);
const flags = [
this._state.isMoving           ? 'MOV'  : 'IDLE',
this._state.isLookingAtMonster ? 'LOOK' : '----',
this._state.isInDarkZone       ? 'DARK' : '----',
this._state.isNearLight        ? 'LIT'  : '----',
].join(' ');
return `[FearEngine ${pct}% | ${flags}${this._paused ? ' | PAUSED' : ''}]`;
}
_checkThresholds(previousFear) {
for (const [threshold, callbacks] of this._thresholds) {
const crossedUpward = previousFear < threshold && this._fear >= threshold;
const fellBelow     = this._fear < threshold;
if (crossedUpward && !this._crossedThresholds.has(threshold)) {
this._crossedThresholds.add(threshold);
for (const cb of [...callbacks]) {
cb(this._fear, threshold);
}
this.emit('thresholdCrossed', { threshold, fear: this._fear });
} else if (fellBelow) {
this._crossedThresholds.delete(threshold);
}
}
}
}
function clamp01(v) {
return v < 0 ? 0 : v > 1 ? 1 : v;
}
export { FearEngine, EventEmitter };
export default FearEngine;


import * as THREE from 'three';
const PROPORTIONS = Object.freeze({
totalHeight: 1.85,
headScaleX: 0.28,
headScaleY: 0.24,
headScaleZ: 0.26,
neckLength: 0.08,
neckRadius: 0.045,
neckRotZ:   0.08,
torsoLength: 0.50,
torsoRadius: 0.14,
shoulderOffsetX: 0.19,
shoulderOffsetY: 0.21,
hipOffsetX:      0.09,
upperLegLength: 0.38,
upperLegRadius: 0.055,
lowerLegLength: 0.36,
lowerLegRadius: 0.040,
footWidth:  0.09,
footHeight: 0.05,
footDepth:  0.22,
armMultiplier:   1.15,
baseUpperArm:    0.29,
baseForearm:     0.254,
baseHand:        0.12,
upperArmRadius:  0.035,
forearmRadius:   0.028,
handWidth:  0.04,
handHeight: 0.10,
handDepth:  0.025,
});
const ARM = Object.freeze({
upperArmLength: PROPORTIONS.baseUpperArm  * PROPORTIONS.armMultiplier,
forearmLength:  PROPORTIONS.baseForearm   * PROPORTIONS.armMultiplier,
handLength:     PROPORTIONS.baseHand      * PROPORTIONS.armMultiplier,
});
const Y = Object.freeze({
ground:     0,
footTop:    PROPORTIONS.footHeight,
knee:       PROPORTIONS.footHeight + PROPORTIONS.lowerLegLength,
hip:        PROPORTIONS.footHeight + PROPORTIONS.lowerLegLength
+ PROPORTIONS.upperLegLength,
neckBase:   PROPORTIONS.footHeight + PROPORTIONS.lowerLegLength
+ PROPORTIONS.upperLegLength + PROPORTIONS.torsoLength,
headCenter: PROPORTIONS.footHeight + PROPORTIONS.lowerLegLength
+ PROPORTIONS.upperLegLength + PROPORTIONS.torsoLength
+ PROPORTIONS.neckLength + PROPORTIONS.headScaleY,
top:        PROPORTIONS.footHeight + PROPORTIONS.lowerLegLength
+ PROPORTIONS.upperLegLength + PROPORTIONS.torsoLength
+ PROPORTIONS.neckLength + PROPORTIONS.headScaleY * 2,
});
const DEFAULT_MATERIALS = Object.freeze({
body: {
color:     0x1a1a1e,
roughness: 0.55,
metalness: 0.12,
flatShading: true,
},
head: {
color:     0x1e1e24,
roughness: 0.40,
metalness: 0.18,
flatShading: true,
},
limb: {
color:     0x222228,
roughness: 0.60,
metalness: 0.10,
flatShading: true,
},
extremity: {
color:     0x2a2a32,
roughness: 0.70,
metalness: 0.05,
flatShading: true,
},
});
export default class TheVisitor extends THREE.Group {
constructor(config = {}) {
super();
this.name = 'TheVisitor';
this._detail = config.segmentsDetail ?? 16;
this._castShadow = config.castShadow ?? true;
this._receiveShadow = config.receiveShadow ?? true;
this._materials = this._buildMaterials(config.materials);
this.parts = new Map();
this._build();
}
getPart(name) {
return this.parts.get(name);
}
getPartNames() {
return [...this.parts.keys()];
}
getProportions() {
return { ...PROPORTIONS, arm: { ...ARM }, absoluteY: { ...Y } };
}
traverseMeshes(fn) {
for (const [name, obj] of this.parts) {
if (obj.isMesh) fn(obj, name);
}
}
toString() {
const names = this.getPartNames().join(', ');
return `[TheVisitor | ${this.parts.size} parts | height=${PROPORTIONS.totalHeight}m]\n  Parts: ${names}`;
}
_buildMaterials(overrides = {}) {
const mats = {};
for (const [key, defaults] of Object.entries(DEFAULT_MATERIALS)) {
const userOverride = overrides[key] || {};
mats[key] = new THREE.MeshStandardMaterial({ ...defaults, ...userOverride });
}
return mats;
}
_register(name, obj) {
obj.name = name;
this.parts.set(name, obj);
if (obj.isMesh) {
obj.castShadow = this._castShadow;
obj.receiveShadow = this._receiveShadow;
}
return obj;
}
_capsule(totalLength, radius, material) {
const middleLength = Math.max(0, totalLength - 2 * radius);
const geo = new THREE.CapsuleGeometry(radius, middleLength, 4, this._detail);
return new THREE.Mesh(geo, material);
}
_cylinder(height, radiusTop, radiusBottom, material) {
const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, this._detail);
return new THREE.Mesh(geo, material);
}
_box(w, h, d, material) {
const geo = new THREE.BoxGeometry(w, h, d);
return new THREE.Mesh(geo, material);
}
_build() {
const P = PROPORTIONS;
const M = this._materials;
const pelvis = this._register('pelvis', new THREE.Group());
pelvis.position.y = Y.hip;
this.add(pelvis);
const torso = this._register(
'torso',
this._capsule(P.torsoLength, P.torsoRadius, M.body)
);
torso.position.y = P.torsoLength / 2;
pelvis.add(torso);
const neckJoint = this._register('neckJoint', new THREE.Group());
neckJoint.position.y = P.torsoLength;
neckJoint.rotation.z = P.neckRotZ;
pelvis.add(neckJoint);
const neck = this._register(
'neck',
this._cylinder(P.neckLength, P.neckRadius, P.neckRadius * 1.1, M.body)
);
neck.position.y = P.neckLength / 2;
neckJoint.add(neck);
const headGeo = new THREE.SphereGeometry(1, this._detail * 2, this._detail);
const head = this._register('head', new THREE.Mesh(headGeo, M.head));
head.scale.set(P.headScaleX, P.headScaleY, P.headScaleZ);
head.position.y = P.neckLength + P.headScaleY;
neckJoint.add(head);
this._buildArm(pelvis, 'left',  -1, M);
this._buildArm(pelvis, 'right',  1, M);
this._buildLeg(pelvis, 'left',  -1, M);
this._buildLeg(pelvis, 'right',  1, M);
}
_buildArm(parent, side, sign, M) {
const P = PROPORTIONS;
const prefix = side;
const shoulder = this._register(`${prefix}Shoulder`, new THREE.Group());
shoulder.position.set(
sign * P.shoulderOffsetX,
P.torsoLength - P.shoulderOffsetY,
0
);
parent.add(shoulder);
const upperArm = this._register(
`${prefix}UpperArm`,
this._capsule(ARM.upperArmLength, P.upperArmRadius, M.limb)
);
upperArm.position.y = -ARM.upperArmLength / 2;
shoulder.add(upperArm);
const elbow = this._register(`${prefix}Elbow`, new THREE.Group());
elbow.position.y = -ARM.upperArmLength;
shoulder.add(elbow);
const forearm = this._register(
`${prefix}Forearm`,
this._capsule(ARM.forearmLength, P.forearmRadius, M.limb)
);
forearm.position.y = -ARM.forearmLength / 2;
elbow.add(forearm);
const wrist = this._register(`${prefix}Wrist`, new THREE.Group());
wrist.position.y = -ARM.forearmLength;
elbow.add(wrist);
const hand = this._register(
`${prefix}Hand`,
this._box(
P.handWidth,
ARM.handLength,
P.handDepth,
M.extremity
)
);
hand.position.y = -ARM.handLength / 2;
wrist.add(hand);
}
_buildLeg(parent, side, sign, M) {
const P = PROPORTIONS;
const prefix = side;
const hip = this._register(`${prefix}Hip`, new THREE.Group());
hip.position.set(sign * P.hipOffsetX, 0, 0);
parent.add(hip);
const upperLeg = this._register(
`${prefix}UpperLeg`,
this._capsule(P.upperLegLength, P.upperLegRadius, M.limb)
);
upperLeg.position.y = -P.upperLegLength / 2;
hip.add(upperLeg);
const knee = this._register(`${prefix}Knee`, new THREE.Group());
knee.position.y = -P.upperLegLength;
hip.add(knee);
const lowerLeg = this._register(
`${prefix}LowerLeg`,
this._capsule(P.lowerLegLength, P.lowerLegRadius, M.limb)
);
lowerLeg.position.y = -P.lowerLegLength / 2;
knee.add(lowerLeg);
const ankle = this._register(`${prefix}Ankle`, new THREE.Group());
ankle.position.y = -P.lowerLegLength;
knee.add(ankle);
const foot = this._register(
`${prefix}Foot`,
this._box(P.footWidth, P.footHeight, P.footDepth, M.extremity)
);
foot.position.set(0, -P.footHeight / 2, P.footDepth * 0.2);
ankle.add(foot);
}
}
export { TheVisitor, PROPORTIONS, ARM, Y as ABSOLUTE_Y, DEFAULT_MATERIALS };


import * as THREE from 'three';
export default class EyeSystem {
constructor(visitor, config = {}) {
this.visitor = visitor;
this.head = visitor.getPart ? visitor.getPart('head') : visitor.getObjectByName('head');
if (!this.head) {
throw new Error('EyeSystem: No se encontró la parte "head" en el visitante.');
}
this.detail = config.segmentsDetail ?? 16;
this.currentPhase = 0;
this.eyes = {
left: null,
right: null
};
this._buildMaterials(config);
this._initEyes(config);
}
_buildMaterials(config) {
this.scleraMaterial = new THREE.MeshStandardMaterial({
color: config.scleraColor ?? 0xdedede,
roughness: config.scleraRoughness ?? 0.1,
metalness: 0.0,
flatShading: false,
});
this.irisMaterial = new THREE.MeshStandardMaterial({
color: new THREE.Color(0, 0, 0),
emissive: new THREE.Color(0, 0, 0),
emissiveIntensity: 2.0,
roughness: 0.2,
metalness: 0.1,
flatShading: false,
});
this.pupilMaterial = new THREE.MeshStandardMaterial({
color: 0x050505,
roughness: 0.9,
metalness: 0.0,
flatShading: false,
});
}
_initEyes(config) {
const headScaleX = 0.28;
const headScaleY = 0.24;
const headScaleZ = 0.26;
const eyePositions = {
left: new THREE.Vector3(-0.28, 0.12, -0.85),
right: new THREE.Vector3(0.28, 0.12, -0.85)
};
for (const [side, pos] of Object.entries(eyePositions)) {
const eyeGroup = new THREE.Group();
eyeGroup.name = `${side}EyeSystem`;
eyeGroup.position.copy(pos);
eyeGroup.scale.set(1 / headScaleX, 1 / headScaleY, 1 / headScaleZ);
const scleraGeo = new THREE.SphereGeometry(0.025, this.detail, this.detail);
const scleraMesh = new THREE.Mesh(scleraGeo, this.scleraMaterial);
scleraMesh.name = `${side}Sclera`;
eyeGroup.add(scleraMesh);
const irisContainer = new THREE.Group();
irisContainer.name = `${side}IrisContainer`;
eyeGroup.add(irisContainer);
const irisGeo = new THREE.SphereGeometry(0.010, this.detail, this.detail);
const irisMesh = new THREE.Mesh(irisGeo, this.irisMaterial);
irisMesh.name = `${side}Iris`;
irisMesh.scale.set(1, 1, 0.3);
irisMesh.position.set(0, 0, -0.024);
irisContainer.add(irisMesh);
const pupilGeo = new THREE.SphereGeometry(0.004, this.detail, this.detail);
const pupilMesh = new THREE.Mesh(pupilGeo, this.pupilMaterial);
pupilMesh.name = `${side}Pupil`;
pupilMesh.scale.set(1, 1, 0.3);
pupilMesh.position.set(0, 0, -0.0248);
irisContainer.add(pupilMesh);
this.head.add(eyeGroup);
this.eyes[side] = {
group: eyeGroup,
sclera: scleraMesh,
irisContainer: irisContainer,
iris: irisMesh,
pupil: pupilMesh
};
}
}
lookAt(targetVector3) {
if (!targetVector3 || !targetVector3.isVector3) {
return;
}
const forward = new THREE.Vector3(0, 0, -1);
const maxAngle = 15 * Math.PI / 180;
for (const side of ['left', 'right']) {
const eye = this.eyes[side];
if (!eye) continue;
const localTarget = targetVector3.clone();
eye.group.worldToLocal(localTarget);
const len = localTarget.length();
if (len < 0.0001) {
eye.irisContainer.quaternion.setFromUnitVectors(forward, forward);
continue;
}
const dirLocal = localTarget.clone().normalize();
const angle = forward.angleTo(dirLocal);
let clampedDir;
if (angle <= maxAngle) {
clampedDir = dirLocal;
} else {
const px = dirLocal.x;
const py = dirLocal.y;
const projLen = Math.sqrt(px * px + py * py);
if (projLen > 0.0001) {
const nx = px / projLen;
const ny = py / projLen;
clampedDir = new THREE.Vector3(
Math.sin(maxAngle) * nx,
Math.sin(maxAngle) * ny,
-Math.cos(maxAngle)
);
clampedDir.normalize();
} else {
clampedDir = forward.clone();
}
}
const q = new THREE.Quaternion();
q.setFromUnitVectors(forward, clampedDir);
eye.irisContainer.quaternion.copy(q);
}
}
setActPhase(phase) {
const p = Math.max(0, Math.min(3, phase));
this.currentPhase = p;
const t = p / 3.0;
const targetR = 0.35;
const targetG = 0.20;
const targetB = 0.15;
const r = targetR * t;
const g = targetG * t;
const b = targetB * t;
this.irisMaterial.color.setRGB(r, g, b);
this.irisMaterial.emissive.setRGB(r, g, b);
}
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


import * as THREE from 'three';
class EventEmitter {
constructor() {
this._listeners = new Map();
}
on(event, callback) {
if (!this._listeners.has(event)) this._listeners.set(event, new Set());
this._listeners.get(event).add(callback);
return this;
}
off(event, callback) {
const set = this._listeners.get(event);
if (set) set.delete(callback);
return this;
}
emit(event, ...args) {
const set = this._listeners.get(event);
if (set && set.size > 0) for (const fn of [...set]) fn(...args);
return this;
}
listenerCount(event) {
return (this._listeners.get(event) || { size: 0 }).size;
}
}
const STATES = Object.freeze({
DORMANT:   'DORMANT',
AWARE:     'AWARE',
FOLLOWING: 'FOLLOWING',
HUNTING:   'HUNTING',
});
export default class VisitorAI extends EventEmitter {
static get DORMANT()   { return STATES.DORMANT; }
static get AWARE()     { return STATES.AWARE; }
static get FOLLOWING() { return STATES.FOLLOWING; }
static get HUNTING()   { return STATES.HUNTING; }
constructor(visitor, config = {}) {
super();
this.visitor = visitor;
this._neckJoint = visitor.getPart ? visitor.getPart('neckJoint') : null;
this._orbitRadius    = config.orbitRadius     ?? 4.0;
this._minOrbitRadius = config.minOrbitRadius  ?? 2.0;
this._playerSpeed    = config.playerSpeed     ?? 2.0;
this._speedMult      = config.speedMultiplier ?? 1.12;
this._bodyLerpSpeed  = config.bodyLerpSpeed   ?? 3.0;
this._stillThreshold   = config.stillThreshold   ?? 5.0;
this._headTurnDuration = config.headTurnDuration ?? 0.8;
this._headTurnAngle    = config.headTurnAngle    ?? 1.4;
this._thresholds = Object.freeze({
aware:     config.thresholds?.aware     ?? 0.20,
following: config.thresholds?.following ?? 0.50,
hunting:   config.thresholds?.hunting   ?? 0.80,
});
this._state = STATES.DORMANT;
this._orbitAngle = 0;
this._bodyYaw = visitor.rotation?.y ?? 0;
this._stillTimer = 0;
this._headTurnActive = false;
this._headTurnTimer = 0;
this._headTurnSide = 1;
this._vPlayerPos = new THREE.Vector3();
this._vOrbPos   = new THREE.Vector3();
}
getState() { return this._state; }
getOrbitAngle() { return this._orbitAngle; }
getEffectiveRadius() {
return this._state === STATES.HUNTING ? this._minOrbitRadius : this._orbitRadius;
}
getStillTimer() { return this._stillTimer; }
setOrbitAngle(angle) {
this._orbitAngle = angle;
return this;
}
setPlayerSpeed(speed) {
this._playerSpeed = Math.max(0, speed);
return this;
}
update(dt, fearLevel, playerPosition) {
if (dt <= 0 || dt > 0.5) return;
this._vPlayerPos.copy(playerPosition);
this._updateState(fearLevel);
const isMoving = this._state === STATES.FOLLOWING || this._state === STATES.HUNTING;
this._updateMovement(dt, isMoving);
this._updateBodyOrientation(dt);
if (!this._headTurnActive) {
this._updateHeadLookAt();
}
if (this._headTurnActive) {
this._animateHeadTurn(dt);
}
}
toString() {
return `[VisitorAI | ${this._state}` +
` | orbit=${this._orbitAngle.toFixed(2)}rad` +
` | still=${this._stillTimer.toFixed(1)}s` +
` | bodyYaw=${this._bodyYaw.toFixed(2)}rad]`;
}
_updateState(fearLevel) {
const newState = this._computeTargetState(fearLevel);
if (newState === this._state) return;
const wasMoving = this._state === STATES.FOLLOWING || this._state === STATES.HUNTING;
const willMove  = newState   === STATES.FOLLOWING || newState   === STATES.HUNTING;
const prev = this._state;
this._state = newState;
this._stillTimer = 0;
if (!wasMoving && willMove)  this.emit('orbitStarted');
if (wasMoving  && !willMove) this.emit('orbitStopped');
this.emit('stateChanged', { from: prev, to: newState });
}
_computeTargetState(fearLevel) {
if (fearLevel >= this._thresholds.hunting)   return STATES.HUNTING;
if (fearLevel >= this._thresholds.following) return STATES.FOLLOWING;
if (fearLevel >= this._thresholds.aware)     return STATES.AWARE;
return STATES.DORMANT;
}
_updateMovement(dt, isMoving) {
if (isMoving) {
const radius      = this.getEffectiveRadius();
const linearSpeed = this._playerSpeed * this._speedMult;
const angularSpeed = linearSpeed / radius;
this._orbitAngle += angularSpeed * dt;
this._vOrbPos.set(
this._vPlayerPos.x + Math.cos(this._orbitAngle) * radius,
0,
this._vPlayerPos.z + Math.sin(this._orbitAngle) * radius
);
this.visitor.position.copy(this._vOrbPos);
this._stillTimer = 0;
} else if (this._state === STATES.AWARE) {
this._stillTimer += dt;
if (this._stillTimer >= this._stillThreshold && !this._headTurnActive) {
this._stillTimer = 0;
this._triggerHeadTurn();
}
}
}
_updateBodyOrientation(dt) {
if (this._state === STATES.DORMANT) return;
const dx = this._vPlayerPos.x - this.visitor.position.x;
const dz = this._vPlayerPos.z - this.visitor.position.z;
if (dx * dx + dz * dz < 0.0001) return;
const targetYaw = Math.atan2(-dx, -dz);
this._bodyYaw = _lerpAngle(this._bodyYaw, targetYaw, Math.min(1, dt * this._bodyLerpSpeed));
this.visitor.rotation.y = this._bodyYaw;
}
_updateHeadLookAt() {
if (!this._neckJoint) return;
if (this._state === STATES.DORMANT) {
this._neckJoint.rotation.y = 0;
this._neckJoint.rotation.z = 0.08;
return;
}
const dx = this._vPlayerPos.x - this.visitor.position.x;
const dz = this._vPlayerPos.z - this.visitor.position.z;
if (dx * dx + dz * dz < 0.0001) return;
const bodyYaw = this.visitor.rotation.y;
const localDx = dx * Math.cos(bodyYaw) - dz * Math.sin(bodyYaw);
const localDz = dx * Math.sin(bodyYaw) + dz * Math.cos(bodyYaw);
const headYaw = Math.atan2(-localDx, -localDz);
this._neckJoint.rotation.y = headYaw;
this._neckJoint.rotation.z = 0.08;
}
_triggerHeadTurn() {
this._headTurnActive = true;
this._headTurnTimer  = 0;
this._headTurnSide = this._headTurnSide === 1 ? -1 : 1;
this.emit('headTurn', { angle: this._headTurnAngle * this._headTurnSide });
}
_animateHeadTurn(dt) {
if (!this._neckJoint) { this._headTurnActive = false; return; }
this._headTurnTimer += dt;
const progress = Math.min(1, this._headTurnTimer / this._headTurnDuration);
let headYaw;
if (progress < 0.4) {
headYaw = this._headTurnAngle * this._headTurnSide * (progress / 0.4);
} else {
headYaw = this._headTurnAngle * this._headTurnSide * (1 - (progress - 0.4) / 0.6);
}
this._neckJoint.rotation.y = headYaw;
this._neckJoint.rotation.z = 0.08;
if (progress >= 1) {
this._headTurnActive = false;
this._headTurnTimer  = 0;
}
}
}
function _lerpAngle(current, target, t) {
let diff = target - current;
while (diff >  Math.PI) diff -= Math.PI * 2;
while (diff < -Math.PI) diff += Math.PI * 2;
return current + diff * t;
}
export { VisitorAI, STATES };


import * as THREE from 'three';
import TheVisitor from './TheVisitor.js';
import EyeSystem from './EyeSystem.js';
function createCrayonDrawing(turned = false) {
const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#eae5d8';
ctx.fillRect(0, 0, 512, 512);
ctx.strokeStyle = 'rgba(0,0,0,0.04)';
ctx.lineWidth = 1;
for (let i = 0; i < 15; i++) {
ctx.beginPath();
ctx.moveTo(Math.random() * 512, 0);
ctx.lineTo(Math.random() * 512, 512);
ctx.stroke();
}
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
ctx.strokeStyle = 'rgba(201, 76, 76, 0.25)';
ctx.lineWidth = 4;
for (let i = 0; i < 15; i++) {
ctx.beginPath();
ctx.moveTo(180 + Math.random() * 150, 220 + Math.random() * 140);
ctx.lineTo(180 + Math.random() * 150, 220 + Math.random() * 140);
ctx.stroke();
}
ctx.strokeStyle = '#4c8fc9';
ctx.lineWidth = 5;
ctx.beginPath();
ctx.arc(200, 310, 10, 0, Math.PI * 2);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(200, 320);
ctx.lineTo(200, 355);
ctx.moveTo(185, 335);
ctx.lineTo(215, 335);
ctx.moveTo(200, 355);
ctx.lineTo(188, 375);
ctx.moveTo(200, 355);
ctx.lineTo(212, 375);
ctx.stroke();
ctx.strokeStyle = '#1a1a1a';
ctx.lineWidth = 5.5;
const headX = 290;
const headY = 220;
ctx.beginPath();
ctx.arc(headX, headY, 14, 0, Math.PI * 2);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(headX, headY + 14);
ctx.lineTo(headX, headY + 80);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(headX, headY + 24);
ctx.bezierCurveTo(headX - 40, headY + 40, headX - 60, headY + 100, headX - 55, headY + 150);
ctx.moveTo(headX, headY + 24);
ctx.bezierCurveTo(headX + 45, headY + 40, headX + 65, headY + 100, headX + 60, headY + 150);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(headX, headY + 80);
ctx.lineTo(headX - 18, headY + 155);
ctx.moveTo(headX, headY + 80);
ctx.lineTo(headX + 18, headY + 155);
ctx.stroke();
ctx.fillStyle = '#1a1a1a';
if (turned) {
ctx.beginPath();
ctx.arc(headX - 7, headY - 2, 2.5, 0, Math.PI * 2);
ctx.arc(headX - 2, headY - 3, 2.5, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.strokeStyle = '#1a1a1a';
ctx.lineWidth = 2.2;
ctx.arc(headX - 5, headY + 6, 4, 0, Math.PI, true);
ctx.stroke();
} else {
ctx.beginPath();
ctx.arc(headX - 4, headY - 1, 2, 0, Math.PI * 2);
ctx.arc(headX + 4, headY - 1, 2, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.moveTo(headX - 5, headY + 6);
ctx.lineTo(headX + 5, headY + 6);
ctx.stroke();
}
ctx.fillStyle = 'rgba(0,0,0,0.55)';
ctx.font = '22px Courier New, monospace';
ctx.fillText("él me ve", 80, 80);
return canvas;
}
function createPolaroidDrawing() {
const canvas = document.createElement('canvas');
canvas.width = 256;
canvas.height = 256;
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#fafafa';
ctx.fillRect(0, 0, 256, 256);
ctx.fillStyle = '#dfd9cc';
ctx.fillRect(16, 16, 224, 180);
ctx.strokeStyle = 'rgba(180, 60, 60, 0.4)';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(60, 160);
ctx.lineTo(128, 50);
ctx.lineTo(196, 160);
ctx.closePath();
ctx.stroke();
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
ctx.strokeStyle = 'rgba(15, 15, 15, 0.08)';
ctx.lineWidth = 3.5;
const headX = 145;
const headY = 85;
for (let i = 0; i < 8; i++) {
const ox = (Math.random() - 0.5) * 8;
const oy = (Math.random() - 0.5) * 8;
ctx.beginPath();
ctx.arc(headX + ox, headY + oy, 10, 0, Math.PI * 2);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(headX + ox, headY + 10 + oy);
ctx.lineTo(headX + ox, headY + 55 + oy);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(headX + ox, headY + 18 + oy);
ctx.bezierCurveTo(headX - 25 + ox, headY + 28 + oy, headX - 45 + ox, headY + 68 + oy, headX - 40 + ox, headY + 105 + oy);
ctx.moveTo(headX + ox, headY + 18 + oy);
ctx.bezierCurveTo(headX + 25 + ox, headY + 28 + oy, headX + 45 + ox, headY + 68 + oy, headX + 40 + ox, headY + 105 + oy);
ctx.stroke();
}
ctx.fillStyle = '#666';
ctx.font = '12px Courier New, monospace';
ctx.fillText("Recuerdo...", 28, 220);
return canvas;
}
function playMusicBox(audioCtx, audioLimiter = null) {
if (!audioCtx) return;
try {
const now = audioCtx.currentTime;
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
function playChokedMoan(audioCtx, position, audioLimiter = null) {
if (!audioCtx) return;
try {
const now = audioCtx.currentTime;
const masterGain = audioCtx.createGain();
masterGain.gain.setValueAtTime(0.001, now);
masterGain.gain.linearRampToValueAtTime(0.30, now + 1.3);
masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);
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
const osc = audioCtx.createOscillator();
osc.type = 'sawtooth';
osc.frequency.setValueAtTime(70, now);
osc.frequency.linearRampToValueAtTime(62, now + 1.4);
const vocalFilter = audioCtx.createBiquadFilter();
vocalFilter.type = 'lowpass';
vocalFilter.frequency.setValueAtTime(200, now);
vocalFilter.Q.value = 5.0;
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
osc.start(now);
osc.stop(now + 2.0);
noiseNode.start(now);
noiseNode.stop(now + 2.0);
} catch (e) {
console.warn("No se pudo reproducir sonido de gemido:", e);
}
}
export default class ScriptedEvents {
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
this.activeAct = 0;
this.currentTime = 0.0;
this.isTimeRunning = true;
this.momentStates = {
m1: 'DORMANT',
m2: 'DORMANT',
m3: 'DORMANT',
m4: 'DORMANT',
m5: 'DORMANT'
};
this.m2LookTime = 0.0;
this.m4LookTime = 0.0;
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
initProps() {
const brownMat = new THREE.MeshStandardMaterial({ color: 0x5a3e2e, roughness: 0.9, flatShading: true });
const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf0edf5, roughness: 0.8, flatShading: true });
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
bear.position.set(-3.0, 0.24, 4.0);
this.props.teddyBear = bear;
const z1 = this.scene.getObjectByName("Zone1_Tower");
if (z1) z1.add(bear);
const partition = new THREE.Group();
partition.name = "DressingRoomWall";
const wallMat = new THREE.MeshStandardMaterial({ color: 0x2e3440, roughness: 0.95, flatShading: true });
const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 4, 3), wallMat);
wallMesh.castShadow = true;
wallMesh.receiveShadow = true;
partition.add(wallMesh);
this.props.drawingTexture = new THREE.CanvasTexture(createCrayonDrawing(false));
const paperMat = new THREE.MeshStandardMaterial({
map: this.props.drawingTexture,
roughness: 0.8,
metalness: 0.0
});
const drawingMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.9), paperMat);
drawingMesh.position.set(0.06, 0.2, 0);
drawingMesh.rotation.y = Math.PI / 2;
drawingMesh.castShadow = true;
partition.add(drawingMesh);
partition.position.set(6.0, 2.0, -6.0);
this.props.drawingWall = partition;
this.props.drawingMesh = drawingMesh;
if (z1) z1.add(partition);
this.props.nuclearMonster = new TheVisitor();
this.props.nuclearMonster.position.set(45.0, 0.0, 0.0);
this.props.nuclearMonster.rotation.y = 0.0;
this.props.nuclearEyeSystem = new EyeSystem(this.props.nuclearMonster);
this.props.nuclearEyeSystem.setActPhase(1.8);
const headPart = this.props.nuclearMonster.getPart('head');
if (headPart) {
const mouthGeo = new THREE.BoxGeometry(0.12, 0.02, 0.04);
const mouthMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
this.props.nuclearMouth = new THREE.Mesh(mouthGeo, mouthMat);
this.props.nuclearMouth.name = "mouth";
this.props.nuclearMouth.position.set(0, -0.4, -0.92);
this.props.nuclearMouth.scale.y = 2.0;
headPart.add(this.props.nuclearMouth);
}
this.scene.add(this.props.nuclearMonster);
const polaroidTex = new THREE.CanvasTexture(createPolaroidDrawing());
const polaroidMat = new THREE.MeshStandardMaterial({
map: polaroidTex,
roughness: 0.6,
metalness: 0.1
});
const polaroidMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.005, 0.28), polaroidMat);
polaroidMesh.name = "PolaroidPhoto";
polaroidMesh.position.set(-3.0, 0.015, 3.0);
polaroidMesh.rotation.y = Math.PI / 6;
this.props.polaroid = polaroidMesh;
const z3 = this.scene.getObjectByName("Zone3_RoomGrid");
if (z3) z3.add(polaroidMesh);
}
update(dt) {
if (this.isTimeRunning) {
this.currentTime += dt;
}
const bearWorldPos = new THREE.Vector3();
if (this.props.teddyBear) this.props.teddyBear.getWorldPosition(bearWorldPos);
const drawingWorldPos = new THREE.Vector3();
if (this.props.drawingMesh) this.props.drawingMesh.getWorldPosition(drawingWorldPos);
const monsterWorldPos = new THREE.Vector3();
if (this.props.nuclearMonster) this.props.nuclearMonster.getWorldPosition(monsterWorldPos);
const polaroidWorldPos = new THREE.Vector3();
if (this.props.polaroid) this.props.polaroid.getWorldPosition(polaroidWorldPos);
const camDir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion).normalize();
if (this.activeAct === 0 && this.momentStates.m1 !== 'TRIGGERED') {
const dist = this.camera.position.distanceTo(bearWorldPos);
const dirToBear = bearWorldPos.clone().sub(this.camera.position).normalize();
const dot = camDir.dot(dirToBear);
if (this.momentStates.m1 === 'DORMANT') {
if (dot > 0.95 && dist < 12.0) {
this.momentStates.m1 = 'LOOKED_AT';
this.logEvent("🧸 EVENTO: Has observado el oso de peluche tirado en la carpa.");
}
} else if (this.momentStates.m1 === 'LOOKED_AT') {
if (dist >= 8.0 && dot < 0.0) {
this.momentStates.m1 = 'TRIGGERED';
playMusicBox(this.audioGlobals.audioCtx || window.audioCtx, this.audioGlobals.audioLimiter);
this.logEvent("🎶 EVENTO: Escuchas una melodía de cajita de música (3 notas) detrás de ti.");
}
}
}
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
this.m2LookTime = -999.0;
this.logEvent("🎨 EVENTO: El dibujo emana algo inquietante. Sientes que debes mirar hacia otro lado.");
}
} else if (this.m2LookTime < 0.0) {
if (dot < 0.5) {
this.momentStates.m2 = 'CHANGED';
const changedCanvas = createCrayonDrawing(true);
if (this.props.drawingTexture) {
this.props.drawingTexture.image = changedCanvas;
this.props.drawingTexture.needsUpdate = true;
}
this.logEvent("😱 EVENTO: Volteas la mirada. El dibujo en la pared ha cambiado: ¡La figura alta te mira!");
}
} else {
this.momentStates.m2 = 'DORMANT';
}
}
}
if (this.activeAct === 3 && this.momentStates.m4 !== 'TRIGGERED' && this.props.nuclearMonster && this.props.nuclearMonster.visible) {
const dist = this.camera.position.distanceTo(monsterWorldPos);
const dirToMonster = monsterWorldPos.clone().sub(this.camera.position).normalize();
const dot = camDir.dot(dirToMonster);
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
if (this.props.nuclearEyeSystem) {
this.props.nuclearEyeSystem.lookAt(this.camera.position);
}
if (this.m4LookTime >= 8.0) {
this.momentStates.m4 = 'TRIGGERED';
if (this.props.nuclearMouth) {
this.props.nuclearMouth.scale.y = 0.0;
}
playChokedMoan(this.audioGlobals.audioCtx || window.audioCtx, monsterWorldPos, this.audioGlobals.audioLimiter);
this.logEvent("🔊 EVENTO: El monstruo cierra la boca emitiendo un estertor sofocado... y se disipa.");
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
this.momentStates.m4 = 'DORMANT';
}
}
}
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
triggerEventManually(number, cameraTargetPos, controlsTargetPos) {
if (!this.audioGlobals.audioCtx) {
this.logEvent("⚠️ Haz clic en el canvas o interactúa primero para inicializar el AudioContext.");
return;
}
this.logEvent(`🚀 EVENTO MANUAL: Disparando Coreografía del Momento ${number}`);
if (number === 1) {
this.activeAct = 0;
this.momentStates.m1 = 'LOOKED_AT';
const bearPos = new THREE.Vector3();
if (this.props.teddyBear) this.props.teddyBear.getWorldPosition(bearPos);
cameraTargetPos.set(bearPos.x, bearPos.y + 1.2, bearPos.z + 1.8);
controlsTargetPos.copy(bearPos);
setTimeout(() => {
cameraTargetPos.set(bearPos.x, bearPos.y + 3.0, bearPos.z + 8.5);
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
const dwPos = new THREE.Vector3();
if (this.props.drawingMesh) this.props.drawingMesh.getWorldPosition(dwPos);
cameraTargetPos.set(dwPos.x + 1.8, dwPos.y, dwPos.z);
controlsTargetPos.copy(dwPos);
setTimeout(() => {
this.logEvent("🎨 EVENTO (Manual): Los 4 segundos expiran. El dibujo se actualiza al mirar al lado.");
cameraTargetPos.set(dwPos.x + 2.0, dwPos.y + 0.5, dwPos.z + 2.0);
setTimeout(() => {
this.momentStates.m2 = 'CHANGED';
const changedCanvas = createCrayonDrawing(true);
if (this.props.drawingTexture) {
this.props.drawingTexture.image = changedCanvas;
this.props.drawingTexture.needsUpdate = true;
}
cameraTargetPos.set(dwPos.x + 1.8, dwPos.y, dwPos.z);
controlsTargetPos.copy(dwPos);
this.logEvent("😱 EVENTO (Manual): ¡El dibujo ha mutado!");
}, 1000);
}, 4000);
} else if (number === 3) {
this.activeAct = 2;
this.momentStates.m3 = 'TRIGGERED';
this.logEvent("👣 EVENTO (Manual): Te detienes en el pasillo... Escuchas pasos adicionales.");
const now = this.audioGlobals.audioCtx.currentTime;
if (this.playFootstep) {
setTimeout(() => {
this.playFootstep('wood');
this.logEvent("👣 PASO GHOST 1 (atrás)");
}, 550);
setTimeout(() => {
this.playFootstep('wood');
this.logEvent("👣 PASO GHOST 2 (atrás)");
}, 1100);
}
} else if (number === 4) {
this.activeAct = 3;
this.momentStates.m4 = 'LOOKING_AT_FACE';
this.m4LookTime = 0.0;
if (this.props.nuclearMonster) {
this.props.nuclearMonster.visible = true;
this.props.nuclearMonster.traverseMeshes((mesh) => {
mesh.material.transparent = false;
mesh.material.opacity = 1.0;
});
}
if (this.props.nuclearMouth) {
this.props.nuclearMouth.scale.y = 2.0;
}
const monPos = new THREE.Vector3();
if (this.props.nuclearMonster) this.props.nuclearMonster.getWorldPosition(monPos);
cameraTargetPos.set(monPos.x, monPos.y + 1.6, monPos.z - 2.5);
controlsTargetPos.set(monPos.x, monPos.y + 1.6, monPos.z);
setTimeout(() => {
this.momentStates.m4 = 'TRIGGERED';
if (this.props.nuclearMouth) {
this.props.nuclearMouth.scale.y = 0.0;
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


import * as THREE from 'three';
export const COLORS = {
floor: 0x1e222b,
wall: 0x2e3440,
wallAccent: 0x3b4252,
coneRoof: 0x434c5e,
door: 0xd08770,
zone1Cylinder: 0x4c566a,
gridFloor: 0x1b1f27
};
const createMaterial = (color) => {
return new THREE.MeshStandardMaterial({
color: color,
roughness: 0.85,
metalness: 0.15,
flatShading: true
});
};
export function createZone1() {
const group = new THREE.Group();
group.name = "Zone1_Tower";
const cylinderMaterial = createMaterial(COLORS.zone1Cylinder);
const roofMaterial = createMaterial(COLORS.coneRoof);
const floorMaterial = createMaterial(COLORS.floor);
const floorGeo = new THREE.CylinderGeometry(14, 14, 0.2, 8);
const floorMesh = new THREE.Mesh(floorGeo, floorMaterial);
floorMesh.position.y = -0.1;
floorMesh.receiveShadow = true;
group.add(floorMesh);
const cylinderGeo = new THREE.CylinderGeometry(14, 14, 5, 8, 1, true);
const cylinderMesh = new THREE.Mesh(cylinderGeo, cylinderMaterial);
cylinderMesh.position.y = 2.5;
cylinderMesh.castShadow = true;
cylinderMesh.receiveShadow = true;
group.add(cylinderMesh);
const coneGeo = new THREE.ConeGeometry(14, 4, 8, 1, true);
const coneMesh = new THREE.Mesh(coneGeo, roofMaterial);
coneMesh.position.y = 7;
coneMesh.castShadow = true;
group.add(coneMesh);
const poleGeo = new THREE.CylinderGeometry(0.12, 0.12, 5, 8);
const poleMat = createMaterial(COLORS.zone1Cylinder);
const polesMesh = new THREE.InstancedMesh(poleGeo, poleMat, 8);
polesMesh.castShadow = true;
polesMesh.receiveShadow = true;
polesMesh.name = "Poles";
for (let i = 0; i < 8; i++) {
const angle = (i / 8) * Math.PI * 2;
const x = Math.cos(angle) * 13.5;
const z = Math.sin(angle) * 13.5;
const matrix = new THREE.Matrix4().makeTranslation(x, 2.5, z);
polesMesh.setMatrixAt(i, matrix);
}
group.add(polesMesh);
const plankGeo = new THREE.BoxGeometry(6.0, 0.08, 0.35);
const plankMat = createMaterial(COLORS.coneRoof);
const gradasMesh = new THREE.InstancedMesh(plankGeo, plankMat, 40);
gradasMesh.castShadow = true;
gradasMesh.receiveShadow = true;
gradasMesh.name = "Gradas";
let idx = 0;
for (let r = 0; r < 5; r++) {
const R = 9.5 + r * 0.7;
const H = 0.2 + r * 0.4;
for (let i = 0; i < 8; i++) {
const angle = (i / 8) * Math.PI * 2;
const x = Math.cos(angle) * R;
const z = Math.sin(angle) * R;
const matrix = new THREE.Matrix4();
const pos = new THREE.Vector3(x, H, z);
const rot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle + Math.PI / 2);
const scale = new THREE.Vector3(1, 1, 1);
matrix.compose(pos, rot, scale);
gradasMesh.setMatrixAt(idx++, matrix);
}
}
group.add(gradasMesh);
return group;
}
export function createZone2() {
const group = new THREE.Group();
group.name = "Zone2_Corridor";
const wallMaterial = createMaterial(COLORS.wall);
const floorMaterial = createMaterial(COLORS.floor);
const doorMaterial = createMaterial(COLORS.door);
const length = 30;
const width = 3.5;
const height = 4;
const floorGeo = new THREE.BoxGeometry(length, 0.1, width);
const floorMesh = new THREE.Mesh(floorGeo, floorMaterial);
floorMesh.position.y = -0.05;
floorMesh.receiveShadow = true;
group.add(floorMesh);
const ceilingGeo = new THREE.BoxGeometry(length, 0.1, width);
const ceilingMesh = new THREE.Mesh(ceilingGeo, floorMaterial);
ceilingMesh.position.y = height + 0.05;
group.add(ceilingMesh);
group.userData.doors = [];
const doorXPositions = [-10, -5, 0, 5, 10];
const doorW = 1.0;
const doorH = 2.5;
const doorT = 0.1;
const zSides = [width / 2, -width / 2];
zSides.forEach((zPos, sideIndex) => {
const isPositiveZ = zPos > 0;
const wallSegments = [
{ start: -15, end: -10.5 },
{ start: -9.5, end: -5.5 },
{ start: -4.5, end: -0.5 },
{ start: 0.5, end: 4.5 },
{ start: 5.5, end: 9.5 },
{ start: 10.5, end: 15 }
];
wallSegments.forEach(seg => {
const segW = seg.end - seg.start;
const segX = seg.start + segW / 2;
const wallGeo = new THREE.BoxGeometry(segW, height, 0.1);
const wallMesh = new THREE.Mesh(wallGeo, wallMaterial);
wallMesh.position.set(segX, height / 2, zPos);
wallMesh.castShadow = true;
wallMesh.receiveShadow = true;
group.add(wallMesh);
});
doorXPositions.forEach(xPos => {
const overDoorGeo = new THREE.BoxGeometry(doorW, height - doorH, 0.1);
const overDoorMesh = new THREE.Mesh(overDoorGeo, wallMaterial);
overDoorMesh.position.set(xPos, doorH + (height - doorH) / 2, zPos);
overDoorMesh.castShadow = true;
overDoorMesh.receiveShadow = true;
group.add(overDoorMesh);
});
doorXPositions.forEach((xPos, doorIndex) => {
const doorGeo = new THREE.BoxGeometry(doorW, doorH, doorT);
const doorMesh = new THREE.Mesh(doorGeo, doorMaterial);
doorMesh.position.set(xPos, doorH / 2, zPos);
doorMesh.castShadow = true;
doorMesh.name = `Door_${isPositiveZ ? 'Left' : 'Right'}_${doorIndex}`;
doorMesh.userData = {
isOpen: false,
initialY: doorH / 2,
initialX: xPos,
initialZ: zPos,
slideDirection: isPositiveZ ? 1 : -1,
width: doorW
};
group.add(doorMesh);
group.userData.doors.push(doorMesh);
});
});
group.setDoorOpen = function(index, openStatus) {
const door = group.userData.doors[index];
if (!door) return;
door.userData.isOpen = openStatus;
if (openStatus) {
door.position.x = door.userData.initialX + door.userData.width * 0.9;
} else {
door.position.x = door.userData.initialX;
}
};
return group;
}
export function createZone3() {
const group = new THREE.Group();
group.name = "Zone3_RoomGrid";
const wallMaterial = createMaterial(COLORS.wallAccent);
const floorMaterial = createMaterial(COLORS.gridFloor);
const roomSize = 6.0;
const roomHeight = 3.0;
const wallThickness = 0.2;
group.userData.floors = [];
const tileGeo = new THREE.BoxGeometry(roomSize, 0.1, roomSize);
for (let row = 0; row < 4; row++) {
const zPos = -9 + row * roomSize;
for (let col = 0; col < 4; col++) {
const xPos = -9 + col * roomSize;
const tileMesh = new THREE.Mesh(tileGeo, floorMaterial);
tileMesh.position.set(xPos, -0.05, zPos);
tileMesh.receiveShadow = true;
tileMesh.name = `Floor_${col}_${row}`;
group.add(tileMesh);
group.userData.floors.push(tileMesh);
}
}
group.userData.hWalls = new Map();
group.userData.vWalls = new Map();
for (let z = 0; z <= 4; z++) {
const zPos = -12 + z * roomSize;
for (let x = 0; x < 4; x++) {
const xPos = -9 + x * roomSize;
const wallGeo = new THREE.BoxGeometry(roomSize, roomHeight, wallThickness);
const wallMesh = new THREE.Mesh(wallGeo, wallMaterial);
wallMesh.position.set(xPos, roomHeight / 2, zPos);
wallMesh.castShadow = true;
wallMesh.receiveShadow = true;
const wallId = `H_${x}_${z}`;
wallMesh.name = wallId;
group.add(wallMesh);
group.userData.hWalls.set(wallId, wallMesh);
}
}
for (let x = 0; x <= 4; x++) {
const xPos = -12 + x * roomSize;
for (let z = 0; z < 4; z++) {
const zPos = -9 + z * roomSize;
const wallGeo = new THREE.BoxGeometry(wallThickness, roomHeight, roomSize);
const wallMesh = new THREE.Mesh(wallGeo, wallMaterial);
wallMesh.position.set(xPos, roomHeight / 2, zPos);
wallMesh.castShadow = true;
wallMesh.receiveShadow = true;
const wallId = `V_${x}_${z}`;
wallMesh.name = wallId;
group.add(wallMesh);
group.userData.vWalls.set(wallId, wallMesh);
}
}
group.setWallState = function(type, col, row, visible) {
const wallId = `${type}_${col}_${row}`;
const wallMap = type === 'H' ? group.userData.hWalls : group.userData.vWalls;
const wall = wallMap.get(wallId);
if (wall) {
if (visible) {
if (!group.children.includes(wall)) {
group.add(wall);
}
} else {
group.remove(wall);
}
}
};
group.generateDefaultPassages = function() {
const wallsToRemove = [
{ type: 'H', col: 0, row: 1 },
{ type: 'H', col: 1, row: 2 },
{ type: 'H', col: 2, row: 1 },
{ type: 'H', col: 3, row: 3 },
{ type: 'H', col: 1, row: 3 },
{ type: 'V', col: 1, row: 0 },
{ type: 'V', col: 2, row: 2 },
{ type: 'V', col: 3, row: 1 },
{ type: 'V', col: 2, row: 3 },
{ type: 'V', col: 1, row: 2 },
];
wallsToRemove.forEach(w => {
group.setWallState(w.type, w.col, w.row, false);
});
};
return group;
}

