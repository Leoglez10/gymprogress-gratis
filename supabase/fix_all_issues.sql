-- =====================================================
-- MASTER FIX SCRIPT (SOLUCIONA TODO)
-- =====================================================
-- 1. Arregla el Registro (Quitando referencia a avatar_url que ya no existe)
-- 2. Arregla Trigger de Ejercicios (Usando columnas correctas user_id/is_custom)
-- 3. Arregla Borrado de Sesiones (Habilitando permisos DELETE)

-- -----------------------------------------------------------------------------
-- PARTE 1: ARREGLAR PERFILES (Login/Registro Bloqueado)
-- -----------------------------------------------------------------------------

-- Primero, aseguramos que la columna avatar_url NO exista (por si acaso no corriste el script anterior)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS avatar_url;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS foto_url;

-- Eliminamos el trigger viejo que intentaba guardar avatar_url
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_profile();

-- Creamos la función CORRECTA (Sin avatar_url)
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reconectamos el trigger
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();


-- -----------------------------------------------------------------------------
-- PARTE 2: ARREGLAR EJERCICIOS (Registro Bloqueado)
-- -----------------------------------------------------------------------------

-- Eliminamos triggers viejos
DROP TRIGGER IF EXISTS on_auth_user_created_exercises ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_exercises();

-- Función correcta usando user_id e is_custom
CREATE OR REPLACE FUNCTION public.handle_new_user_exercises()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.exercises (user_id, name, muscle_group, is_custom)
  VALUES 
    (NEW.id, 'Press de Banca', 'Pecho', false),
    (NEW.id, 'Sentadilla', 'Pierna', false),
    (NEW.id, 'Peso Muerto', 'Espalda', false),
    (NEW.id, 'Press Militar', 'Hombro', false),
    (NEW.id, 'Dominadas', 'Espalda', false)
  ON CONFLICT (user_id, name) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_exercises
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_exercises();


-- -----------------------------------------------------------------------------
-- PARTE 3: ARREGLAR BORRADO DE SESIONES (CRUD Roto)
-- -----------------------------------------------------------------------------

-- Habilitar RLS en sesiones
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

-- Crear política para BORRAR (que faltaba)
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.workout_sessions;
CREATE POLICY "Users can delete their own sessions"
ON public.workout_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- Asegurar otras políticas
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.workout_sessions;
CREATE POLICY "Users can view their own sessions" ON public.workout_sessions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.workout_sessions;
CREATE POLICY "Users can insert their own sessions" ON public.workout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own sessions" ON public.workout_sessions;
CREATE POLICY "Users can update their own sessions" ON public.workout_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Permisos para Entradas y Sets (Cascade)
ALTER TABLE public.workout_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their entries" ON public.workout_entries;
CREATE POLICY "Users can manage their entries" ON public.workout_entries FOR ALL USING (
  EXISTS (SELECT 1 FROM public.workout_sessions s WHERE s.id = workout_entries.session_id AND s.user_id = auth.uid())
);

ALTER TABLE public.sets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their sets" ON public.sets;
CREATE POLICY "Users can manage their sets" ON public.sets FOR ALL USING (
  EXISTS (SELECT 1 FROM public.workout_entries e JOIN public.workout_sessions s ON s.id = e.session_id WHERE e.id = sets.entry_id AND s.user_id = auth.uid())
);

SELECT 'TODO ARREGLADO: Login, Registro y Borrado de Sesiones funcionando.' as status;
