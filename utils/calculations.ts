import { SetEntry, WorkoutSession, ExerciseStats, Exercise, Unit } from '../types';

export const KG_TO_LB = 2.20462;

export const convertWeight = (weightInKg: number, targetUnit: Unit): number => {
  if (targetUnit === 'kg') return weightInKg;
  return weightInKg * KG_TO_LB;
};

// Added precision parameter. Default is 0 (integer) for clean charts, but Logger can request more.
export const formatWeight = (weightInKg: number, targetUnit: Unit, precision: number = 0): number => {
  const val = convertWeight(weightInKg, targetUnit);
  const factor = Math.pow(10, precision);
  return Math.round(val * factor) / factor;
};

// Epley Formula: Weight * (1 + Reps / 30)
export const calculateE1RM = (weight: number, reps: number): number => {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
};

// Inverse Epley: reps = 30 * (e1RM/weight - 1)
export const estimateMaxRepsAtWeight = (weight: number, e1rm: number): number => {
  if (weight <= 0 || e1rm <= 0) return 0;
  const reps = 30 * (e1rm / weight - 1);
  return Math.max(0, Math.floor(reps));
};

// Simple RPE/RIR mapping commonly used: RPE = 10 - RIR
export const rpeFromRir = (rir: number): number => {
  if (rir == null || isNaN(rir as any)) return NaN;
  return Math.max(1, Math.min(10, 10 - rir));
};

export const rirFromRpe = (rpe: number): number => {
  if (rpe == null || isNaN(rpe as any)) return NaN;
  return Math.max(0, Math.min(10, 10 - rpe));
};

// Estimate RIR for a set given an e1RM context
export const estimateRirFromSet = (weight: number, reps: number, e1rm: number): number => {
  const maxReps = estimateMaxRepsAtWeight(weight, e1rm);
  return Math.max(0, maxReps - reps);
};

// Estimate achievable reps at given RIR (using e1RM as context)
export const estimateRepsFromRir = (weight: number, e1rm: number, rir: number): number => {
  const maxReps = estimateMaxRepsAtWeight(weight, e1rm);
  return Math.max(0, Math.floor(maxReps - (rir || 0)));
};

export const getSessionMaxE1RM = (sets: SetEntry[]): number => {
  let max = 0;
  sets.forEach(set => {
    // Filter out warmups or invalid data
    if (!set.isWarmup && set.weight > 0 && set.reps > 0) {
      const e1rm = calculateE1RM(set.weight, set.reps);
      if (e1rm > max) max = e1rm;
    }
  });
  return max;
};

export const calculateExerciseStats = (
  exercise: Exercise,
  allSessions: WorkoutSession[],
  unit: Unit // Add unit to calculation context
): ExerciseStats => {
  // 1. Extract all sessions that contain this exercise
  const relevantSessions = allSessions
    .map(session => {
      const entry = session.entries.find(e => e.exerciseId === exercise.id);
      if (!entry) return null;
      return {
        date: session.date,
        maxE1RM: getSessionMaxE1RM(entry.sets), // Calculated in KG
      };
    })
    .filter((s): s is { date: string; maxE1RM: number } => s !== null && s.maxE1RM > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest first

  // If no history
  if (relevantSessions.length === 0) {
    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      lastSessionDate: null,
      currentE1RM: 0,
      previousAvgE1RM: 0,
      trendPercent: 0,
      status: 'new',
      history: [],
      avgRIR: undefined,
      avgRPE: undefined,
    };
  }

  const current = relevantSessions[0];
  
  // Create history points converted to requested unit (Integer precision for charts)
  const historyForChart = relevantSessions.slice().reverse().map(s => ({
    date: new Date(s.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }),
    e1rm: formatWeight(s.maxE1RM, unit, 0)
  }));

  // Logic: Compare current (index 0) vs Avg of previous 2 (index 1 and 2)
  let prevAvg = 0;
  let comparisonCount = 0;

  if (relevantSessions.length > 1) {
    prevAvg += relevantSessions[1].maxE1RM;
    comparisonCount++;
  }
  if (relevantSessions.length > 2) {
    prevAvg += relevantSessions[2].maxE1RM;
    comparisonCount++;
  }

  if (comparisonCount > 0) {
    prevAvg = prevAvg / comparisonCount;
  } else {
    prevAvg = current.maxE1RM;
  }

  const trendRaw = prevAvg > 0 ? ((current.maxE1RM - prevAvg) / prevAvg) * 100 : 0;
  const trendPercent = Math.round(trendRaw * 10) / 10;

  let status: ExerciseStats['status'] = 'maintaining';
  if (trendPercent >= 2) status = 'improving';
  else if (trendPercent <= -2) status = 'declining';

  // Compute average RIR/RPE for the most recent session of this exercise
  const latestSession = allSessions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .find(s => s.entries.some(e => e.exerciseId === exercise.id));

  let avgRIR: number | undefined = undefined;
  let avgRPE: number | undefined = undefined;
  if (latestSession) {
    const entry = latestSession.entries.find(e => e.exerciseId === exercise.id)!;
    const workSets = entry.sets.filter(s => !s.isWarmup && s.reps > 0 && s.weight > 0);
    if (workSets.length) {
      const rirVals = workSets.map(s => (s.rir != null ? s.rir : (s.rpe != null ? Math.max(0, Math.min(10, 10 - s.rpe)) : undefined))).filter((v): v is number => v != null);
      const rpeVals = workSets.map(s => (s.rpe != null ? s.rpe : (s.rir != null ? Math.max(1, Math.min(10, 10 - s.rir)) : undefined))).filter((v): v is number => v != null);
      if (rirVals.length) avgRIR = Math.round((rirVals.reduce((a, b) => a + b, 0) / rirVals.length) * 10) / 10;
      if (rpeVals.length) avgRPE = Math.round((rpeVals.reduce((a, b) => a + b, 0) / rpeVals.length) * 10) / 10;
    }
  }

  return {
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    lastSessionDate: current.date,
    currentE1RM: formatWeight(current.maxE1RM, unit, 0), // Integer for e1RM
    previousAvgE1RM: formatWeight(prevAvg, unit, 0),
    trendPercent,
    status,
    history: historyForChart,
    avgRIR,
    avgRPE,
  };
};