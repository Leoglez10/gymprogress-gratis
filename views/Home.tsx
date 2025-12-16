import React, { useEffect, useMemo, useState } from 'react';
import { store } from '../services/store';
import { calculateExerciseStats } from '../utils/calculations';
import { ExerciseCard } from '../components/ExerciseCard';
import { ExerciseDetailModal } from '../components/ExerciseDetailModal';
import { PlusCircle, HelpCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Exercise, UserProfile, WorkoutSession } from '../types';
import { exerciseService } from '../services/exerciseService';
import { sessionService } from '../services/sessionService';
import { formatWeight } from '../utils/calculations';

interface Props {
  onStartLogging: () => void;
  onGoToExercises: () => void;
  onGoToProfile: () => void;
  onGoToHelp: () => void;
  userProfile: UserProfile;
}

export const HomeView: React.FC<Props> = ({ onStartLogging, onGoToExercises, onGoToProfile, onGoToHelp, userProfile }) => {
  const [sessions, setSessions] = useState<WorkoutSession[]>(store.getSessions());
  const [exercises, setExercises] = useState<Exercise[]>(store.getExercises());
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showRecents, setShowRecents] = useState<boolean>(false);
  const [openSessions, setOpenSessions] = useState<Record<string, boolean>>({});

  // Sync remote data (Supabase) when user changes
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const userId = userProfile.id;

      // Load exercises (hybrid: remote with local fallback)
      try {
        const remoteEx = await exerciseService.fetchExercises(userId);
        if (!cancelled && remoteEx.length) {
          setExercises(remoteEx);
        }
      } catch (e) {
        // fallback already set from store
        console.warn('Fallo cargar ejercicios remotos, usando cache local', e);
      }

      // Load sessions (remote with fallback to local)
      try {
        const remoteSessions = await sessionService.fetchSessions(userId, 50);
        if (!cancelled && remoteSessions.length) {
          setSessions(remoteSessions);
        }
      } catch (e) {
        console.warn('Fallo cargar sesiones remotas, usando cache local', e);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [userProfile.id]);

  const statsList = useMemo(() => {
    // Pass userProfile.weightUnit to calculation engine
    const calculated = exercises.map(ex => calculateExerciseStats(ex, sessions, userProfile.weightUnit));
    // Sort: Exercises with recent activity first, then by trend
    return calculated.sort((a, b) => {
        const dateA = a.lastSessionDate ? new Date(a.lastSessionDate).getTime() : 0;
        const dateB = b.lastSessionDate ? new Date(b.lastSessionDate).getTime() : 0;
        return dateB - dateA;
    });
  }, [sessions, exercises, userProfile.weightUnit]);

  const recentSessions = useMemo(() => {
    return [...sessions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [sessions]);

  const isUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('¿Eliminar esta sesión?')) return;
    setDeletingId(sessionId);
    try {
      if (isUUID(sessionId)) {
        await sessionService.deleteSession(sessionId);
      }
      store.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (e) {
      console.error('Error al borrar sesión', e);
      alert('No se pudo borrar la sesión');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteEntry = async (sessionId: string, entryId: string) => {
    if (!confirm('¿Eliminar este ejercicio de la sesión?')) return;
    try {
      // Attempt remote delete if ids are UUID
      if (isUUID(entryId)) {
        await sessionService.deleteEntry(entryId);
      }
      // Update local store and state
      store.deleteEntry(sessionId, entryId);
      setSessions(prev => prev
        .map(s => s.id === sessionId ? { ...s, entries: s.entries.filter(e => e.id !== entryId) } : s)
        .filter(s => s.entries.length > 0));
    } catch (e) {
      console.error('Error al borrar ejercicio de la sesión', e);
      alert('No se pudo borrar este ejercicio');
    }
  };

  const hasSessions = sessions.length > 0;
  
  const initials = userProfile.alias 
    ? userProfile.alias.substring(0, 2).toUpperCase() 
    : userProfile.name.substring(0, 2).toUpperCase();

  return (
    <div className="pb-24 pt-6 px-4 max-w-2xl mx-auto w-full">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black italic tracking-tight text-white">
          GYMPROGRESS
        </h1>
        <div className="flex items-center space-x-3">
             <button 
                onClick={onStartLogging}
                className="hidden md:flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors"
             >
                <PlusCircle size={16} />
                <span>Registrar</span>
             </button>

             <button 
                onClick={onGoToHelp}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Ayuda / Conceptos"
             >
                <HelpCircle size={24} />
             </button>

            <button onClick={onGoToProfile} className="relative group">
               <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold border-2 border-slate-900 overflow-hidden shadow-lg transition-transform group-hover:scale-105">
                  {userProfile.photoUrl ? (
                    <img src={userProfile.photoUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
               </div>
            </button>
        </div>
      </header>

      {!hasSessions ? (
        <div className="text-center py-10 bg-slate-800/50 rounded-xl border border-slate-700 border-dashed">
          <div className="mb-4 text-6xl">🏋️</div>
          <h2 className="text-xl font-bold mb-2">Empieza tu progreso</h2>
          <p className="text-slate-400 mb-6 max-w-xs mx-auto">
            Registra tu primera sesión para ver tus estadísticas y tendencias.
          </p>
          <button 
            onClick={onStartLogging}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-all active:scale-95 shadow-lg shadow-blue-900/20"
          >
            Registrar Entrenamiento
          </button>
        </div>
      ) : (
        <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 ml-1">Tu Rendimiento</h2>
            {statsList.map(stat => (
                <ExerciseCard
                  key={stat.exerciseId}
                  stats={stat}
                  unit={userProfile.weightUnit}
                  onClick={() => {
                    const ex = exercises.find(e => e.id === stat.exerciseId);
                    if (ex) setSelectedExercise(ex);
                  }}
                />
            ))}

            <div className="mt-6 bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <button
                onClick={() => setShowRecents(v => !v)}
                className="w-full flex items-center justify-between text-left rounded-lg px-2 py-1 hover:bg-slate-700/40 transition"
              >
                <h3 className="text-sm font-semibold text-slate-200">Sesiones recientes</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{showRecents ? 'Ocultar' : 'Mostrar'}</span>
                  {showRecents ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
              </button>

              {showRecents && (
                recentSessions.length === 0 ? (
                  <p className="text-slate-500 text-sm mt-3">Aún no registras sesiones.</p>
                ) : (
                  <div className="divide-y divide-slate-800/80 mt-3">
                    {recentSessions.map(s => (
                      <div key={s.id} className="py-2">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setOpenSessions(prev => ({ ...prev, [s.id]: !prev[s.id] }))}
                            className="text-left flex items-center gap-2 hover:text-white transition flex-1"
                          >
                            {openSessions[s.id] ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-500" />}
                            <div>
                              <div className="text-slate-100 text-sm font-semibold">{new Date(s.date).toLocaleString()}</div>
                              <div className="text-xs text-slate-400 mt-1">
                                {s.entries.map(entry => exercises.find(e => e.id === entry.exerciseId)?.name).filter(Boolean).join(', ')}
                              </div>
                            </div>
                            <div className="text-xs text-slate-500 ml-auto">{s.entries.length} ejercicios</div>
                          </button>
                          <button
                            onClick={() => handleDeleteSession(s.id)}
                            disabled={deletingId === s.id}
                            className="text-red-400 text-xs border border-red-500/40 px-3 py-1 rounded hover:bg-red-500/10 disabled:opacity-50"
                          >
                            {deletingId === s.id ? 'Borrando...' : 'Eliminar'}
                          </button>
                        </div>

                        {openSessions[s.id] && (
                          <div className="mt-2 space-y-2 pl-2 border-l border-slate-800">
                            {s.entries.map(entry => {
                              const ex = exercises.find(e => e.id === entry.exerciseId);
                              const bestSet = entry.sets.reduce((acc, set) => set.weight > acc.weight ? set : acc, entry.sets[0]);
                              const volume = entry.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
                              return (
                                <div key={entry.id} className="bg-slate-800/60 rounded px-2 py-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="text-sm text-slate-200 truncate">{ex ? ex.name : 'Ejercicio'}</div>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                      <span>{entry.sets.length} sets</span>
                                      <span>Vol: {formatWeight(volume, userProfile.weightUnit, 0)} {userProfile.weightUnit}</span>
                                      <span>Mejor: {formatWeight(bestSet?.weight || 0, userProfile.weightUnit, 1)} {userProfile.weightUnit}</span>
                                    </div>
                                  </div>
                                  <div className="mt-1 flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleDeleteEntry(s.id, entry.id)}
                                      className="text-red-400 text-[11px] border border-red-500/40 px-2 py-0.5 rounded hover:bg-red-500/10"
                                    >
                                      Borrar ejercicio
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
        </div>
      )}

      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          sessions={sessions}
          unit={userProfile.weightUnit}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
};