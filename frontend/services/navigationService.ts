import { fetchApi } from './api';
import { NavigationConfig } from '../types/admin';
import { DEFAULT_NAVIGATION_CONFIG } from './defaultData';

export const navigationService = {
  // Public: Get published active navigation tree
  async getPublicNavigation(): Promise<NavigationConfig> {
    try {
      const data = await fetchApi<NavigationConfig>('/navigation');
      if (data && Array.isArray(data.items)) {
        return data;
      }
    } catch (err) {
      console.warn('[navigationService] Could not fetch public navigation from API, using fallback:', err);
    }
    return DEFAULT_NAVIGATION_CONFIG;
  },

  // Admin: Get all items including inactive
  async getAllNavigation(): Promise<NavigationConfig> {
    try {
      const data = await fetchApi<NavigationConfig>('/navigation/all');
      if (data && Array.isArray(data.items)) {
        return data;
      }
    } catch (err) {
      // Try /admin/navigation fallback
      try {
        const adminData = await fetchApi<NavigationConfig>('/admin/navigation');
        if (adminData && Array.isArray(adminData.items)) {
          return adminData;
        }
      } catch (adminErr) {
        console.warn('[navigationService] Could not fetch admin navigation from API:', adminErr);
      }
    }
    return DEFAULT_NAVIGATION_CONFIG;
  },

  // Admin: Save updated navigation configuration
  async updateNavigation(config: NavigationConfig): Promise<NavigationConfig> {
    try {
      const updated = await fetchApi<NavigationConfig>('/navigation', {
        method: 'PUT',
        body: JSON.stringify(config),
      });
      return updated;
    } catch (err) {
      console.warn('[navigationService] Backend API save failed, continuing with client persistence:', err);
      return config;
    }
  },

  // Admin: Reset to default brand configuration
  async resetNavigation(): Promise<NavigationConfig> {
    try {
      const reset = await fetchApi<NavigationConfig>('/navigation/reset', {
        method: 'POST',
      });
      return reset;
    } catch (err) {
      console.warn('[navigationService] Reset API failed, resetting to brand default:', err);
      return DEFAULT_NAVIGATION_CONFIG;
    }
  },
};
