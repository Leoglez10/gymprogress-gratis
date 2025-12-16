import { supabase } from './supabase';
import { WorkoutSession, WorkoutEntry, SetEntry } from '../types';
import { exerciseService } from './exerciseService';

export const sessionService = {
    /**
     * Create a new workout session with entries and sets in Supabase
     */
    createSession: async (userId: string, session: WorkoutSession): Promise<string | null> => {
        try {
            // 1. Create the session
            const { data: sessionData, error: sessionError } = await supabase
                .from('workout_sessions')
                .insert({
                    user_id: userId,
                    started_at: session.date,
                    notes: session.note || null,
                    name: null // opcional, si quieres nombrar las sesiones
                })
                .select()
                .single();

            if (sessionError) {
                console.error('Error creating session:', sessionError);
                throw new Error('Error al guardar la sesión');
            }

            const sessionId = sessionData.id;

            // 2. Ensure exercises have UUIDs (sync temp_* to Supabase if needed)
            const preparedEntries: WorkoutEntry[] = [];
            for (let i = 0; i < session.entries.length; i++) {
                const entry = session.entries[i];
                let exerciseId = entry.exerciseId;
                try {
                    exerciseId = await exerciseService.ensureRemoteExercise(userId, entry.exerciseId);
                } catch (e) {
                    console.error('Error ensuring remote exercise for entry:', entry.exerciseId, e);
                    throw new Error('Error al sincronizar el ejercicio (ID inválido)');
                }

                preparedEntries.push({ ...entry, exerciseId });
            }

            // 3. Create entries for each exercise
            for (let i = 0; i < preparedEntries.length; i++) {
                const entry = preparedEntries[i];

                const { data: entryData, error: entryError } = await supabase
                    .from('workout_entries')
                    .insert({
                        session_id: sessionId,
                        exercise_id: entry.exerciseId,
                        order_index: i,
                        notes: entry.variant || null // usando notes para variant
                    })
                    .select()
                    .single();

                if (entryError) {
                    console.error('Error creating entry:', entryError);
                    throw new Error('Error al guardar los ejercicios');
                }

                const entryId = entryData.id;

                // 4. Create sets for this entry
                const setsToInsert = entry.sets.map((set, setIndex) => ({
                    entry_id: entryId,
                    set_number: setIndex + 1,
                    weight_kg: set.weight, // ya está en kg
                    reps: set.reps,
                    rpe: set.rpe || (set.rir != null ? Math.max(1, Math.min(10, 10 - set.rir)) : null),
                    rir: set.rir ?? null,
                    is_warmup: set.isWarmup
                }));

                const { error: setsError } = await supabase
                    .from('sets')
                    .insert(setsToInsert);

                if (setsError) {
                    console.error('Error creating sets:', setsError);
                    throw new Error('Error al guardar las series');
                }
            }

            return sessionId;
        } catch (error) {
            console.error('Exception creating session:', error);
            throw error;
        }
    },

    /**
     * Fetch all sessions for a user with their entries and sets
     */
    fetchSessions: async (userId: string, limit: number = 50): Promise<WorkoutSession[]> => {
        try {
            // Fetch sessions
            const { data: sessions, error: sessionsError } = await supabase
                .from('workout_sessions')
                .select(`
          id,
          user_id,
          started_at,
          notes,
          name
        `)
                .eq('user_id', userId)
                .order('started_at', { ascending: false })
                .limit(limit);

            if (sessionsError) {
                console.error('Error fetching sessions:', sessionsError);
                return [];
            }

            if (!sessions || sessions.length === 0) {
                return [];
            }

            // Fetch all entries for these sessions
            const sessionIds = sessions.map(s => s.id);
            const { data: entries, error: entriesError } = await supabase
                .from('workout_entries')
                .select(`
          id,
          session_id,
          exercise_id,
          order_index,
          notes
        `)
                .in('session_id', sessionIds)
                .order('order_index', { ascending: true });

            if (entriesError) {
                console.error('Error fetching entries:', entriesError);
                return [];
            }

            // Fetch all sets for these entries
            const entryIds = entries?.map(e => e.id) || [];
            const { data: sets, error: setsError } = await supabase
                .from('sets')
                .select('*')
                .in('entry_id', entryIds)
                .order('set_number', { ascending: true });

            if (setsError) {
                console.error('Error fetching sets:', setsError);
                return [];
            }

            // Map to WorkoutSession format
            return sessions.map(session => {
                const sessionEntries = entries?.filter(e => e.session_id === session.id) || [];

                return {
                    id: session.id,
                    date: session.started_at,
                    note: session.notes || undefined,
                    entries: sessionEntries.map(entry => {
                        const entrySets = sets?.filter(s => s.entry_id === entry.id) || [];

                        return {
                            id: entry.id,
                            exerciseId: entry.exercise_id,
                            variant: entry.notes || undefined,
                            sets: entrySets.map(set => ({
                                id: set.id,
                                weight: set.weight_kg,
                                reps: set.reps,
                                rpe: set.rpe || undefined,
                                rir: set.rir || undefined,
                                isWarmup: set.is_warmup
                            }))
                        };
                    })
                };
            });
        } catch (error) {
            console.error('Exception fetching sessions:', error);
            return [];
        }
    },

    /**
     * Get the last set for a specific exercise (for autofill)
     */
    getLastSetForExercise: async (userId: string, exerciseId: string): Promise<{ weight: number; reps: number } | null> => {
        try {
            // Query para obtener el último set de un ejercicio específico
            const { data, error } = await supabase
                .from('sets')
                .select(`
          weight_kg,
          reps,
          workout_entries!inner (
            exercise_id,
            workout_sessions!inner (
              user_id,
              started_at
            )
          )
        `)
                .eq('workout_entries.exercise_id', exerciseId)
                .eq('workout_entries.workout_sessions.user_id', userId)
                .order('workout_entries.workout_sessions.started_at', { ascending: false })
                .limit(1)
                .single();

            if (error || !data) {
                return null;
            }

            return {
                weight: data.weight_kg,
                reps: data.reps
            };
        } catch (error) {
            console.error('Exception getting last set:', error);
            return null;
        }
    },

    /**
     * Delete a session and all its entries/sets (cascade should handle this automatically)
     */
    deleteSession: async (sessionId: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('workout_sessions')
                .delete()
                .eq('id', sessionId);

            if (error) {
                console.error('Error deleting session:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Exception deleting session:', error);
            return false;
        }
    }
};
