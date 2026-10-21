import { useAuth } from './useAuth';

export const useTheme = () => {
  const { checkTokenExpired } = useAuth();

  const loadUserThemePreference = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken || checkTokenExpired(authToken)) {
      return;
    }

    try {
      const res = await fetch('/api/v1/auth/profile', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + authToken,
        },
      });

      if (!res.ok) return;

      const profile = await res.json();
      let themeSetting = profile.darkmode;
      if (typeof themeSetting === 'boolean') {
        themeSetting = themeSetting ? 'dark' : 'light';
      }

      if (themeSetting === null) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        localStorage.setItem('userThemePreference', prefersDark ? 'dark' : 'light');
      } else if (themeSetting && (themeSetting === 'dark' || themeSetting === 'light')) {
        localStorage.setItem('userThemePreference', themeSetting);
      }

      if (profile.primary_color) {
        localStorage.setItem('userPrimaryColor', profile.primary_color);
      }
    } catch (e) {
      // Fallback to system theme preference
    }
  };

  return { checkTokenExpired, loadUserThemePreference };
};
