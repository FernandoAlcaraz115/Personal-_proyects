/**
 * tooltip.js — Hover + click para fijar info de un cuerpo celeste.
 *
 * Fixes:
 *   - El evento DOM "click" se dispara también al soltar tras un drag.
 *     Se detecta si hubo arrastre (> 5 px) y se ignora ese click.
 *   - Durante el drag se oculta el tooltip para no mostrarlo en planetas
 *     que el cursor cruza accidentalmente al rotar la cámara.
 *   - Guardia en los hits del raycaster: solo se muestra tooltip si el
 *     mesh devuelto tiene userData.name definido.
 */

import * as THREE from 'three';

const raycaster = new THREE.Raycaster();
const mouse     = new THREE.Vector2();

const tooltip = document.getElementById('tooltip');
const ttImg   = document.getElementById('tooltip-img');
const ttName  = document.getElementById('tooltip-name');
const ttType  = document.getElementById('tooltip-type');
const ttDesc  = document.getElementById('tooltip-description');
const ttStats = document.getElementById('tooltip-stats');
const ttHint  = document.getElementById('tooltip-hint');
const ttWiki  = document.getElementById('tooltip-wiki');

const OFFSET         = 20;
const DRAG_THRESHOLD = 5; // px — movimiento mínimo para considerarse drag

let pinnedBody   = null;
let isDragging   = false;
let pointerStart = { x: 0, y: 0 };

// ── Detección de drag ──────────────────────────────
window.addEventListener('pointerdown', (e) => {
  pointerStart = { x: e.clientX, y: e.clientY };
  isDragging   = false;
});

window.addEventListener('pointermove', (e) => {
  if (e.buttons === 0) return; // ningún botón pulsado → no es drag
  const dx = e.clientX - pointerStart.x;
  const dy = e.clientY - pointerStart.y;
  if (dx * dx + dy * dy > DRAG_THRESHOLD * DRAG_THRESHOLD) {
    isDragging = true;
  }
});

// ── Exports ───────────────────────────────────────

export function setupTooltip(camera, bodies) {

  // ── Hover ───────────────────────────────────────
  window.addEventListener('mousemove', (e) => {
    if (pinnedBody) return;

    // Durante un drag la cámara rota; no mostrar tooltip
    if (isDragging) {
      hideTooltip();
      document.body.style.cursor = 'default';
      return;
    }

    mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(bodies);

    const hit = hits.find(h => h.object.userData?.name);
    if (hit) {
      showTooltip(e.clientX, e.clientY, hit.object.userData, false);
      document.body.style.cursor = 'pointer';
    } else {
      hideTooltip();
      document.body.style.cursor = 'default';
    }
  });

  // ── Click: fijar / soltar ───────────────────────
  window.addEventListener('click', (e) => {
    // Ignorar si fue un drag (rotación de cámara)
    if (isDragging) return;
    if (e.target.closest('#controls'))     return;
    if (e.target.closest('#tooltip-wiki')) return;

    mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(bodies);

    // Solo considerar hits con userData completo
    const hit = hits.find(h => h.object.userData?.name);

    if (hit) {
      const mesh = hit.object;
      if (pinnedBody === mesh) {
        unpin();
      } else {
        pinnedBody = mesh;
        tooltip.classList.add('pinned');
        showTooltip(e.clientX, e.clientY, mesh.userData, true);
      }
    } else if (pinnedBody) {
      unpin();
    }
  });

  // ── ESC: soltar ─────────────────────────────────
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') unpin();
  });
}

export function updatePinnedTooltip() {
  if (!pinnedBody) return;
  tooltip.classList.remove('hidden');
}

// ── Helpers ──────────────────────────────────────

function unpin() {
  pinnedBody = null;
  tooltip.classList.remove('pinned');
  hideTooltip();
}

function showTooltip(x, y, data, pinned) {
  if (data.imgFile) {
    ttImg.src    = data.imgFile;
    ttImg.hidden = false;
  } else {
    ttImg.hidden = true;
  }

  ttName.textContent = data.name ?? '';
  ttType.textContent = data.type ?? '';
  tooltip.style.setProperty('--body-color', data.color ?? '#6ab0ff');

  ttDesc.textContent = data.description ?? '';

  ttStats.innerHTML = '';
  for (const [label, value] of Object.entries(data.stats ?? {})) {
    const li = document.createElement('li');
    li.innerHTML = `<span>${label}</span><span>${value}</span>`;
    ttStats.appendChild(li);
  }

  if (data.wiki) {
    ttWiki.href   = data.wiki;
    ttWiki.hidden = !pinned;
  } else {
    ttWiki.hidden = true;
  }

  ttHint.textContent = pinned ? 'Clic o ESC para soltar' : 'Clic para fijar';

  positionTooltip(x, y);
  tooltip.classList.remove('hidden');
}

function positionTooltip(x, y) {
  tooltip.style.left = '0px';
  tooltip.style.top  = '0px';

  const tw = tooltip.offsetWidth;
  const th = tooltip.offsetHeight;
  const M  = 10;

  let left = x + OFFSET;
  let top  = y + OFFSET;

  if (left + tw > window.innerWidth  - M) left = x - tw - OFFSET;
  if (top  + th > window.innerHeight - M) top  = y - th - OFFSET;

  left = Math.max(M, Math.min(left, window.innerWidth  - tw - M));
  top  = Math.max(M, Math.min(top,  window.innerHeight - th - M));

  tooltip.style.left = `${left}px`;
  tooltip.style.top  = `${top}px`;
}

function hideTooltip() {
  tooltip.classList.add('hidden');
}
