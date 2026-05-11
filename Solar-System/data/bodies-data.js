/**
 * bodies-data.js — Datos de cada cuerpo celeste.
 *
 * Campos relevantes:
 *   imgFile   — ruta de la imagen del tooltip (carpeta img/)
 *   wiki      — URL de Wikipedia en español
 */

export const BODIES = [

  // ── Sol ──────────────────────────────────────────────────────
  {
    name: 'Sol',
    type: 'Estrella',
    imgFile:     'img/sol.jpg',
    wiki:        'https://es.wikipedia.org/wiki/Sol',
    textureFile: 'assets/textures/8k_sun.jpg',
    description: 'Estrella en el centro de nuestro sistema solar. Su energía sustenta toda la vida en la Tierra.',
    stats: {
      'Tipo':        'Enana amarilla (G2V)',
      'Diámetro':    '1,392,700 km',
      'Temperatura': '5,500 °C (superficie)',
      'Núcleo':      '~15 millones °C',
      'Edad':        '~4.6 mil millones de años',
    },
    radius: 14,
    color: '#FDB813',
    emissive: '#FF8C00',
    orbitRadius: 0,
    orbitSpeed: 0,
    rotationSpeed: 0.02,
  },

  // ── Mercurio ─────────────────────────────────────────────────
  {
    name: 'Mercurio',
    type: 'Planeta',
    imgFile:     'img/mercurio.jpg',
    wiki:        'https://es.wikipedia.org/wiki/Mercurio_(planeta)',
    textureFile: 'assets/textures/8k_mercury.jpg',
    description: 'El planeta más pequeño y cercano al Sol. Sin atmósfera, sufre extremos térmicos brutales.',
    stats: {
      'Diámetro':        '4,879 km',
      'Distancia al Sol': '57.9 M km',
      'Período orbital': '88 días',
      'Temperatura':     '-180 °C a 430 °C',
      'Lunas':           '0',
    },
    radius: 1.5,
    color: '#b5b5b5',
    orbitRadius: 28,
    orbitSpeed: 1.6,
    rotationSpeed: 0.004,
  },

  // ── Venus ────────────────────────────────────────────────────
  {
    name: 'Venus',
    type: 'Planeta',
    imgFile:     'img/Venus.jpg',
    wiki:        'https://es.wikipedia.org/wiki/Venus_(planeta)',
    textureFile: 'assets/textures/4k_venus_atmosphere.jpg',
    description: 'El planeta más caliente del sistema solar. Su densa atmósfera de CO₂ genera un efecto invernadero extremo.',
    stats: {
      'Diámetro':        '12,104 km',
      'Distancia al Sol': '108.2 M km',
      'Período orbital': '225 días',
      'Temperatura':     '~465 °C',
      'Lunas':           '0',
    },
    radius: 2.8,
    color: '#e8cda0',
    orbitRadius: 44,
    orbitSpeed: 1.17,
    rotationSpeed: 0.002,
  },

  // ── Tierra ───────────────────────────────────────────────────
  {
    name: 'Tierra',
    type: 'Planeta',
    imgFile:          'img/Tierra.jpg',
    wiki:             'https://es.wikipedia.org/wiki/Tierra',
    textureFile:      'assets/textures/8k_earth_daymap.jpg',
    nightTextureFile: 'assets/textures/8k_earth_nightmap.jpg',
    cloudTextureFile: 'assets/textures/8k_earth_clouds.jpg',
    description: 'Nuestro hogar. El único planeta conocido con vida, agua líquida y una luna grande que estabiliza su eje.',
    stats: {
      'Diámetro':        '12,742 km',
      'Distancia al Sol': '149.6 M km',
      'Período orbital': '365.25 días',
      'Lunas':           '1 (Luna)',
      'Temperatura':     '-88 °C a 58 °C',
    },
    radius: 3,
    color: '#4fa3e0',
    orbitRadius: 62,
    orbitSpeed: 1.0,
    rotationSpeed: 0.3,
  },

  // ── Marte ────────────────────────────────────────────────────
  {
    name: 'Marte',
    type: 'Planeta',
    imgFile:     'img/Marte.jpg',
    wiki:        'https://es.wikipedia.org/wiki/Marte_(planeta)',
    textureFile: 'assets/textures/8k_mars.jpg',
    description: 'El planeta rojo. Alberga el Olympus Mons, la montaña más alta del sistema solar (21 km).',
    stats: {
      'Diámetro':        '6,779 km',
      'Distancia al Sol': '227.9 M km',
      'Período orbital': '687 días',
      'Lunas':           '2 (Fobos y Deimos)',
      'Temperatura':     '-125 °C a 20 °C',
    },
    radius: 2,
    color: '#c1440e',
    orbitRadius: 82,
    orbitSpeed: 0.8,
    rotationSpeed: 0.29,
  },

  // ── Júpiter ──────────────────────────────────────────────────
  {
    name: 'Júpiter',
    type: 'Planeta',
    imgFile:     'img/Jupiter.jpg',
    wiki:        'https://es.wikipedia.org/wiki/J%C3%BApiter_(planeta)',
    textureFile: 'assets/textures/8k_jupiter.jpg',
    description: 'El planeta más grande del sistema solar. Su Gran Mancha Roja es una tormenta mayor que la Tierra.',
    stats: {
      'Diámetro':        '139,820 km',
      'Distancia al Sol': '778.5 M km',
      'Período orbital': '11.9 años',
      'Lunas':           '95 conocidas',
      'Composición':     'Hidrógeno y helio',
    },
    radius: 8,
    color: '#c88b3a',
    orbitRadius: 115,
    orbitSpeed: 0.43,
    rotationSpeed: 0.72,
  },

  // ── Saturno ──────────────────────────────────────────────────
  {
    name: 'Saturno',
    type: 'Planeta',
    imgFile:     'img/Saturno.jpg',
    wiki:        'https://es.wikipedia.org/wiki/Saturno_(planeta)',
    textureFile: 'assets/textures/8k_saturn.jpg',
    rings: { innerRadius: 9.5, outerRadius: 17, color: '#e8d4a0', alphaMapFile: 'assets/textures/8k_saturn_ring_alpha.png' },
    description: 'Famoso por sus espectaculares anillos de hielo y roca. Es el planeta menos denso del sistema solar.',
    stats: {
      'Diámetro':        '116,460 km',
      'Distancia al Sol': '1,427 M km',
      'Período orbital': '29.4 años',
      'Lunas':           '146 conocidas',
      'Densidad':        'Menor que el agua',
    },
    radius: 7,
    color: '#e4d191',
    orbitRadius: 155,
    orbitSpeed: 0.32,
    rotationSpeed: 0.65,
  },

  // ── Urano ────────────────────────────────────────────────────
  {
    name: 'Urano',
    type: 'Planeta',
    imgFile:     'img/Urano.jpg',
    wiki:        'https://es.wikipedia.org/wiki/Urano_(planeta)',
    textureFile: 'assets/textures/2k_uranus.jpg',
    description: 'Gira de lado con una inclinación axial de 98°. Posee anillos tenues y una atmósfera de hielo.',
    stats: {
      'Diámetro':        '50,724 km',
      'Distancia al Sol': '2,871 M km',
      'Período orbital': '84 años',
      'Temperatura':     '-224 °C',
      'Lunas':           '28 conocidas',
    },
    radius: 4.5,
    color: '#7de8e8',
    orbitRadius: 190,
    orbitSpeed: 0.23,
    rotationSpeed: 0.42,
  },

  // ── Neptuno ──────────────────────────────────────────────────
  {
    name: 'Neptuno',
    type: 'Planeta',
    imgFile:     'img/Neptuno.jpg',
    wiki:        'https://es.wikipedia.org/wiki/Neptuno_(planeta)',
    textureFile: 'assets/textures/2k_neptune.jpg',
    description: 'El planeta más lejano y ventoso. Sus vientos supersónicos superan los 2,100 km/h.',
    stats: {
      'Diámetro':        '49,244 km',
      'Distancia al Sol': '4,495 M km',
      'Período orbital': '165 años',
      'Vientos':         'Hasta 2,100 km/h',
      'Lunas':           '16 conocidas',
    },
    radius: 4.2,
    color: '#3f54ba',
    orbitRadius: 225,
    orbitSpeed: 0.18,
    rotationSpeed: 0.4,
  },

  // ════════════════════════════════════════════════════════════
  //  LUNAS
  // ════════════════════════════════════════════════════════════

  // ── Luna (Tierra) ────────────────────────────────────────────
  {
    name: 'Luna',
    type: 'Luna',
    imgFile:     'img/Luna.jpg',
    wiki:        'https://es.wikipedia.org/wiki/Luna',
    textureFile: 'assets/textures/8k_moon.jpg',
    description: 'El único satélite natural de la Tierra. Su influencia gravitacional regula las mareas terrestres.',
    stats: {
      'Diámetro':        '3,474 km',
      'Distancia':       '384,400 km de la Tierra',
      'Período orbital': '27.3 días',
      'Gravedad':        '1/6 de la Tierra',
    },
    radius: 0.82,
    color: '#c8c8c8',
    parent: 'Tierra',
    orbitRadius: 6.5,
    orbitSpeed: 3.5,
    rotationSpeed: 0.05,
  },

  // ── Fobos (Marte) ────────────────────────────────────────────
  {
    name: 'Fobos',
    type: 'Luna',
    imgFile:     'img/Fobos.jpg',
    wiki:        'https://es.wikipedia.org/wiki/Fobos_(sat%C3%A9lite)',
    description: 'La luna interior de Marte. Orbita tan cerca que en ~50 millones de años colisionará con el planeta.',
    stats: {
      'Diámetro':        '22.4 km',
      'Distancia':       '9,376 km de Marte',
      'Período orbital': '7.6 horas',
      'Forma':           'Irregular / patata',
    },
    radius: 0.42,
    color: '#a09070',
    parent: 'Marte',
    orbitRadius: 4.2,
    orbitSpeed: 7,
    rotationSpeed: 0.1,
  },

  // ── Deimos (Marte) ───────────────────────────────────────────
  {
    name: 'Deimos',
    type: 'Luna',
    imgFile:     'img/Deimos.jpg',
    wiki:        'https://es.wikipedia.org/wiki/Deimos_(sat%C3%A9lite)',
    description: 'La luna exterior y más pequeña de Marte. Su baja gravedad casi no retiene material en su superficie.',
    stats: {
      'Diámetro':        '12.4 km',
      'Distancia':       '23,460 km de Marte',
      'Período orbital': '30.3 horas',
    },
    radius: 0.28,
    color: '#908060',
    parent: 'Marte',
    orbitRadius: 6.5,
    orbitSpeed: 2.5,
    rotationSpeed: 0.08,
  },

  // ── Ío (Júpiter) ─────────────────────────────────────────────
  {
    name: 'Ío',
    type: 'Luna',
    imgFile:     'img/io.jpg',
    wiki:        'https://es.wikipedia.org/wiki/I%C3%B3_(sat%C3%A9lite)',
    description: 'El cuerpo geológicamente más activo del sistema solar, con más de 400 volcanes en erupción continua.',
    stats: {
      'Diámetro':        '3,643 km',
      'Distancia':       '421,700 km de Júpiter',
      'Período orbital': '1.77 días',
      'Volcanes':        'Más de 400 activos',
    },
    radius: 0.85,
    color: '#e8d44d',
    parent: 'Júpiter',
    orbitRadius: 13,
    orbitSpeed: 5,
    rotationSpeed: 0.1,
  },

  // ── Europa (Júpiter) ─────────────────────────────────────────
  {
    name: 'Europa',
    type: 'Luna',
    imgFile:     'img/Europa.jpg',
    wiki:        'https://es.wikipedia.org/wiki/Europa_(sat%C3%A9lite)',
    description: 'Bajo su superficie de hielo se esconde un océano de agua líquida. Es uno de los mejores candidatos para albergar vida.',
    stats: {
      'Diámetro':        '3,122 km',
      'Distancia':       '671,100 km de Júpiter',
      'Período orbital': '3.55 días',
      'Superficie':      'Hielo con océano subterráneo',
    },
    radius: 0.78,
    color: '#c8d4e8',
    parent: 'Júpiter',
    orbitRadius: 17,
    orbitSpeed: 3.5,
    rotationSpeed: 0.08,
  },

  // ── Ganimedes (Júpiter) ──────────────────────────────────────
  {
    name: 'Ganimedes',
    type: 'Luna',
    imgFile:     'img/Ganimedes.jpg',
    wiki:        'https://es.wikipedia.org/wiki/Gan%C3%ADmedes_(sat%C3%A9lite)',
    description: 'La luna más grande del sistema solar, incluso mayor que Mercurio. Tiene su propio campo magnético.',
    stats: {
      'Diámetro':        '5,268 km',
      'Distancia':       '1,070,400 km de Júpiter',
      'Período orbital': '7.15 días',
      'Nota':            'Mayor que Mercurio',
    },
    radius: 1.1,
    color: '#a09090',
    parent: 'Júpiter',
    orbitRadius: 22,
    orbitSpeed: 2.2,
    rotationSpeed: 0.07,
  },

  // ── Titán (Saturno) ──────────────────────────────────────────
  {
    name: 'Titán',
    type: 'Luna',
    imgFile:     'img/Titan.jpeg',
    wiki:        'https://es.wikipedia.org/wiki/Tit%C3%A1n_(sat%C3%A9lite)',
    description: 'La mayor luna de Saturno. Posee atmósfera densa de nitrógeno y lagos de metano líquido en su superficie.',
    stats: {
      'Diámetro':        '5,151 km',
      'Distancia':       '1,221,870 km de Saturno',
      'Período orbital': '15.9 días',
      'Atmósfera':       'Nitrógeno y metano',
    },
    radius: 1.05,
    color: '#d4a060',
    parent: 'Saturno',
    orbitRadius: 22,
    orbitSpeed: 1.8,
    rotationSpeed: 0.06,
  },
];
