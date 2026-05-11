/**
 * orbits.js — Líneas de órbita de los planetas alrededor del sol.
 * Devuelve el array de Line objects para poder togglearlos desde ui.js.
 */

import * as THREE from 'three';
import { BODIES } from '../data/bodies-data.js';

export function createOrbitLines(scene) {
  const lines    = [];
  const segments = 160;

  for (const data of BODIES) {
    if (data.orbitRadius <= 0 || data.parent) continue;

    const points = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(angle) * data.orbitRadius,
        0,
        Math.sin(angle) * data.orbitRadius,
      ));
    }

    const geo  = new THREE.BufferGeometry().setFromPoints(points);
    const mat  = new THREE.LineBasicMaterial({
      color:       0x2a3a5a,
      transparent: true,
      opacity:     0.45,
    });

    const line = new THREE.Line(geo, mat);
    scene.add(line);
    lines.push(line);
  }

  return lines;
}
