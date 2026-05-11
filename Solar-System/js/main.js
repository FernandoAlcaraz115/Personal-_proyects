/**
 * main.js — Punto de entrada.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { createStarField }  from './starfield.js';
import { createOrbitLines } from './orbits.js';
import { buildSolarSystem } from './bodies.js';
import { setupTooltip }     from './tooltip.js';
import { setupLabels }      from './labels.js';
import { animate }          from './loop.js';
import { setupUI }          from './ui.js';
import { simState }         from './sim-state.js';

// ── Renderer ──────────────────────────────────────
const canvas   = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

// ── Escena y cámara ───────────────────────────────
const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 80, 220);

// ── Controles orbitales ───────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance   = 20;
controls.maxDistance   = 1200;

// ── Iluminación ───────────────────────────────────
// decay = 0 → sin atenuación por distancia: todos los planetas reciben
// la misma intensidad del sol, evitando que los interiores se quemen y
// los exteriores queden negros.
const sunLight     = new THREE.PointLight(0xfff5e0, 2, 0, 0);
const ambientLight = new THREE.AmbientLight(0x112244, 1.0);
scene.add(sunLight, ambientLight);

// ── Contenido ─────────────────────────────────────
createStarField(scene);
const orbitLines = createOrbitLines(scene);
const bodies     = buildSolarSystem(scene);

// ── Etiquetas 3D ──────────────────────────────────
const { labelRenderer, labelObjects } = setupLabels(scene, bodies);

// ── Tooltip ───────────────────────────────────────
setupTooltip(camera, bodies);

// ── Panel de controles ────────────────────────────
setupUI(orbitLines, labelObjects, camera, controls);

// ── Loop ──────────────────────────────────────────
animate(renderer, labelRenderer, scene, camera, controls, bodies, simState);

// ── Resize ────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Ocultar pantalla de carga tras el primer frame ─
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.getElementById('loading').classList.add('hidden');
  });
});
