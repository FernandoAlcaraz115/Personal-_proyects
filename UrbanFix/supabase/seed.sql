-- ========================================================
-- UrbanFix: Seed Data para Pruebas en Supabase
-- ========================================================

-- Categorías
INSERT INTO categories (id, name, slug, icon, color, department, sla_hours) VALUES
('cat_bache', 'Bache / Asfalto Dañado', 'bache', 'Cone', '#F59E0B', 'Obras Públicas y Pavimentación', 72),
('cat_luminaria', 'Luminaria Fundida / Apagada', 'luminaria', 'Lightbulb', '#EAB308', 'Alumbrado Público', 48),
('cat_fuga', 'Fuga de Agua Potable', 'fuga', 'Droplets', '#06B6D4', 'Agua y Saneamiento', 24),
('cat_semaforo', 'Semáforo Averiado', 'semaforo', 'TrafficLight', '#EF4444', 'Movilidad y Tránsito', 12),
('cat_basura', 'Basura Acumulada / Escombros', 'basura', 'Trash2', '#10B981', 'Servicios Públicos y Limpia', 36)
ON CONFLICT (id) DO NOTHING;

-- Cuadrillas Municipales
INSERT INTO crews (id, name, department, lead_technician, phone, status, active_tasks) VALUES
('b1000000-0000-0000-0000-000000000001', 'Cuadrilla Pavimentación Centro', 'Obras Públicas', 'Ing. Carlos Mendoza', '555-0192', 'busy', 2),
('b1000000-0000-0000-0000-000000000002', 'Cuadrilla Alumbrado Rápido', 'Alumbrado Público', 'Tec. Roberto Gómez', '555-0144', 'available', 1),
('b1000000-0000-0000-0000-000000000003', 'Emergencias Hidráulicas 24/7', 'Agua y Saneamiento', 'Ing. Sofía Valdés', '555-0811', 'busy', 3),
('b1000000-0000-0000-0000-000000000004', 'Mantenimiento Semafórico', 'Movilidad', 'Téc. Fernando Ruiz', '555-0322', 'available', 0)
ON CONFLICT (id) DO NOTHING;

-- Reportes iniciales con coordenadas reales en zona urbana representativa (CDMX / Guadalajara centro)
INSERT INTO reports (
    id, ticket_number, title, description, category_id, status, priority, 
    latitude, longitude, address, neighborhood, photo_url, citizen_name, 
    assigned_crew_id, upvotes_count, created_at
) VALUES
(
    'c1000000-0000-0000-0000-000000000001',
    'UF-2026-001',
    'Bache profundo en carril derecho',
    'Bache de aprox. 40cm de diámetro que causa ponchaduras constantes al incorporarse a la avenida.',
    'cat_bache',
    'in_progress',
    'high',
    19.432608, -99.133209,
    'Av. Juárez 42, frente a plaza cívica',
    'Centro Histórico',
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    'Alejandro Silva',
    'b1000000-0000-0000-0000-000000000001',
    6,
    NOW() - INTERVAL '1 day'
),
(
    'c1000000-0000-0000-0000-000000000002',
    'UF-2026-002',
    'Fuga abundante de agua limpia',
    'Tubería rota en banqueta brotando litros de agua potable hacia la calle.',
    'cat_fuga',
    'assigned',
    'critical',
    19.435800, -99.141200,
    'Calle Balderas esq. Ayuntamiento',
    'Centro',
    'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=600&auto=format&fit=crop&q=80',
    'Mariana López',
    'b1000000-0000-0000-0000-000000000003',
    12,
    NOW() - INTERVAL '4 hours'
),
(
    'c1000000-0000-0000-0000-000000000003',
    'UF-2026-003',
    'Luminaria parpadeando y poste inclinado',
    'La lámpara se apaga en la noche dejando la esquina totalmente a oscuras e insegura.',
    'cat_luminaria',
    'pending',
    'medium',
    19.428500, -99.138900,
    'Calle López 88',
    'Doctores',
    'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80',
    'Esteban Morales',
    NULL,
    3,
    NOW() - INTERVAL '2 days'
),
(
    'c1000000-0000-0000-0000-000000000004',
    'UF-2026-004',
    'Semáforo apagado en cruce transitado',
    'Semáforo principal sin energía, riesgo alto de choques entre vehículos y peatones.',
    'cat_semaforo',
    'in_review',
    'critical',
    19.424600, -99.166100,
    'Glorieta de Insurgentes esq. Oaxaca',
    'Roma Norte',
    'https://images.unsplash.com/photo-1572970725354-93ff912a208c?w=600&auto=format&fit=crop&q=80',
    'Rodrigo Casas',
    NULL,
    19,
    NOW() - INTERVAL '1 hour'
),
(
    'c1000000-0000-0000-0000-000000000005',
    'UF-2026-005',
    'Bache reparado y reencarpetado',
    'Bache sobre carril de baja velocidad reportado la semana pasada.',
    'cat_bache',
    'resolved',
    'medium',
    19.439100, -99.137500,
    'República de Cuba 15',
    'Centro',
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    'Lucía Herrera',
    'b1000000-0000-0000-0000-000000000001',
    4,
    NOW() - INTERVAL '5 days'
)
ON CONFLICT (id) DO NOTHING;
