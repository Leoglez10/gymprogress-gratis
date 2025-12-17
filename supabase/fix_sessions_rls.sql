-- =====================================================
-- FIX RLS FOR SESSIONS (ENABLE DELETE)
-- =====================================================

-- 1. Enable RLS on workout_sessions (if not enabled)
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

-- 2. Create Policy for DELETING sessions
-- Allow users to delete their own sessions
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.workout_sessions;
CREATE POLICY "Users can delete their own sessions"
ON public.workout_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- 3. Create Policy for SELECTing sessions (just in case)
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.workout_sessions;
CREATE POLICY "Users can view their own sessions"
ON public.workout_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- 4. Create Policy for INSERTing sessions
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.workout_sessions;
CREATE POLICY "Users can insert their own sessions"
ON public.workout_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. Create Policy for UPDATING sessions
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.workout_sessions;
CREATE POLICY "Users can update their own sessions"
ON public.workout_sessions
FOR UPDATE
USING (auth.uid() = user_id);


-- =====================================================
-- FIX RLS FOR ENTRIES & SETS (CASCADE HANDLING)
-- =====================================================
-- Usually DELETE on parent cascades, but we need policies if we query them directly.
-- Note: 'workout_entries' and 'sets' usually inherit access via joins, but explicit policies are safer.

-- WORKOUT_ENTRIES
ALTER TABLE public.workout_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their entries via session" ON public.workout_entries;
CREATE POLICY "Users can manage their entries via session"
ON public.workout_entries
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.workout_sessions s
    WHERE s.id = workout_entries.session_id
    AND s.user_id = auth.uid()
  )
);

-- SETS
ALTER TABLE public.sets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their sets via entry" ON public.sets;
CREATE POLICY "Users can manage their sets via entry"
ON public.sets
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.workout_entries e
    JOIN public.workout_sessions s ON s.id = e.session_id
    WHERE e.id = sets.entry_id
    AND s.user_id = auth.uid()
  )
);

SELECT 'RLS Policies for Sessions fixed. DELETE should work now.' as status;
