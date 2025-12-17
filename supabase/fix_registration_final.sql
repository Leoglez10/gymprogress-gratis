-- =====================================================
-- FIX FINAL: CORREGIR ERROR DE REGISTRO
-- =====================================================
-- Este script alinea el trigger de "nuevos usuarios" con la tabla 'exercises' real.
-- Tabla actual usa: user_id, is_custom
-- Trigger anterior usaba: created_by, is_public (incorrecto)

-- 1. Limpiar versiones anteriores del trigger y la función
DROP TRIGGER IF EXISTS on_auth_user_created_exercises ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_exercises();

-- 2. Crear la función usando las columnas CORRECTAS (user_id, is_custom)
CREATE OR REPLACE FUNCTION public.handle_new_user_exercises()
RETURNS trigger AS $$
BEGIN
  -- Insertar ejercicios básicos automáticamente para el nuevo usuario
  -- Se usa 'false' en is_custom porque son ejercicios por defecto del sistema
  INSERT INTO public.exercises (user_id, name, muscle_group, is_custom)
  VALUES 
    (NEW.id, 'Press de Banca', 'Pecho', false),
    (NEW.id, 'Sentadilla (Squat)', 'Pierna', false),
    (NEW.id, 'Peso Muerto', 'Espalda/Pierna', false),
    (NEW.id, 'Press Militar', 'Hombro', false),
    (NEW.id, 'Dominadas', 'Espalda', false)
  ON CONFLICT (user_id, name) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Reconectar el trigger a la tabla de usuarios de Supabase (auth.users)
CREATE TRIGGER on_auth_user_created_exercises
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_exercises();

-- 4. Verificación simple
SELECT 'Fix Final aplicado. El trigger ahora usa user_id e is_custom.' as status;
