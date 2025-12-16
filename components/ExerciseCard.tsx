import React from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { ExerciseStats, Unit } from '../types';
import { TrendBadge } from './TrendBadge';

interface Props {
  stats: ExerciseStats;
  unit?: Unit;
  onClick?: () => void;
}

export const ExerciseCard: React.FC<Props> = ({ stats, unit = 'kg', onClick }) => {
  // Determine chart color based on status
  const chartColor = stats.status === 'improving' ? '#22c55e' : stats.status === 'declining' ? '#ef4444' : '#3b82f6';

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-slate-800 rounded-xl p-4 mb-4 border border-slate-700 shadow-sm relative overflow-hidden hover:border-blue-500/60 transition-colors"
    >
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div>
          <h3 className="font-bold text-lg text-slate-100">{stats.exerciseName}</h3>
          <p className="text-xs text-slate-400">
            {stats.lastSessionDate ? `Última sesión: ${new Date(stats.lastSessionDate).toLocaleDateString()}` : 'Sin registros'}
          </p>
        </div>
        <TrendBadge status={stats.status} percent={stats.trendPercent} />
      </div>

      <div className="flex items-end justify-between relative z-10">
        <div>
          <span className="text-3xl font-bold tracking-tight text-white">{stats.currentE1RM}</span>
          <span className="text-sm text-slate-400 ml-1">{unit} (e1RM)</span>
          {(stats.avgRIR != null || stats.avgRPE != null) && (
            <div className="text-[11px] text-slate-400 mt-1">
              {stats.avgRIR != null && <span>RIR prom: <span className="text-slate-200">{stats.avgRIR}</span></span>}
              {stats.avgRIR != null && stats.avgRPE != null && <span className="mx-2">•</span>}
              {stats.avgRPE != null && <span>RPE prom: <span className="text-slate-200">{stats.avgRPE}</span></span>}
            </div>
          )}
        </div>
      </div>

      {/* Sparkline Chart */}
      {stats.history.length > 1 && (
        <div className="absolute bottom-0 right-0 w-1/2 h-16 opacity-30 z-0 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.history}>
              <defs>
                <linearGradient id={`colorGradient-${stats.exerciseId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
              <Area 
                type="monotone" 
                dataKey="e1rm" 
                stroke={chartColor} 
                strokeWidth={2}
                fillOpacity={1} 
                fill={`url(#colorGradient-${stats.exerciseId})`} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </button>
  );
};