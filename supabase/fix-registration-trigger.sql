-- =====================================================
-- FIX: CORREGIR ERROR DE REGISTRO
-- =====================================================
-- El error "Database error saving new user" ocurre porque el trigger
-- intenta usar columnas "user_id" y "is_custom" que no existen en tu tabla.
-- Tu tabla usa "created_by" y "is_public".

-- 1. Eliminar el trigger y función anteriores (si existen)
DROP TRIGGER IF EXISTS on_auth_user_created_exercises ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_exercises();

-- 2. Crear la función corregida con los nombres de columna reales
CREATE OR REPLACE FUNCTION public.handle_new_user_exercises()
RETURNS trigger AS $$
BEGIN
  -- Insertar ejercicios por defecto usando "created_by" y "is_public"
  INSERT INTO public.exercises (created_by, name, muscle_group, is_public)
  VALUES 
    (NEW.id, 'Press de Banca', 'Pecho', true),
    (NEW.id, 'Sentadilla (Squat)', 'Pierna', true),
    (NEW.id, 'Peso Muerto', 'Espalda/Pierna', true),
    (NEW.id, 'Press Militar', 'Hombro', true),
    (NEW.id, 'Dominadas', 'Espalda', true)
  ON CONFLICT (created_by, name) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Volver a crear el trigger
CREATE TRIGGER on_auth_user_created_exercises
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_exercises();

-- Mensaje de éxito
SELECT 'Fix aplicado correctamente. Intenta registrar usuario de nuevo.' as status;
