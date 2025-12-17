-- =====================================================
-- LIMPIAR COLUMNAS DE AVATAR (FOTO)
-- =====================================================
-- Este script elimina las columnas que ya no se usan en el perfil

ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS avatar_url,
DROP COLUMN IF EXISTS foto_url;

SELECT 'Columnas de foto de perfil eliminadas correctamente.' as status;
