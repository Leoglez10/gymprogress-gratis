import { supabase } from './supabase';
import { UserProfile } from '../types';

export const authService = {
  // Register
  register: async (email: string, password: string, name: string) => {
    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error('No se pudo crear el usuario');

    // Return full data so UI can decide (check for session)
    return authData;
  },

  // Login
  login: async (email: string, password: string): Promise<UserProfile> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Error al iniciar sesión');

    // STRICT CHECK: Email must be confirmed
    if (!data.user.email_confirmed_at) {
      await supabase.auth.signOut(); // Force logout
      throw new Error('Debes verificar tu correo electrónico antes de entrar.');
    }

    // Fetch extra profile data
    const profile = await authService.fetchProfile(data.user.id, data.user.email || email);
    if (!profile) throw new Error('Error al cargar el perfil de usuario');
    return profile;
  },

  // Logout
  logout: async () => {
    try {
      console.log('🚪 authService.logout: Starting logout...');

      // Force short timeout for signOut to avoid hanging
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1000));

      await Promise.race([signOutPromise, timeoutPromise]);
      console.log('🚪 authService.logout: Logout complete (or timed out)');
    } catch (error) {
      console.error('⚠️ authService.logout: Error signing out (ignoring):', error);
    }

    // Always clear localStorage critical keys just in case
    localStorage.removeItem('sb-kxvqtlfvginxgvaggzol-auth-token'); // Supabase token key pattern
    localStorage.removeItem('gp_user_profile');
  },

  // Fetch full profile from DB
  fetchProfile: async (userId: string, email: string): Promise<UserProfile | null> => {
    console.log('fetchProfile called for:', userId);

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle to avoid errors if row is missing

      if (error) {
        console.error('Error fetching profile:', error);
        return null; // Return null to let UI handle "no profile" state
      }

      if (!profile) {
        console.log('No profile found for user (Strict Mode).');
        // Strict mode: If profile doesn't exist in DB, we return null.
        return null; // The app will handle "Auth but no profile" as a failure state
      }

      // Return connection-validated profile
      const userProfile: UserProfile = {
        id: userId,
        email: email,
        name: profile.full_name || email.split('@')[0],
        alias: profile.nombre_mostrar || profile.full_name?.split(' ')[0] || email.split('@')[0],
        weightUnit: (profile.weight_unit || profile.unidad_peso || 'kg') as 'kg' | 'lb',
        photoUrl: profile.avatar_url || profile.foto_url
      };

      console.log('Returning user profile:', userProfile);
      return userProfile;
    } catch (e) {
      console.error('fetchProfile crashed:', e);
      return null;
    }
  },

  // Request password reset email
  resetPassword: async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/restablecer-contrasena`,
    });
    if (error) throw new Error(error.message);
  },

  // Update password (for logged-in user or after reset)
  updatePassword: async (_email: string, newPassword: string): Promise<void> => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw new Error(error.message);
  },

  // Get current session user (Async now!)
  getCurrentUser: async (): Promise<UserProfile | null> => {
    try {
      console.log('🔐 getCurrentUser: Getting session...');
      const { data, error } = await supabase.auth.getSession();
      console.log('🔐 getCurrentUser: Session data:', data, 'error:', error);

      if (error || !data.session?.user) {
        console.log('🔐 getCurrentUser: No session or error');
        return null;
      }

      // STRICT CHECK
      if (!data.session.user.email_confirmed_at) {
        console.warn("User has session but email is not confirmed. Logging out.");
        await supabase.auth.signOut();
        return null;
      }

      console.log('🔐 getCurrentUser: Fetching profile for user:', data.session.user.id);
      const profile = await authService.fetchProfile(data.session.user.id, data.session.user.email!);
      console.log('🔐 getCurrentUser: Profile fetched:', profile);
      return profile;
    } catch (e) {
      console.error('❌ getCurrentUser: Error:', e);
      return null;
    }
  }
};