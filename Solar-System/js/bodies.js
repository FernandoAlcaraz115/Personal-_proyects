/**
 * bodies.js — Construye el sistema solar completo.
 *
 * Pase 1: sol y planetas (sin parent).
 * Pase 2: lunas, ancladas al mesh de su planeta padre.
 */

import * as THREE from 'three';
import { BODIES } from '../data/bodies-data.js';

const loader = new THREE.TextureLoader();

// ── Shader día/noche (solo Tierra por ahora) ──────
//
// El terminador (línea día↔noche) se calcula en el fragment shader
// como el dot product entre la normal en espacio mundo y la dirección
// al sol. smoothstep suaviza la transición.

const DAY_NIGHT_VERT = /* glsl */`
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  void main() {
    vUv          = uv;
    // Para esferas con escala uniforme, mat3(modelMatrix) es suficiente
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vWorldPos    = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const DAY_NIGHT_FRAG = /* glsl */`
  uniform sampler2D uDayMap;
  uniform sampler2D uNightMap;
  uniform sampler2D uCloudMap;   // canal R = densidad de nube (0 = cielo, 1 = nube)
  uniform vec3      uSunPos;

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  void main() {
    vec3  toSun  = normalize(uSunPos - vWorldPos);
    float sunDot = dot(vWorldNormal, toSun);

    // -0.08 → 0.20: zona de penumbra/crepúsculo
    float blend = smoothstep(-0.08, 0.20, sunDot);

    vec3  day   = texture2D(uDayMap,   vUv).rgb;
    vec3  night = texture2D(uNightMap, vUv).rgb * 0.75;
    float cloud = texture2D(uCloudMap, vUv).r;

    // Lado día: nubes blancas sobre la superficie
    vec3 dayFinal   = mix(day,   vec3(1.0), cloud * 0.88);
    // Lado noche: nubes tapan parte de las luces de ciudad
    vec3 nightFinal = mix(night, vec3(0.0), cloud * 0.65);

    gl_FragColor = vec4(mix(nightFinal, dayFinal, blend), 1.0);
  }
`;

function makeDayNightMaterial(data) {
  // Textura de nubes opcional: si no existe se usa un mapa negro (sin nubes)
  const cloudTex = data.cloudTextureFile
    ? loader.load(data.cloudTextureFile)
    : null;

  if (!cloudTex) {
    // Textura 1×1 negra en memoria como fallback (densidad de nube = 0)
    const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
    blank.needsUpdate = true;
    return buildEarthShader(data, blank);
  }
  return buildEarthShader(data, cloudTex);
}

function buildEarthShader(data, cloudTex) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uDayMap:   { value: loader.load(data.textureFile) },
      uNightMap: { value: loader.load(data.nightTextureFile) },
      uCloudMap: { value: cloudTex },
      uSunPos:   { value: new THREE.Vector3(0, 0, 0) },
    },
    vertexShader:   DAY_NIGHT_VERT,
    fragmentShader: DAY_NIGHT_FRAG,
  });
}

// ── Helpers ───────────────────────────────────────

function makeSphere(data) {
  const { radius, color, emissive, textureFile, nightTextureFile } = data;
  const geo = new THREE.SphereGeometry(radius, 64, 32);

  let mat;

  if (nightTextureFile && textureFile) {
    // Shader personalizado día/noche
    mat = makeDayNightMaterial(data);
  } else if (emissive) {
    // Sol: MeshBasicMaterial → siempre totalmente iluminado
    const tex = textureFile ? loader.load(textureFile) : null;
    mat = new THREE.MeshBasicMaterial({
      map:   tex,
      color: tex ? 0xffffff : color,
    });
  } else {
    const tex = textureFile ? loader.load(textureFile) : null;
    mat = new THREE.MeshStandardMaterial({
      map:       tex,
      color:     tex ? 0xffffff : color,
      roughness: 0.88,
      metalness: 0,
    });
  }

  return new THREE.Mesh(geo, mat);
}

function makeRing({ innerRadius, outerRadius, color, alphaMapFile }) {
  const geo = new THREE.RingGeometry(innerRadius, outerRadius, 128);

  // Remap UV: u = 0 en el borde interior → u = 1 en el exterior.
  // Esto hace que el alpha map de anillo (franja radial) se alinee correctamente.
  const pos = geo.attributes.position;
  const uv  = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const r = Math.sqrt(x * x + y * y);
    uv.setX(i, (r - innerRadius) / (outerRadius - innerRadius));
  }
  uv.needsUpdate = true;

  const mat = new THREE.MeshBasicMaterial({
    color,
    side:       THREE.DoubleSide,
    transparent: true,
    depthWrite:  false,
  });

  if (alphaMapFile) {
    mat.alphaMap = loader.load(alphaMapFile);
  } else {
    mat.opacity = 0.78;
  }

  const ring = new THREE.Mesh(geo, mat);
  ring.rotation.x = -Math.PI / 2; // plano horizontal (ecuatorial)
  return ring;
}

function makeSunGlow(radius) {
  const group = new THREE.Group();

  // ── Corona interna: esferas BackSide en capas ─────────────
  // Cada capa añade luminosidad aditiva decreciente hacia afuera.
  const coronaLayers = [
    { factor: 1.08, opacity: 0.22, color: 0xffe8a0 },
    { factor: 1.22, opacity: 0.13, color: 0xffcc60 },
    { factor: 1.50, opacity: 0.07, color: 0xff9930 },
  ];
  for (const { factor, opacity, color } of coronaLayers) {
    const geo = new THREE.SphereGeometry(radius * factor, 32, 16);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending:   THREE.AdditiveBlending,
      side:       THREE.BackSide,
      depthWrite: false,
    });
    group.add(new THREE.Mesh(geo, mat));
  }

  // ── Halo exterior: sprite con gradiente radial en canvas ───
  // El canvas genera un degradado cónico suave que imita la corona solar.
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx  = canvas.getContext('2d');
  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0.00, 'rgba(255, 230, 140, 0.55)');
  grad.addColorStop(0.12, 'rgba(255, 190,  70, 0.40)');
  grad.addColorStop(0.30, 'rgba(255, 130,  30, 0.20)');
  grad.addColorStop(0.55, 'rgba(255,  80,  10, 0.08)');
  grad.addColorStop(1.00, 'rgba(255,  50,   0, 0.00)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const spriteMat = new THREE.SpriteMaterial({
    map:        new THREE.CanvasTexture(canvas),
    blending:   THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(spriteMat);
  const haloSize = radius * 6.5;
  sprite.scale.set(haloSize, haloSize, 1);
  group.add(sprite);

  return group;
}

// ── Construcción principal ────────────────────────

export function buildSolarSystem(scene) {
  const clickable  = [];
  const meshByName = {};

  const primaries = BODIES.filter(b => !b.parent);
  const moons     = BODIES.filter(b =>  b.parent);

  // ─ Pase 1: sol y planetas ─────────────────────
  for (const data of primaries) {
    const mesh = makeSphere(data);

    if (data.orbitRadius > 0) {
      const pivot = new THREE.Object3D();
      pivot.rotation.y    = Math.random() * Math.PI * 2;
      mesh.position.x     = data.orbitRadius;
      mesh.userData.pivot = pivot;
      pivot.add(mesh);
      scene.add(pivot);
    } else {
      scene.add(mesh);
      mesh.add(makeSunGlow(data.radius));
    }

    if (data.rings) mesh.add(makeRing(data.rings));

    mesh.userData = { ...mesh.userData, ...data };
    meshByName[data.name] = mesh;
    clickable.push(mesh);
  }

  // ─ Pase 2: lunas ──────────────────────────────
  for (const data of moons) {
    const parentMesh = meshByName[data.parent];
    if (!parentMesh) continue;

    const mesh  = makeSphere(data);
    const pivot = new THREE.Object3D();
    pivot.rotation.y    = Math.random() * Math.PI * 2;
    mesh.position.x     = data.orbitRadius;
    mesh.userData.pivot = pivot;
    pivot.add(mesh);
    parentMesh.add(pivot);

    mesh.userData = { ...mesh.userData, ...data };
    meshByName[data.name] = mesh;
    clickable.push(mesh);
  }

  return clickable;
}
