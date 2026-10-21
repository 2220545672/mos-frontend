import { useTheme } from 'vuetify';
import { useI18n } from 'vue-i18n';
import type { AuthUser } from './useAuth';

const DEFAULT_PRIMARY = '#1976D2';

export function useAppearance() {
  const theme = useTheme();
  const { locale } = useI18n();

  const prefersDark = () => !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const applySystemDefaults = () => {
    theme.change(prefersDark() ? 'dark' : 'light');
    theme.themes.value.light.colors.primary = DEFAULT_PRIMARY;
    theme.themes.value.dark.colors.primary = DEFAULT_PRIMARY;
  };

  const applyStoredAppearance = () => {
    const storedTheme = localStorage.getItem('userThemePreference');
    if (storedTheme) {
      theme.change(storedTheme);
    }
    const storedPrimaryColor = localStorage.getItem('userPrimaryColor');
    if (storedPrimaryColor) {
      theme.themes.value[theme.global.name.value].colors.primary = storedPrimaryColor;
    }
  };

  const applyUser = (user: AuthUser) => {
    let themeSetting = user.darkmode;
    if (typeof themeSetting === 'boolean') {
      themeSetting = themeSetting ? 'dark' : 'light';
    }

    if (themeSetting === null || themeSetting === undefined) {
      theme.change(prefersDark() ? 'dark' : 'light');
    } else if (themeSetting === 'dark' || themeSetting === 'light') {
      theme.change(themeSetting);
    }

    locale.value = user.language || 'en';
    theme.themes.value[theme.global.name.value].colors.primary = user.primary_color || DEFAULT_PRIMARY;
  };

  return { applySystemDefaults, applyStoredAppearance, applyUser };
}
