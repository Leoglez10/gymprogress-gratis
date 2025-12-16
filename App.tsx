import React, { useState, useEffect } from 'react';
import { Home, Dumbbell, User, LogOut, PlusCircle, HelpCircle, Calculator, Menu, X } from 'lucide-react';
import { HomeView } from './views/Home';
import { WorkoutLogger } from './views/WorkoutLogger';
import { ExercisesView } from './views/Exercises';
import { ProfileView } from './views/Profile';
import { HelpView } from './views/Help';
import { CalculatorView } from './views/Calculator';
import { AuthView } from './views/Auth';
import { store } from './services/store';
import { authService } from './services/auth';
import { supabase } from './services/supabase';
import { cacheService } from './services/cache';
import { UserProfile } from './types';
import { UnverifiedBanner } from './components/UnverifiedBanner';


type View = 'home' | 'exercises' | 'profile' | 'logger' | 'help' | 'calculator';

function App() {
  // Try to load from cache immediately (instant load!)
  const cachedUser = cacheService.getCachedUserProfile();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(cachedUser);
  const [loadingAuth, setLoadingAuth] = useState(!cachedUser); // Skip loading if we have cache

  const [currentView, setCurrentView] = useState<View>('home');
  const [userProfile, setUserProfile] = useState<UserProfile>(cachedUser || store.getProfile());
  const [isEmailVerified, setIsEmailVerified] = useState(true); // Assume verified until proven otherwise
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Check for auth on mount and listen for changes
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Verify email is confirmed
          if (!session.user.email_confirmed_at) {
            console.warn("Session exists but email not confirmed. Logging out.");
            await supabase.auth.signOut();
            cacheService.clearCache();
            setCurrentUser(null);
            setLoadingAuth(false);
            return;
          }

          const user = await authService.fetchProfile(session.user.id, session.user.email!);
          if (user) {
            setCurrentUser(user);
            setUserProfile(user);
            cacheService.saveUserProfile(user); // Cache for next reload
          } else {
            // Profile not found, clear cache and logout
            cacheService.clearCache();
            setCurrentUser(null);
          }
        } else {
          // No session, clear cache
          cacheService.clearCache();
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Auth init error:", err);
        cacheService.clearCache();
        setCurrentUser(null);
      } finally {
        setLoadingAuth(false);
      }
    };

    // Only run init if we don't have cached data OR run in background to verify
    if (!cachedUser) {
      initAuth();
    } else {
      // We have cache, verify in background without blocking UI
      setLoadingAuth(false);
      initAuth();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth Event:', event);

      if (event === 'SIGNED_IN' && session?.user) {
        // STRICT CHECK in Listener
        if (!session.user.email_confirmed_at) {
          console.warn("Session detected but email not confirmed. Ignoring login.");
          await supabase.auth.signOut();
          return;
        }

        const user = await authService.fetchProfile(session.user.id, session.user.email!);
        if (user) {
          setCurrentUser(user);
          setUserProfile(user);
          cacheService.saveUserProfile(user); // Cache on login
        }
      } else if (event === 'SIGNED_OUT') {
        cacheService.clearCache(); // Clear cache on logout
        setCurrentUser(null);
        setCurrentView('home');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle Log out
  const handleLogout = async () => {
    cacheService.clearCache();
    await authService.logout();
    setCurrentUser(null);
    setUserProfile(null);
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
      cacheService.saveUserProfile(user); // Cache on successful login
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
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans flex flex-col">
      {/* Warning Banner for Unverified Accounts */}
      {!isEmailVerified && currentUser && (
        <UnverifiedBanner email={currentUser.email || 'tu correo'} />
      )}

      <div className="flex flex-col md:flex-row flex-1">
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
              onClick={() => setCurrentView('calculator')}
              className={`flex items-center space-x-3 w-full p-2 rounded-lg transition-colors ${currentView === 'calculator' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white'}`}
            >
              <Calculator size={20} />
              <span className="font-medium">Calculadora</span>
            </button>

            <button
              onClick={() => setCurrentView('help')}
              className={`flex items-center space-x-3 w-full p-2 rounded-lg transition-colors ${currentView === 'help' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white'}`}
            >
              <HelpCircle size={20} />
              <span className="font-medium">Ayuda</span>
            </button>
          </nav>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 w-full px-4 py-3 mt-auto bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all border border-red-500/20 hover:border-red-500/30"
          >
            <LogOut size={18} />
            <span className="font-medium">Cerrar Sesión</span>
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
          {currentView === 'exercises' && <ExercisesView currentUser={currentUser} />}
          {currentView === 'profile' && (
            <ProfileView
              profile={userProfile}
              onUpdate={setUserProfile}
              onReset={handleResetDemo}
            />
          )}
          {currentView === 'help' && (
            <HelpView onBack={() => setCurrentView('home')} unit={userProfile.weightUnit} />
          )}
          {currentView === 'calculator' && (
            <CalculatorView onBack={() => setCurrentView('home')} unit={userProfile.weightUnit} />
          )}
        </main>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end" onClick={() => setShowMobileMenu(false)}>
            <div className="w-full bg-slate-900 border-t border-slate-700 rounded-t-2xl p-4 pb-safe animate-in slide-in-from-bottom duration-200" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Menú</h3>
                <button onClick={() => setShowMobileMenu(false)} className="p-2 text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setCurrentView('exercises'); setShowMobileMenu(false); }}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
                >
                  <Dumbbell size={24} className="text-blue-400" />
                  <span className="text-sm font-medium text-white">Ejercicios</span>
                </button>
                <button
                  onClick={() => { setCurrentView('calculator'); setShowMobileMenu(false); }}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
                >
                  <Calculator size={24} className="text-purple-400" />
                  <span className="text-sm font-medium text-white">Calculadora</span>
                </button>
                <button
                  onClick={() => { setCurrentView('help'); setShowMobileMenu(false); }}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
                >
                  <HelpCircle size={24} className="text-green-400" />
                  <span className="text-sm font-medium text-white">Ayuda</span>
                </button>
                <button
                  onClick={() => { handleLogout(); setShowMobileMenu(false); }}
                  className="flex flex-col items-center gap-2 p-4 bg-red-900/20 hover:bg-red-900/30 rounded-xl border border-red-700/30 transition-colors"
                >
                  <LogOut size={24} className="text-red-400" />
                  <span className="text-sm font-medium text-red-400">Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        )}

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
            onClick={() => setShowMobileMenu(true)}
            className="flex flex-col items-center p-2 text-slate-500 hover:text-blue-400"
          >
            <Menu size={24} />
            <span className="text-[10px] font-medium mt-1">Menú</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

export default App;