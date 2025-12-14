import { supabase } from './supabase';
import { UserProfile } from '../types';

export const authService = {
  // Register a new user
  register: async (name: string, email: string, password: string): Promise<UserProfile> => {
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

    // 2. Create profile entry (handled by trigger usually, but we can ensure/fetch it)
    // The trigger we defined in SQL creates the profile automatically. 
    // We just need to wait a tiny bit or just construct the profile locally for the UI.

    // Let's verify/update if needed or just return local structure
    const newUser: UserProfile = {
      id: authData.user.id,
      name: name,
      email: email,
      alias: name.split(' ')[0],
      weightUnit: 'kg', // Default
      photoUrl: undefined
    };

    return newUser;
  },

  // Login
  login: async (email: string, password: string): Promise<UserProfile> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Error al iniciar sesión');

    // Fetch extra profile data
    return await authService.fetchProfile(data.user.id, data.user.email || email);
  },

  // Logout
  logout: async () => {
    await supabase.auth.signOut();
  },

  // Fetch full profile from DB
  fetchProfile: async (userId: string, email: string): Promise<UserProfile> => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
    }

    // Default fallback if profile missing (e.g. trigger failed)
    return {
      id: userId,
      email: email,
      name: profile?.full_name || profile?.nombre_mostrar || 'Usuario',
      alias: profile?.nombre_mostrar || 'Usuario', // mapping 'nombre_mostrar' if using Spanish SQL
      weightUnit: profile?.weight_unit || profile?.unidad_peso || 'kg',
      photoUrl: profile?.avatar_url || profile?.foto_url
    };
  },

  // Get current session user (Async now!)
  getCurrentUser: async (): Promise<UserProfile | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    return await authService.fetchProfile(session.user.id, session.user.email!);
  }
};