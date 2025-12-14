import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2, StickyNote, RefreshCw, PlusCircle, X } from 'lucide-react';
import { store } from '../services/store';
import { Exercise, WorkoutSession, WorkoutEntry, SetEntry, Unit } from '../types';
import { convertWeight, formatWeight, KG_TO_LB } from '../utils/calculations';

interface Props {
  onCancel: () => void;
  onFinish: () => void;
  unit: Unit;
  onToggleUnit: (u: Unit) => void;
}

export const WorkoutLogger: React.FC<Props> = ({ onCancel, onFinish, unit, onToggleUnit }) => {
  const [exercises, setExercises] = useState<Exercise[]>(store.getExercises());
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [sessionEntries, setSessionEntries] = useState<WorkoutEntry[]>([]);
  const [sessionNote, setSessionNote] = useState<string>('');
  const [showNoteInput, setShowNoteInput] = useState<boolean>(false);
  
  // Create New Exercise State
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseGroup, setNewExerciseGroup] = useState('');
  
  // Set Input State
  const [currentWeight, setCurrentWeight] = useState<string>('');
  const [currentReps, setCurrentReps] = useState<string>('');

  // When selecting an exercise, try to autofill from history
  useEffect(() => {
    if (activeExerciseId) {
      const last = store.getLastSetForExercise(activeExerciseId);
      if (last) {
        // last.weight is in KG. Convert if user is in LB.
        // Use precision 1 to avoid rounding errors (e.g. 12.5 lbs becoming 13)
        const displayWeight = formatWeight(last.weight, unit, 1);
        setCurrentWeight(displayWeight.toString());
        setCurrentReps(last.reps.toString());
      } else {
        setCurrentWeight('');
        setCurrentReps('');
      }
    }
  }, [activeExerciseId]); // Remove 'unit' from dependency to handle manual toggle logic separately

  // Handle manual unit toggle to convert active input
  const handleUnitToggle = () => {
    const newUnit = unit === 'kg' ? 'lb' : 'kg';
    
    // Convert currently typed weight if it's a valid number
    if (currentWeight) {
        const val = parseFloat(currentWeight);
        if (!isNaN(val)) {
            let newVal = 0;
            if (unit === 'kg') {
                // KG -> LB
                newVal = val * KG_TO_LB;
            } else {
                // LB -> KG
                newVal = val / KG_TO_LB;
            }
            // Update input with 1 decimal precision
            setCurrentWeight(Number.isInteger(newVal) ? newVal.toString() : newVal.toFixed(1));
        }
    }
    
    onToggleUnit(newUnit);
  };

  const handleCreateExercise = () => {
    if (newExerciseName.trim() && newExerciseGroup.trim()) {
      const newEx = store.addExercise(newExerciseName, newExerciseGroup);
      setExercises(store.getExercises()); // Reload list
      setActiveExerciseId(newEx.id); // Auto-select
      setIsCreatingExercise(false);
      setNewExerciseName('');
      setNewExerciseGroup('');
    }
  };

  const handleAddEntry = (exId: string) => {
    const existingEntry = sessionEntries.find(e => e.exerciseId === exId);
    if (!existingEntry) {
      const newEntry: WorkoutEntry = {
        id: `entry_${Date.now()}`,
        exerciseId: exId,
        sets: []
      };
      setSessionEntries([...sessionEntries, newEntry]);
    }
    setActiveExerciseId(exId);
  };

  const handleAddSet = () => {
    if (!activeExerciseId || !currentWeight || !currentReps) return;
    
    // Logic: Input is in User Unit. Storage is always in KG.
    const inputWeight = parseFloat(currentWeight);
    const weightToStore = unit === 'kg' ? inputWeight : inputWeight / KG_TO_LB;

    setSessionEntries(prev => prev.map(entry => {
      if (entry.exerciseId === activeExerciseId) {
        const newSet: SetEntry = {
          id: `set_${Date.now()}`,
          weight: weightToStore, // Save as KG
          reps: parseInt(currentReps),
          isWarmup: false
        };
        return { ...entry, sets: [...entry.sets, newSet] };
      }
      return entry;
    }));
  };

  const removeSet = (entryId: string, setId: string) => {
    setSessionEntries(prev => prev.map(entry => {
      if (entry.id === entryId) {
        return { ...entry, sets: entry.sets.filter(s => s.id !== setId) };
      }
      return entry;
    }));
  };

  const handleFinish = () => {
    // Filter out empty entries
    const validEntries = sessionEntries.filter(e => e.sets.length > 0);
    
    if (validEntries.length === 0) {
      onCancel();
      return;
    }

    const newSession: WorkoutSession = {
      id: `session_${Date.now()}`,
      date: new Date().toISOString(),
      entries: validEntries,
      note: sessionNote
    };

    store.saveSession(newSession);
    onFinish();
  };

  const activeEntry = sessionEntries.find(e => e.exerciseId === activeExerciseId);
  const activeExercise = exercises.find(e => e.id === activeExerciseId);

  // Quick Math Helpers
  const adjustWeight = (delta: number) => {
    const w = parseFloat(currentWeight) || 0;
    // Round to 2 decimals to avoid floating point weirdness (e.g. 2.50000001)
    const newVal = Math.round((w + delta) * 100) / 100;
    setCurrentWeight(newVal.toString());
  };

  // Adjust increments based on unit
  const smallInc = unit === 'kg' ? 2.5 : 5;
  const largeInc = unit === 'kg' ? 5 : 10;

  return (
    <div className="flex flex-col h-screen bg-slate-900 pb-0 md:pb-0">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
             <button onClick={onCancel} className="p-2 -ml-2 text-slate-400 hover:text-white mr-2">
                <ArrowLeft />
             </button>
             <h2 className="font-bold text-lg hidden xs:block">Registrar</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Unit Toggle Badge */}
            <button 
                onClick={handleUnitToggle}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors border border-slate-600"
                title="Cambiar Unidad"
            >
                <RefreshCw size={12} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-200 w-4 text-center">{unit.toUpperCase()}</span>
            </button>

            <button 
              onClick={() => setShowNoteInput(!showNoteInput)}
              className={`p-2 rounded-full transition-colors ${showNoteInput ? 'text-blue-400 bg-blue-900/30' : 'text-slate-400 hover:text-white'}`}
              title="Añadir Nota"
            >
              <StickyNote size={20} />
            </button>
            <button 
              onClick={handleFinish} 
              disabled={sessionEntries.length === 0}
              className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Fin
            </button>
          </div>
        </div>
        
        {/* Expanding Note Input */}
        {showNoteInput && (
          <div className="px-4 pb-4 animate-in slide-in-from-top-1 fade-in duration-200">
            <textarea
              value={sessionNote}
              onChange={(e) => setSessionNote(e.target.value)}
              placeholder="Notas generales de la sesión (ej. Me sentí cansado, buen pump...)"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              rows={2}
              autoFocus
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        
        {/* Exercise Selector (Left/Top) */}
        <div className={`flex-1 overflow-y-auto p-4 ${activeExerciseId ? 'hidden md:block md:w-1/3 md:border-r md:border-slate-700' : 'block'}`}>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Selecciona Ejercicio</h3>
          
          {/* Create New Exercise Inline */}
          {!isCreatingExercise ? (
             <button 
               onClick={() => setIsCreatingExercise(true)}
               className="w-full py-3 px-4 mb-4 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-blue-500 hover:bg-slate-800 transition-all flex items-center justify-center text-sm font-bold"
             >
                <PlusCircle size={16} className="mr-2" />
                Crear Nuevo Ejercicio
             </button>
          ) : (
             <div className="bg-slate-800 p-3 rounded-lg border border-slate-600 mb-4 animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-white uppercase">Nuevo Ejercicio</span>
                    <button onClick={() => setIsCreatingExercise(false)}><X size={16} className="text-slate-400 hover:text-white"/></button>
                </div>
                <input 
                    autoFocus
                    placeholder="Nombre (ej. Prensa)"
                    value={newExerciseName}
                    onChange={e => setNewExerciseName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white mb-2 focus:border-blue-500 outline-none"
                />
                <input 
                    placeholder="Grupo Muscular (ej. Pierna)"
                    value={newExerciseGroup}
                    onChange={e => setNewExerciseGroup(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white mb-3 focus:border-blue-500 outline-none"
                />
                <button 
                    onClick={handleCreateExercise}
                    disabled={!newExerciseName || !newExerciseGroup}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded disabled:opacity-50"
                >
                    Guardar y Usar
                </button>
             </div>
          )}

          <div className="space-y-2">
            {exercises.map(ex => {
              const hasData = sessionEntries.find(e => e.exerciseId === ex.id)?.sets.length || 0;
              return (
                <button
                  key={ex.id}
                  onClick={() => handleAddEntry(ex.id)}
                  className={`w-full text-left p-3 rounded-lg flex justify-between items-center transition-colors ${
                    activeExerciseId === ex.id 
                      ? 'bg-blue-900/30 border border-blue-600/50 text-blue-200' 
                      : 'bg-slate-800 hover:bg-slate-750 border border-slate-700'
                  }`}
                >
                  <span>{ex.name}</span>
                  {hasData > 0 && (
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full flex items-center">
                       {hasData} sets <CheckCircle2 size={10} className="ml-1" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Entry Logger (Right/Main) */}
        {activeExerciseId && activeExercise && (
          <div className="flex-1 flex flex-col h-full bg-slate-900 md:w-2/3">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center md:hidden">
                <h3 className="font-bold text-xl">{activeExercise.name}</h3>
                <button onClick={() => setActiveExerciseId(null)} className="text-sm text-blue-400">Cambiar</button>
            </div>
             <div className="p-4 border-b border-slate-800 hidden md:flex justify-between items-center">
                <h3 className="font-bold text-xl">{activeExercise.name}</h3>
            </div>

            {/* Set List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <table className="w-full text-sm text-slate-300">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-700 text-left">
                    <th className="pb-2 pl-2">Set</th>
                    <th className="pb-2">{unit}</th>
                    <th className="pb-2">Reps</th>
                    <th className="pb-2">e1RM</th>
                    <th className="pb-2 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {activeEntry?.sets.map((set, idx) => {
                    // Display stored kg in selected unit
                    // Use precision 1 for Table to show 12.5 correctly
                    const displayWeight = formatWeight(set.weight, unit, 1);
                    const e1rm = Math.round(set.weight * (1 + set.reps/30));
                    const displayE1RM = formatWeight(e1rm, unit, 0); // Keep e1RM as integer
                    
                    return (
                      <tr key={set.id} className="border-b border-slate-800/50">
                        <td className="py-3 pl-2 text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-3 font-bold text-white">{displayWeight}</td>
                        <td className="py-3">{set.reps}</td>
                        <td className="py-3 text-slate-500">{displayE1RM}</td>
                        <td className="py-3 text-right">
                          <button onClick={() => removeSet(activeEntry.id, set.id)} className="text-red-400 p-1">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {(!activeEntry?.sets.length) && (
                      <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                              Agrega series usando los controles de abajo
                          </td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Controls */}
            <div className="p-4 bg-slate-800 border-t border-slate-700">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Peso ({unit})</label>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => adjustWeight(-smallInc)} className="p-2 bg-slate-700 rounded-md text-slate-300">-</button>
                    <input 
                      type="number" 
                      value={currentWeight} 
                      onChange={(e) => setCurrentWeight(e.target.value)}
                      placeholder="0"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-md p-2 text-center font-mono text-lg text-white"
                      inputMode="decimal"
                    />
                     <button onClick={() => adjustWeight(smallInc)} className="p-2 bg-slate-700 rounded-md text-slate-300">+</button>
                  </div>
                   <div className="flex justify-center mt-2 space-x-2">
                       <button onClick={() => adjustWeight(smallInc)} className="text-[10px] bg-slate-700 px-2 py-1 rounded text-blue-200">+{smallInc}</button>
                       <button onClick={() => adjustWeight(largeInc)} className="text-[10px] bg-slate-700 px-2 py-1 rounded text-blue-200">+{largeInc}</button>
                   </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Reps</label>
                  <input 
                    type="number" 
                    value={currentReps} 
                    onChange={(e) => setCurrentReps(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-center font-mono text-lg text-white"
                    inputMode="numeric"
                  />
                </div>
              </div>
              <button 
                onClick={handleAddSet}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Agregar Serie
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};