import React, { useMemo, useState } from 'react';
import { Calculator, TrendingUp, ArrowLeft } from 'lucide-react';
import { Unit } from '../types';
import { calculateE1RM, formatWeight, rpeFromRir, rirFromRpe, estimateMaxRepsAtWeight } from '../utils/calculations';

interface Props {
  onBack: () => void;
  unit?: Unit;
}

export const CalculatorView: React.FC<Props> = ({ onBack, unit = 'kg' }) => {
  // Quick Estimator State
  const [estWeight, setEstWeight] = useState<string>('');
  const [estReps, setEstReps] = useState<string>('');
  const [estRir, setEstRir] = useState<string>('');
  const [estRpe, setEstRpe] = useState<string>('');

  const results = useMemo(() => {
    const w = parseFloat(estWeight) || 0;
    const reps = parseInt(estReps) || 0;
    const rir = estRir === '' ? undefined : Math.max(0, Math.min(10, parseInt(estRir)));
    const rpe = estRpe === '' ? undefined : Math.max(1, Math.min(10, parseFloat(estRpe)));

    // Convert display weight to KG for calculations
    const weightKg = unit === 'kg' ? w : w / 2.20462;
    const e1rm = reps > 0 ? calculateE1RM(weightKg, reps) : 0;

    // Prefer provided RIR, else derive from RPE if provided
    const normalizedRir = rir != null ? rir : (rpe != null ? rirFromRpe(rpe) : NaN);
    const normalizedRpe = rpe != null ? rpe : (rir != null ? rpeFromRir(rir) : NaN);

    // If we have e1RM context, estimate max reps at weight
    const maxReps = e1rm > 0 && weightKg > 0 ? estimateMaxRepsAtWeight(weightKg, e1rm) : 0;
    const estRepsAtRir = isNaN(normalizedRir as any) ? 0 : Math.max(0, Math.floor(maxReps - (normalizedRir || 0)));

    return {
      e1rmDisplay: e1rm > 0 ? `${formatWeight(e1rm, unit, 0)} ${unit}` : '0',
      normalizedRir: isNaN(normalizedRir as any) ? undefined : Math.round((normalizedRir as number) * 10) / 10,
      normalizedRpe: isNaN(normalizedRpe as any) ? undefined : Math.round((normalizedRpe as number) * 10) / 10,
      maxReps,
      estRepsAtRir,
    };
  }, [estWeight, estReps, estRir, estRpe, unit]);

  return (
    <div className="pb-24 pt-6 px-4 max-w-2xl mx-auto w-full">
      <header className="flex items-center space-x-4 mb-6">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white md:hidden">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-white">Calculadora e1RM</h1>
      </header>

      {/* Quick e1RM Calculator */}
      <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <Calculator className="text-blue-500" size={24} />
          <h3 className="text-lg font-semibold text-white">Estimador Rápido de e1RM</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Peso ({unit})</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={estWeight}
              onChange={e => setEstWeight(e.target.value)}
              placeholder={unit === 'kg' ? '80' : '176'}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Reps</label>
            <input
              type="number"
              min="1"
              max="30"
              value={estReps}
              onChange={e => setEstReps(e.target.value)}
              placeholder="5"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">RIR (0-10) — Opcional</label>
            <input
              type="number"
              min="0"
              max="10"
              value={estRir}
              onChange={e => setEstRir(e.target.value)}
              placeholder="2"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">RPE (1-10) — Opcional</label>
            <input
              type="number"
              min="1"
              max="10"
              step="0.5"
              value={estRpe}
              onChange={e => setEstRpe(e.target.value)}
              placeholder="8"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Results */}
        <div className="mt-6 pt-4 border-t border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp size={18} className="text-blue-400" />
              <p className="text-sm font-medium text-blue-400">e1RM Estimado</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {results.e1rmDisplay !== '0' ? results.e1rmDisplay : '—'}
            </p>
          </div>
          <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-2">RIR/RPE Normalizado</p>
            <p className="text-xl font-semibold text-white">
              {results.normalizedRir != null ? `RIR ${results.normalizedRir}` : '—'}
              {results.normalizedRpe != null && results.normalizedRir != null ? ' / ' : ''}
              {results.normalizedRpe != null ? `RPE ${results.normalizedRpe}` : ''}
            </p>
          </div>
          {results.maxReps > 0 && (
            <>
              <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-2">Máx. Reps al Fallo</p>
                <p className="text-xl font-semibold text-white">{Math.round(results.maxReps)} reps</p>
              </div>
              {results.normalizedRir != null && (
                <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2">Reps Estimadas (con RIR)</p>
                  <p className="text-xl font-semibold text-white">{results.estRepsAtRir} reps</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};
