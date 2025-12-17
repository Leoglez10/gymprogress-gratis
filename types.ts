export type Unit = 'kg' | 'lb';

export interface UserProfile {
  id: string;
  name: string;
  email?: string; // Added for Auth
  password?: string; // Added for Auth simulation (stored locally)
  alias?: string;
  weightUnit: Unit;
}

export interface Exercise {
  id: string;
  userId?: string; // For Supabase user association
  name: string;
  muscleGroup: string;
  isCustom: boolean; // false = seed, true = created by user
}

export interface SetEntry {
  id: string;
  weight: number;
  reps: number;
  rpe?: number;
  rir?: number;
  isWarmup: boolean;
}

export interface WorkoutEntry {
  id: string;
  exerciseId: string;
  sets: SetEntry[];
  variant?: string; // e.g., "Incline", "Dumbbell"
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO String
  entries: WorkoutEntry[];
  note?: string;
}

// Analytics Types
export interface ExerciseStats {
  exerciseId: string;
  exerciseName: string;
  lastSessionDate: string | null;
  currentE1RM: number; // Estimated 1 Rep Max
  previousAvgE1RM: number; // Average of previous 2 sessions
  trendPercent: number;
  status: 'improving' | 'maintaining' | 'declining' | 'new';
  history: { date: string; e1rm: number }[];
  avgRIR?: number; // Average RIR of last session
  avgRPE?: number; // Average RPE of last session
}