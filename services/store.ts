import { Exercise, WorkoutSession, UserProfile } from '../types';

// Seed Data
const DEFAULT_EXERCISES: Exercise[] = [
  { id: 'ex_1', name: 'Press de Banca', muscleGroup: 'Pecho', isCustom: false },
  { id: 'ex_2', name: 'Sentadilla (Squat)', muscleGroup: 'Pierna', isCustom: false },
  { id: 'ex_3', name: 'Peso Muerto', muscleGroup: 'Espalda/Pierna', isCustom: false },
  { id: 'ex_4', name: 'Press Militar', muscleGroup: 'Hombro', isCustom: false },
  { id: 'ex_5', name: 'Dominadas', muscleGroup: 'Espalda', isCustom: false },
];

const DEFAULT_PROFILE: UserProfile = {
  id: 'user_1',
  name: 'Usuario Demo',
  alias: 'JP',
  weightUnit: 'kg',
};

// LocalStorage Keys
const KEYS = {
  EXERCISES: 'gp_exercises',
  SESSIONS: 'gp_sessions',
  PROFILE: 'gp_profile_v2', // Bumped version to avoid conflict with old structure
};

export const store = {
  getProfile: (): UserProfile => {
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : DEFAULT_PROFILE;
  },

  updateProfile: (profile: UserProfile) => {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  getExercises: (): Exercise[] => {
    const data = localStorage.getItem(KEYS.EXERCISES);
    return data ? JSON.parse(data) : DEFAULT_EXERCISES;
  },

  addExercise: (name: string, muscleGroup: string): Exercise => {
    const exercises = store.getExercises();
    const newEx: Exercise = {
      id: `ex_${Date.now()}`,
      name,
      muscleGroup,
      isCustom: true,
    };
    exercises.push(newEx);
    localStorage.setItem(KEYS.EXERCISES, JSON.stringify(exercises));
    return newEx;
  },

  getSessions: (): WorkoutSession[] => {
    const data = localStorage.getItem(KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  },

  saveSession: (session: WorkoutSession) => {
    const sessions = store.getSessions();
    sessions.push(session);
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
  },

  // Helper to get previous stats for logging UI
  getLastSetForExercise: (exerciseId: string): { weight: number; reps: number } | null => {
    const sessions = store.getSessions();
    // Sort newest first
    sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (const session of sessions) {
      const entry = session.entries.find(e => e.exerciseId === exerciseId);
      if (entry && entry.sets.length > 0) {
        // Return the last set of that session (usually the heaviest or final working set)
        const lastSet = entry.sets[entry.sets.length - 1];
        return { weight: lastSet.weight, reps: lastSet.reps };
      }
    }
    return null;
  },
  
  // Debug function to clear data
  clearData: () => {
    localStorage.clear();
    window.location.reload();
  }
};