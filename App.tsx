import React, { useState, useEffect } from 'react';
import { Home, Dumbbell, User, LogOut, PlusCircle, HelpCircle } from 'lucide-react';
import { HomeView } from './views/Home';
import { WorkoutLogger } from './views/WorkoutLogger';
import { ExercisesView } from './views/Exercises';
import { ProfileView } from './views/Profile';
import { HelpView } from './views/Help';
import { AuthView } from './views/Auth';
import { store } from './services/store';
import { authService } from './services/auth';
import { UserProfile } from './types';


type View = 'home' | 'exercises' | 'profile' | 'logger' | 'help';

function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [currentView, setCurrentView] = useState<View>('home');
  const [userProfile, setUserProfile] = useState<UserProfile>(store.getProfile());

  // Check for auth on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setUserProfile(user); // Sync UI profile
        }
      } catch (error) {
        console.error("Auth check failed", error);
      } finally {
        setLoadingAuth(false);
      }
    }
    checkAuth();
  }, []);

  // Handle Log out
  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentView('home');
  };

  const handleResetDemo = () => {
    if (confirm('¿Borrar todos los datos y reiniciar demo?')) {
      store.clearData();
    }
  };

  // 1. Loading State
  if (loadingAuth) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-500">Cargando...</div>;
  }

  // 2. Not Authenticated -> Show Auth View
  if (!currentUser) {
    return <AuthView onLoginSuccess={(user) => {
      setCurrentUser(user);
      setUserProfile(user);
    }} />;
  }

  // 3. Authenticated -> Show App

  // If we are in logger mode, we take over the whole screen
  if (currentView === 'logger') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-50 font-sans">
        <WorkoutLogger
          onCancel={() => setCurrentView('home')}
          onFinish={() => setCurrentView('home')}
          unit={userProfile.weightUnit}
          onToggleUnit={(newUnit) => {
            const updated = { ...userProfile, weightUnit: newUnit };
            // Update both stores (global profile + auth user record)
            store.updateProfile(updated);
            setUserProfile(updated);
            // In a real app we would update the user record in the DB here too
          }}
        />
      </div>
    );
  }

  const initials = userProfile.alias
    ? userProfile.alias.substring(0, 2).toUpperCase()
    : userProfile.name.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans flex flex-col md:flex-row">


      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 p-6 sticky top-0 h-screen">
        <div className="text-2xl font-black italic tracking-tight text-white mb-10">
          GYMPROGRESS
        </div>

        {/* User Mini Profile in Sidebar */}
        <div className="flex items-center space-x-3 mb-8 px-2">
          <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden">
            {userProfile.photoUrl ? (
              <img src={userProfile.photoUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-sm truncate">{userProfile.alias || userProfile.name}</p>
            <p className="text-xs text-slate-400 capitalize">{userProfile.weightUnit}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-4">
          <button
            onClick={() => setCurrentView('home')}
            className={`flex items-center space-x-3 w-full p-2 rounded-lg transition-colors ${currentView === 'home' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white'}`}
          >
            <Home size={20} />
            <span className="font-medium">Inicio</span>
          </button>

          <button
            onClick={() => setCurrentView('logger')}
            className={`flex items-center space-x-3 w-full p-2 rounded-lg transition-colors ${currentView === 'logger' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white'}`}
          >
            <PlusCircle size={20} />
            <span className="font-medium">Registrar Sesión</span>
          </button>

          <button
            onClick={() => setCurrentView('exercises')}
            className={`flex items-center space-x-3 w-full p-2 rounded-lg transition-colors ${currentView === 'exercises' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white'}`}
          >
            <Dumbbell size={20} />
            <span className="font-medium">Ejercicios</span>
          </button>
          <button
            onClick={() => setCurrentView('profile')}
            className={`flex items-center space-x-3 w-full p-2 rounded-lg transition-colors ${currentView === 'profile' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white'}`}
          >
            <User size={20} />
            <span className="font-medium">Perfil</span>
          </button>

          <button
            onClick={() => setCurrentView('help')}
            className={`flex items-center space-x-3 w-full p-2 rounded-lg transition-colors ${currentView === 'help' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white'}`}
          >
            <HelpCircle size={20} />
            <span className="font-medium">Ayuda</span>
          </button>
        </nav>
        <button onClick={handleLogout} className="flex items-center space-x-2 text-slate-600 text-sm hover:text-red-400 mt-auto pt-4 border-t border-slate-800">
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto no-scrollbar relative">
        {currentView === 'home' && (
          <HomeView
            onStartLogging={() => setCurrentView('logger')}
            onGoToExercises={() => setCurrentView('exercises')}
            onGoToProfile={() => setCurrentView('profile')}
            onGoToHelp={() => setCurrentView('help')}
            userProfile={userProfile}
          />
        )}
        {currentView === 'exercises' && <ExercisesView />}
        {currentView === 'profile' && (
          <ProfileView
            profile={userProfile}
            onUpdate={setUserProfile}
            onReset={handleResetDemo}
          />
        )}
        {currentView === 'help' && (
          <HelpView onBack={() => setCurrentView('home')} />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around p-3 z-50 pb-safe">
        <button
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center p-2 ${currentView === 'home' ? 'text-blue-500' : 'text-slate-500'}`}
        >
          <Home size={24} />
          <span className="text-[10px] font-medium mt-1">Inicio</span>
        </button>
        <button
          onClick={() => setCurrentView('logger')}
          className="flex flex-col items-center justify-center -mt-8"
        >
          <div className="bg-blue-600 text-white h-14 w-14 rounded-full flex items-center justify-center shadow-lg shadow-blue-900/50">
            <Dumbbell size={24} />
          </div>
          <span className="text-[10px] font-medium mt-1 text-slate-300">Entrenar</span>
        </button>
        <button
          onClick={() => setCurrentView('profile')}
          className={`flex flex-col items-center p-2 ${currentView === 'profile' ? 'text-blue-500' : 'text-slate-500'}`}
        >
          <User size={24} />
          <span className="text-[10px] font-medium mt-1">Perfil</span>
        </button>
      </nav>
    </div>
  );
}

export default App;