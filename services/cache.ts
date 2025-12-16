import { UserProfile } from '../types';

const CACHE_KEY = 'gymprogress_user_cache';

export const cacheService = {
    // Save user profile to localStorage
    saveUserProfile: (profile: UserProfile | null) => {
        try {
            if (profile) {
                localStorage.setItem(CACHE_KEY, JSON.stringify(profile));
            } else {
                localStorage.removeItem(CACHE_KEY);
            }
        } catch (error) {
            console.error('Error saving to cache:', error);
        }
    },

    // Get cached user profile (instant)
    getCachedUserProfile: (): UserProfile | null => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                return JSON.parse(cached) as UserProfile;
            }
            return null;
        } catch (error) {
            console.error('Error reading from cache:', error);
            return null;
        }
    },

    // Clear cache
    clearCache: () => {
        try {
            localStorage.removeItem(CACHE_KEY);
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    }
};
