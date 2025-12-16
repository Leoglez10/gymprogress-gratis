-- =====================================================
-- FIX: CORREGIR POLÍTICAS RLS PARA EJERCICIOS
-- =====================================================
-- El problema es que las políticas usan "user_id" pero tu tabla usa "created_by"

-- 1. Eliminar políticas antiguas
DROP POLICY IF EXISTS "Users can view own exercises" ON public.exercises;
DROP POLICY IF EXISTS "Users can insert own exercises" ON public.exercises;
DROP POLICY IF EXISTS "Users can update own exercises" ON public.exercises;
DROP POLICY IF EXISTS "Users can delete own exercises" ON public.exercises;

-- 2. Crear políticas nuevas con "created_by"
CREATE POLICY "Users can view own exercises"
  ON public.exercises FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert own exercises"
  ON public.exercises FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own exercises"
  ON public.exercises FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own exercises"
  ON public.exercises FOR DELETE
  USING (auth.uid() = created_by);

SELECT 'Políticas RLS corregidas. Recarga la página de ejercicios.' as status;
