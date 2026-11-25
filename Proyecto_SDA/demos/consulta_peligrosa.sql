-- Consulta generada por LLM con alucinación destructiva (sin WHERE)
-- e incompatibilidades de dialecto SQL
DELETE FROM usuarios_activos;

SELECT id, nombre, DATEDIFF(fecha_fin, fecha_inicio) AS dias, FROM empleados WHERE activo = 1 WHERE rol = 'admin';
