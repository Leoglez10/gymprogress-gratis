import { supabase } from './supabase';
import { UserProfile } from '../types';

const withTimeout = async <T>(promise: Promise<T>, ms = 30000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout al contactar Supabase (30s)')), ms)
    ),
  ]);
};

// Handles profile updates and avatar uploads to Supabase Storage
export const profileService = {
  uploadAvatar: async (file: File, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await withTimeout(
      supabase.storage.from('avatars').upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      })
    );

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data, error: urlError } = supabase.storage.from('avatars').getPublicUrl(filePath);
    if (urlError) {
      throw new Error(urlError.message);
    }
    if (!data?.publicUrl) {
      throw new Error('No se pudo obtener la URL pública del avatar');
    }

    return data.publicUrl;
  },

  updateProfile: async (profile: UserProfile): Promise<void> => {
    const payload = {
      full_name: profile.name,
      nombre_mostrar: profile.alias,
      weight_unit: profile.weightUnit,
      unidad_peso: profile.weightUnit,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await withTimeout(
        supabase.from('profiles').update(payload).eq('id', profile.id)
      );

      if (error) {
        console.warn('⚠️ Update Supabase failed (will save locally):', error.message);
        // Don't throw; let the app continue with local save
      }
    } catch (e) {
      console.warn('⚠️ Update Supabase timeout/error (will save locally):', e);
      // Don't throw; let the app continue with local save
    }
  },
};
