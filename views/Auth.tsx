import React, { useState } from 'react';
import { authService } from '../services/auth';
import { UserProfile } from '../types';
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

interface Props {
  onLoginSuccess: (user: UserProfile) => void;
}

type AuthMode = 'login' | 'register' | 'forgot_password' | 'reset_success' | 'verify_email';

export const AuthView: React.FC<Props> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  const clearErrors = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt started for:', email);
    setLoading(true);
    clearErrors();

    // Safety timeout promise
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Tiempo de espera agotado. Por favor, intenta de nuevo.')), 8000)
    );

    try {
      // Race between login and timeout
      const user = await Promise.race([
        authService.login(email, password),
        timeout
      ]) as UserProfile;


      console.log('Login successful, user:', user);
      onLoginSuccess(user);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || String(err));
    } finally {
      if (typeof setLoading === 'function') {
        setLoading(false);
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    clearErrors();
    try {
      await authService.register(name, email, password);
      // Show verification screen instead of auto-login
      setMode('verify_email');
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearErrors();
    try {
      await authService.resetPassword(email);
      // For demo purposes, we automatically simulate a password reset to "123456" if they click the link in the "email"
      setMode('reset_success');
    } catch (err: any) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };

  // Simulated Reset flow
  const handleSimulatedReset = async () => {
    await authService.updatePassword(email, '123456');
    alert('Contraseña reestablecida a: 123456');
    setMode('login');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden relative">

        {/* Background Decorations */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-600 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-600 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

        <div className="p-8 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black italic tracking-tight text-white mb-2">GYMPROGRESS</h1>
            <p className="text-slate-400 text-sm">
              {mode === 'login' && 'Bienvenido de nuevo, atleta.'}
              {mode === 'register' && 'Crea tu cuenta y empieza a progresar.'}
              {mode === 'forgot_password' && 'Recupera tu acceso.'}
            </p>
          </div>

          {/* Error / Success Messages */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-start text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={16} className="mt-0.5 mr-2 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Views Logic */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Correo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="ejemplo@correo.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase">Contraseña</label>
                  <button type="button" onClick={() => { clearErrors(); setMode('forgot_password'); }} className="text-xs text-blue-400 hover:text-blue-300">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 flex items-center justify-center"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (
                  <>
                    <span>Iniciar Sesión</span>
                    <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Nombre</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-500" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Correo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="ejemplo@correo.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 flex items-center justify-center"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Crear Cuenta'}
              </button>
            </form>
          )}

          {mode === 'forgot_password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Correo registrado</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="ejemplo@correo.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 flex items-center justify-center"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Enviar Link de Recuperación'}
              </button>

              <button type="button" onClick={() => { clearErrors(); setMode('login'); }} className="w-full text-slate-400 text-sm hover:text-white mt-2">
                Volver al inicio
              </button>
            </form>
          )}

          {mode === 'reset_success' && (
            <div className="text-center py-4 animate-in zoom-in duration-300">
              <div className="bg-green-500/10 text-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">¡Correo Enviado!</h3>
              <p className="text-slate-400 text-sm mb-6">
                Hemos enviado las instrucciones a <strong>{email}</strong>.
                <br /><br />
                Revisa tu bandeja de entrada (y spam) para continuar.
              </p>
              <button
                onClick={() => setMode('login')}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all"
              >
                Volver al Login
              </button>
            </div>
          )}

          {mode === 'verify_email' && (
            <div className="text-center py-4 animate-in zoom-in duration-300">
              <div className="bg-blue-500/10 text-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                <Mail size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">¡Verifica Tu Correo!</h3>
              <p className="text-slate-400 text-sm mb-2">
                Hemos enviado un correo de confirmación a <strong>{email}</strong>.
              </p>
              <p className="text-slate-300 text-sm mb-6">
                Debes verificar tu cuenta antes de poder iniciar sesión.
                <br /><br />
                Revisa tu bandeja de entrada (y spam) y haz clic en el enlace de confirmación.
              </p>
              <button
                onClick={() => setMode('login')}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all"
              >
                Entendido, Ir al Login
              </button>
            </div>
          )}

          {/* Footer Switching */}
          {mode !== 'forgot_password' && mode !== 'reset_success' && mode !== 'verify_email' && (
            <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
              <p className="text-slate-400 text-sm">
                {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                <button
                  onClick={() => {
                    clearErrors();
                    setMode(mode === 'login' ? 'register' : 'login');
                  }}
                  className="ml-2 font-bold text-blue-500 hover:text-blue-400 transition-colors"
                >
                  {mode === 'login' ? 'Regístrate' : 'Inicia Sesión'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};