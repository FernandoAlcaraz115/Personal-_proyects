/**
 * labels.js — Etiquetas 3D con nombres de planetas usando CSS2DRenderer.
 * Las etiquetas siempre miran a la cámara y se ocultan si están detrás.
 */

import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export function setupLabels(scene, bodies) {
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  Object.assign(labelRenderer.domElement.style, {
    position:      'fixed',
    top:           '0',
    left:          '0',
    pointerEvents: 'none',
    zIndex:        '5',
  });
  document.body.appendChild(labelRenderer.domElement);

  const labelObjects = [];

  for (const mesh of bodies) {
    const div = document.createElement('div');
    div.className   = 'planet-label';
    div.textContent = mesh.userData.name ?? '';

    const obj = new CSS2DObject(div);
    // Posicionar la etiqueta justo encima de la esfera
    obj.position.set(0, (mesh.userData.radius ?? 1) * 1.5, 0);
    mesh.add(obj);
    labelObjects.push(obj);
  }

  window.addEventListener('resize', () => {
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { labelRenderer, labelObjects };
}
