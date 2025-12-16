import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Trash2, Pencil, Check, X } from 'lucide-react';
import { exerciseService } from '../services/exerciseService';
import { Exercise, UserProfile } from '../types';

interface ExercisesViewProps {
  currentUser: UserProfile;
}

export const ExercisesView: React.FC<ExercisesViewProps> = ({ currentUser }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editGroup, setEditGroup] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load exercises on mount
  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    console.log('🔄 loadExercises: START with user:', currentUser.id);
    try {
      setLoading(true);
      setError(null);

      console.log('📡 loadExercises: Fetching exercises...');
      const fetchedExercises = await exerciseService.fetchExercises(currentUser.id);
      console.log('✅ loadExercises: Fetched exercises:', fetchedExercises);

      setExercises(fetchedExercises);
    } catch (err) {
      console.error('❌ loadExercises: Error:', err);
      setError('Error al cargar los ejercicios');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ex: Exercise) => {
    if (!ex.isCustom && !ex.id.startsWith('temp_')) return; // Protect seeded exercises
    if (!confirm(`¿Eliminar ${ex.name}?`)) return;
    try {
      setDeletingId(ex.id);
      await exerciseService.deleteExercise(ex.id, currentUser.id);
      setExercises(prev => prev.filter(e => e.id !== ex.id));
    } catch (err: any) {
      console.error('Error deleting exercise:', err);
      setError(err.message || 'Error al borrar el ejercicio');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditStart = (ex: Exercise) => {
    if (!ex.isCustom && !ex.id.startsWith('temp_')) return; // protect seeds
    setEditingId(ex.id);
    setEditName(ex.name);
    setEditGroup(ex.muscleGroup);
    setError(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName('');
    setEditGroup('');
  };

  const handleEditSave = async (ex: Exercise) => {
    if (!editName.trim() || !editGroup.trim()) return;
    try {
      setSaving(true);
      const updated = await exerciseService.updateExercise(ex.id, currentUser.id, editName.trim(), editGroup.trim());
      if (updated) {
        setExercises(prev => prev.map(e => e.id === ex.id ? updated : e));
      }
      handleEditCancel();
    } catch (err: any) {
      console.error('Error editing exercise:', err);
      setError(err.message || 'Error al renombrar el ejercicio');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim() || !newGroup.trim()) return;

    try {
      setSaving(true);
      setError(null);

      const newExercise = await exerciseService.createExercise(
        currentUser.id,
        newName.trim(),
        newGroup.trim()
      );

      if (newExercise) {
        setExercises([...exercises, newExercise]);
        setIsAdding(false);
        setNewName('');
        setNewGroup('');
      }
    } catch (err: any) {
      console.error('Error creating exercise:', err);
      setError(err.message || 'Error al crear el ejercicio');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="pb-24 pt-6 px-4 max-w-2xl mx-auto w-full flex items-center justify-center min-h-100">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 size={32} className="animate-spin" />
          <p>Cargando ejercicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-6 px-4 max-w-2xl mx-auto w-full">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Ejercicios</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-slate-700 p-2 rounded-full text-slate-300 hover:bg-slate-600 transition-colors"
          disabled={saving}
        >
          <Plus size={20} />
        </button>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6 animate-in slide-in-from-top-2 fade-in">
          <h3 className="font-bold mb-3 text-white">Nuevo Ejercicio</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nombre (ej. Curl de Bíceps)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-blue-500 focus:outline-none"
              required
              disabled={saving}
            />
            <input
              type="text"
              placeholder="Grupo Muscular (ej. Brazo)"
              value={newGroup}
              onChange={e => setNewGroup(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-blue-500 focus:outline-none"
              required
              disabled={saving}
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setError(null);
                }}
                className="px-3 py-1 text-slate-400 hover:text-white transition-colors"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-1.5 rounded font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={saving}
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid gap-3">
        {exercises.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>No hay ejercicios aún.</p>
            <p className="text-sm mt-2">Crea uno nuevo usando el botón +</p>
          </div>
        ) : (
          exercises.map(ex => (
            <div key={ex.id} className="bg-slate-800 p-4 rounded-lg flex justify-between items-center border border-slate-700/50 hover:border-slate-600 transition-colors">
              <div className="flex-1 min-w-0">
                {editingId === ex.id ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                    />
                    <input
                      value={editGroup}
                      onChange={e => setEditGroup(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="font-medium text-slate-200 truncate">{ex.name}</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mt-1 truncate">{ex.muscleGroup}</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 ml-3">
                {ex.isCustom && <span className="text-[10px] bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded">Propio</span>}
                {(ex.isCustom || ex.id.startsWith('temp_')) && (
                  editingId === ex.id ? (
                    <>
                      <button
                        onClick={() => handleEditSave(ex)}
                        disabled={saving}
                        className="text-green-400 hover:text-green-200 p-2 rounded hover:bg-green-500/10 disabled:opacity-50"
                        title="Guardar"
                      >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="text-slate-400 hover:text-white p-2 rounded hover:bg-slate-700"
                        title="Cancelar"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditStart(ex)}
                        className="text-slate-300 hover:text-white p-2 rounded hover:bg-slate-700"
                        title="Renombrar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(ex)}
                        disabled={deletingId === ex.id}
                        className="text-red-400 hover:text-red-200 p-2 rounded hover:bg-red-500/10 disabled:opacity-50"
                        title="Eliminar ejercicio"
                      >
                        {deletingId === ex.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
