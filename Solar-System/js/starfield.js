/**
 * starfield.js — Fondo estelar usando la textura de la Vía Láctea.
 * Se mapea en el interior de una esfera gigante (BackSide).
 */

import * as THREE from 'three';

export function createStarField(scene) {
  const loader  = new THREE.TextureLoader();
  const texture = loader.load('assets/textures/8k_stars_milky_way.jpg');

  const geo = new THREE.SphereGeometry(5000, 64, 32);
  const mat = new THREE.MeshBasicMaterial({
    map:  texture,
    side: THREE.BackSide,
  });

  scene.add(new THREE.Mesh(geo, mat));
}
