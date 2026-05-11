/**
 * loop.js — Bucle de animación principal.
 * Respeta simState.paused y simState.speed.
 */

import * as THREE from 'three';
import { updatePinnedTooltip } from './tooltip.js';

const clock = new THREE.Clock();

export function animate(renderer, labelRenderer, scene, camera, controls, bodies, simState) {
  function tick() {
    requestAnimationFrame(tick);

    // Siempre avanza el reloj para evitar saltos al reanudar
    const raw   = clock.getDelta();
    const delta = simState.paused ? 0 : raw * simState.speed;

    for (const mesh of bodies) {
      const { pivot, orbitSpeed, rotationSpeed } = mesh.userData;
      if (pivot) pivot.rotation.y += (orbitSpeed    ?? 0)   * delta;
      mesh.rotation.y             += (rotationSpeed ?? 0.1) * delta;
    }

    updatePinnedTooltip();
    controls.update();
    renderer.render(scene, camera);
    if (labelRenderer) labelRenderer.render(scene, camera);
  }

  tick();
}
