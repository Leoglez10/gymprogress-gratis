-- =====================================================
-- DEBUG: DESHABILITAR RLS TEMPORALMENTE
-- =====================================================
-- Esto permitirá que cualquier usuario lea todos los ejercicios
-- (solo para probar si RLS es el problema)

ALTER TABLE public.exercises DISABLE ROW LEVEL SECURITY;

SELECT 'RLS deshabilitado en exercises. Recarga la página.' as status;
