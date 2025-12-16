-- =====================================================
-- DEBUG: DESHABILITAR TRIGGER TEMPORALMENTE
-- =====================================================
-- Vamos a eliminar el trigger para probar si es la causa del error.
-- Si después de ejecutar esto puedes registrarte, confirma que el error está en el trigger.

DROP TRIGGER IF EXISTS on_auth_user_created_exercises ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_exercises();

SELECT 'Trigger eliminado. Intenta registrarte ahora.' as status;
