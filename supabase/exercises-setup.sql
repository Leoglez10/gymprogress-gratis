-- =====================================================
-- TABLA DE EJERCICIOS PARA GYMPROGRESS
-- =====================================================
-- Este script crea la tabla de ejercicios y los triggers necesarios
-- Ejecuta este script en tu proyecto de Supabase (SQL Editor)

-- 1. Crear la tabla de ejercicios
CREATE TABLE IF NOT EXISTS public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  muscle_group text NOT NULL,
  is_custom boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_user_exercise UNIQUE(user_id, name)
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas de seguridad (solo el usuario ve sus propios ejercicios)

-- Policy: Los usuarios solo pueden ver sus propios ejercicios
DROP POLICY IF EXISTS "Users can view own exercises" ON public.exercises;
CREATE POLICY "Users can view own exercises"
  ON public.exercises FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Los usuarios pueden insertar sus propios ejercicios
DROP POLICY IF EXISTS "Users can insert own exercises" ON public.exercises;
CREATE POLICY "Users can insert own exercises"
  ON public.exercises FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Los usuarios pueden actualizar sus propios ejercicios
DROP POLICY IF EXISTS "Users can update own exercises" ON public.exercises;
CREATE POLICY "Users can update own exercises"
  ON public.exercises FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Los usuarios pueden eliminar sus propios ejercicios
DROP POLICY IF EXISTS "Users can delete own exercises" ON public.exercises;
CREATE POLICY "Users can delete own exercises"
  ON public.exercises FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Crear función para insertar ejercicios por defecto a nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user_exercises()
RETURNS trigger AS $$
BEGIN
  -- Insertar ejercicios por defecto para el nuevo usuario
  INSERT INTO public.exercises (user_id, name, muscle_group, is_custom)
  VALUES 
    (NEW.id, 'Press de Banca', 'Pecho', false),
    (NEW.id, 'Sentadilla (Squat)', 'Pierna', false),
    (NEW.id, 'Peso Muerto', 'Espalda/Pierna', false),
    (NEW.id, 'Press Militar', 'Hombro', false),
    (NEW.id, 'Dominadas', 'Espalda', false)
  ON CONFLICT (user_id, name) DO NOTHING; -- Evitar duplicados
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Crear trigger que ejecuta la función cuando se crea un nuevo usuario
DROP TRIGGER IF EXISTS on_auth_user_created_exercises ON auth.users;
CREATE TRIGGER on_auth_user_created_exercises
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_exercises();

-- 6. Insertar ejercicios por defecto para usuarios existentes (migración)
-- NOTA: Esto insertará ejercicios para usuarios que ya existen en tu base de datos
INSERT INTO public.exercises (user_id, name, muscle_group, is_custom)
SELECT 
  u.id as user_id,
  e.name,
  e.muscle_group,
  false as is_custom
FROM auth.users u
CROSS JOIN (
  VALUES 
    ('Press de Banca', 'Pecho'),
    ('Sentadilla (Squat)', 'Pierna'),
    ('Peso Muerto', 'Espalda/Pierna'),
    ('Press Militar', 'Hombro'),
    ('Dominadas', 'Espalda')
) AS e(name, muscle_group)
ON CONFLICT (user_id, name) DO NOTHING;

-- =====================================================
-- ¡LISTO! Ahora puedes usar la tabla de ejercicios
-- =====================================================
