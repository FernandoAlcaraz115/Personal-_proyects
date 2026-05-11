/**
 * ui.js — Panel de controles de la simulación.
 * Gestiona: pause, velocidad, presets, toggle órbitas/etiquetas, reset cámara.
 */

import { simState } from './sim-state.js';

export function setupUI(orbitLines, labelObjects, camera, controls) {
  const btnPause    = document.getElementById('btn-pause');
  const sliderSpeed = document.getElementById('slider-speed');
  const labelSpeed  = document.getElementById('label-speed');
  const btnOrbits   = document.getElementById('btn-orbits');
  const btnLabels   = document.getElementById('btn-labels');
  const btnReset    = document.getElementById('btn-reset');

  // ── Pause / Resume ────────────────────────────────
  btnPause.addEventListener('click', () => {
    simState.paused = !simState.paused;
    btnPause.querySelector('span').textContent = simState.paused
      ? '▶  Reanudar'
      : '⏸  Pausar';
    btnPause.classList.toggle('active', simState.paused);
  });

  // ── Velocidad: slider ─────────────────────────────
  sliderSpeed.addEventListener('input', () => {
    simState.speed = parseFloat(sliderSpeed.value);
    labelSpeed.textContent = formatSpeed(simState.speed);
    syncPresets(simState.speed);
  });

  // ── Velocidad: presets ────────────────────────────
  document.querySelectorAll('.speed-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = parseFloat(btn.dataset.speed);
      simState.speed    = s;
      sliderSpeed.value = String(s);
      labelSpeed.textContent = formatSpeed(s);
      syncPresets(s);
    });
  });

  function syncPresets(speed) {
    document.querySelectorAll('.speed-preset').forEach(btn => {
      btn.classList.toggle('active', parseFloat(btn.dataset.speed) === speed);
    });
  }

  // ── Toggle órbitas ────────────────────────────────
  btnOrbits.addEventListener('click', () => {
    simState.showOrbits = !simState.showOrbits;
    for (const line of orbitLines) line.visible = simState.showOrbits;
    btnOrbits.classList.toggle('active', simState.showOrbits);
  });

  // ── Toggle etiquetas ──────────────────────────────
  btnLabels.addEventListener('click', () => {
    simState.showLabels = !simState.showLabels;
    for (const obj of labelObjects) obj.visible = simState.showLabels;
    btnLabels.classList.toggle('active', simState.showLabels);
  });

  // ── Reset cámara ──────────────────────────────────
  btnReset.addEventListener('click', () => {
    camera.position.set(0, 80, 220);
    controls.target.set(0, 0, 0);
    controls.update();
  });
}

function formatSpeed(s) {
  return s < 1 ? `${s.toFixed(2)}×` : `${s.toFixed(1)}×`;
}
