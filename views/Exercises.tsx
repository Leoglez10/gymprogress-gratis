import React, { useState } from 'react';
import { store } from '../services/store';
import { Plus } from 'lucide-react';

export const ExercisesView: React.FC = () => {
  const [exercises, setExercises] = useState(store.getExercises());
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newGroup) {
      store.addExercise(newName, newGroup);
      setExercises(store.getExercises());
      setIsAdding(false);
      setNewName('');
      setNewGroup('');
    }
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-2xl mx-auto w-full">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Ejercicios</h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-slate-700 p-2 rounded-full text-slate-300 hover:bg-slate-600"
        >
          <Plus size={20} />
        </button>
      </header>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6 animate-in slide-in-from-top-2 fade-in">
          <h3 className="font-bold mb-3 text-white">Nuevo Ejercicio</h3>
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Nombre (ej. Curl de Bíceps)" 
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
              required
            />
             <input 
              type="text" 
              placeholder="Grupo Muscular (ej. Brazo)" 
              value={newGroup}
              onChange={e => setNewGroup(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
              required
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1 text-slate-400">Cancelar</button>
              <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded font-medium">Guardar</button>
            </div>
          </div>
        </form>
      )}

      <div className="grid gap-3">
        {exercises.map(ex => (
          <div key={ex.id} className="bg-slate-800 p-4 rounded-lg flex justify-between items-center border border-slate-700/50">
            <div>
              <h3 className="font-medium text-slate-200">{ex.name}</h3>
              <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">{ex.muscleGroup}</p>
            </div>
            {ex.isCustom && <span className="text-[10px] bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded">Propio</span>}
          </div>
        ))}
      </div>
    </div>
  );
};
