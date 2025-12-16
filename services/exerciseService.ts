import { supabase } from './supabase';
import { Exercise } from '../types';

// Helper to manage local storage
const LOCAL_KEY_PREFIX = 'gp_exercises_';

const getLocalExercises = (userId: string): Exercise[] => {
    try {
        const stored = localStorage.getItem(LOCAL_KEY_PREFIX + userId);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Error reading local exercises:', e);
        return [];
    }
};

const saveLocalExercises = (userId: string, exercises: Exercise[]) => {
    try {
        localStorage.setItem(LOCAL_KEY_PREFIX + userId, JSON.stringify(exercises));
    } catch (e) {
        console.error('Error saving local exercises:', e);
    }
};

export const exerciseService = {
    /**
     * Fetch exercises using Hybrid Strategy:
     * 1. Try to fetch from Supabase (with timeout)
     * 2. If successful, update localStorage and return fresh data
     * 3. If fails/timeouts, return data from localStorage
     */
    fetchExercises: async (userId: string): Promise<Exercise[]> => {
        console.log('🔍 fetchExercises (Hybrid): Starting...');

        // 1. Prepare Supabase Query with Timeout
        const fetchFromSupabase = async () => {
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Supabase timeout')), 3000) // 3s max wait
            );

            const queryPromise = supabase
                .from('exercises')
                .select('id, user_id, name, muscle_group, is_custom')
                .eq('user_id', userId)
                .order('name', { ascending: true });

            const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

            if (error) throw error;
            return (data || []).map((ex: any) => ({
                id: ex.id,
                userId: ex.user_id,
                name: ex.name,
                muscleGroup: ex.muscle_group,
                isCustom: ex.is_custom
            }));
        };

        try {
            // 2. Try Supabase
            const remoteExercises = await fetchFromSupabase();
            console.log('✅ Supabase Sync Success:', remoteExercises.length);

            // CRITICAL FIX: Don't just overwrite. Preserve pending local exercises (temp_*)
            const currentLocal = getLocalExercises(userId);
            const pendingExercises = currentLocal.filter(ex => ex.id.startsWith('temp_'));

            // Merge remote + pending
            // Use a Map to prevent duplicates if somehow a temp got synced but not updated locally
            const mergedMap = new Map<string, Exercise>();

            remoteExercises.forEach((ex: Exercise) => mergedMap.set(ex.name + ex.muscleGroup, ex));

            // Add pending ones only if not already in remote (by name check)
            pendingExercises.forEach(pending => {
                const key = pending.name + pending.muscleGroup;
                if (!mergedMap.has(key)) {
                    mergedMap.set(key, pending);
                }
            });

            const mergedExercises = Array.from(mergedMap.values());

            // Update local cache
            saveLocalExercises(userId, mergedExercises);
            return mergedExercises;

        } catch (error) {
            console.warn('⚠️ Supabase Sync Failed/Timeout, using Local Storage:', error);
            // 3. Fallback to Local Storage
            return getLocalExercises(userId);
        }
    },

    /**
     * Ensure the exercise has a real UUID in Supabase.
     * If the provided exerciseId is a temp/local id, this will create the exercise in Supabase
     * using the local cached data, update local cache, and return the new UUID.
     */
    ensureRemoteExercise: async (userId: string, exerciseId: string): Promise<string> => {
        // Quick UUID check
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(exerciseId)) {
            return exerciseId; // already a UUID
        }

        // Look up local exercise by id
        const localList = getLocalExercises(userId);
        const local = localList.find(e => e.id === exerciseId);
        if (!local) {
            throw new Error('No se encontró el ejercicio local para sincronizar');
        }

        // Try to find an existing remote exercise with same name/muscle group
        const { data: existing, error: findErr } = await supabase
            .from('exercises')
            .select('id, user_id, name, muscle_group, is_custom')
            .eq('user_id', userId)
            .eq('name', local.name.trim())
            .eq('muscle_group', local.muscleGroup.trim())
            .limit(1)
            .maybeSingle();

        if (!findErr && existing) {
            // Update local cache replacing temp id with existing id
            const updatedExisting = localList.map(ex =>
                ex.id === exerciseId
                    ? { ...ex, id: existing.id, userId: existing.user_id, isCustom: existing.is_custom }
                    : ex
            );
            saveLocalExercises(userId, updatedExisting);
            return existing.id as string;
        }

        // Create in Supabase immediately if not found
        const { data, error } = await supabase
            .from('exercises')
            .insert({
                user_id: userId,
                name: local.name.trim(),
                muscle_group: local.muscleGroup.trim(),
                is_custom: true
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Update local cache replacing temp id with real id
        const updated = localList.map(ex =>
            ex.id === exerciseId
                ? { ...ex, id: data.id, userId: data.user_id, isCustom: data.is_custom }
                : ex
        );
        saveLocalExercises(userId, updated);

        return data.id as string;
    },
    createExercise: async (userId: string, name: string, muscleGroup: string): Promise<Exercise | null> => {
        // 1. Optimistic Update (Local First)
        const tempId = `temp_${Date.now()}`;
        const newExercise: Exercise = {
            id: tempId,
            userId,
            name: name.trim(),
            muscleGroup: muscleGroup.trim(),
            isCustom: true
        };

        console.log('💾 createExercise (Hybrid): Saving locally...');
        const currentLocal = getLocalExercises(userId);
        saveLocalExercises(userId, [...currentLocal, newExercise]);

        // 2. Background Sync to Supabase
        // We don't await this to block the UI, but we try to update the ID if successful
        (async () => {
            try {
                console.log('☁️ Syncing creation to Supabase...');
                const { data, error } = await supabase
                    .from('exercises')
                    .insert({
                        user_id: userId,
                        name: newExercise.name,
                        muscle_group: newExercise.muscleGroup,
                        is_custom: true
                    })
                    .select()
                    .single();

                if (error) throw error;

                // Update local ID with real Supabase ID
                const updatedList = getLocalExercises(userId).map(ex =>
                    ex.id === tempId ? {
                        ...ex,
                        id: data.id, // Update ID
                        userId: data.user_id,
                        isCustom: data.is_custom
                    } : ex
                );
                saveLocalExercises(userId, updatedList);
                console.log('✅ Supabase creation synced!');

            } catch (err) {
                console.error('❌ Background sync failed:', err);
                // We keep the local version with temp ID, it will sync next fetch
            }
        })();

        return newExercise;
    },

    deleteExercise: async (exerciseId: string, userId: string): Promise<boolean> => {
        // 1. Local Delete
        console.log('🗑️ deleteExercise (Hybrid): Deleting locally...');
        const currentLocal = getLocalExercises(userId);
        const filtered = currentLocal.filter(ex => ex.id !== exerciseId);
        saveLocalExercises(userId, filtered);

        // 2. Background Sync
        (async () => {
            try {
                // If it's a temp ID, we just don't sync
                if (exerciseId.startsWith('temp_')) return;

                const { error } = await supabase
                    .from('exercises')
                    .delete()
                    .eq('id', exerciseId)
                    .eq('is_custom', true); // Security check

                if (error) throw error;
                console.log('✅ Supabase deletion synced!');
            } catch (err) {
                console.error('❌ Background delete failed:', err);
            }
        })();

        return true;
    },

    // Note: Added userId param to support local update
    updateExercise: async (exerciseId: string, userId: string, name?: string, muscleGroup?: string): Promise<Exercise | null> => {
        // 1. Local Update
        console.log('✏️ updateExercise (Hybrid): Updating locally...');
        const currentLocal = getLocalExercises(userId);
        const updatedList = currentLocal.map(ex => {
            if (ex.id === exerciseId) {
                return {
                    ...ex,
                    name: name || ex.name,
                    muscleGroup: muscleGroup || ex.muscleGroup
                };
            }
            return ex;
        });
        saveLocalExercises(userId, updatedList);

        const updatedExercise = updatedList.find(ex => ex.id === exerciseId) || null;

        // 2. Background Sync
        (async () => {
            try {
                if (exerciseId.startsWith('temp_')) return;

                const updates: any = {};
                if (name) updates.name = name.trim();
                if (muscleGroup) updates.muscle_group = muscleGroup.trim();

                const { error } = await supabase
                    .from('exercises')
                    .update(updates)
                    .eq('id', exerciseId);

                if (error) throw error;
                console.log('✅ Supabase update synced!');
            } catch (err) {
                console.error('❌ Background update failed:', err);
            }
        })();

        return updatedExercise;
    }
};
