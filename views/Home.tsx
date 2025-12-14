import React, { useMemo } from 'react';
import { store } from '../services/store';
import { calculateExerciseStats } from '../utils/calculations';
import { ExerciseCard } from '../components/ExerciseCard';
import { PlusCircle, HelpCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface Props {
  onStartLogging: () => void;
  onGoToExercises: () => void;
  onGoToProfile: () => void;
  onGoToHelp: () => void;
  userProfile: UserProfile;
}

export const HomeView: React.FC<Props> = ({ onStartLogging, onGoToExercises, onGoToProfile, onGoToHelp, userProfile }) => {
  const sessions = store.getSessions();
  const exercises = store.getExercises();

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
                <ExerciseCard key={stat.exerciseId} stats={stat} unit={userProfile.weightUnit} />
            ))}
        </div>
      )}
    </div>
  );
};