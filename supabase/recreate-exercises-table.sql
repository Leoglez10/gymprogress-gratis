-- =====================================================
-- RECREAR TABLA EXERCISES CORRECTAMENTE
-- =====================================================
-- Este script elimina la tabla actual y la recrea desde cero
-- con la configuración correcta para que funcione con JavaScript

-- PASO 1: Respaldar datos existentes
CREATE TABLE IF NOT EXISTS exercises_backup AS 
SELECT * FROM exercises;

-- PASO 2: Eliminar tabla y políticas actuales
DROP POLICY IF EXISTS "Users can view own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can insert own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can update own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can delete own exercises" ON exercises;
DROP TABLE IF EXISTS exercises CASCADE;

-- PASO 3: Crear tabla nueva con schema correcto
CREATE TABLE exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  muscle_group text NOT NULL,
  is_custom boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

-- PASO 4: Habilitar RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- PASO 5: Crear políticas RLS
CREATE POLICY "Users can view own exercises"
  ON exercises FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercises"
  ON exercises FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercises"
  ON exercises FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercises"
  ON exercises FOR DELETE
  USING (auth.uid() = user_id);

-- PASO 6: Migrar datos del respaldo
INSERT INTO exercises (id, user_id, name, muscle_group, is_custom, created_at)
SELECT 
  id,
  created_by as user_id,
  name,
  muscle_group,
  NOT is_public as is_custom,
  created_at
FROM exercises_backup
ON CONFLICT (user_id, name) DO NOTHING;

-- PASO 7: Crear trigger para ejercicios por defecto
CREATE OR REPLACE FUNCTION handle_new_user_exercises()
RETURNS trigger AS $$
BEGIN
  INSERT INTO exercises (user_id, name, muscle_group, is_custom)
  VALUES 
    (NEW.id, 'Press de Banca', 'Pecho', false),
    (NEW.id, 'Sentadilla', 'Pierna', false),
    (NEW.id, 'Peso Muerto', 'Espalda', false),
    (NEW.id, 'Press Militar', 'Hombro', false),
    (NEW.id, 'Dominadas', 'Espalda', false)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_exercises ON auth.users;
CREATE TRIGGER on_auth_user_created_exercises
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_exercises();

-- PASO 8: Verificar resultado
SELECT 'Tabla recreada exitosamente. Ejercicios migrados:' as status, count(*) from exercises;

-- NOTA: Después de ejecutar esto:
-- 1. Ve a Settings → API en Supabase
-- 2. Si no ves cambios, reinicia el proyecto: Settings → General → Pause → Resume
-- 3. Actualiza el código frontend (siguiente archivo)
