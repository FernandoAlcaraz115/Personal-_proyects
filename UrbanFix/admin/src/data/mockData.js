// Dataset de prueba para UrbanFix Admin
export const INITIAL_CATEGORIES = [
  {
    id: 'cat_bache',
    name: 'Bache / Asfalto Dañado',
    slug: 'bache',
    icon: 'Hammer',
    color: '#f97316',
    department: 'Obras Públicas y Pavimentación',
    slaHours: 72
  },
  {
    id: 'cat_luminaria',
    name: 'Luminaria Fundida / Apagada',
    slug: 'luminaria',
    icon: 'Lightbulb',
    color: '#eab308',
    department: 'Alumbrado Público',
    slaHours: 48
  },
  {
    id: 'cat_fuga',
    name: 'Fuga de Agua Potable',
    slug: 'fuga',
    icon: 'Droplets',
    color: '#06b6d4',
    department: 'Agua Potable y Saneamiento',
    slaHours: 24
  },
  {
    id: 'cat_semaforo',
    name: 'Semáforo Averiado',
    slug: 'semaforo',
    icon: 'AlertTriangle',
    color: '#ef4444',
    department: 'Movilidad y Tránsito',
    slaHours: 12
  },
  {
    id: 'cat_basura',
    name: 'Basura Acumulada / Escombros',
    slug: 'basura',
    icon: 'Trash2',
    color: '#10b981',
    department: 'Servicios Públicos y Limpia',
    slaHours: 36
  }
];

export const INITIAL_CREWS = [
  {
    id: 'crew-01',
    name: 'Cuadrilla Pavimentación Poniente',
    department: 'Obras Públicas y Pavimentación',
    leadTechnician: 'Ing. Carlos Mendoza',
    phone: '+52 55 4192-8811',
    status: 'busy',
    activeTasks: 2
  },
  {
    id: 'crew-02',
    name: 'Alumbrado Exprés Nocturno',
    department: 'Alumbrado Público',
    leadTechnician: 'Téc. Roberto Gómez',
    phone: '+52 55 8321-4402',
    status: 'available',
    activeTasks: 0
  },
  {
    id: 'crew-03',
    name: 'Brigada Hidráulica Emergencias 24/7',
    department: 'Agua Potable y Saneamiento',
    leadTechnician: 'Ing. Sofía Valdés',
    phone: '+52 55 9012-3377',
    status: 'busy',
    activeTasks: 3
  },
  {
    id: 'crew-04',
    name: 'Técnicos de Semaforización',
    department: 'Movilidad y Tránsito',
    leadTechnician: 'Téc. Fernando Ruiz',
    phone: '+52 55 1290-7744',
    status: 'available',
    activeTasks: 1
  },
  {
    id: 'crew-05',
    name: 'Limpia y Desazolve Cuauhtémoc',
    department: 'Servicios Públicos y Limpia',
    leadTechnician: 'Marcos Peralta',
    phone: '+52 55 7766-5544',
    status: 'available',
    activeTasks: 0
  }
];

export const INITIAL_REPORTS = [
  {
    id: 'rep-001',
    ticketNumber: 'UF-2026-0101',
    title: 'Bache profundo en carril de alta velocidad',
    description: 'Bache de aproximadamente 50cm de diámetro que ha causado daños a varios neumáticos al frenar en el semáforo.',
    categoryId: 'cat_bache',
    status: 'in_progress',
    priority: 'high',
    latitude: 19.432608,
    longitude: -99.133209,
    address: 'Av. Juárez 42, frente a Alameda Central',
    neighborhood: 'Centro Histórico',
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    citizenName: 'Alejandro Silva',
    citizenPhone: '55 1234 5678',
    assignedCrewId: 'crew-01',
    upvotesCount: 14,
    createdAt: '2026-10-12T14:30:00Z',
    history: [
      { status: 'pending', date: '2026-10-12T14:30:00Z', note: 'Reporte registrado por ciudadano vía App Móvil' },
      { status: 'in_review', date: '2026-10-12T16:10:00Z', note: 'Validado por supervisor del C5' },
      { status: 'assigned', date: '2026-10-13T09:00:00Z', note: 'Asignado a Cuadrilla Pavimentación Poniente' },
      { status: 'in_progress', date: '2026-10-14T08:15:00Z', note: 'Cuadrilla en sitio cortando asfalto perimetral' }
    ]
  },
  {
    id: 'rep-002',
    ticketNumber: 'UF-2026-0102',
    title: 'Fuga abundante de agua potable en banqueta',
    description: 'Tubería rota bajo la acera. El agua está brotando a presión e inundando la entrada de dos negocios locales.',
    categoryId: 'cat_fuga',
    status: 'assigned',
    priority: 'critical',
    latitude: 19.436150,
    longitude: -99.141800,
    address: 'Calle Balderas 82 esq. Ayuntamiento',
    neighborhood: 'Centro',
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=800&auto=format&fit=crop&q=80',
    citizenName: 'Mariana López',
    citizenPhone: '55 9876 5432',
    assignedCrewId: 'crew-03',
    upvotesCount: 29,
    createdAt: '2026-10-14T06:15:00Z',
    history: [
      { status: 'pending', date: '2026-10-14T06:15:00Z', note: 'Alerta prioritaria registrada con video' },
      { status: 'assigned', date: '2026-10-14T07:00:00Z', note: 'Despacho urgente a Brigada Hidráulica 24/7' }
    ]
  },
  {
    id: 'rep-003',
    ticketNumber: 'UF-2026-0103',
    title: 'Luminaria apagada en callejón oscuro',
    description: 'Poste número AL-409 con lámpara fundida desde hace 5 días. Genera foco de asaltos nocturnos.',
    categoryId: 'cat_luminaria',
    status: 'pending',
    priority: 'medium',
    latitude: 19.428500,
    longitude: -99.138900,
    address: 'Calle López 115',
    neighborhood: 'Doctores',
    photoUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80',
    citizenName: 'Esteban Morales',
    citizenPhone: '55 4567 8901',
    assignedCrewId: null,
    upvotesCount: 7,
    createdAt: '2026-10-13T20:45:00Z',
    history: [
      { status: 'pending', date: '2026-10-13T20:45:00Z', note: 'Esperando validación de cuadrilla' }
    ]
  },
  {
    id: 'rep-004',
    ticketNumber: 'UF-2026-0104',
    title: 'Semáforo intermitente en cruce de 4 carriles',
    description: 'Luces ámbar y roja parpadeando simultáneamente. Congestionamiento vial severo y riesgo de atropellamiento.',
    categoryId: 'cat_semaforo',
    status: 'in_review',
    priority: 'critical',
    latitude: 19.424600,
    longitude: -99.166100,
    address: 'Av. Chapultepec esq. Insurgentes',
    neighborhood: 'Roma Norte',
    photoUrl: 'https://images.unsplash.com/photo-1572970725354-93ff912a208c?w=800&auto=format&fit=crop&q=80',
    citizenName: 'Rodrigo Casas',
    citizenPhone: '55 3322 1100',
    assignedCrewId: null,
    upvotesCount: 38,
    createdAt: '2026-10-14T08:00:00Z',
    history: [
      { status: 'pending', date: '2026-10-14T08:00:00Z', note: 'Múltiples reportes ciudadanos en la misma coordenada' },
      { status: 'in_review', date: '2026-10-14T08:20:00Z', note: 'Central de tránsito verificando cámaras C5' }
    ]
  },
  {
    id: 'rep-005',
    ticketNumber: 'UF-2026-0105',
    title: 'Escombros y basura vegetal obstruyendo banqueta',
    description: 'Ramas secas de poda municipal y costales de cascajo abandonados en vía pública impiden el paso de sillas de ruedas.',
    categoryId: 'cat_basura',
    status: 'assigned',
    priority: 'low',
    latitude: 19.418200,
    longitude: -99.162300,
    address: 'Calle Orizaba 45',
    neighborhood: 'Roma Norte',
    photoUrl: 'https://images.unsplash.com/photo-1611288875685-147054941d42?w=800&auto=format&fit=crop&q=80',
    citizenName: 'Lucía Herrera',
    citizenPhone: '55 6677 8899',
    assignedCrewId: 'crew-05',
    upvotesCount: 3,
    createdAt: '2026-10-11T11:20:00Z',
    history: [
      { status: 'pending', date: '2026-10-11T11:20:00Z', note: 'Reporte ingresado' },
      { status: 'assigned', date: '2026-10-13T10:00:00Z', note: 'Asignado a cuadrilla de limpia zona poniente' }
    ]
  },
  {
    id: 'rep-006',
    ticketNumber: 'UF-2026-0106',
    title: 'Bache reparado con carpeta asfáltica en caliente',
    description: 'Trabajo concluido exitosamente. Sellado e impermeabilizado de fisuras perimetrales.',
    categoryId: 'cat_bache',
    status: 'resolved',
    priority: 'high',
    latitude: 19.439100,
    longitude: -99.137500,
    address: 'República de Cuba 28',
    neighborhood: 'Centro',
    photoUrl: 'https://images.unsplash.com/photo-1584463699043-4b684cb3501a?w=800&auto=format&fit=crop&q=80',
    resolutionPhotoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=800&auto=format&fit=crop&q=80',
    resolutionNotes: 'Se utilizó mezcla asfáltica AC-20 y compactación con rodillo vibro-compactador.',
    citizenName: 'Patricio Vega',
    citizenPhone: '55 4433 2211',
    assignedCrewId: 'crew-01',
    upvotesCount: 8,
    createdAt: '2026-10-09T09:10:00Z',
    resolvedAt: '2026-10-12T17:00:00Z',
    history: [
      { status: 'pending', date: '2026-10-09T09:10:00Z', note: 'Reporte ciudadano' },
      { status: 'assigned', date: '2026-10-10T08:30:00Z', note: 'Asignado a Cuadrilla 01' },
      { status: 'in_progress', date: '2026-10-11T10:00:00Z', note: 'Inicio de labores de bacheo' },
      { status: 'resolved', date: '2026-10-12T17:00:00Z', note: 'Reparación concluida y verificada con foto posterior' }
    ]
  },
  {
    id: 'rep-007',
    ticketNumber: 'UF-2026-0107',
    title: 'Fuga de agua en medidor doméstico expuesto',
    description: 'Chorro constante hacia el arroyo vehicular.',
    categoryId: 'cat_fuga',
    status: 'pending',
    priority: 'medium',
    latitude: 19.422100,
    longitude: -99.173200,
    address: 'Calle Ámsterdam 140',
    neighborhood: 'Condesa',
    photoUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
    citizenName: 'Diana Rivas',
    citizenPhone: '55 8899 0011',
    assignedCrewId: null,
    upvotesCount: 5,
    createdAt: '2026-10-14T09:00:00Z',
    history: [
      { status: 'pending', date: '2026-10-14T09:00:00Z', note: 'Nuevo reporte recibido' }
    ]
  },
  {
    id: 'rep-008',
    ticketNumber: 'UF-2026-0108',
    title: 'Dos luminarias LED sin corriente en parque público',
    description: 'Zona de juegos infantiles queda completamente oscura a partir de las 19:00 hrs.',
    categoryId: 'cat_luminaria',
    status: 'in_progress',
    priority: 'high',
    latitude: 19.415800,
    longitude: -99.171400,
    address: 'Parque México, andador central',
    neighborhood: 'Condesa',
    photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
    citizenName: 'Gabriel Navarro',
    citizenPhone: '55 1122 3344',
    assignedCrewId: 'crew-02',
    upvotesCount: 22,
    createdAt: '2026-10-13T18:00:00Z',
    history: [
      { status: 'pending', date: '2026-10-13T18:00:00Z', note: 'Reporte ingresado' },
      { status: 'assigned', date: '2026-10-14T07:30:00Z', note: 'Asignado a Alumbrado Exprés Nocturno' },
      { status: 'in_progress', date: '2026-10-14T09:10:00Z', note: 'Reemplazando balastro y cableado subterráneo' }
    ]
  }
];
