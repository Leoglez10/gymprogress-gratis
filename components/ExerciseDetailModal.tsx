import React, { useMemo, useState } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { Exercise, Unit, WorkoutSession } from '../types';
import { formatWeight, calculateE1RM } from '../utils/calculations';

type Timeframe = 'day' | 'week' | 'month' | 'year';

interface Props {
  exercise: Exercise;
  sessions: WorkoutSession[];
  unit: Unit;
  onClose: () => void;
}

interface BucketRow {
  label: string;
  sessions: number;
  bestE1RM: number;
  avgE1RM: number;
  volume: number;
  avgRIR?: number;
  avgRPE?: number;
}

const isoWeek = (d: Date): { year: number; week: number } => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: date.getUTCFullYear(), week: weekNo };
};

const bucketKey = (d: Date, tf: Timeframe): string => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  if (tf === 'day') return `${y}-${m}-${day}`;
  if (tf === 'month') return `${y}-${m}`;
  if (tf === 'year') return `${y}`;
  const w = isoWeek(d);
  return `${w.year}-W${`${w.week}`.padStart(2, '0')}`;
};

const bucketLabel = (key: string, tf: Timeframe): string => {
  if (tf === 'day') return key;
  if (tf === 'week') return `Semana ${key.split('W')[1]} ${key.split('-')[0]}`;
  if (tf === 'month') {
    const [y, m] = key.split('-');
    return `${y}-${m}`;
  }
  return key;
};

const buildRows = (exercise: Exercise, sessions: WorkoutSession[], tf: Timeframe): BucketRow[] => {
  const buckets = new Map<string, { e1rmSum: number; e1rmBest: number; count: number; volume: number; rirSum: number; rpeSum: number; rirCount: number; rpeCount: number; sessions: Set<string> }>();

  sessions.forEach(session => {
    const entry = session.entries.find(e => e.exerciseId === exercise.id);
    if (!entry) return;

    const dateObj = new Date(session.date);
    const key = bucketKey(dateObj, tf);

    const bucket = buckets.get(key) || {
      e1rmSum: 0,
      e1rmBest: 0,
      count: 0,
      volume: 0,
      rirSum: 0,
      rpeSum: 0,
      rirCount: 0,
      rpeCount: 0,
      sessions: new Set<string>()
    };

    const workSets = entry.sets.filter(s => !s.isWarmup && s.weight > 0 && s.reps > 0);
    workSets.forEach(set => {
      const e1rm = calculateE1RM(set.weight, set.reps);
      bucket.e1rmSum += e1rm;
      bucket.e1rmBest = Math.max(bucket.e1rmBest, e1rm);
      bucket.count += 1;
      bucket.volume += set.weight * set.reps;
      if (set.rir != null) {
        bucket.rirSum += set.rir;
        bucket.rirCount += 1;
      }
      if (set.rpe != null) {
        bucket.rpeSum += set.rpe;
        bucket.rpeCount += 1;
      }
    });

    bucket.sessions.add(session.id);
    buckets.set(key, bucket);
  });

  const rows: BucketRow[] = [];
  buckets.forEach((b, key) => {
    const avgE1RM = b.count ? b.e1rmSum / b.count : 0;
    const avgRIR = b.rirCount ? b.rirSum / b.rirCount : undefined;
    const avgRPE = b.rpeCount ? b.rpeSum / b.rpeCount : undefined;
    rows.push({
      label: bucketLabel(key, tf),
      sessions: b.sessions.size,
      bestE1RM: b.e1rmBest,
      avgE1RM,
      volume: b.volume,
      avgRIR: avgRIR != null ? Math.round(avgRIR * 10) / 10 : undefined,
      avgRPE: avgRPE != null ? Math.round(avgRPE * 10) / 10 : undefined
    });
  });

  return rows.sort((a, b) => (a.label > b.label ? -1 : 1));
};

export const ExerciseDetailModal: React.FC<Props> = ({ exercise, sessions, unit, onClose }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('week');
  const [showChart, setShowChart] = useState(false);

  const rows = useMemo(() => buildRows(exercise, sessions, timeframe), [exercise, sessions, timeframe]);

  const totals = useMemo(() => {
    if (!rows.length) return { best: 0, avg: 0, vol: 0, rir: undefined as number | undefined, rpe: undefined as number | undefined };
    let best = 0;
    let sum = 0;
    let count = 0;
    let vol = 0;
    let rirSum = 0, rirCount = 0;
    let rpeSum = 0, rpeCount = 0;
    rows.forEach(r => {
      best = Math.max(best, r.bestE1RM);
      sum += r.avgE1RM;
      count += 1;
      vol += r.volume;
      if (r.avgRIR != null) { rirSum += r.avgRIR; rirCount += 1; }
      if (r.avgRPE != null) { rpeSum += r.avgRPE; rpeCount += 1; }
    });
    return {
      best,
      avg: count ? sum / count : 0,
      vol,
      rir: rirCount ? Math.round((rirSum / rirCount) * 10) / 10 : undefined,
      rpe: rpeCount ? Math.round((rpeSum / rpeCount) * 10) / 10 : undefined,
    };
  }, [rows]);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <div>
              <p className="text-xs uppercase text-slate-500">Detalle</p>
              <h2 className="text-xl font-bold text-white">{exercise.name}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowChart(true)} 
                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                title="Ver gráfica"
              >
                <TrendingUp size={20} />
              </button>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
          </div>

        <div className="px-5 py-3 flex flex-wrap gap-2">
          {(['day','week','month','year'] as Timeframe[]).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${timeframe === tf ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'}`}
            >
              {tf === 'day' && 'Diario'}
              {tf === 'week' && 'Semanal'}
              {tf === 'month' && 'Mensual'}
              {tf === 'year' && 'Anual'}
            </button>
          ))}
        </div>

        <div className="px-5 pb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Mejor e1RM" value={`${formatWeight(totals.best, unit, 0)} ${unit}`} />
          <StatCard label="e1RM promedio" value={`${formatWeight(totals.avg, unit, 0)} ${unit}`} />
          <StatCard label="Volumen" value={`${formatWeight(totals.vol, unit, 0)} ${unit}`} hint="suma peso*reps" />
          <StatCard label="RIR prom" value={totals.rir != null ? totals.rir.toString() : '-'} secondary={`RPE prom ${totals.rpe ?? '-'}`} />
        </div>

        <div className="px-5 pb-5 overflow-auto">
          <table className="w-full text-sm text-slate-200">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800">
                <th className="py-2 text-left">Periodo</th>
                <th className="py-2 text-left">Sesiones</th>
                <th className="py-2 text-left">Mejor e1RM</th>
                <th className="py-2 text-left">e1RM prom</th>
                <th className="py-2 text-left">Volumen</th>
                <th className="py-2 text-left">RIR prom</th>
                <th className="py-2 text-left">RPE prom</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">Sin datos para este ejercicio.</td>
                </tr>
              )}
              {rows.map(row => (
                <tr key={row.label} className="border-b border-slate-800/60">
                  <td className="py-2 font-semibold">{row.label}</td>
                  <td className="py-2">{row.sessions}</td>
                  <td className="py-2">{formatWeight(row.bestE1RM, unit, 0)} {unit}</td>
                  <td className="py-2">{formatWeight(row.avgE1RM, unit, 0)} {unit}</td>
                  <td className="py-2">{formatWeight(row.volume, unit, 0)} {unit}</td>
                  <td className="py-2">{row.avgRIR != null ? row.avgRIR : '-'}</td>
                  <td className="py-2">{row.avgRPE != null ? row.avgRPE : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Chart Modal */}
    {showChart && (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-auto shadow-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
            <div>
              <p className="text-xs uppercase text-slate-500">Gráfica de Progreso</p>
              <h2 className="text-xl font-bold text-white">{exercise.name}</h2>
            </div>
            <button onClick={() => setShowChart(false)} className="p-2 text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6">
            {/* Chart Container */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-4">
              <div className="h-80 flex items-center justify-center">
                <svg viewBox="0 0 800 300" className="w-full h-full">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map(i => (
                    <line
                      key={`grid-${i}`}
                      x1="60"
                      y1={60 + i * 50}
                      x2="760"
                      y2={60 + i * 50}
                      stroke="#334155"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  ))}
                  
                  {/* Y-axis labels */}
                  {[0, 1, 2, 3, 4].map(i => {
                    const value = totals.best - (i * totals.best / 4);
                    return (
                      <text
                        key={`label-${i}`}
                        x="50"
                        y={65 + i * 50}
                        fill="#94a3b8"
                        fontSize="12"
                        textAnchor="end"
                      >
                        {formatWeight(value, unit, 0)}
                      </text>
                    );
                  })}
                  
                  {/* Line chart */}
                  {rows.length > 1 && (() => {
                    const maxE1RM = totals.best || 1;
                    const points = rows.reverse().map((row, idx) => {
                      const x = 60 + (idx / (rows.length - 1)) * 700;
                      const y = 260 - ((row.bestE1RM / maxE1RM) * 200);
                      return { x, y, label: row.label, value: row.bestE1RM };
                    });
                    
                    const pathData = points.map((p, i) => 
                      `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
                    ).join(' ');
                    
                    return (
                      <>
                        {/* Line */}
                        <path
                          d={pathData}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        
                        {/* Area under line */}
                        <path
                          d={`${pathData} L ${points[points.length - 1].x} 260 L 60 260 Z`}
                          fill="url(#gradient)"
                          opacity="0.3"
                        />
                        
                        {/* Data points */}
                        {points.map((p, i) => (
                          <g key={i}>
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="5"
                              fill="#3b82f6"
                              stroke="#1e293b"
                              strokeWidth="2"
                            />
                            {/* X-axis labels */}
                            <text
                              x={p.x}
                              y="285"
                              fill="#94a3b8"
                              fontSize="10"
                              textAnchor="middle"
                            >
                              {p.label.length > 8 ? p.label.substring(0, 8) : p.label}
                            </text>
                          </g>
                        ))}
                        
                        {/* Gradient definition */}
                        <defs>
                          <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </>
                    );
                  })()}
                  
                  {rows.length <= 1 && (
                    <text x="400" y="150" fill="#64748b" fontSize="16" textAnchor="middle">
                      Necesitas al menos 2 periodos para mostrar la gráfica
                    </text>
                  )}
                  
                  {/* Axes */}
                  <line x1="60" y1="260" x2="760" y2="260" stroke="#475569" strokeWidth="2" />
                  <line x1="60" y1="60" x2="60" y2="260" stroke="#475569" strokeWidth="2" />
                </svg>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Mejor e1RM por periodo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

interface StatProps {
  label: string;
  value: string;
  secondary?: string;
  hint?: string;
}

const StatCard: React.FC<StatProps> = ({ label, value, secondary, hint }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
    <div className="text-xs uppercase text-slate-500">{label}</div>
    <div className="text-xl font-bold text-white leading-tight">{value}</div>
    {secondary && <div className="text-xs text-slate-400 mt-0.5">{secondary}</div>}
    {hint && <div className="text-[11px] text-slate-500 mt-1">{hint}</div>}
  </div>
);
