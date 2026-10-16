-- ========================================================
-- UrbanFix: Esquema de Base de Datos para Supabase + PostGIS
-- Sistema Inteligente de Reportes Urbanos
-- ========================================================

-- 1. Habilitar extensiones geoespaciales y UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Tabla de Categorías de Infraestructura
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL,
    department VARCHAR(150) NOT NULL,
    sla_hours INTEGER NOT NULL DEFAULT 48,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Cuadrillas y Técnicos Municipales
CREATE TABLE IF NOT EXISTS crews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    department VARCHAR(150) NOT NULL,
    lead_technician VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'busy', 'off_duty')),
    active_tasks INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla Principal de Reportes Ciudadanos
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(30) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category_id TEXT REFERENCES categories(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'assigned', 'in_progress', 'resolved', 'rejected')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location GEOGRAPHY(Point, 4326),
    address TEXT NOT NULL,
    neighborhood VARCHAR(150),
    photo_url TEXT NOT NULL,
    resolution_photo_url TEXT,
    resolution_notes TEXT,
    citizen_name VARCHAR(150) DEFAULT 'Ciudadano Anónimo',
    citizen_phone VARCHAR(50),
    assigned_crew_id UUID REFERENCES crews(id) ON DELETE SET NULL,
    upvotes_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Trigger para sincronizar la columna espacial PostGIS 'location' con lat/lon
CREATE OR REPLACE FUNCTION update_report_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_report_geom
BEFORE INSERT OR UPDATE OF latitude, longitude ON reports
FOR EACH ROW
EXECUTE FUNCTION update_report_geom();

-- Índice espacial para búsquedas ultrarrápidas de proximidad (detección de duplicados en un radio)
CREATE INDEX IF NOT EXISTS idx_reports_location ON reports USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports (category_id);

-- 5. Historial de Trazabilidad y Cambios de Estado
CREATE TABLE IF NOT EXISTS report_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    comment TEXT,
    changed_by VARCHAR(150) DEFAULT 'Sistema / Administrador',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Función RPC para Detección de Duplicados en Radio de X Metros
CREATE OR REPLACE FUNCTION find_nearby_reports(
    user_lat DOUBLE PRECISION,
    user_lon DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION DEFAULT 30.0
)
RETURNS TABLE (
    id UUID,
    ticket_number VARCHAR,
    title VARCHAR,
    category_id TEXT,
    distance_meters DOUBLE PRECISION,
    status VARCHAR,
    photo_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.ticket_number,
        r.title,
        r.category_id,
        ST_Distance(r.location, ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography) AS distance_meters,
        r.status,
        r.photo_url
    FROM reports r
    WHERE r.status != 'resolved' AND r.status != 'rejected'
      AND ST_DWithin(r.location, ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography, radius_meters)
    ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;
