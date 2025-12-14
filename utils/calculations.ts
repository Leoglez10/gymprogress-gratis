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

  return {
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    lastSessionDate: current.date,
    currentE1RM: formatWeight(current.maxE1RM, unit, 0), // Integer for e1RM
    previousAvgE1RM: formatWeight(prevAvg, unit, 0),
    trendPercent,
    status,
    history: historyForChart,
  };
};